const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');
const { cache } = require('../cache');
const { INSIGHT_TABS } = require('../data/insight-tabs');
const { claudeMessage } = require('../ai/clients');
const { PATTERN_ARCHIVE_NARRATIVE_PROMPT, buildArchiveNarrativePrompt } = require('../ai/prompts/pattern-archive');

const ARCHIVE_NARRATIVE_TTL = 60 * 60 * 24; // 24 hours

// ─────────────────────────────────────────────────────────────────────────────
// Trigger-matched, awareness-aware tab ranking (E-02 + personalization upgrade)
// ─────────────────────────────────────────────────────────────────────────────
function rankInsightTabs(tabs, profile, readMap) {
  const detectedTriggers = profile.detected_triggers || [];
  const primaryStyle = profile.primary_style;
  const situation = profile.relationship_situation || 'all';
  const awarenessLevel = profile.awareness_level || 1;

  const scored = tabs.map(tab => {
    let score = 0;

    // 1. Style match — highest priority
    if (tab.styles.includes(primaryStyle) && !tab.styles.includes('all')) score += 10;

    // 2. Trigger match — surface relevant tabs after a session
    if (detectedTriggers.some(t =>
      tab.theme.includes(t) || t.includes(tab.theme) || tab.theme.split('_').some(w => t.includes(w))
    )) score += 8;

    // 3. Unread preference
    const dwell = readMap[tab.id] || 0;
    if (!readMap[tab.id]) score += 5;

    // 4. Situation relevance boost
    if (tab.situations && tab.situations.includes(situation)) score += 4;

    // 5. Difficulty matching — prefer tabs at the right awareness level
    //    difficulty 1 → ideal for awareness 1–2; difficulty 2 → ideal for awareness 3–4
    if (tab.difficulty === 1 && awarenessLevel <= 2) score += 3;
    if (tab.difficulty === 2 && awarenessLevel >= 3) score += 3;
    // Slight penalty for serving difficulty-2 to very new users
    if (tab.difficulty === 2 && awarenessLevel === 1) score -= 4;

    // 6. Don't immediately resurface a recently deep-read tab
    if (readMap[tab.id] && dwell > 30) score -= 6;

    return { ...tab, score, read: !!readMap[tab.id], dwell_seconds: dwell };
  });

  const sorted = scored.sort((a, b) => b.score - a.score);

  // Style-matched tabs first, then universal — score handles the rest
  const styleMatched = sorted.filter(t => t.styles.includes(primaryStyle) && !t.styles.includes('all'));
  const rest = sorted.filter(t => !t.styles.includes(primaryStyle) || t.styles.includes('all'));

  return [...styleMatched, ...rest];
}

// GET /api/insight-tabs
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const profileResult = await query(
      'SELECT primary_style, current_emotional_state, detected_triggers, awareness_level, relationship_situation FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );
    const profile = profileResult.rows[0];

    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    // State gate: tabs are locked when activated or in crisis
    if (profile.current_emotional_state !== 'stable') {
      const lockMessage = profile.current_emotional_state === 'crisis'
        ? "These will be here when you're ready. Right now, use Rescue Mode or reach out to someone you trust."
        : "These land better when you're regulated. Use Rescue Mode first, then come back.";
      return res.json({ locked: true, message: lockMessage });
    }

    // Session gate: users with no primary_style haven't completed onboarding
    // Exception: unaware users (discovery phase) still benefit from introductory tabs
    if (!profile.primary_style) {
      // #4: Serve introductory tabs for users in discovery/unaware state
      // These are the 'all' style tabs with difficulty=1 — foundational psychoeducation
      const introTabs = INSIGHT_TABS.filter(t =>
        t.styles.includes('all') && t.difficulty === 1
      ).slice(0, 3);

      if (introTabs.length === 0) {
        return res.json({
          locked: true,
          message: "Complete your first conversation with Emora to unlock these."
        });
      }

      return res.json({
        locked: false,
        tabs: introTabs,
        meta: { total: introTabs.length, read: 0 },
        introMode: true
      });
    }

    // Get read history
    const readResult = await query(
      'SELECT tab_id, dwell_seconds FROM insight_tab_reads WHERE user_id = $1',
      [req.user.id]
    );
    const readMap = {};
    readResult.rows.forEach(r => { readMap[r.tab_id] = r.dwell_seconds; });

    // Filter to eligible styles
    const eligible = INSIGHT_TABS.filter(tab =>
      tab.styles.includes(profile.primary_style) || tab.styles.includes('all')
    );

    // Apply ranked serving — cap at 5 (matches frontend batch size)
    const ranked = rankInsightTabs(eligible, profile, readMap);
    const tabs = ranked.slice(0, 5);

    const totalEligible = eligible.length;
    const readCount = eligible.filter(t => readMap[t.id]).length;

    res.json({ locked: false, tabs, meta: { total: totalEligible, read: readCount } });
  } catch (err) {
    next(err);
  }
});

// POST /api/insight-tabs/:tabId/read
router.post('/:tabId/read', authenticateUser, async (req, res, next) => {
  try {
    const { tabId } = req.params;
    const { dwell_seconds = 0 } = req.body;

    const tab = INSIGHT_TABS.find(t => t.id === tabId);
    if (!tab) {
      return res.status(404).json({ error: 'Tab not found' });
    }

    await query(`
      INSERT INTO insight_tab_reads (user_id, tab_id, dwell_seconds, read_at)
      VALUES ($1, $2, $3, NOW())
      ON CONFLICT (user_id, tab_id) DO UPDATE
      SET dwell_seconds = GREATEST(insight_tab_reads.dwell_seconds, $3),
          read_at = NOW()
    `, [req.user.id, tabId, dwell_seconds]);

    // E-02 / E-04: Deep read (45s+) — flag theme for Emora context via Redis + profile
    if (dwell_seconds >= 45) {
      // Redis signal for next Emora session (E-04 cross-feature)
      await cache.set(
        `deep_read_tab:${req.user.id}`,
        JSON.stringify({ tab_id: tabId, tab_theme: tab.theme, difficulty: tab.difficulty, read_at: Date.now() }),
        86400 // 24 hours
      ).catch(() => {});

      // Persist to profile for longer-term context
      await query(
        'UPDATE user_profiles SET recent_deep_read_tab = $2, updated_at = NOW() WHERE user_id = $1',
        [req.user.id, tab.theme]
      ).catch(() => {});
    }

    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/insight-tabs/pattern-archive
// Phase 3+ only. Returns earliest vs. recent session data plus a Claude-generated
// narrative letter that names the real distance traveled in the user's own words.
// Narrative is cached in Redis for 24h — regenerates on next open after expiry.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/pattern-archive', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const profileResult = await query(
      'SELECT current_phase, action_stage, primary_style, active_patterns, improved_patterns, first_session_at FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    const profile = profileResult.rows[0];
    if (!profile) return res.status(404).json({ error: 'Profile not found' });

    const phase = profile.current_phase || profile.action_stage;
    const phaseUnlocked = ['replacement', 'consolidation', 'maintenance'].includes(phase);
    if (!phaseUnlocked) {
      return res.json({ locked: true, message: 'The Pattern Archive unlocks when you reach the Replacement stage.' });
    }

    // Pull earliest 3 and latest 3 sessions
    const [earliest, latest] = await Promise.all([
      query(`
        SELECT session_summary, key_insight, patterns_active, patterns_improving, session_date
        FROM conversation_summaries
        WHERE user_id = $1
        ORDER BY session_date ASC
        LIMIT 3
      `, [userId]),
      query(`
        SELECT session_summary, key_insight, patterns_active, patterns_improving, session_date
        FROM conversation_summaries
        WHERE user_id = $1
        ORDER BY session_date DESC
        LIMIT 3
      `, [userId])
    ]);

    // Derive pattern delta
    const earlyPatterns = new Set(earliest.rows.flatMap(s => s.patterns_active || []));
    const recentPatterns = new Set(latest.rows.flatMap(s => s.patterns_active || []));
    const improvedPatterns = profile.improved_patterns || [];
    const quietedPatterns = [...earlyPatterns].filter(p => !recentPatterns.has(p));
    const persistingPatterns = [...earlyPatterns].filter(p => recentPatterns.has(p));

    const earliestData = {
      sessions: earliest.rows.map(s => ({
        date: new Date(s.session_date).toISOString().split('T')[0],
        key_insight: s.key_insight,
        patterns: s.patterns_active || [],
      }))
    };
    const latestData = {
      sessions: latest.rows.map(s => ({
        date: new Date(s.session_date).toISOString().split('T')[0],
        key_insight: s.key_insight,
        patterns: s.patterns_active || [],
      }))
    };
    const delta = {
      quieted: quietedPatterns,
      persisting: persistingPatterns,
      improved: improvedPatterns,
    };

    // ── Narrative generation (Claude, cached 24h) ──────────────────────────
    // Only attempt if there's enough session data to say something real
    let narrative = null;
    const hasEnoughData = earliest.rows.some(s => s.key_insight) && latest.rows.some(s => s.key_insight);

    if (hasEnoughData) {
      const cacheKey = `archive_narrative:${userId}`;
      const cached = await cache.get(cacheKey);

      if (cached) {
        narrative = cached;
      } else {
        // Generate narrative asynchronously — respond immediately with data,
        // then store the narrative. On next fetch it will be available.
        // This way the first open is fast; subsequent opens show the letter.
        const weeksElapsed = profile.first_session_at
          ? Math.floor((Date.now() - new Date(profile.first_session_at).getTime()) / (1000 * 60 * 60 * 24 * 7))
          : null;

        claudeMessage({
          system: PATTERN_ARCHIVE_NARRATIVE_PROMPT,
          messages: [{
            role: 'user',
            content: buildArchiveNarrativePrompt({
              primaryStyle: profile.primary_style,
              currentPhase: phase,
              earliest: earliestData,
              latest: latestData,
              delta,
              weeksElapsed,
            })
          }],
          maxTokens: 500,
        })
          .then(text => cache.set(cacheKey, text, ARCHIVE_NARRATIVE_TTL))
          .catch(() => {});
        // narrative stays null on first open — frontend handles this gracefully
      }
    }

    res.json({
      locked: false,
      narrative,  // null on first open, populated on subsequent opens
      earliest: earliestData,
      latest: latestData,
      delta,
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
