/**
 * WEEK 1 EXPERIENCE SERVICE
 * Handles the five engineered moments that determine whether a user stays.
 *
 * Moment 1: Onboarding closing statement (handled frontend-only)
 * Moment 2: First Emora session onboarding mode (context-engine.js)
 * Moment 3: Day 3 "it remembered" moment (context-engine.js)
 * Moment 4: Day 7 micro-report (this file + scheduler)
 * Moment 5: Re-entry experience (this file)
 */

const { query } = require('../database');
const { claudeMessage } = require('../ai/clients');

// ─── Plant Stage System ───────────────────────────────────────────────────────
// The plant advances when BOTH the time threshold AND a minimum session count
// are met. It is a clock of real engagement — not a reward, not a streak counter.
// A user who installed and never came back stays a seed; a user who keeps showing
// up grows at the natural pace of the work.

const PLANT_STAGES = [
  { days: 0,   sessions: 0,  stage: 'seed',   label: 'seed' },
  { days: 3,   sessions: 1,  stage: 'sprout', label: 'sprout' },
  { days: 10,  sessions: 2,  stage: 'shoot',  label: 'shoot' },
  { days: 21,  sessions: 3,  stage: 'stem',   label: 'stem' },
  { days: 45,  sessions: 5,  stage: 'leaves', label: 'leaves' },
  { days: 90,  sessions: 8,  stage: 'rooted', label: 'rooted' },
  { days: 180, sessions: 12, stage: 'mature', label: 'mature' },
];

function getPlantStage(firstSessionAt, sessionCount = 0) {
  if (!firstSessionAt) return PLANT_STAGES[0];

  const daysSince = Math.floor(
    (Date.now() - new Date(firstSessionAt).getTime()) / (1000 * 60 * 60 * 24)
  );
  // Stage requires both time and engagement — neither alone is enough
  const matched = PLANT_STAGES.filter(s => s.days <= daysSince && s.sessions <= sessionCount);
  return matched[matched.length - 1] || PLANT_STAGES[0];
}

// ─── Re-Entry Prompt ──────────────────────────────────────────────────────────

function getDaysSince(timestamp) {
  if (!timestamp) return Infinity;
  return Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60 * 24)
  );
}

function getHoursSince(timestamp) {
  if (!timestamp) return Infinity;
  return Math.floor(
    (Date.now() - new Date(timestamp).getTime()) / (1000 * 60 * 60)
  );
}

/**
 * Returns the re-entry prompt to show when a user comes back after 3+ days away.
 * Returns null if no re-entry screen should be shown.
 */
function getReentryPrompt(profile) {
  const daysSince = getDaysSince(profile.last_app_open);

  if (daysSince < 3) return null;

  // Post-action re-entry
  if (profile.last_action_completed_at && getDaysSince(profile.last_action_completed_at) < 5) {
    return {
      days_away: daysSince,
      question: 'How did that land?',
      context: 'post_action',
    };
  }

  // Post-activation re-entry
  if (profile.current_emotional_state === 'activated') {
    return {
      days_away: daysSince,
      question: 'How are you now?',
      context: 'post_activation',
    };
  }

  // Neutral re-entry
  return {
    days_away: daysSince,
    question: 'What happened?',
    context: 'neutral',
  };
}

/**
 * Post-crisis gate: show safety screen once on first open after a crisis flag.
 */
function getPostCrisisGate(profile) {
  if (!profile.last_crisis_flag_at) return false;
  const hoursSince = getHoursSince(profile.last_crisis_flag_at);
  return hoursSince < 48 && !profile.post_crisis_screen_shown;
}

// ─── Micro-Report (Day 7) ─────────────────────────────────────────────────────

const MICRO_REPORT_SYSTEM_PROMPT = `You are Emora's reflection engine. Generate a warm, brief early-progress micro-report.

This is NOT the full 15-day pattern report. It is a quiet acknowledgment of what the user has done so far —
whether that's been 5 sessions in 4 days or a few sessions over 10 days. Meet them where they are.

Format (use exactly these section headers, no markdown, no asterisks):

What I've noticed so far.

[1-2 gentle sentences acknowledging what the user brought to their sessions. Reference the most common trigger if available. Warm, not clinical. Adjust timing language to match session_count vs days — if they've had many sessions quickly, acknowledge their engagement; if slower, acknowledge the steadiness.]

A question to sit with:
[One open, non-leading question based on the dominant theme of the sessions. Not a homework assignment. A genuine invitation.]

See you whenever.

TONE: Warmer and shorter than the 15-day report. Acknowledge the newness of the relationship. Do not evaluate or grade. Do not use the word "journey" or "healing".`;

async function generateMicroReport(userId) {
  try {
    const [profileResult, sessions, actions, prevReport] = await Promise.all([
      query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]),
      query(`
        SELECT session_summary, triggers_mentioned, key_insight, session_date
        FROM conversation_summaries
        WHERE user_id = $1 AND session_date > NOW() - INTERVAL '8 days'
        ORDER BY session_date
      `, [userId]),
      query(`
        SELECT action_id, action_category, completed_at
        FROM action_history
        WHERE user_id = $1 AND served_at > NOW() - INTERVAL '8 days'
        ORDER BY served_at
        LIMIT 1
      `, [userId]),
      query(`
        SELECT micro_report_sent FROM user_profiles WHERE user_id = $1
      `, [userId])
    ]);

    const profile = profileResult.rows[0];
    if (!profile || profile.micro_report_sent) return null;

    const sessionCount = sessions.rows.length;
    if (sessionCount < 1) return null;

    // Find the top trigger
    const triggerMap = {};
    sessions.rows.forEach(s => {
      (s.triggers_mentioned || []).forEach(t => {
        triggerMap[t] = (triggerMap[t] || 0) + 1;
      });
    });
    const topTrigger = Object.entries(triggerMap).sort(([, a], [, b]) => b - a)[0]?.[0] || null;
    const firstAction = actions.rows[0]?.action_category || null;

    const daysSinceFirst = profile.first_session_at
      ? Math.floor((Date.now() - new Date(profile.first_session_at).getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    const dataBlock = `<period_data>
  <session_count>${sessionCount}</session_count>
  <days_since_first_session>${daysSinceFirst}</days_since_first_session>
  <report_triggered_by>${sessionCount >= 5 ? '5_sessions_reached' : '10_days_elapsed'}</report_triggered_by>
  <top_trigger>${topTrigger || 'not yet detected'}</top_trigger>
  <first_action_category>${firstAction || 'not yet tried'}</first_action_category>
  <sessions>
    ${sessions.rows.map(s =>
      `<session date="${new Date(s.session_date).toISOString().split('T')[0]}">${s.session_summary || s.key_insight || ''}</session>`
    ).join('\n    ')}
  </sessions>
</period_data>`;

    const content = await claudeMessage({
      system: MICRO_REPORT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: dataBlock }],
      maxTokens: 250
    });

    // Save micro report
    await query(`
      INSERT INTO micro_reports (user_id, content, top_trigger, first_action)
      VALUES ($1, $2, $3, $4)
    `, [userId, content, topTrigger, firstAction]);

    // Mark as sent on profile
    await query(
      'UPDATE user_profiles SET micro_report_sent = true, updated_at = NOW() WHERE user_id = $1',
      [userId]
    );

    return { content, top_trigger: topTrigger, first_action: firstAction };
  } catch (error) {
    console.error(`[Week1] Micro-report generation failed for ${userId.slice(0, 8)}:`, error.message);
    return null;
  }
}

/**
 * Usage-based micro-report eligibility:
 * Triggers on "5 sessions OR 10 days since first session, whichever comes first."
 *
 * Why: Power users who talk to Emora frequently shouldn't have to wait 10 days
 * for insights they've already earned. Casual users are still guaranteed a report
 * by day 10 even if they've only had a few sessions.
 *
 * Minimum 3 sessions required regardless — ensures enough data for a meaningful report.
 */
async function checkMicroReportEligibility(userId) {
  const result = await query(
    'SELECT first_session_at, session_count, micro_report_sent FROM user_profiles WHERE user_id = $1',
    [userId]
  );
  const profile = result.rows[0];
  if (!profile || profile.micro_report_sent) return false;
  if (!profile.first_session_at) return false;

  const sessionCount = profile.session_count || 0;
  const daysSinceFirst = getDaysSince(profile.first_session_at);

  // Minimum session requirement scales down with time elapsed:
  // - Default: 3 sessions minimum
  // - Past day 10: 2 sessions minimum (casual user who came back a few times)
  // - Past day 14: 1 session minimum (low-engagement user — still give them something)
  // This ensures no user is permanently locked out of their first report.
  const minSessions = daysSinceFirst >= 14 ? 1 : daysSinceFirst >= 10 ? 2 : 3;
  if (sessionCount < minSessions) return false;

  // Trigger if: 5+ sessions (power user) OR 10+ days (casual user)
  const enoughSessions = sessionCount >= 5;
  const enoughDays = daysSinceFirst >= 10;

  return enoughSessions || enoughDays;
}

/**
 * Record that the user opened the app (for re-entry detection).
 */
async function recordAppOpen(userId) {
  await query(
    'UPDATE user_profiles SET last_app_open = NOW(), updated_at = NOW() WHERE user_id = $1',
    [userId]
  ).catch(() => {}); // Non-critical
}

/**
 * Mark post-crisis screen as shown (so it only shows once per crisis event).
 */
async function markPostCrisisScreenShown(userId) {
  await query(
    'UPDATE user_profiles SET post_crisis_screen_shown = true, updated_at = NOW() WHERE user_id = $1',
    [userId]
  ).catch(() => {});
}

// ─── Weekly Pulse ─────────────────────────────────────────────────────────────
// Returns 7-day summary data if user is due for a weekly pulse.
// Available to all phases except maintenance (which has its own home screen). Once per 7 days.

async function getWeeklyPulse(profile) {
  const phase = profile.current_phase || profile.action_stage || 'awareness';
  // Maintenance users have a dedicated home screen — skip pulse there
  if (phase === 'maintenance') return null;

  // Only if 7+ days since last pulse (or never shown)
  const daysSincePulse = profile.last_weekly_pulse_at
    ? Math.floor((Date.now() - new Date(profile.last_weekly_pulse_at).getTime()) / (1000 * 60 * 60 * 24))
    : 999;

  if (daysSincePulse < 7) return null;

  // Only if user has 2+ sessions (not brand new)
  if ((profile.session_count || 0) < 2) return null;

  try {
    const [sessions, actions, rescues, insights] = await Promise.all([
      query(`
        SELECT COUNT(*) AS count
        FROM conversation_summaries
        WHERE user_id = $1 AND session_date > NOW() - INTERVAL '7 days'
      `, [profile.user_id]),
      query(`
        SELECT COUNT(*) FILTER (WHERE completed_at IS NOT NULL) AS completed
        FROM action_history
        WHERE user_id = $1 AND served_at > NOW() - INTERVAL '7 days'
      `, [profile.user_id]),
      query(`
        SELECT COUNT(*) AS count
        FROM rescue_sessions
        WHERE user_id = $1 AND started_at > NOW() - INTERVAL '7 days'
      `, [profile.user_id]),
      query(`
        SELECT key_insight FROM conversation_summaries
        WHERE user_id = $1
          AND session_date > NOW() - INTERVAL '7 days'
          AND key_insight IS NOT NULL
          AND key_insight != 'No clear insight surfaced'
        ORDER BY session_date DESC LIMIT 1
      `, [profile.user_id])
    ]);

    const sessionCount = parseInt(sessions.rows[0]?.count || 0);
    const actionsCompleted = parseInt(actions.rows[0]?.completed || 0);
    const rescueCount = parseInt(rescues.rows[0]?.count || 0);
    const topInsight = insights.rows[0]?.key_insight || null;

    // Only show pulse if there's meaningful activity to reflect
    if (sessionCount === 0 && actionsCompleted === 0) return null;

    // Mark pulse as shown (async, non-blocking)
    query(
      'UPDATE user_profiles SET last_weekly_pulse_at = NOW(), updated_at = NOW() WHERE user_id = $1',
      [profile.user_id]
    ).catch(() => {});

    return {
      session_count: sessionCount,
      actions_completed: actionsCompleted,
      rescue_count: rescueCount,
      emora_noticed: topInsight,
    };
  } catch (_) {
    return null;
  }
}

module.exports = {
  getPlantStage,
  getReentryPrompt,
  getPostCrisisGate,
  generateMicroReport,
  checkMicroReportEligibility,
  recordAppOpen,
  markPostCrisisScreenShown,
  getWeeklyPulse,
  getDaysSince,
  getHoursSince,
};
