const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');
const { generatePatternReport } = require('../services/write-back');

// GET /api/pattern-report/latest
router.get('/latest', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, content, closing_question, generated_at, period_end,
             period_start, session_count, key_insight, emotional_arc, patterns, triggers
      FROM pattern_reports
      WHERE user_id = $1
      ORDER BY generated_at DESC
      LIMIT 1
    `, [req.user.id]);

    if (result.rows.length === 0) {
      return res.json({
        report: null,
        message: "Your first pattern report will be ready after 7 days of using the app."
      });
    }

    res.json({ report: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// GET /api/pattern-report/all
router.get('/all', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, closing_question, generated_at, period_end
      FROM pattern_reports
      WHERE user_id = $1
      ORDER BY generated_at DESC
    `, [req.user.id]);

    res.json({ reports: result.rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/pattern-report/:id
router.get('/:id', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, content, closing_question, generated_at, period_end,
             period_start, session_count, key_insight, emotional_arc, patterns, triggers
      FROM pattern_reports
      WHERE id = $1 AND user_id = $2
    `, [req.params.id, req.user.id]);

    if (!result.rows[0]) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/pattern-report/generate (manual trigger for testing)
router.post('/generate', authenticateUser, async (req, res, next) => {
  try {
    // Check if a report was generated in the last 7 days (prevent spam)
    const recentCheck = await query(`
      SELECT id FROM pattern_reports
      WHERE user_id = $1 AND generated_at > NOW() - INTERVAL '7 days'
      LIMIT 1
    `, [req.user.id]);

    if (recentCheck.rows.length > 0 && process.env.NODE_ENV !== 'development') {
      return res.status(429).json({
        error: 'A report was generated recently. Reports are generated every 15 days.'
      });
    }

    const content = await generatePatternReport(req.user.id);
    if (!content) {
      return res.status(422).json({
        error: 'Not enough data yet. Use Emora, Action Lab, and Rescue Mode for at least a week.'
      });
    }

    res.json({ ok: true, message: 'Pattern report generated.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
