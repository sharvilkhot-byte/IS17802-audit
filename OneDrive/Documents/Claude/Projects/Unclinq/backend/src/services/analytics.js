/**
 * ANALYTICS SERVICE
 * Lightweight event logging to user_events table.
 * All functions are fire-and-forget — failures are silent.
 *
 * Key events to track:
 *   onboarding_completed      — user finishes onboarding
 *   first_emora_session       — first Emora message sent
 *   emora_session_completed   — session ended with 4+ messages
 *   rescue_mode_used          — rescue session started
 *   action_completed          — action marked done
 *   insight_tab_read          — insight tab opened and dwell > 10s
 *   pattern_report_viewed     — pattern report opened
 *   stage_upgraded            — action_stage moved up
 *   crisis_flagged            — crisis protocol triggered
 *   reentry_after_days        — user returns after 3+ days away
 */

const { query } = require('../database');

/**
 * Log a named event for a user.
 * @param {string} userId
 * @param {string} event  — snake_case event name
 * @param {object} [metadata] — optional extra data
 */
async function logEvent(userId, event, metadata = {}) {
  try {
    await query(
      'INSERT INTO user_events (user_id, event, metadata) VALUES ($1, $2, $3)',
      [userId, event, JSON.stringify(metadata)]
    );
  } catch (_) {
    // Never throw — analytics must never break the user experience
  }
}

/**
 * Check whether a specific event has already been logged for a user.
 * Useful for one-time events like first_emora_session.
 * @returns {Promise<boolean>}
 */
async function hasLoggedEvent(userId, event) {
  try {
    const result = await query(
      'SELECT 1 FROM user_events WHERE user_id = $1 AND event = $2 LIMIT 1',
      [userId, event]
    );
    return result.rows.length > 0;
  } catch (_) {
    return false;
  }
}

module.exports = { logEvent, hasLoggedEvent };
