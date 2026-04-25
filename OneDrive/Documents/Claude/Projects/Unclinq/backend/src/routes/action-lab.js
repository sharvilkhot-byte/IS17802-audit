const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');
const { geminiMessage } = require('../ai/clients');
const { cache } = require('../cache');
const { ACTION_LAB_MATCHER_PROMPT } = require('../ai/prompts/action-matcher');
const { ACTION_GENERATOR_PROMPT } = require('../ai/prompts/action-generator');
const { ACTION_LIBRARY } = require('../data/action-library');
const {
  processActionCompletion,
  processActionSkip,
  processActionMarkedHard
} = require('../services/write-back');

/**
 * Tier eligibility is based on phase AND onboarding awareness_level.
 *
 * Default (phase-based):
 *   awareness → tier 1  |  interruption → tier 2  |  replacement+ → tier 3
 *
 * Awareness-level override for awareness-phase users:
 *   If awareness_level >= 3 (spots patterns in/near real-time),
 *   they're ready for tier 2 actions even before formal phase transition.
 *   Self-aware users shouldn't grind through beginner-only content.
 *
 *   If awareness_level == 4 AND 5+ Emora sessions completed,
 *   they can access tier 3 in awareness phase — functionally at interruption level.
 */
function getMaxTier(stage, phase, awarenessLevel, sessionCount) {
  const effectivePhase = phase || stage;
  const baseMap = {
    awareness: 1, interruption: 2, replacement: 3,
    consolidation: 3, maintenance: 3
  };
  const baseTier = baseMap[effectivePhase] || baseMap[stage] || 1;

  // Only boost awareness-phase users — all other phases already have their correct tiers
  if (effectivePhase === 'awareness') {
    const al = Number(awarenessLevel) || 1;
    const sessions = Number(sessionCount) || 0;

    // Highly self-aware (level 4) + 5+ Emora sessions → unlock tier 3 early
    if (al >= 4 && sessions >= 5) return 3;

    // Self-aware (level 3+) → unlock tier 2 from day 1
    if (al >= 3) return 2;
  }

  return baseTier;
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/action-lab/next
// ─────────────────────────────────────────────────────────────────────────────
router.get('/next', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const profileResult = await query(`
      SELECT user_id, primary_style, secondary_style, relationship_situation,
             current_emotional_state, action_stage, current_phase, awareness_level,
             session_count, active_patterns, detected_triggers, onboarding_pattern_text,
             pattern_duration, maintenance_mode
      FROM user_profiles WHERE user_id = $1
    `, [userId]);
    const profile = profileResult.rows[0];

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found. Complete onboarding first.' });
    }

    // Never serve to activated/crisis users
    if (profile.current_emotional_state !== 'stable') {
      return res.json({
        defer: true,
        message: profile.current_emotional_state === 'crisis'
          ? "Talk to someone you trust first. Come back when you're ready."
          : "Talk to Emora first. Actions land differently when you're regulated."
      });
    }

    // Get recently served actions to exclude
    const recentResult = await query(`
      SELECT action_id FROM action_history
      WHERE user_id = $1 AND served_at > NOW() - INTERVAL '14 days'
    `, [userId]);
    const excludeIds = recentResult.rows.map(r => r.action_id);

    // Get last 3 Emora session contexts (richer signal than just the latest)
    const sessionResult = await query(`
      SELECT triggers_mentioned, key_insight, patterns_active, session_summary
      FROM conversation_summaries
      WHERE user_id = $1 ORDER BY session_date DESC LIMIT 3
    `, [userId]);
    const sessionContext = sessionResult.rows[0] || {};
    const recentInsights = sessionResult.rows
      .filter(s => s.key_insight)
      .map(s => s.key_insight)
      .slice(0, 3);

    // E-04: Post-rescue gate — cap to tier 1 for 6h after rescue session
    let maxTier = getMaxTier(
      profile.action_stage,
      profile.current_phase,
      profile.awareness_level,   // from onboarding — boosts tier for self-aware users
      profile.session_count      // must have 5+ sessions for tier-3 early unlock
    );
    const [postRescueRaw, deepReadRaw, skipFlagsRaw] = await Promise.all([
      cache.get(`post_rescue:${userId}`).catch(() => null),
      cache.get(`deep_read_tab:${userId}`).catch(() => null),
      cache.get(`skip_flags:${userId}`).catch(() => null),
    ]);
    if (postRescueRaw) {
      maxTier = Math.min(maxTier, 1); // gentle tier only when still processing
    }
    const deepRead = deepReadRaw ? JSON.parse(deepReadRaw) : null;
    const skipFlags = skipFlagsRaw ? JSON.parse(skipFlagsRaw) : {};

    // Filter action library
    const eligible = ACTION_LIBRARY.filter(a =>
      (a.style === profile.primary_style || a.style === 'all') &&
      (a.situations.includes(profile.relationship_situation) || a.situations.includes('all')) &&
      a.tier <= maxTier &&
      !excludeIds.includes(a.id)
    );

    // Build rich context block used by both the matcher and the generator
    const skipFlagEntries = Object.entries(skipFlags);
    const activePatterns = (profile.active_patterns || []).join(', ') || 'none';
    const userContext = `<user_context>
  <style>${profile.primary_style}</style>
  <stage>${profile.action_stage}</stage>
  <phase>${profile.current_phase || profile.action_stage}</phase>
  <state>${profile.current_emotional_state}</state>
  <max_tier>${maxTier}</max_tier>
  <situation>${profile.relationship_situation}</situation>
  <primary_pattern_from_onboarding>${profile.onboarding_pattern_text || 'not specified'}</primary_pattern_from_onboarding>
  <pattern_duration>${profile.pattern_duration || 'not specified'}</pattern_duration>
  <active_patterns_accumulated>${activePatterns}</active_patterns_accumulated>
  <recent_trigger>${sessionContext.triggers_mentioned?.[0] || 'none'}</recent_trigger>
  <recent_insights>${recentInsights.length > 0 ? recentInsights.join(' | ') : 'none'}</recent_insights>
  <patterns_active_last_session>${(sessionContext.patterns_active || []).join(', ') || 'none'}</patterns_active_last_session>
  <deep_read_tab_theme>${deepRead?.tab_theme || 'none'}</deep_read_tab_theme>
  <skip_flagged_categories>${skipFlagEntries.length > 0 ? skipFlagEntries.map(([cat]) => cat).join(', ') : 'none'}</skip_flagged_categories>
</user_context>`;

    // Library exhausted — generate a fresh action rather than returning nothing
    if (eligible.length === 0) {
      let generated;
      try {
        const geminiResponse = await geminiMessage({
          systemInstruction: ACTION_GENERATOR_PROMPT,
          prompt: `${userContext}\n<exclude_categories>${skipFlagEntries.map(([cat]) => cat).join(', ') || 'none'}</exclude_categories>`
        });
        const cleaned = geminiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        generated = JSON.parse(cleaned);
      } catch {
        return res.json({
          defer: false,
          action: null,
          message: "You've worked through all available actions recently. New ones will appear soon."
        });
      }

      const historyResult = await query(`
        INSERT INTO action_history (user_id, action_id, action_category, difficulty_tier, context_at_serving)
        VALUES ($1, $2, $3, $4, $5) RETURNING id
      `, [
        userId,
        generated.action_id,
        generated.category,
        generated.tier,
        JSON.stringify({ emotional_state: profile.current_emotional_state, action_stage: profile.action_stage, generated: true })
      ]);

      return res.json({
        defer: false,
        history_id: historyResult.rows[0].id,
        post_rescue: !!postRescueRaw,
        action: {
          id: generated.action_id,
          text: generated.text,
          brief_why: generated.brief_why,
          tier: generated.tier,
          category: generated.category,
          completion_acknowledgment: generated.completion_acknowledgment
        }
      });
    }

    // Standard path: select and personalize from library
    const matcherInput = `${userContext}
<constraints>
  <exclude_ids>${excludeIds.join(', ')}</exclude_ids>
</constraints>
<action_library>
${JSON.stringify(eligible, null, 2)}
</action_library>`;

    let matched;
    try {
      const geminiResponse = await geminiMessage({
        systemInstruction: ACTION_LAB_MATCHER_PROMPT,
        prompt: matcherInput
      });
      const cleaned = geminiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      matched = JSON.parse(cleaned);
    } catch (aiError) {
      // Fallback: pick random eligible action
      const random = eligible[Math.floor(Math.random() * eligible.length)];
      matched = {
        defer: false,
        action_id: random.id,
        category: random.category,
        tier: random.tier,
        text: random.text,
        brief_why: random.brief_why,
        completion_acknowledgment: random.completion_ack
      };
    }

    if (matched.defer) {
      return res.json({ defer: true, message: 'Regulate first.' });
    }

    // Record the serving
    const historyResult = await query(`
      INSERT INTO action_history (user_id, action_id, action_category, difficulty_tier, context_at_serving)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id
    `, [
      userId,
      matched.action_id,
      matched.category,
      matched.tier,
      JSON.stringify({
        emotional_state: profile.current_emotional_state,
        action_stage: profile.action_stage,
        recent_trigger: sessionContext.triggers_mentioned?.[0] || null
      })
    ]);

    res.json({
      defer: false,
      history_id: historyResult.rows[0].id,
      post_rescue: !!postRescueRaw,
      action: {
        id: matched.action_id,
        text: matched.text,
        brief_why: matched.brief_why,
        tier: matched.tier,
        category: matched.category,
        completion_acknowledgment: matched.completion_acknowledgment
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/action-lab/complete
router.post('/complete', authenticateUser, async (req, res, next) => {
  try {
    const { history_id } = req.body;
    if (!history_id) return res.status(400).json({ error: 'history_id required' });
    await processActionCompletion(req.user.id, history_id);

    // E-04: Cache action completion signal so Emora can reference it next session
    const actionRecord = await query(
      'SELECT action_id, action_category, difficulty_tier, context_at_serving FROM action_history WHERE id = $1 AND user_id = $2',
      [history_id, req.user.id]
    );
    if (actionRecord.rows[0]) {
      const { action_id, action_category, difficulty_tier, context_at_serving } = actionRecord.rows[0];
      const actionEntry = ACTION_LIBRARY.find(a => a.id === action_id);
      await cache.set(
        `action_completed:${req.user.id}`,
        JSON.stringify({
          action_text: actionEntry?.text || action_id,
          action_tier: difficulty_tier,
          category: action_category,
          completed_at: Date.now()
        }),
        21600 // 6h TTL — long enough to reach Emora in the same session window
      ).catch(() => {});
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/action-lab/skip
router.post('/skip', authenticateUser, async (req, res, next) => {
  try {
    const { history_id } = req.body;
    if (!history_id) return res.status(400).json({ error: 'history_id required' });
    await processActionSkip(req.user.id, history_id);
    res.json({ ok: true, message: "Noted. It'll come back when you're ready." });
  } catch (err) { next(err); }
});

// POST /api/action-lab/mark-hard
router.post('/mark-hard', authenticateUser, async (req, res, next) => {
  try {
    const { history_id } = req.body;
    if (!history_id) return res.status(400).json({ error: 'history_id required' });
    await processActionMarkedHard(req.user.id, history_id);
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// POST /api/action-lab/effectiveness
// Lightweight post-action signal: did this action help?
// Stored on action_history and used by the matcher to soften/boost future serving
router.post('/effectiveness', authenticateUser, async (req, res, next) => {
  try {
    const { history_id, rating } = req.body;
    if (!history_id) return res.status(400).json({ error: 'history_id required' });
    if (!['helped', 'somewhat', 'not_really'].includes(rating)) {
      return res.status(400).json({ error: 'rating must be helped, somewhat, or not_really' });
    }

    await query(
      'UPDATE action_history SET effectiveness = $1 WHERE id = $2 AND user_id = $3',
      [rating, history_id, req.user.id]
    );

    // If "not_really", cache the category so the matcher can deprioritise it
    if (rating === 'not_really') {
      const record = await query(
        'SELECT action_category FROM action_history WHERE id = $1 AND user_id = $2',
        [history_id, req.user.id]
      );
      const category = record.rows[0]?.action_category;
      if (category) {
        const skipKey = `skip_flags:${req.user.id}`;
        const raw = await cache.get(skipKey).catch(() => null);
        const flags = raw ? JSON.parse(raw) : {};
        flags[category] = (flags[category] || 0) + 1;
        await cache.set(skipKey, JSON.stringify(flags), 604800).catch(() => {}); // 7 days
      }
    }

    res.json({ ok: true });
  } catch (err) { next(err); }
});

// GET /api/action-lab/history
router.get('/history', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT action_id, action_category, difficulty_tier, served_at,
             completed_at, skipped_at, marked_hard, context_at_serving
      FROM action_history
      WHERE user_id = $1
      ORDER BY served_at DESC
      LIMIT 5
    `, [req.user.id]);

    // Enrich each row with the human-readable action text from the library
    const enriched = result.rows.map(row => {
      const entry = ACTION_LIBRARY.find(a => a.id === row.action_id);
      return {
        ...row,
        action_text: entry?.text || row.action_id.replace(/_/g, ' '),
        completion_acknowledgment: entry?.completion_ack || null,
      };
    });

    res.json({ history: enriched });
  } catch (err) { next(err); }
});

module.exports = router;
