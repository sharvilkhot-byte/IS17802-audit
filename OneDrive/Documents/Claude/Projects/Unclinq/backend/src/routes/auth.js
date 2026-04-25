const router = require('express').Router();
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { query } = require('../database');
const { authenticateUser, signToken } = require('../middleware/auth');
const { clearSession } = require('../services/session-manager');
const { sendPasswordResetEmail, sendOtpEmail } = require('../services/email');

// ─── OTP helpers ─────────────────────────────────────────────────────────
function generateOtp() {
  // Cryptographically random 6-digit code (000000–999999, zero-padded)
  return String(crypto.randomInt(0, 1000000)).padStart(6, '0');
}

function hashOtp(code) {
  return crypto.createHash('sha256').update(code).digest('hex');
}

// POST /api/auth/send-otp
// Generates a 6-digit code and emails it. Works for both login and registration.
router.post('/send-otp', async (req, res, next) => {
  try {
    const { email, purpose = 'login' } = req.body;
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: 'Valid email is required' });
    }
    if (!['login', 'register'].includes(purpose)) {
      return res.status(400).json({ error: 'Invalid purpose' });
    }

    const normalEmail = email.toLowerCase().trim();

    // Rate limit: max 5 OTP requests per email per 10 minutes
    const { cache } = require('../cache');
    const rlKey = `otp_rate:${normalEmail}`;
    const raw = await cache.get(rlKey).catch(() => null);
    const attempts = raw ? parseInt(raw, 10) : 0;
    if (attempts >= 5) {
      return res.status(429).json({ error: 'Too many code requests. Wait 10 minutes.' });
    }
    await cache.set(rlKey, String(attempts + 1), 600).catch(() => {});

    const code = generateOtp();
    const codeHash = hashOtp(code);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Upsert: one active OTP per email+purpose
    await query(`
      INSERT INTO auth_otps (email, code_hash, purpose, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email, purpose) WHERE used = false
      DO UPDATE SET code_hash = $2, expires_at = $4, attempts = 0, created_at = NOW()
    `, [normalEmail, codeHash, purpose, expiresAt]);

    const emailResult = await sendOtpEmail(normalEmail, code, purpose);
    if (!emailResult.ok) {
      console.error('OTP email failed:', emailResult.error);
      // Still return success to avoid leaking email existence, but log it
    }

    res.json({ ok: true, message: 'Code sent. Check your email.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/verify-otp
// Verifies the 6-digit code. If valid and user doesn't exist yet, creates the account.
// Returns JWT + user on success.
router.post('/verify-otp', async (req, res, next) => {
  try {
    const { email, code, purpose = 'login', name } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Email and code are required' });
    }
    if (!/^\d{6}$/.test(code)) {
      return res.status(400).json({ error: 'Code must be 6 digits' });
    }

    const normalEmail = email.toLowerCase().trim();
    const codeHash = hashOtp(code);

    // Fetch active OTP
    const otpResult = await query(`
      SELECT id, code_hash, expires_at, attempts
      FROM auth_otps
      WHERE email = $1 AND purpose = $2 AND used = false
      LIMIT 1
    `, [normalEmail, purpose]);

    if (!otpResult.rows[0]) {
      return res.status(400).json({ error: 'No active code found. Request a new one.' });
    }

    const otp = otpResult.rows[0];

    // Check expiry
    if (new Date(otp.expires_at) < new Date()) {
      await query('UPDATE auth_otps SET used = true WHERE id = $1', [otp.id]);
      return res.status(400).json({ error: 'Code expired. Request a new one.' });
    }

    // Check max attempts
    if (otp.attempts >= 5) {
      await query('UPDATE auth_otps SET used = true WHERE id = $1', [otp.id]);
      return res.status(400).json({ error: 'Too many wrong attempts. Request a new code.' });
    }

    // Verify code
    if (otp.code_hash !== codeHash) {
      await query('UPDATE auth_otps SET attempts = attempts + 1 WHERE id = $1', [otp.id]);
      const remaining = 5 - (otp.attempts + 1);
      return res.status(400).json({ error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` });
    }

    // Mark OTP used
    await query('UPDATE auth_otps SET used = true WHERE id = $1', [otp.id]);

    // Find or create user
    let user;
    const existingUser = await query(
      'SELECT u.id, u.email, u.name, up.onboarding_completed, up.primary_style, up.color_preference FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.email = $1',
      [normalEmail]
    );

    if (existingUser.rows.length > 0) {
      user = existingUser.rows[0];
      await query('UPDATE user_profiles SET last_active = NOW() WHERE user_id = $1', [user.id]);
    } else {
      // Create new passwordless account
      const newUser = await query(
        'INSERT INTO users (email, password_hash, name) VALUES ($1, NULL, $2) RETURNING id, email, name',
        [normalEmail, name ? name.trim().slice(0, 100) : null]
      );
      user = newUser.rows[0];
      await query('INSERT INTO user_profiles (user_id) VALUES ($1)', [user.id]);
      user.onboarding_completed = false;
      user.primary_style = null;
      user.color_preference = null;
    }

    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboarding_completed: user.onboarding_completed || false,
        primary_style: user.primary_style || null,
        color_preference: user.color_preference || null,
      },
      onboarding_completed: user.onboarding_completed || false,
      is_new_user: existingUser.rows.length === 0,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    const existing = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'An account with this email already exists' });
    }

    const hash = await bcrypt.hash(password, 12);
    const result = await query(
      'INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name',
      [email.toLowerCase(), hash, name || null]
    );
    const user = result.rows[0];

    // Create blank profile
    await query(
      'INSERT INTO user_profiles (user_id) VALUES ($1)',
      [user.id]
    );

    const token = signToken(user.id);
    res.status(201).json({
      token,
      user: { id: user.id, email: user.email, name: user.name },
      onboarding_required: true
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const result = await query(
      'SELECT u.id, u.email, u.name, u.password_hash, up.onboarding_completed, up.primary_style, up.color_preference FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Update last_active
    await query('UPDATE user_profiles SET last_active = NOW() WHERE user_id = $1', [user.id]);

    const token = signToken(user.id);
    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        onboarding_completed: user.onboarding_completed || false,
        primary_style: user.primary_style,
        color_preference: user.color_preference || null
      },
      onboarding_completed: user.onboarding_completed || false,
      primary_style: user.primary_style,
      color_preference: user.color_preference || null
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticateUser, async (req, res, next) => {
  try {
    const [profileResult, actionsResult, rescueResult] = await Promise.all([
      // Fix: Explicitly enumerate safe columns — never SELECT * to avoid leaking
      // internal columns (password_hash, token_hash, reentry_churned, etc.)
      query(`
        SELECT u.id, u.email, u.name,
               up.primary_style, up.secondary_style, up.relationship_situation,
               up.awareness_level, up.action_stage, up.current_phase,
               up.current_emotional_state, up.onboarding_completed,
               up.active_patterns, up.detected_triggers, up.improved_patterns,
               up.last_active, up.session_count, up.phase_sessions,
               up.pending_phase_entry, up.maintenance_mode,
               up.onboarding_intention, up.stress_state_clean_sessions,
               up.user_context, up.first_session_at, up.color_preference
        FROM users u
        LEFT JOIN user_profiles up ON up.user_id = u.id
        WHERE u.id = $1
      `, [req.user.id]),
      // Compute actions_completed_30d dynamically (true rolling window)
      query(`
        SELECT COUNT(*) AS count
        FROM action_history
        WHERE user_id = $1
          AND completed_at IS NOT NULL
          AND completed_at > NOW() - INTERVAL '30 days'
      `, [req.user.id]),
      // Compute rescue_mode_count_30d dynamically
      query(`
        SELECT COUNT(*) AS count
        FROM rescue_sessions
        WHERE user_id = $1
          AND started_at > NOW() - INTERVAL '30 days'
      `, [req.user.id]),
    ]);

    if (!profileResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }

    const profile = profileResult.rows[0];

    // #10: Auto-reset activated state after 6h of no session activity
    if (profile.current_emotional_state === 'activated' && profile.last_active) {
      const hoursSince = (Date.now() - new Date(profile.last_active).getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 6) {
        await query(
          "UPDATE user_profiles SET current_emotional_state = 'stable', updated_at = NOW() WHERE user_id = $1 AND current_emotional_state = 'activated'",
          [req.user.id]
        ).catch(() => {});
        profile.current_emotional_state = 'stable';
      }
    }

    // #8: Auto-reset crisis state after 48h — crisis gates features indefinitely otherwise
    // The safety screen is separate (shown once on home load); this resets the feature gate
    if (profile.current_emotional_state === 'crisis' && profile.last_crisis_flag_at) {
      const hoursSince = (Date.now() - new Date(profile.last_crisis_flag_at).getTime()) / (1000 * 60 * 60);
      if (hoursSince >= 48) {
        await query(
          "UPDATE user_profiles SET current_emotional_state = 'stable', updated_at = NOW() WHERE user_id = $1 AND current_emotional_state = 'crisis'",
          [req.user.id]
        ).catch(() => {});
        profile.current_emotional_state = 'stable';
      }
    }

    const user = {
      ...profile,
      actions_completed_30d: parseInt(actionsResult.rows[0]?.count || 0),
      rescue_mode_count_30d: parseInt(rescueResult.rows[0]?.count || 0),
    };

    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/auth/settings
// Updates editable user fields: name, relationship_situation, user_context
router.patch('/settings', authenticateUser, async (req, res, next) => {
  try {
    const { name, relationship_situation, user_context } = req.body;
    const validSituations = ['in_relationship', 'dating', 'unrequited', 'post_breakup', 'single_healing'];

    if (relationship_situation && !validSituations.includes(relationship_situation)) {
      return res.status(400).json({ error: 'Invalid relationship_situation value' });
    }

    const ops = [];

    // Update name in users table if provided
    if (name !== undefined) {
      const cleanName = name ? name.trim().slice(0, 100) : null;
      ops.push(query('UPDATE users SET name = $1 WHERE id = $2', [cleanName, req.user.id]));
    }

    // Build user_profiles updates
    const profileUpdates = [];
    const profileValues = [];
    let idx = 1;

    if (relationship_situation !== undefined) {
      profileUpdates.push(`relationship_situation = $${idx++}`);
      profileValues.push(relationship_situation);
    }

    if (user_context !== undefined && user_context !== null && typeof user_context === 'object') {
      // Sanitize: allow up to 3 people (name + role) and a situation note (200 chars)
      const sanitized = {
        people: Array.isArray(user_context.people)
          ? user_context.people.slice(0, 3).map(p => ({
              name: String(p.name || '').trim().slice(0, 50),
              role: String(p.role || '').trim().slice(0, 30),
            })).filter(p => p.name)
          : [],
        situation: String(user_context.situation || '').trim().slice(0, 200),
      };
      profileUpdates.push(`user_context = $${idx++}`);
      profileValues.push(JSON.stringify(sanitized));
    }

    if (profileUpdates.length > 0) {
      profileValues.push(req.user.id);
      ops.push(query(
        `UPDATE user_profiles SET ${profileUpdates.join(', ')}, updated_at = NOW() WHERE user_id = $${idx}`,
        profileValues
      ));
    }

    if (ops.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    await Promise.all(ops);

    // Flush Emora session so the next conversation picks up fresh context.
    // Settings changes (name, situation, user_context) are injected via the context engine —
    // stale cached sessions would use the old values for up to 3 hours otherwise.
    clearSession(req.user.id).catch(() => {});

    // Return updated user
    const result = await query(`
      SELECT u.id, u.email, u.name, up.primary_style, up.secondary_style,
             up.relationship_situation, up.awareness_level, up.action_stage,
             up.current_emotional_state, up.onboarding_completed, up.user_context
      FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id
      WHERE u.id = $1
    `, [req.user.id]);

    res.json({ user: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/request-reassessment
// User-initiated style reassessment — flags for re-evaluation on next Emora session
router.post('/request-reassessment', authenticateUser, async (req, res, next) => {
  try {
    await query(
      `UPDATE user_profiles
       SET reassessment_offered = false, assessment_confidence = 'low',
           reassessment_requested_at = NOW(), updated_at = NOW()
       WHERE user_id = $1`,
      [req.user.id]
    );
    res.json({ ok: true, message: "Emora will gently revisit your attachment style in your next session." });
  } catch (err) { next(err); }
});

// GET /api/auth/export-data
// Returns all user data as JSON (GDPR data portability)
router.get('/export-data', authenticateUser, async (req, res, next) => {
  try {
    const [profileRes, sessionsRes, actionsRes, rescueRes, reportsRes] = await Promise.all([
      query(`SELECT u.email, u.name, u.created_at, up.primary_style, up.secondary_style,
                    up.relationship_situation, up.awareness_level, up.action_stage,
                    up.active_patterns, up.improved_patterns, up.detected_triggers,
                    up.onboarding_intention, up.session_count, up.first_session_at,
                    up.user_context
             FROM users u LEFT JOIN user_profiles up ON up.user_id = u.id WHERE u.id = $1`,
        [req.user.id]),
      query(`SELECT session_date, key_insight, emotional_state_start, emotional_state_end,
                    triggers_mentioned, patterns_active,
                    mood_end, reflection_note, duration_seconds, message_count
             FROM conversation_summaries WHERE user_id = $1 ORDER BY session_date DESC`,
        [req.user.id]),
      query(`SELECT action_id, action_category, served_at, completed_at, effectiveness
             FROM action_history WHERE user_id = $1 ORDER BY served_at DESC`,
        [req.user.id]),
      query(`SELECT activation_type, exercise_used, duration_seconds, started_at
             FROM rescue_sessions WHERE user_id = $1 ORDER BY started_at DESC`,
        [req.user.id]),
      query(`SELECT period_end, generated_at, closing_question
             FROM pattern_reports WHERE user_id = $1 ORDER BY generated_at DESC`,
        [req.user.id]),
    ]);

    res.json({
      exported_at: new Date().toISOString(),
      profile: profileRes.rows[0] || {},
      sessions: sessionsRes.rows,
      actions: actionsRes.rows,
      rescue_sessions: rescueRes.rows,
      pattern_reports: reportsRes.rows,
    });
  } catch (err) { next(err); }
});

// POST /api/auth/refresh
// Exchanges a valid token for a fresh one — extends session without forcing re-login
router.post('/refresh', authenticateUser, async (req, res, next) => {
  try {
    // authenticateUser already verified the current token; just issue a new one
    const newToken = signToken(req.user.id);
    res.json({ token: newToken });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/auth/account
// Hard-deletes the user and all associated data (GDPR compliance)
router.delete('/account', authenticateUser, async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return res.status(400).json({ error: 'Password is required to confirm account deletion' });
    }

    // Verify password before deleting
    const userResult = await query('SELECT password_hash FROM users WHERE id = $1', [req.user.id]);
    if (!userResult.rows[0]) {
      return res.status(404).json({ error: 'User not found' });
    }
    const valid = await bcrypt.compare(password, userResult.rows[0].password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Incorrect password' });
    }

    // Cascade delete — all related data is removed via ON DELETE CASCADE in the schema
    await query('DELETE FROM users WHERE id = $1', [req.user.id]);

    res.json({ ok: true, message: 'Your account and all data have been permanently deleted.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/forgot-password
// Generates a reset token (stored in DB); email delivery is handled externally
// TODO: Integrate an email provider (SendGrid, Resend, SES, etc.) to deliver the
// reset link. Until then the raw token is logged to console in development only.
router.post('/forgot-password', async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // Rate limit: 3 requests per email per 10 minutes to prevent abuse
    const rateLimitKey = `pw_reset_rate:${email.toLowerCase()}`;
    const { cache } = require('../cache');
    const raw = await cache.get(rateLimitKey).catch(() => null);
    const attempts = raw ? parseInt(raw, 10) : 0;
    if (attempts >= 3) {
      return res.status(429).json({ error: 'Too many requests. Please wait 10 minutes before trying again.' });
    }
    await cache.set(rateLimitKey, String(attempts + 1), 600).catch(() => {}); // 10-min window

    const result = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    // Always return 200 to prevent email enumeration attacks
    if (result.rows.length === 0) {
      return res.json({ ok: true, message: 'If that email is registered, a reset link will be sent.' });
    }

    const userId = result.rows[0].id;
    // Generate a secure reset token (UUID v4) — keep raw token for the email link,
    // store bcrypt hash in DB so a DB leak doesn't expose valid reset tokens.
    const { v4: uuidv4 } = require('uuid');
    const resetToken = uuidv4();
    const tokenHash = await bcrypt.hash(resetToken, 10); // 10 rounds — fast enough for reset flow
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store hashed token (upsert — one active token per user)
    // token column kept for backwards compatibility but token_hash is the authoritative value.
    await query(`
      INSERT INTO password_reset_tokens (user_id, token, token_hash, expires_at)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (user_id) DO UPDATE
        SET token = $2, token_hash = $3, expires_at = $4, used = false
    `, [userId, '[hashed]', tokenHash, expiresAt]);

    await sendPasswordResetEmail(email.toLowerCase(), resetToken);

    res.json({ ok: true, message: 'If that email is registered, a reset link will be sent.' });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res, next) => {
  try {
    const { token, new_password } = req.body;
    if (!token || !new_password) {
      return res.status(400).json({ error: 'Token and new_password are required' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    // Fix #6: Tokens are now bcrypt-hashed. We fetch all unexpired tokens and
    // bcrypt.compare each until we find a match. Since there's only one token
    // per user (upsert), this means at most one DB row to check.
    const result = await query(`
      SELECT user_id, token_hash, token FROM password_reset_tokens
      WHERE expires_at > NOW() AND used = false
    `);

    let userId = null;
    for (const row of result.rows) {
      if (row.token_hash) {
        const match = await bcrypt.compare(token, row.token_hash);
        if (match) { userId = row.user_id; break; }
      } else if (row.token === token) {
        // Fallback for any pre-migration tokens that were not hashed
        userId = row.user_id; break;
      }
    }

    if (!userId) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }
    const hash = await bcrypt.hash(new_password, 12);

    await Promise.all([
      query('UPDATE users SET password_hash = $2 WHERE id = $1', [userId, hash]),
      query('UPDATE password_reset_tokens SET used = true WHERE user_id = $1', [userId]),
    ]);

    res.json({ ok: true, message: 'Password updated. You can now log in.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
