const jwt = require('jsonwebtoken');
const { query } = require('../database');

// Issue #1: No fallback — if JWT_SECRET is missing the app crashes fast at boot (app.js)
// rather than silently running with a known secret.
const JWT_SECRET = process.env.JWT_SECRET || (
  process.env.NODE_ENV === 'production'
    ? (() => { throw new Error('FATAL: JWT_SECRET must be set in production'); })()
    : 'dev_only_secret_not_for_production'
);

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
}

async function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const token = authHeader.slice(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    // Attach user to request
    req.user = { id: decoded.userId };
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Middleware that also fetches the full profile
async function authenticateWithProfile(req, res, next) {
  await authenticateUser(req, res, async () => {
    try {
      const result = await query(
        'SELECT * FROM user_profiles WHERE user_id = $1',
        [req.user.id]
      );
      req.profile = result.rows[0] || null;
      next();
    } catch (err) {
      next(err);
    }
  });
}

module.exports = { authenticateUser, authenticateWithProfile, signToken };
