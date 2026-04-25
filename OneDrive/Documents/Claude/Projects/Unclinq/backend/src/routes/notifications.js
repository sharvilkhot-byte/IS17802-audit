/**
 * NOTIFICATIONS ROUTES (E-03)
 *
 * GET  /api/notifications         — Returns unread in-app notifications for the user
 * POST /api/notifications/:id/dismiss — Marks a notification as dismissed
 */

const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');

// GET /api/notifications
router.get('/', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, type, message, action_path, created_at
      FROM in_app_notifications
      WHERE user_id = $1
        AND dismissed = false
        AND (expires_at IS NULL OR expires_at > NOW())
      ORDER BY created_at DESC
      LIMIT 5
    `, [req.user.id]);

    res.json({ notifications: result.rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/notifications/:id/dismiss
router.post('/:id/dismiss', authenticateUser, async (req, res, next) => {
  try {
    await query(
      'UPDATE in_app_notifications SET dismissed = true WHERE id = $1 AND user_id = $2',
      [req.params.id, req.user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
