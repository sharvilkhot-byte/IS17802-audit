/**
 * WEEK 1 ROUTES
 * Endpoints that power the five Week 1 Experience moments.
 *
 * GET  /api/week1/reentry     — Called on every app open; returns re-entry data, plant stage, crisis gate
 * GET  /api/week1/micro-report — Returns the Day 7 micro-report if available
 * POST /api/week1/app-open    — Records the app open timestamp (for re-entry detection)
 */

const router = require('express').Router();
const { authenticateUser } = require('../middleware/auth');
const { query } = require('../database');
const {
  getPlantStage,
  getReentryPrompt,
  getPostCrisisGate,
  recordAppOpen,
  markPostCrisisScreenShown,
  getWeeklyPulse,
} = require('../services/week1');
const { checkReentryChurn } = require('../services/write-back');
const { logEvent } = require('../services/analytics');

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/week1/reentry
// Called on every authenticated app open. Returns everything the home screen
// needs to decide what to show the user first.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/reentry', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;

    const result = await query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]);
    const profile = result.rows[0];
    if (!profile) return res.json({ show_reentry: false });

    // Plant stage (always returned — never null)
    // Requires both time and session count so abandoned accounts don't "grow"
    const plant = getPlantStage(profile.first_session_at, profile.session_count || 0);

    // Post-crisis gate (show safety screen first, once)
    // #8: Atomic claim — UPDATE returns 1 row only if not yet shown, preventing race condition
    // on rapid re-opens (two concurrent calls would both read shown=false but only one UPDATE lands)
    let showSafetyScreen = false;
    if (getPostCrisisGate(profile)) {
      const claimed = await query(
        `UPDATE user_profiles SET post_crisis_screen_shown = true, updated_at = NOW()
         WHERE user_id = $1 AND post_crisis_screen_shown = false AND last_crisis_flag_at IS NOT NULL
         RETURNING user_id`,
        [userId]
      ).catch(() => ({ rows: [] }));
      showSafetyScreen = claimed.rows.length > 0;
    }

    // Re-entry prompt (only if 3+ days away)
    const reentryData = getReentryPrompt(profile);

    // Check for unseen micro-report
    let microReport = null;
    if (profile.micro_report_sent) {
      const mrResult = await query(
        'SELECT content, top_trigger, first_action, generated_at FROM micro_reports WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1',
        [userId]
      );
      if (mrResult.rows.length > 0) {
        // Only surface it once (when it's fresh — within 7 days of being generated)
        const mr = mrResult.rows[0];
        const daysSinceGenerated = Math.floor(
          (Date.now() - new Date(mr.generated_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysSinceGenerated <= 7) {
          microReport = mr;
        }
      }
    }

    // Record this app open (async, non-blocking)
    recordAppOpen(userId).catch(() => {});

    // If re-entry prompt is being shown, increment nudge counter
    if (reentryData) {
      query(`
        UPDATE user_profiles
        SET reentry_nudge_count   = COALESCE(reentry_nudge_count, 0) + 1,
            last_reentry_nudge_at = NOW(),
            updated_at            = NOW()
        WHERE user_id = $1
      `, [userId]).catch(() => {});

      logEvent(userId, 'reentry_after_days', { days_away: reentryData.days_away }).catch(() => {});
    }

    // Check for churn — silent, fire-and-forget
    checkReentryChurn(userId).catch(() => {});

    // Weekly Pulse — 7-day summary for Phase 1 and Phase 2 users
    const weeklyPulse = await getWeeklyPulse(profile).catch(() => null);

    // Last session key insight — shown on home as a quiet reminder of what emerged
    const insightResult = await query(`
      SELECT key_insight, session_date
      FROM conversation_summaries
      WHERE user_id = $1
        AND key_insight IS NOT NULL
        AND key_insight != 'No clear insight surfaced'
      ORDER BY session_date DESC LIMIT 1
    `, [userId]).catch(() => ({ rows: [] }));
    const lastSessionInsight = insightResult.rows[0] || null;

    res.json({
      show_reentry: !!reentryData,
      reentry: reentryData,
      show_safety_screen: showSafetyScreen,
      plant_stage: plant.stage,
      plant_days: plant.days,
      micro_report: microReport,
      session_count: profile.session_count || 0,
      // Phase entry moment: null or 'interruption' / 'replacement' / 'consolidation' / 'maintenance'
      // Shown as a full-screen moment exactly once when user enters a new phase.
      pending_phase_entry: profile.pending_phase_entry || null,
      // Pass attachment style so frontend can render style-specific copy
      primary_style: profile.primary_style || null,
      // Weekly pulse: 7-day activity summary shown on reentry for all phases except maintenance
      // (maintenance users have their own home screen — getWeeklyPulse already returns null for them)
      weekly_pulse: weeklyPulse || null,
      // Current phase — used by frontend to switch to MaintenanceModeCard
      current_phase: profile.current_phase || profile.action_stage || 'awareness',
      maintenance_mode: profile.maintenance_mode || false,
      // Last session insight — shown quietly on home as a reminder of what surfaced
      last_session_insight: lastSessionInsight,
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/week1/dismiss-phase-entry
// Called when the user taps "Continue" on the phase entry moment screen.
// Clears the pending_phase_entry flag so it never shows again.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/dismiss-phase-entry', authenticateUser, async (req, res, next) => {
  try {
    await query(`
      UPDATE user_profiles
      SET pending_phase_entry = NULL, updated_at = NOW()
      WHERE user_id = $1
    `, [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/week1/pending-milestone
// Returns the first unseen milestone event for the user.
// ─────────────────────────────────────────────────────────────────────────────
router.get('/pending-milestone', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, milestone_type, phase, surface_data, triggered_at
      FROM milestone_events
      WHERE user_id = $1 AND seen_at IS NULL
      ORDER BY triggered_at ASC
      LIMIT 1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json({ milestone: null });
    }

    res.json({ milestone: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/week1/dismiss-milestone/:id
// Marks a milestone as seen so it doesn't show again.
// ─────────────────────────────────────────────────────────────────────────────
router.post('/dismiss-milestone/:id', authenticateUser, async (req, res, next) => {
  try {
    await query(`
      UPDATE milestone_events
      SET seen_at = NOW()
      WHERE id = $1 AND user_id = $2
    `, [req.params.id, req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/week1/micro-report
// Returns the Day 7 micro-report content if it exists
// ─────────────────────────────────────────────────────────────────────────────
router.get('/micro-report', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT content, top_trigger, first_action, generated_at FROM micro_reports WHERE user_id = $1 ORDER BY generated_at DESC LIMIT 1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.json({ report: null });
    }

    res.json({ report: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/week1/app-open
// Lightweight ping on every app load — records last_app_open for re-entry logic
// ─────────────────────────────────────────────────────────────────────────────
router.post('/app-open', authenticateUser, async (req, res) => {
  recordAppOpen(req.user.id).catch(() => {});
  res.json({ ok: true });
});

module.exports = router;
