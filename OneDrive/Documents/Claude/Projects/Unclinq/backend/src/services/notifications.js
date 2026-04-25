/**
 * SMART NOTIFICATION SERVICE (E-03)
 * Four targeted notifications — and only four.
 * Each has strict eligibility rules. Violating them erodes trust faster than silence.
 *
 * In Unclinq web, notifications are delivered in-app (no push infrastructure needed yet).
 * The scheduler writes eligible notifications to the DB; the frontend reads them on load.
 */

const { query } = require('../database');

const REENTRY_MESSAGES = [
  "Something worth continuing when you're ready.",
  "Still here.",
  "Your last note is waiting.",
  "The pattern you were looking at isn't going anywhere.",
];

function getDaysSince(ts) {
  if (!ts) return Infinity;
  return Math.floor((Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24));
}

function getHoursSince(ts) {
  if (!ts) return Infinity;
  return Math.floor((Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60));
}

// ─── Write a notification to the DB (de-duped by type per user) ───────────────
async function createNotification(userId, type, message, actionPath = null) {
  // Don't create duplicate un-dismissed notifications of the same type
  const existing = await query(`
    SELECT id FROM in_app_notifications
    WHERE user_id = $1 AND type = $2 AND dismissed = false
      AND (expires_at IS NULL OR expires_at > NOW())
  `, [userId, type]);
  if (existing.rows.length > 0) return null;

  const result = await query(`
    INSERT INTO in_app_notifications (user_id, type, message, action_path, expires_at)
    VALUES ($1, $2, $3, $4, NOW() + INTERVAL '7 days')
    RETURNING id
  `, [userId, type, message, actionPath]);
  return result.rows[0].id;
}

// ─── Notification 1: Re-entry nudge ──────────────────────────────────────────
async function checkReentryNudge(userId) {
  const result = await query(`
    SELECT current_emotional_state, last_app_open, session_count,
           reentry_nudge_count, reentry_churned, last_reentry_nudge_at,
           preferred_session_window
    FROM user_profiles WHERE user_id = $1
  `, [userId]);
  const p = result.rows[0];
  if (!p) return;

  const eligible =
    (p.session_count || 0) >= 2 &&
    getDaysSince(p.last_app_open) >= 4 &&
    p.current_emotional_state === 'stable' &&
    !p.reentry_churned &&
    getDaysSince(p.last_reentry_nudge_at) >= 4;

  if (!eligible) return;

  const count = p.reentry_nudge_count || 0;
  const message = REENTRY_MESSAGES[count % REENTRY_MESSAGES.length];

  await createNotification(userId, 'reentry', message, '/emora');

  // Increment counter — churn after 3 unresponded nudges
  const newCount = count + 1;
  await query(`
    UPDATE user_profiles
    SET last_reentry_nudge_at = NOW(),
        reentry_nudge_count = $2,
        reentry_churned = $3,
        updated_at = NOW()
    WHERE user_id = $1
  `, [userId, newCount, newCount >= 3]);
}

// ─── Notification 2: Pattern report ready ────────────────────────────────────
async function notifyReportReady(userId) {
  await createNotification(
    userId,
    'report_ready',
    'Your 15-day pattern report is ready.',
    '/report'
  );
}

// ─── Notification 3: Post-rescue Emora bridge ────────────────────────────────
// Called 2h after rescue session ends with exit_path = 'close'
async function checkPostRescueBridge(userId, rescueSession) {
  if ((rescueSession.duration_seconds || 0) < 180) return; // Only if user engaged 3+ min
  if (rescueSession.exit_path !== 'close') return;         // Only if they didn't already go to Emora

  // Check if they've opened Emora since the rescue session
  const recentEmora = await query(`
    SELECT COUNT(*) FROM conversation_summaries
    WHERE user_id = $1 AND session_date > $2
  `, [userId, rescueSession.ended_at || new Date(Date.now() - 2 * 60 * 60 * 1000)]);

  if (parseInt(recentEmora.rows[0].count) > 0) return; // Already talked to Emora

  // Check current state — never send if crisis
  const profileResult = await query(
    'SELECT current_emotional_state FROM user_profiles WHERE user_id = $1',
    [userId]
  );
  if (profileResult.rows[0]?.current_emotional_state === 'crisis') return;

  await createNotification(
    userId,
    'post_rescue',
    "You handled something earlier. Emora's here if you want to look at what it was.",
    '/emora'
  );
}

// ─── Notification 4: Action Lab prompt ───────────────────────────────────────
async function checkActionLabPrompt(userId) {
  const result = await query(`
    SELECT current_emotional_state, last_action_lab_visit, action_stage
    FROM user_profiles WHERE user_id = $1
  `, [userId]);
  const p = result.rows[0];
  if (!p) return;

  const eligible =
    p.current_emotional_state === 'stable' &&
    getDaysSince(p.last_action_lab_visit) >= 5 &&
    p.action_stage !== 'awareness'; // Don't push first-time users

  if (!eligible) return;

  await createNotification(
    userId,
    'action_lab',
    "There's something waiting for you.",
    '/actions'
  );
}

// ─── Run all checks for a user (called by scheduler) ─────────────────────────
async function runNotificationChecks(userId) {
  await Promise.allSettled([
    checkReentryNudge(userId),
    checkActionLabPrompt(userId),
  ]);
}

module.exports = {
  runNotificationChecks,
  notifyReportReady,
  checkPostRescueBridge,
  checkReentryNudge,
  checkActionLabPrompt,
};
