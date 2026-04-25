const cron = require('node-cron');
const { query } = require('../database');
const { generatePatternReport } = require('../services/write-back');
const { checkMicroReportEligibility, generateMicroReport } = require('../services/week1');
const { runNotificationChecks, notifyReportReady } = require('../services/notifications');

/**
 * Pattern Report Scheduler
 * Runs daily at 9 AM. Finds users who are due for a 15-day report and generates them.
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Only start scheduler in production or if explicitly enabled
if (process.env.NODE_ENV === 'production' || process.env.ENABLE_SCHEDULER === 'true') {
  cron.schedule('0 9 * * *', async () => {
    console.log('[Scheduler] Pattern report job started');

    try {
      const dueUsers = await query(`
        SELECT u.id
        FROM users u
        LEFT JOIN (
          SELECT user_id, MAX(generated_at) AS last_report
          FROM pattern_reports
          GROUP BY user_id
        ) pr ON pr.user_id = u.id
        JOIN user_profiles up ON up.user_id = u.id
        WHERE (pr.last_report IS NULL OR pr.last_report < NOW() - INTERVAL '15 days')
        AND u.created_at < NOW() - INTERVAL '7 days'
        AND up.last_active > NOW() - INTERVAL '15 days'
        AND up.onboarding_completed = true
      `);

      console.log(`[Scheduler] Generating reports for ${dueUsers.rows.length} users`);

      const batchSize = 3;
      for (let i = 0; i < dueUsers.rows.length; i += batchSize) {
        const batch = dueUsers.rows.slice(i, i + batchSize);
        await Promise.allSettled(
          batch.map(user =>
            generatePatternReport(user.id)
              .then(() => {
                console.log(`[Scheduler] Report done for ${user.id.slice(0, 8)}`);
                notifyReportReady(user.id).catch(() => {}); // E-03: in-app notification
              })
              .catch(err => console.error(`[Scheduler] Report failed for ${user.id.slice(0, 8)}:`, err.message))
          )
        );
        // Rate limit between batches
        if (i + batchSize < dueUsers.rows.length) {
          await sleep(5000);
        }
      }

      console.log('[Scheduler] Pattern report job completed');
    } catch (error) {
      console.error('[Scheduler] Job failed:', error.message);
    }

    // ── Day 7 Micro-Report check ─────────────────────────────────────────────
    try {
      const microReportCandidates = await query(`
        SELECT u.id
        FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        WHERE up.onboarding_completed = true
          AND up.micro_report_sent = false
          AND up.first_session_at IS NOT NULL
          AND up.first_session_at < NOW() - INTERVAL '7 days'
          AND (up.last_crisis_flag_at IS NULL OR up.last_crisis_flag_at < NOW() - INTERVAL '48 hours')
      `);

      console.log(`[Scheduler] Checking ${microReportCandidates.rows.length} users for Day 7 micro-report`);

      for (const user of microReportCandidates.rows) {
        const eligible = await checkMicroReportEligibility(user.id);
        if (eligible) {
          generateMicroReport(user.id)
            .then(r => r && console.log(`[Scheduler] Micro-report generated for ${user.id.slice(0, 8)}`))
            .catch(err => console.error(`[Scheduler] Micro-report failed for ${user.id.slice(0, 8)}:`, err.message));
          await sleep(2000); // gentle rate limit between AI calls
        }
      }
    } catch (error) {
      console.error('[Scheduler] Micro-report job failed:', error.message);
    }
  });

  console.log('[Scheduler] Pattern report + micro-report scheduler initialized (runs daily at 9 AM)');

  // E-03: Notification eligibility sweep — runs daily at 10 AM
  cron.schedule('0 10 * * *', async () => {
    console.log('[Scheduler] Notification eligibility check started');
    try {
      const activeUsers = await query(`
        SELECT u.id FROM users u
        JOIN user_profiles up ON up.user_id = u.id
        WHERE up.onboarding_completed = true
          AND up.last_active > NOW() - INTERVAL '30 days'
      `);
      for (const user of activeUsers.rows) {
        runNotificationChecks(user.id).catch(() => {});
        await sleep(100); // gentle rate limit
      }
    } catch (err) {
      console.error('[Scheduler] Notification check failed:', err.message);
    }
  });
}

module.exports = {};
