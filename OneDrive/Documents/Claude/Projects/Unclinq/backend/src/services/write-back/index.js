/**
 * WRITE-BACK SERVICE
 * Runs after every meaningful user event to extract signals and update the User Profile Object.
 * This is what makes the app smarter over time.
 * All functions are fire-and-forget — failures must never break the user experience.
 */

const { query } = require('../../database');
const { cache } = require('../../cache');
const { claudeMessage } = require('../../ai/clients');
const { SESSION_EXTRACTION_PROMPT, buildExtractionPrompt } = require('../../ai/prompts/extraction');
const { PATTERN_REPORT_PROMPT } = require('../../ai/prompts/pattern-report');
const { logEvent } = require('../analytics');

// ─────────────────────────────────────────────────────────────────────────────
// EVENT 1: Session End (Emora)
// ─────────────────────────────────────────────────────────────────────────────

async function processSessionEnd(userId, conversationMessages, sessionMeta = {}) {
  if (!conversationMessages || conversationMessages.length < 3) return;

  try {
    const formatted = conversationMessages
      .map(m => `${m.role === 'user' ? 'USER' : 'EMORA'}: ${m.content}`)
      .join('\n\n');

    const rawResponse = await claudeMessage({
      system: SESSION_EXTRACTION_PROMPT,
      messages: [{ role: 'user', content: buildExtractionPrompt(formatted) }],
      maxTokens: 1000
    });

    let signals;
    try {
      // Strip any markdown code fences
      const cleaned = rawResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      signals = JSON.parse(cleaned);
    } catch (parseError) {
      console.error('Write-back: failed to parse extraction JSON');
      return;
    }

    // Validate required fields
    if (!signals.emotional_state_start) return;

    // Save conversation summary — includes AI-extracted signals + post-session check-in meta.
    // Column notes: raw_message_count = total message objects (user+assistant), set server-side.
    //               message_count     = user-only count from the frontend check-in payload.
    await query(`
      INSERT INTO conversation_summaries (
        user_id, emotional_state_start, emotional_state_end,
        triggers_mentioned, patterns_active, patterns_improving,
        key_insight, session_summary, challenge_phase_reached,
        reassurance_seeking_detected, shutdown_detected,
        raw_message_count, mood_end, reflection_note,
        duration_seconds, message_count
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)
    `, [
      userId,
      signals.emotional_state_start,
      signals.emotional_state_end,
      signals.triggers_mentioned || [],
      signals.patterns_active || [],
      signals.patterns_showing_improvement || [],
      signals.key_insight || 'No clear insight surfaced',
      signals.session_summary || '',
      signals.challenge_phase_reached || false,
      signals.reassurance_seeking_detected || false,
      signals.shutdown_detected || false,
      conversationMessages.length,
      sessionMeta.mood_end || null,
      sessionMeta.reflection_note || null,
      sessionMeta.duration_seconds || null,
      sessionMeta.message_count || null,
    ]);

    // session_count is incremented in emora.js:trackSessionStart on the first exchange.
    // Here we only update first_session_at as a safety net (idempotent via COALESCE).
    await query(`
      UPDATE user_profiles
      SET
        first_session_at = COALESCE(first_session_at, NOW()),
        updated_at = NOW()
      WHERE user_id = $1
    `, [userId]);

    // Cache top trigger so Action Lab can read it (E-04 signal)
    if (signals.triggers_mentioned?.length > 0) {
      const { cache } = require('../../cache');
      await cache.set(
        `session_trigger:${userId}`,
        JSON.stringify({ top_trigger: signals.triggers_mentioned[0], detected_at: Date.now() }),
        86400 // 24 hours
      ).catch(() => {});
    }

    // Apply profile updates
    await applyProfileUpdates(userId, signals.suggested_profile_updates, signals);

    // Increment phase_sessions counter
    await query(
      'UPDATE user_profiles SET phase_sessions = COALESCE(phase_sessions, 0) + 1, updated_at = NOW() WHERE user_id = $1',
      [userId]
    ).catch(() => {});

    // Check phase milestones
    await checkPhaseMilestones(userId, signals).catch(() => {});

    // Check for stage upgrade
    if (signals.suggested_profile_updates?.action_stage_upgrade_candidate) {
      await evaluateStageUpgrade(userId);
    }

    // E-06: Session rhythm detection — record best session hour if deep engagement
    const isDeepSession = signals.challenge_phase_reached ||
      (signals.raw_message_count || 0) >= 8 ||
      (!signals.reassurance_seeking_detected && signals.key_insight && signals.key_insight !== 'No clear insight surfaced');

    if (isDeepSession) {
      await recordSessionRhythm(userId).catch(() => {});
    }

    // ── Low-confidence reassessment: mark as offered after session 3 ──────────
    // Context-engine injects the reassessment question at session_count === 2 (3rd session).
    // We mark reassessment_offered = true here so it only shows once.
    query(`
      UPDATE user_profiles
      SET reassessment_offered = true, updated_at = NOW()
      WHERE user_id = $1
        AND assessment_confidence = 'low'
        AND reassessment_offered = false
        AND (session_count IS NULL OR session_count >= 3)
    `, [userId]).catch(() => {});

    console.log(`Write-back: session processed for user ${userId.slice(0, 8)}`);
  } catch (error) {
    // Never throw — write-back failures must be silent to the user
    console.error('Write-back: session end processing failed:', error.message);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Profile Update Application
// ─────────────────────────────────────────────────────────────────────────────

async function applyProfileUpdates(userId, updates, signals) {
  if (!updates) return;

  const ops = [];

  if (updates.emotional_state) {
    ops.push(query(
      'UPDATE user_profiles SET current_emotional_state = $2, updated_at = NOW() WHERE user_id = $1',
      [userId, updates.emotional_state]
    ));
  }

  if (updates.awareness_level_delta && updates.awareness_level_delta !== 0) {
    ops.push(query(
      'UPDATE user_profiles SET awareness_level = GREATEST(1, LEAST(4, awareness_level + $2)), updated_at = NOW() WHERE user_id = $1',
      [userId, updates.awareness_level_delta]
    ));
  }

  if (updates.new_trigger) {
    ops.push(query(`
      UPDATE user_profiles
      SET detected_triggers = (
        SELECT jsonb_agg(DISTINCT value)
        FROM jsonb_array_elements(detected_triggers || $2::jsonb)
      ),
      updated_at = NOW()
      WHERE user_id = $1
    `, [userId, JSON.stringify([updates.new_trigger])]));
  }

  if (signals?.patterns_active?.length > 0) {
    ops.push(query(`
      UPDATE user_profiles
      SET active_patterns = (
        SELECT jsonb_agg(DISTINCT value) FROM (
          SELECT jsonb_array_elements(active_patterns) AS value
          UNION
          SELECT jsonb_array_elements($2::jsonb) AS value
        ) t
        LIMIT 10
      ),
      updated_at = NOW()
      WHERE user_id = $1
    `, [userId, JSON.stringify(signals.patterns_active)]));
  }

  if (updates.pattern_improving) {
    ops.push(query(`
      UPDATE user_profiles
      SET improved_patterns = (
        SELECT jsonb_agg(DISTINCT value)
        FROM jsonb_array_elements(improved_patterns || $2::jsonb)
      ),
      updated_at = NOW()
      WHERE user_id = $1
    `, [userId, JSON.stringify([updates.pattern_improving])]));
  }

  await Promise.allSettled(ops);
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Upgrade Evaluator
// Handles transitions: awareness → interruption → replacement → consolidation → maintenance
// ─────────────────────────────────────────────────────────────────────────────

async function evaluateStageUpgrade(userId) {
  const profileResult = await query(
    'SELECT action_stage, current_phase, phase_entered_at, improved_patterns, stress_state_clean_sessions, last_regression_at FROM user_profiles WHERE user_id = $1',
    [userId]
  );
  const profile = profileResult.rows[0];
  if (!profile) return;

  // Maintenance is the terminal phase — no upgrades from here
  if (profile.current_phase === 'maintenance') return;

  // ── Discovery → Awareness ─────────────────────────────────────────────────
  // Discovery users (no prior attachment knowledge) start here. After 3 sessions
  // they've been introduced to their patterns and can begin awareness-phase work.
  // We advance current_phase only — action_stage stays 'awareness' (already set).
  if (profile.current_phase === 'discovery') {
    const sessionCountResult = await query(
      'SELECT COUNT(*) AS count FROM conversation_summaries WHERE user_id = $1',
      [userId]
    );
    const sessionCount = parseInt(sessionCountResult.rows[0]?.count || 0);
    if (sessionCount >= 3) {
      const upgraded = await query(
        `UPDATE user_profiles SET current_phase = 'awareness', phase_entered_at = NOW(), updated_at = NOW()
         WHERE user_id = $1 AND current_phase = 'discovery'`,
        [userId]
      );
      if (upgraded.rowCount > 0) {
        logEvent(userId, 'stage_upgraded', { from: 'discovery', to: 'awareness' }).catch(() => {});
      }
    }
    return; // Don't evaluate further upgrades until discovery → awareness completes
  }

  const [actionStats, rescueStats, sessionStats] = await Promise.all([
    query(`
      SELECT
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completed,
        COUNT(*) FILTER (WHERE marked_hard = true) AS hard_count,
        COUNT(*) AS total_served
      FROM action_history
      WHERE user_id = $1 AND served_at > NOW() - INTERVAL '21 days'
    `, [userId]),
    query(`
      SELECT COUNT(*) AS rescue_count
      FROM rescue_sessions
      WHERE user_id = $1 AND started_at > NOW() - INTERVAL '21 days'
    `, [userId]),
    query(`
      SELECT COUNT(*) FILTER (WHERE challenge_phase_reached = true) AS challenges
      FROM conversation_summaries
      WHERE user_id = $1 AND session_date > NOW() - INTERVAL '21 days'
    `, [userId])
  ]);

  const completed = parseInt(actionStats.rows[0]?.completed || 0);
  const totalServed = parseInt(actionStats.rows[0]?.total_served || 1);
  const hardCount = parseInt(actionStats.rows[0]?.hard_count || 0);
  const rescueCount = parseInt(rescueStats.rows[0]?.rescue_count || 0);
  const challenges = parseInt(sessionStats.rows[0]?.challenges || 0);

  const completionRate = completed / totalServed;
  const hardRate = completed > 0 ? hardCount / completed : 0;

  // ── Awareness → Interruption ──────────────────────────────────────────────
  // Fix #8: Single atomic UPDATE with WHERE guard prevents double-upgrade race conditions.
  // If two write-backs fire simultaneously, only one UPDATE will match (rowCount > 0).
  if (profile.action_stage === 'awareness') {
    if (completed >= 5 && completionRate >= 0.5 && rescueCount < 5 && hardRate < 0.5) {
      const upgraded = await query(
        `UPDATE user_profiles
         SET action_stage = 'interruption', current_phase = 'interruption',
             phase_entered_at = NOW(), phase_sessions = 0, updated_at = NOW()
         WHERE user_id = $1 AND action_stage = 'awareness'`,
        [userId]
      );
      if (upgraded.rowCount > 0) {
        await fireStageUpgradeNotification(userId, 'interruption');
        logEvent(userId, 'stage_upgraded', { from: 'awareness', to: 'interruption' }).catch(() => {});
      }
    }

  // ── Interruption → Replacement ────────────────────────────────────────────
  } else if (profile.action_stage === 'interruption') {
    if (completed >= 12 && completionRate >= 0.6 && rescueCount < 3 && challenges >= 2 && hardRate < 0.3) {
      const upgraded = await query(
        `UPDATE user_profiles
         SET action_stage = 'replacement', current_phase = 'replacement',
             phase_entered_at = NOW(), phase_sessions = 0, updated_at = NOW()
         WHERE user_id = $1 AND action_stage = 'interruption'`,
        [userId]
      );
      if (upgraded.rowCount > 0) {
        await fireStageUpgradeNotification(userId, 'replacement');
        logEvent(userId, 'stage_upgraded', { from: 'interruption', to: 'replacement' }).catch(() => {});
      }
    }

  // ── Replacement → Consolidation ───────────────────────────────────────────
  // Requires: 60+ days in replacement, 3+ improved patterns, 6+ activated-state
  // sessions with challenge_phase_reached, 70%+ action completion rate in last 30 days.
  // This is deliberately a high bar — consolidation is for users genuinely building
  // new relational behaviors, not just attempting them.
  } else if (profile.current_phase === 'replacement') {
    const daysInReplacement = profile.phase_entered_at
      ? Math.floor((Date.now() - new Date(profile.phase_entered_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const improvedCount = (profile.improved_patterns || []).length;

    // Fetch activated-state sessions with challenge in replacement window
    const activatedChallenges = await query(`
      SELECT COUNT(*) AS count
      FROM conversation_summaries
      WHERE user_id = $1
        AND session_date > $2
        AND emotional_state_start = 'activated'
        AND challenge_phase_reached = true
    `, [userId, profile.phase_entered_at || new Date(0)]);

    // 30-day action consistency check
    const recentActions = await query(`
      SELECT
        COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completed_30,
        COUNT(*) AS total_30
      FROM action_history
      WHERE user_id = $1 AND served_at > NOW() - INTERVAL '30 days'
    `, [userId]);

    const activatedChallengeCount = parseInt(activatedChallenges.rows[0]?.count || 0);
    const completed30 = parseInt(recentActions.rows[0]?.completed_30 || 0);
    const total30 = parseInt(recentActions.rows[0]?.total_30 || 1);
    const consistencyRate = completed30 / total30;

    if (
      daysInReplacement >= 60 &&
      improvedCount >= 3 &&
      activatedChallengeCount >= 6 &&
      consistencyRate >= 0.7
    ) {
      const upgraded = await query(`
        UPDATE user_profiles
        SET current_phase = 'consolidation',
            consolidation_entered_at = NOW(),
            phase_entered_at = NOW(),
            phase_sessions = 0,
            updated_at = NOW()
        WHERE user_id = $1 AND current_phase = 'replacement'
      `, [userId]);
      if (upgraded.rowCount > 0) {
        await fireStageUpgradeNotification(userId, 'consolidation');
        logEvent(userId, 'phase_upgraded', { from: 'replacement', to: 'consolidation' }).catch(() => {});
      }
    }

  // ── Consolidation → Maintenance ───────────────────────────────────────────
  // Requires: 3+ stress-state clean sessions, no regression in last 30 days,
  // 30+ days in consolidation. This is earned security — not just pattern management.
  } else if (profile.current_phase === 'consolidation') {
    const daysInConsolidation = profile.phase_entered_at
      ? Math.floor((Date.now() - new Date(profile.phase_entered_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const stressCleanSessions = parseInt(profile.stress_state_clean_sessions || 0);
    const lastRegression = profile.last_regression_at ? new Date(profile.last_regression_at) : null;
    const daysSinceRegression = lastRegression
      ? Math.floor((Date.now() - lastRegression.getTime()) / (1000 * 60 * 60 * 24))
      : 999; // no regression = treated as very old

    const noRecentRegression = !lastRegression || daysSinceRegression >= 30;

    if (daysInConsolidation >= 30 && stressCleanSessions >= 3 && noRecentRegression) {
      const upgraded = await query(`
        UPDATE user_profiles
        SET current_phase = 'maintenance',
            maintenance_mode = true,
            phase_entered_at = NOW(),
            phase_sessions = 0,
            updated_at = NOW()
        WHERE user_id = $1 AND current_phase = 'consolidation'
      `, [userId]);
      if (upgraded.rowCount > 0) {
        await fireStageUpgradeNotification(userId, 'maintenance');
        logEvent(userId, 'phase_upgraded', { from: 'consolidation', to: 'maintenance' }).catch(() => {});
      }
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT 2 & 3: Action Completion / Skip
// ─────────────────────────────────────────────────────────────────────────────

async function processActionCompletion(userId, historyId) {
  // Fix #13: Drop the stale static counter increment (actions_completed_30d).
  // The /api/auth/me endpoint already computes this dynamically from action_history.
  // Incrementing a static column here means it never resets and diverges from reality.
  await query('UPDATE action_history SET completed_at = NOW() WHERE id = $1 AND user_id = $2', [historyId, userId]);

  // Check stage upgrade every 5 completions; also fire first-action milestone
  const stats = await query(
    'SELECT COUNT(*) AS count FROM action_history WHERE user_id = $1 AND completed_at IS NOT NULL',
    [userId]
  );
  const totalCompleted = parseInt(stats.rows[0].count);

  // Fire first action completed milestone (fires exactly once per user)
  if (totalCompleted === 1) {
    const phaseResult = await query(
      'SELECT current_phase, action_stage FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    const p = phaseResult.rows[0];
    const phase = p?.current_phase || p?.action_stage || 'awareness';
    insertMilestoneIfNew(userId, 'first_action_completed', phase, {
      message: "You did the first one. That's the hardest part."
    }).catch(() => {});
  }

  if (totalCompleted % 5 === 0) {
    await evaluateStageUpgrade(userId);
  }
}

async function processActionSkip(userId, historyId) {
  // Fix #13: Same as above — don't increment the stale static skip counter.
  await query('UPDATE action_history SET skipped_at = NOW() WHERE id = $1 AND user_id = $2', [historyId, userId]);

  // E-04: Check if 3+ skips in same category — flag for Pattern Report
  try {
    const historyRow = await query(
      'SELECT action_category FROM action_history WHERE id = $1 AND user_id = $2',
      [historyId, userId]
    );
    const category = historyRow.rows[0]?.action_category;
    if (category) {
      const skipCount = await query(`
        SELECT COUNT(*) FROM action_history
        WHERE user_id = $1 AND action_category = $2
          AND skipped_at IS NOT NULL
          AND served_at > NOW() - INTERVAL '30 days'
      `, [userId, category]);
      const count = parseInt(skipCount.rows[0]?.count || 0);
      if (count >= 3) {
        // Per-category key for Pattern Report
        await cache.set(
          `skip_flag:${userId}:${category}`,
          JSON.stringify({ category, skip_count: count, flagged_at: Date.now() }),
          604800 // 7 days
        ).catch(() => {});

        // Summary key for Action Lab to read in a single Redis call
        const summaryRaw = await cache.get(`skip_flags:${userId}`).catch(() => null);
        const summary = summaryRaw ? JSON.parse(summaryRaw) : {};
        summary[category] = count;
        await cache.set(
          `skip_flags:${userId}`,
          JSON.stringify(summary),
          604800
        ).catch(() => {});
      }
    }
  } catch (_) { /* skip flag check is non-critical */ }
}

async function processActionMarkedHard(userId, historyId) {
  await query(
    'UPDATE action_history SET marked_hard = true WHERE id = $1 AND user_id = $2',
    [historyId, userId]
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT 4: Rescue Mode Session End
// ─────────────────────────────────────────────────────────────────────────────

async function processRescueSessionEnd(userId, sessionData) {
  await Promise.allSettled([
    query(`
      INSERT INTO rescue_sessions (user_id, entry_path, activation_type, exercise_used, duration_seconds, exit_path)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [userId, sessionData.entry_path, sessionData.activation_type,
        sessionData.exercise_used, sessionData.duration_seconds, sessionData.exit_path]),

    // Fix #13: rescue_mode_count_30d removed — computed dynamically in /me endpoint.
    // Only update the non-stale fields: emotional state and last trigger type.
    query(`
      UPDATE user_profiles
      SET rescue_mode_last_trigger = $2,
          current_emotional_state = 'activated',
          updated_at = NOW()
      WHERE user_id = $1
    `, [userId, sessionData.activation_type])
  ]);

  // If user chose Emora bridge, store context for Emora to pick up
  if (sessionData.exit_path === 'emora_bridge') {
    await cache.set(
      `rescue_bridge:${userId}`,
      JSON.stringify({
        activation_type: sessionData.activation_type,
        exercise_used: sessionData.exercise_used,
        duration_seconds: sessionData.duration_seconds
      }),
      21600 // 6 hours
    );
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// EVENT 5: Pattern Report Generation
// ─────────────────────────────────────────────────────────────────────────────

async function generatePatternReport(userId) {
  const [profileResult, sessions, actions, rescues, prevReport, tabReads] = await Promise.all([
    query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]),
    query(`
      SELECT session_summary, triggers_mentioned, patterns_active, patterns_improving,
             key_insight, challenge_phase_reached, session_date, emotional_state_start, emotional_state_end,
             mood_end, reflection_note
      FROM conversation_summaries
      WHERE user_id = $1 AND session_date > NOW() - INTERVAL '15 days'
      ORDER BY session_date
    `, [userId]),
    query(`
      SELECT action_id, action_category, difficulty_tier, completed_at, skipped_at, marked_hard
      FROM action_history
      WHERE user_id = $1 AND served_at > NOW() - INTERVAL '15 days'
    `, [userId]),
    query(`
      SELECT activation_type, exercise_used, exit_path, duration_seconds
      FROM rescue_sessions
      WHERE user_id = $1 AND started_at > NOW() - INTERVAL '15 days'
    `, [userId]),
    query(`
      SELECT closing_question FROM pattern_reports
      WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1
    `, [userId]),
    query(`
      SELECT tab_id, dwell_seconds, read_at
      FROM insight_tab_reads
      WHERE user_id = $1 AND read_at > NOW() - INTERVAL '15 days'
      ORDER BY dwell_seconds DESC LIMIT 5
    `, [userId]),
  ]);

  const profile = profileResult.rows[0];
  if (!profile) return null;

  // Build trigger frequency map (with per-state breakdown for frontend visualisation)
  const triggerStateMap = {};
  sessions.rows.forEach(s => {
    // Map DB state values → the three frontend state keys
    const rawState = s.emotional_state_end || s.emotional_state_start || 'stable';
    const sessionState = rawState === 'crisis' ? 'difficult' : rawState === 'activated' ? 'activated' : 'stable';
    (s.triggers_mentioned || []).forEach(t => {
      if (!triggerStateMap[t]) triggerStateMap[t] = { label: t, stable: 0, activated: 0, difficult: 0 };
      triggerStateMap[t][sessionState]++;
    });
  });
  // Legacy flat map still used for the AI prompt
  const triggerMap = {};
  Object.entries(triggerStateMap).forEach(([t, v]) => {
    triggerMap[t] = v.stable + v.activated + v.difficult;
  });

  const completedActions = actions.rows.filter(a => a.completed_at);
  const skippedActions = actions.rows.filter(a => a.skipped_at);
  const hardActions = actions.rows.filter(a => a.marked_hard);

  const categoryCompletions = {};
  completedActions.forEach(a => {
    categoryCompletions[a.action_category] = (categoryCompletions[a.action_category] || 0) + 1;
  });

  // Mood distribution across sessions (from post-session check-ins)
  const moodCounts = {};
  sessions.rows.forEach(s => {
    if (s.mood_end) moodCounts[s.mood_end] = (moodCounts[s.mood_end] || 0) + 1;
  });
  const moodSessionsWithNote = sessions.rows.filter(s => s.reflection_note);

  // Insight tabs deeply read this period
  const deepTabs = tabReads.rows.filter(r => r.dwell_seconds >= 45);

  const dataBlock = `<user_profile>
  <style>${profile.primary_style}</style>
  <situation>${profile.relationship_situation}</situation>
  <stage>${profile.action_stage}</stage>
  <awareness_level>${profile.awareness_level}</awareness_level>
</user_profile>
<period_data>
  <session_count>${sessions.rows.length}</session_count>
  <session_summaries>
    ${sessions.rows.map(s =>
      `<session date="${new Date(s.session_date).toISOString().split('T')[0]}" state_start="${s.emotional_state_start}" state_end="${s.emotional_state_end}" challenge="${s.challenge_phase_reached}" mood_end="${s.mood_end || ''}">${s.session_summary || ''}</session>`
    ).join('\n    ')}
  </session_summaries>
  ${Object.keys(moodCounts).length > 0 ? `<mood_after_sessions>
    <!-- How the user felt leaving each session — signals whether sessions are landing -->
    ${Object.entries(moodCounts).sort(([,a],[,b]) => b - a).map(([mood, count]) =>
      `<mood label="${mood}" count="${count}" />`
    ).join('\n    ')}
  </mood_after_sessions>` : ''}
  ${moodSessionsWithNote.length > 0 ? `<user_reflections>
    <!-- User's own words written after sessions — use these to reflect their self-awareness back -->
    ${moodSessionsWithNote.slice(0, 3).map(s =>
      `<reflection date="${new Date(s.session_date).toISOString().split('T')[0]}">${s.reflection_note}</reflection>`
    ).join('\n    ')}
  </user_reflections>` : ''}
  <trigger_frequency>
    ${Object.entries(triggerMap).sort(([,a],[,b]) => b - a).map(([t, c]) =>
      `<trigger name="${t}" count="${c}" />`
    ).join('\n    ')}
  </trigger_frequency>
  <actions_completed count="${completedActions.length}">
    ${Object.entries(categoryCompletions).map(([cat, count]) =>
      `<category name="${cat}" count="${count}" />`
    ).join('\n    ')}
  </actions_completed>
  <actions_skipped count="${skippedActions.length}" />
  <actions_marked_hard count="${hardActions.length}" />
  <rescue_uses count="${rescues.rows.length}">
    ${rescues.rows.map(r =>
      `<rescue type="${r.activation_type}" exit="${r.exit_path}" duration="${r.duration_seconds}s" />`
    ).join('\n    ')}
  </rescue_uses>
  ${deepTabs.length > 0 ? `<insight_tabs_read>
    <!-- Topics the user spent significant time reading — signals where their curiosity is -->
    ${deepTabs.map(r => `<tab id="${r.tab_id}" dwell="${r.dwell_seconds}s" />`).join('\n    ')}
  </insight_tabs_read>` : ''}
  <previous_report_question>${prevReport.rows[0]?.closing_question || 'None — this is the first report'}</previous_report_question>
</period_data>`;

  // E-08: Add first-report preamble if this is their first pattern report
  const isFirstReport = !profile.pattern_report_count || profile.pattern_report_count === 0;
  const firstReportPreamble = isFirstReport ? `
IMPORTANT: This is the user's first pattern report.
Before the "WHAT I NOTICED" section, include this exact preamble:

---
This is your first pattern report. It covers ${sessions.rows.length} conversation${sessions.rows.length !== 1 ? 's' : ''} and ${completedActions.length} action${completedActions.length !== 1 ? 's' : ''}.

A note on what this is: not a grade. Not a progress evaluation. A mirror. What you see in it is what was actually there — the parts moving and the parts still fixed.

Both are useful. Neither is a verdict.
---

Then continue with the standard WHAT I NOTICED section.
` : '';

  const reportContent = await claudeMessage({
    system: PATTERN_REPORT_PROMPT + firstReportPreamble,
    messages: [{ role: 'user', content: dataBlock }],
    maxTokens: 750
  });

  // Extract closing question
  const questionMatch = reportContent.match(/ONE QUESTION\n([\s\S]+?)$/m);
  const closingQuestion = questionMatch ? questionMatch[1].trim() : null;

  // ── Structured fields for the Wrapped card reveal ────────────────────────

  // period_start — earliest session date in the window
  const periodStart = sessions.rows.length > 0 ? sessions.rows[0].session_date : null;

  // session_count
  const sessionCount = sessions.rows.length;

  // key_insight — most recent non-generic insight from sessions
  const keyInsight = sessions.rows
    .filter(s => s.key_insight && s.key_insight !== 'No clear insight surfaced')
    .slice(-1)[0]?.key_insight || null;

  // emotional_arc — one entry per session with date label + mapped state
  const emotionalArc = sessions.rows.map(s => {
    const rawState = s.emotional_state_end || s.emotional_state_start || 'stable';
    return {
      label: new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      state: rawState === 'crisis' ? 'difficult' : rawState === 'activated' ? 'activated' : 'stable',
    };
  });

  // patterns — combine active + improving from profile, deduplicated
  const seen = new Set();
  const patternsArr = [
    ...(profile.active_patterns   || []).map(p => ({ label: p, status: 'active',    note: null })),
    ...(profile.improved_patterns || []).map(p => ({ label: p, status: 'improving', note: null })),
  ].filter(p => { if (seen.has(p.label)) return false; seen.add(p.label); return true; }).slice(0, 6);

  // triggers — top 5 by total frequency, with per-state breakdown
  const triggersArr = Object.values(triggerStateMap)
    .sort((a, b) => (b.stable + b.activated + b.difficult) - (a.stable + a.activated + a.difficult))
    .slice(0, 5);

  await query(`
    INSERT INTO pattern_reports
      (user_id, period_start, period_end, content, closing_question, generated_at,
       session_count, key_insight, emotional_arc, patterns, triggers)
    VALUES ($1, $2, NOW(), $3, $4, NOW(), $5, $6, $7, $8, $9)
  `, [
    userId,
    periodStart,
    reportContent,
    closingQuestion,
    sessionCount,
    keyInsight,
    JSON.stringify(emotionalArc),
    JSON.stringify(patternsArr),
    JSON.stringify(triggersArr),
  ]);

  // E-08: Increment report counter
  await incrementPatternReportCount(userId);

  return reportContent;
}

// ─────────────────────────────────────────────────────────────────────────────
// E-06: Session Rhythm Detection
// Records the hour of high-quality sessions to learn preferred engagement windows
// ─────────────────────────────────────────────────────────────────────────────

async function recordSessionRhythm(userId) {
  const sessionHour = new Date().getHours(); // 0–23

  // Insert into best_session_hours
  await query(`
    INSERT INTO best_session_hours (user_id, session_hour, recorded_at)
    VALUES ($1, $2, NOW())
  `, [userId, sessionHour]).catch(() => {});

  // Recalculate preferred_session_window from last 10 deep sessions
  const result = await query(`
    SELECT session_hour, COUNT(*) AS cnt
    FROM best_session_hours
    WHERE user_id = $1
    ORDER BY recorded_at DESC
    LIMIT 10
  `, [userId]);

  if (result.rows.length < 3) return; // need enough data to infer a pattern

  // Find mode hour across recent deep sessions
  const hourCounts = {};
  result.rows.forEach(r => {
    hourCounts[r.session_hour] = (hourCounts[r.session_hour] || 0) + parseInt(r.cnt);
  });
  const peakHour = parseInt(Object.entries(hourCounts).sort(([,a],[,b]) => b - a)[0][0]);

  // Map to a time-of-day window label
  let window;
  if (peakHour >= 5 && peakHour < 12) window = 'morning';
  else if (peakHour >= 12 && peakHour < 17) window = 'afternoon';
  else if (peakHour >= 17 && peakHour < 21) window = 'evening';
  else window = 'night';

  await query(`
    UPDATE user_profiles
    SET preferred_session_window = $2, updated_at = NOW()
    WHERE user_id = $1
  `, [userId, window]).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Crisis Flag (E-09)
// Called from emora route when [CRISIS_FLAG] is detected
// ─────────────────────────────────────────────────────────────────────────────

async function processCrisisFlag(userId) {
  await query(`
    UPDATE user_profiles
    SET
      last_crisis_flag_at = NOW(),
      post_crisis_screen_shown = false,
      current_emotional_state = 'crisis',
      updated_at = NOW()
    WHERE user_id = $1
  `, [userId]).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Pattern Report — increment counter after generation (E-08)
// ─────────────────────────────────────────────────────────────────────────────

async function incrementPatternReportCount(userId) {
  await query(`
    UPDATE user_profiles
    SET pattern_report_count = COALESCE(pattern_report_count, 0) + 1, updated_at = NOW()
    WHERE user_id = $1
  `, [userId]).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Stage Upgrade Notification
// Fires an in-app notification when the user moves to a new action stage
// ─────────────────────────────────────────────────────────────────────────────

const STAGE_UPGRADE_MESSAGES = {
  interruption:    "You've moved to the Interruption stage. The patterns you've been noticing — you're starting to catch them in real time.",
  replacement:     "You've reached the Replacement stage. This is where behavior actually starts to change. It's taken real work to get here.",
  consolidation:   "You've entered the Consolidation phase. You've been interrupting the pattern consistently. The next part is proving it holds under real pressure.",
  maintenance:     "You've reached Maintenance. The patterns you came in with — you're no longer ruled by them. This is what earned security looks like.",
};

async function fireStageUpgradeNotification(userId, newStage) {
  const message = STAGE_UPGRADE_MESSAGES[newStage];
  if (!message) return;

  // Queue the full-screen phase entry moment (cleared when user dismisses it)
  await query(`
    UPDATE user_profiles
    SET pending_phase_entry = $2, updated_at = NOW()
    WHERE user_id = $1
  `, [userId, newStage]).catch(() => {});

  // Also leave a subtle in-app notification as a fallback (shows if they somehow miss the full-screen moment)
  await query(`
    INSERT INTO in_app_notifications (user_id, type, message, action_path, expires_at)
    VALUES ($1, 'stage_upgrade', $2, '/home', NOW() + INTERVAL '7 days')
  `, [userId, message]).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Reentry Churn Detection
// Called from week1 route — marks a user churned after 3 unanswered nudges
// ─────────────────────────────────────────────────────────────────────────────

async function checkReentryChurn(userId) {
  try {
    const result = await query(
      'SELECT reentry_nudge_count, reentry_churned, last_reentry_nudge_at FROM user_profiles WHERE user_id = $1',
      [userId]
    );
    const profile = result.rows[0];
    if (!profile || profile.reentry_churned) return;

    // If they've been sent 3+ nudges AND haven't opened the app in 14+ days
    if (profile.reentry_nudge_count >= 3 && profile.last_reentry_nudge_at) {
      const daysSinceNudge = Math.floor(
        (Date.now() - new Date(profile.last_reentry_nudge_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      if (daysSinceNudge >= 14) {
        await query(
          'UPDATE user_profiles SET reentry_churned = true, updated_at = NOW() WHERE user_id = $1',
          [userId]
        );
        logEvent(userId, 'user_churned', { nudge_count: profile.reentry_nudge_count }).catch(() => {});
      }
    }
  } catch (_) {}
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase Milestone Detection
// Called after every session. Each milestone fires exactly once per user.
// ─────────────────────────────────────────────────────────────────────────────

async function insertMilestoneIfNew(userId, type, phase, surfaceData = {}) {
  try {
    await query(`
      INSERT INTO milestone_events (user_id, milestone_type, phase, surface_data)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id, milestone_type) DO NOTHING
    `, [userId, type, phase, JSON.stringify(surfaceData)]);
  } catch (_) { /* non-critical */ }
}

async function checkPhaseMilestones(userId, signals) {
  const profileResult = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
  const profile = profileResult.rows[0];
  if (!profile) return;

  const phase = profile.current_phase || profile.action_stage || 'awareness';

  // ── Milestone: first_pattern_recognition ──────────────────────────────────
  // Fires when the same pattern appears in 3+ of the last 5 sessions.
  const recentSessions = await query(`
    SELECT patterns_active FROM conversation_summaries
    WHERE user_id = $1 ORDER BY session_date DESC LIMIT 5
  `, [userId]);

  if (recentSessions.rows.length >= 3) {
    const patternCount = {};
    recentSessions.rows.forEach(s => {
      (s.patterns_active || []).forEach(p => {
        patternCount[p] = (patternCount[p] || 0) + 1;
      });
    });
    const recurringPattern = Object.entries(patternCount).find(([, count]) => count >= 3);
    if (recurringPattern) {
      await insertMilestoneIfNew(userId, 'first_pattern_recognition', phase, {
        pattern: recurringPattern[0],
        message: `Emora has noticed a pattern in what you've been sharing. ${recurringPattern[0].replace(/_/g, ' ')} has come up across multiple conversations.`
      });
    }
  }

  // ── Milestone: first_pattern_interrupt ────────────────────────────────────
  // Fires when write-back detects improvement in a pattern for the first time.
  if ((signals?.patterns_showing_improvement || []).length > 0) {
    const pattern = signals.patterns_showing_improvement[0];
    await insertMilestoneIfNew(userId, 'first_pattern_interrupt', phase, {
      pattern,
      message: `You caught yourself. That's the work.`
    });
  }

  // ── Milestone: style_signal_shift ─────────────────────────────────────────
  // Fires when user profile has accumulated 2+ improved patterns (replacement phase only).
  if (phase === 'replacement') {
    const improvedCount = (profile.improved_patterns || []).length;
    if (improvedCount >= 2) {
      await insertMilestoneIfNew(userId, 'style_signal_shift', phase, {
        message: `Something in how you talk about this has changed. Emora noticed.`
      });
    }
  }

  // ── Secure Leaning Unlock ─────────────────────────────────────────────────
  // RAISED BAR (was: 14 days in replacement + 2 improved patterns).
  // NOW: Must be in consolidation phase for 60+ days with 3+ improved patterns,
  // 3+ stress-state clean sessions, and no recent regression.
  // Rationale: Earned security requires proving the change holds under real stress,
  // across multiple activated-state encounters. 14 days is too early.
  if (
    phase === 'consolidation' &&
    !profile.secure_leaning_unlocked &&
    profile.primary_style !== 'secure_leaning'
  ) {
    const daysInConsolidation = profile.consolidation_entered_at
      ? Math.floor((Date.now() - new Date(profile.consolidation_entered_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;
    const improvedCount = (profile.improved_patterns || []).length;
    const stressCleanSessions = parseInt(profile.stress_state_clean_sessions || 0);
    const lastRegression = profile.last_regression_at ? new Date(profile.last_regression_at) : null;
    const daysSinceRegression = lastRegression
      ? Math.floor((Date.now() - lastRegression.getTime()) / (1000 * 60 * 60 * 24))
      : 999;

    if (
      daysInConsolidation >= 60 &&
      improvedCount >= 3 &&
      stressCleanSessions >= 3 &&
      daysSinceRegression >= 30
    ) {
      await query(
        "UPDATE user_profiles SET primary_style = 'secure_leaning', secure_leaning_unlocked = true, updated_at = NOW() WHERE user_id = $1",
        [userId]
      ).catch(() => {});

      await insertMilestoneIfNew(userId, 'secure_leaning_unlock', phase, {
        message: `You built something safer. That took interrupting the old thing long enough to know what else is possible.`
      });

      logEvent(userId, 'secure_leaning_unlocked', { days_in_consolidation: daysInConsolidation }).catch(() => {});
    }
  }

  // ── Stress-State Clean Session Tracking ───────────────────────────────────
  // If user was activated at session start, showed pattern improvement, and
  // reached the challenge phase — this counts as a "stress-state clean session".
  // Used as a prerequisite for consolidation → maintenance transition.
  if (
    (phase === 'consolidation' || phase === 'replacement') &&
    signals?.emotional_state_start === 'activated' &&
    signals?.challenge_phase_reached === true &&
    (signals?.patterns_showing_improvement || []).length > 0
  ) {
    await query(`
      UPDATE user_profiles
      SET stress_state_clean_sessions = COALESCE(stress_state_clean_sessions, 0) + 1,
          updated_at = NOW()
      WHERE user_id = $1
    `, [userId]).catch(() => {});
  }

  // ── Regression Detection ──────────────────────────────────────────────────
  // If a pattern that was in improved_patterns reappears in active_patterns
  // for this session, it's a regression. We log it and notify the user once.
  // We do NOT downgrade phase — that would be demoralizing. Instead, Emora
  // gets the regression context and normalizes it as "part of the process."
  await detectAndLogRegression(userId, profile, signals, phase).catch(() => {});

  // ── Phase Progress Report (Milestone 5) ───────────────────────────────────
  // Fires at 8+ sessions in interruption phase, once only.
  if (phase === 'interruption' && !profile.phase_progress_report_sent) {
    const phaseSessionCount = profile.phase_sessions || 0;
    if (phaseSessionCount >= 8) {
      generatePhaseProgressReport(userId).catch(() => {});
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Regression Detection & Logging
// Called post-session. If a previously improved pattern resurfaces,
// log the regression, update profile, and queue a user notification (once).
// ─────────────────────────────────────────────────────────────────────────────

async function detectAndLogRegression(userId, profile, signals, phase) {
  const improvedPatterns = profile.improved_patterns || [];
  const activeThisSession = signals?.patterns_active || [];

  if (improvedPatterns.length === 0 || activeThisSession.length === 0) return;

  // Find patterns that were improved but are active again this session
  const regressions = activeThisSession.filter(p => improvedPatterns.includes(p));
  if (regressions.length === 0) return;

  // Only notify for first regression per pattern within 30 days (prevent alarm fatigue)
  for (const pattern of regressions) {
    const recentRegression = await query(`
      SELECT id FROM regression_events
      WHERE user_id = $1 AND pattern = $2
        AND detected_at > NOW() - INTERVAL '30 days'
      LIMIT 1
    `, [userId, pattern]);

    if (recentRegression.rows.length > 0) continue; // already logged recently, skip

    // Log the regression
    await query(`
      INSERT INTO regression_events (user_id, pattern, phase_at_regression, user_notified)
      VALUES ($1, $2, $3, true)
    `, [userId, pattern, phase]);

    // Update last_regression_at on profile
    await query(`
      UPDATE user_profiles SET last_regression_at = NOW(), updated_at = NOW() WHERE user_id = $1
    `, [userId]).catch(() => {});

    // Insert milestone (won't fire if it's already happened; regression milestones are once-only)
    // We use a unique key that includes the pattern so each pattern gets its own moment
    await insertMilestoneIfNew(userId, `regression_${pattern}`, phase, {
      pattern,
      type: 'regression',
      message: `${pattern.replace(/_/g, ' ')} showed up again. That's not failure — it's what patterns do. You've interrupted this before. You know it's possible.`
    }).catch(() => {});

    logEvent(userId, 'pattern_regression', { pattern, phase }).catch(() => {});
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Phase Progress Report (Milestone 5)
// Fires at 8+ sessions in interruption phase. One per user.
// ─────────────────────────────────────────────────────────────────────────────

const PHASE_PROGRESS_REPORT_PROMPT = `You are the Phase Progress writer for Unclinq. You write a short, honest reflection for a user who has been in the Interruption phase for 8+ sessions.

This is not the full 15-day Pattern Report. It is a mid-phase check-in: "you've been doing something different. Here's what the data says."

FORMAT — use exactly these headers, no markdown, no asterisks:

What you've been doing differently.

[1-2 sentences. Name a specific behavioral shift visible in their session data. Reference actual patterns that improved. Max 40 words total.]

What's still pulling.

[1 sentence. Name the pattern still most active. Honest, not discouraging. Max 25 words.]

One thing to carry into the next stretch:
[Single concrete thought. Not homework. Not a technique. A genuine observation. Max 20 words.]

TONE: Same as Pattern Report — mirror, not judge. Specific to their data. Never generic.`;

async function generatePhaseProgressReport(userId) {
  try {
    const [profileResult, sessions, actions] = await Promise.all([
      query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]),
      query(`
        SELECT session_summary, patterns_active, patterns_improving, key_insight, session_date
        FROM conversation_summaries
        WHERE user_id = $1 AND session_date > NOW() - INTERVAL '30 days'
        ORDER BY session_date
      `, [userId]),
      query(`
        SELECT action_category, completed_at, skipped_at, marked_hard
        FROM action_history
        WHERE user_id = $1 AND served_at > NOW() - INTERVAL '30 days'
      `, [userId])
    ]);

    const profile = profileResult.rows[0];
    if (!profile || profile.phase_progress_report_sent) return;

    const completed = actions.rows.filter(a => a.completed_at).length;
    const improved = (profile.improved_patterns || []).join(', ') || 'none yet';
    const active = (profile.active_patterns || []).join(', ') || 'none detected';

    const dataBlock = `<phase_data>
  <phase>interruption</phase>
  <phase_sessions>${profile.phase_sessions || 0}</phase_sessions>
  <style>${profile.primary_style}</style>
  <improved_patterns>${improved}</improved_patterns>
  <active_patterns>${active}</active_patterns>
  <actions_completed>${completed}</actions_completed>
  <sessions>
    ${sessions.rows.map(s =>
      `<session date="${new Date(s.session_date).toISOString().split('T')[0]}">${s.session_summary || ''}</session>`
    ).join('\n    ')}
  </sessions>
</phase_data>`;

    const content = await claudeMessage({
      system: PHASE_PROGRESS_REPORT_PROMPT,
      messages: [{ role: 'user', content: dataBlock }],
      maxTokens: 250
    });

    // Store as an in-app notification so it surfaces on next home open
    await query(`
      INSERT INTO in_app_notifications (user_id, type, message, action_path, expires_at)
      VALUES ($1, 'report_ready', $2, '/report', NOW() + INTERVAL '14 days')
    `, [userId, content]).catch(() => {});

    // Mark sent
    await query(
      'UPDATE user_profiles SET phase_progress_report_sent = true, updated_at = NOW() WHERE user_id = $1',
      [userId]
    ).catch(() => {});

    logEvent(userId, 'phase_progress_report_generated', {}).catch(() => {});
  } catch (err) {
    console.error('Phase progress report failed:', err.message);
  }
}

const { generateMicroReport } = require('../week1');

module.exports = {
  processSessionEnd,
  processActionCompletion,
  processActionSkip,
  processActionMarkedHard,
  processRescueSessionEnd,
  generatePatternReport,
  generateMicroReport,
  evaluateStageUpgrade,
  processCrisisFlag,
  incrementPatternReportCount,
  checkReentryChurn,
  checkPhaseMilestones,
  generatePhaseProgressReport,
  detectAndLogRegression,
};
