const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');
const { claudeMessage } = require('../ai/clients');
const { cache } = require('../cache');
const { buildContextPackage, touchLastActive } = require('../services/context-engine');
const {
  getOrCreateSession,
  addMessage,
  clearSession,
  saveSession,
  buildMessagesForClaude
} = require('../services/session-manager');
const { processSessionEnd, processCrisisFlag } = require('../services/write-back');
const { logEvent, hasLoggedEvent } = require('../services/analytics');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emora/message
// ─────────────────────────────────────────────────────────────────────────────
router.post('/message', authenticateUser, async (req, res, next) => {
  const userId = req.user.id;
  const lockKey = `emora_lock:${userId}`;

  try {
    const { message } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }
    if (message.length > 2000) {
      return res.status(400).json({ error: 'Message too long' });
    }

    // ── Concurrency lock ─────────────────────────────────────────────────────
    // Prevent race condition: if two requests arrive simultaneously (e.g., user
    // double-taps send), only the first one proceeds. The second gets a gentle
    // rejection. Lock auto-expires in 30 seconds to prevent deadlocks.
    const lockAcquired = await cache.setnx(lockKey, '1', 30);
    if (!lockAcquired) {
      return res.status(429).json({
        error: 'Emora is still thinking. Please wait a moment.',
        retry_after: 2
      });
    }

    // Build context package (profile + recent summaries + rescue bridge)
    const context = await buildContextPackage(userId, 'emora');

    // Get current session
    const session = await getOrCreateSession(userId);

    // Don't continue if crisis was flagged — unless user signals they're safe
    if (session.crisis_flagged) {
      const lower = message.toLowerCase().trim();
      const safeSignals = [
        "i'm okay", "im okay", "i am okay", "i'm safe", "im safe", "i am safe",
        "i'm fine", "im fine", "i am fine", "i'm alright", "im alright",
        "i called", "i talked to", "i reached out", "i'm with someone",
        "crisis passed", "feeling better", "i'm better", "im better"
      ];
      const userIsSafe = safeSignals.some(s => lower.includes(s));

      if (!userIsSafe) {
        return res.json({
          message: "I'm still here when you're ready. Please reach out to someone you trust first.",
          crisis: true
        });
      }

      // User signalled they're safe — un-flag and resume
      session.crisis_flagged = false;
      await saveSession(userId, session);
    }

    // Add user message to session
    await addMessage(userId, 'user', message);
    const updatedSession = await getOrCreateSession(userId);

    // Build Claude messages array
    const claudeMessages = buildMessagesForClaude(updatedSession, context.profileSnapshot);

    // Call Claude — maxTokens set to 180 (tokens ≠ words; 120 was too tight and
    // caused truncated replies on valid 80-word responses with punctuation/whitespace)
    let emoraReply;
    try {
      emoraReply = await claudeMessage({
        system: context.systemPrompt,
        messages: claudeMessages,
        maxTokens: 180
      });
    } catch (aiError) {
      if (aiError.message?.includes('ANTHROPIC_API_KEY')) {
        return res.status(503).json({
          error: 'Emora is not yet configured. Add ANTHROPIC_API_KEY to enable AI conversations.'
        });
      }
      throw aiError;
    }

    // Check for crisis flag
    if (emoraReply.startsWith('[CRISIS_FLAG]')) {
      const cleanReply = emoraReply.replace('[CRISIS_FLAG]', '').trim();

      // Update session with crisis flag
      updatedSession.crisis_flagged = true;
      await saveSession(userId, updatedSession);

      // Update profile state + set crisis flag for E-09 safety screen gate
      processCrisisFlag(userId).catch(() => {});

      await addMessage(userId, 'assistant', cleanReply);

      return res.json({
        message: cleanReply,
        crisis: true,
      });
    }

    // Add Emora's reply to session
    await addMessage(userId, 'assistant', emoraReply);

    // Quick state assessment — returns rescue_offer flag (E-06)
    const rescueOffer = await quickStateUpdate(userId, message).catch(() => false);
    touchLastActive(userId).catch(() => {});

    // Track first session timestamp + session count (on very first message of a session)
    if (updatedSession.message_count <= 2) {
      // message_count of 2 = 1 user message + 1 Emora reply = first exchange
      trackSessionStart(userId).catch(() => {});

      // Log first-ever Emora session event (once per user)
      hasLoggedEvent(userId, 'first_emora_session').then(already => {
        if (!already) logEvent(userId, 'first_emora_session').catch(() => {});
      }).catch(() => {});
    }

    res.json({ message: emoraReply, ...(rescueOffer ? { rescue_offer: true } : {}) });
  } catch (err) {
    next(err);
  } finally {
    // Always release the concurrency lock — whether success, error, or early return.
    // The 30s TTL is a safety net; explicit delete ensures fast re-entry on normal flow.
    await cache.del(lockKey).catch(() => {});
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/emora/session-end
// Called when user navigates away from Emora
// ─────────────────────────────────────────────────────────────────────────────
router.post('/session-end', authenticateUser, async (req, res) => {
  const userId = req.user.id;

  // Post-session check-in data from the frontend overlay
  const {
    mood_end,
    reflection_note,
    duration_seconds,
    message_count,
  } = req.body || {};

  // Validate mood_end — must be one of the 5 check-in levels if provided
  const VALID_MOODS = ['worse', 'unsettled', 'same', 'lighter', 'grounded'];
  const sessionMeta = {
    mood_end: mood_end && VALID_MOODS.includes(mood_end) ? mood_end : null,
    reflection_note: typeof reflection_note === 'string' ? reflection_note.slice(0, 500) : null,
    duration_seconds: Number.isFinite(duration_seconds) ? Math.max(0, duration_seconds) : null,
    message_count: Number.isFinite(message_count) ? Math.max(0, message_count) : null,
  };

  try {
    const session = await clearSession(userId);

    // Fix #11: Skip write-back entirely for crisis sessions.
    // Crisis sessions are emotionally charged and should not be used for
    // pattern extraction — they skew the profile negatively and the AI
    // prompt extraction is not designed for safety-mode conversations.
    if (session && session.messages && session.messages.length >= 4 && !session.crisis_flagged) {
      // Fire-and-forget — don't block the response
      processSessionEnd(userId, session.messages, sessionMeta)
        .catch(err => console.error('Write-back failed:', err.message));
    }
  } catch (err) {
    console.error('Session end error:', err.message);
  }

  res.json({ ok: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/emora/session-history
// Recent session insights for the user
// ─────────────────────────────────────────────────────────────────────────────
router.get('/session-history', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT id, key_insight, session_date, emotional_state_start, emotional_state_end,
             challenge_phase_reached, triggers_mentioned, excluded,
             mood_end, duration_seconds, message_count
      FROM conversation_summaries
      WHERE user_id = $1
      ORDER BY session_date DESC
      LIMIT 8
    `, [req.user.id]);

    res.json({ sessions: result.rows });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATCH /api/emora/sessions/:id/exclude
// Toggles whether a session is excluded from pattern analysis.
// User can undo this — excluded sessions are hidden from write-back processing
// but never deleted, so data is always recoverable.
// ─────────────────────────────────────────────────────────────────────────────
router.patch('/sessions/:id/exclude', authenticateUser, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { excluded } = req.body;

    if (typeof excluded !== 'boolean') {
      return res.status(400).json({ error: '"excluded" must be a boolean' });
    }

    // Only allow users to modify their own sessions
    const result = await query(
      `UPDATE conversation_summaries
       SET excluded = $1
       WHERE id = $2 AND user_id = $3
       RETURNING id, excluded`,
      [excluded, id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json({ ok: true, id: result.rows[0].id, excluded: result.rows[0].excluded });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/emora/current-session
// Returns current in-progress session messages (for UI restore)
// ─────────────────────────────────────────────────────────────────────────────
router.get('/current-session', authenticateUser, async (req, res, next) => {
  try {
    const session = await getOrCreateSession(req.user.id);
    res.json({
      messages: session.messages || [],
      phase: session.phase,
      crisis_flagged: session.crisis_flagged
    });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// Track session start (first message of a new session)
// Sets first_session_at and increments session_count exactly once per session.
// write-back/index.js only updates first_session_at (idempotent) — it does NOT increment session_count.
// ─────────────────────────────────────────────────────────────────────────────
async function trackSessionStart(userId) {
  await query(`
    UPDATE user_profiles
    SET
      first_session_at = COALESCE(first_session_at, NOW()),
      session_count    = COALESCE(session_count, 0) + 1,
      updated_at       = NOW()
    WHERE user_id = $1
  `, [userId]).catch(() => {});
}

// ─────────────────────────────────────────────────────────────────────────────
// Quick state assessment (lightweight, keyword-based)
// E-06: Returns rescue_offer=true when activation streak >= 2 within 10min
// ─────────────────────────────────────────────────────────────────────────────
async function quickStateUpdate(userId, message) {
  const lower = message.toLowerCase();
  const activationKeywords = [
    "can't stop", "going insane", "freaking out", "i want to text",
    "i keep checking", "can't focus", "spiraling", "obsessing",
    "i can't", "feel crazy", "so anxious", "can't breathe"
  ];
  const stabilityKeywords = [
    'i think i understand', 'i realized', 'makes sense now',
    'feeling better', 'calmer', 'thinking about it differently', 'i get it now'
  ];

  // Fix #14: Require 2+ keyword matches to avoid false positives from casual usage.
  // Single-word matches like "i can't decide" shouldn't flip someone to activated state.
  const activationMatchCount = activationKeywords.filter(k => lower.includes(k)).length;
  const stabilityMatchCount = stabilityKeywords.filter(k => lower.includes(k)).length;

  const hasActivation = activationMatchCount >= 2;
  const hasStability = stabilityMatchCount >= 1; // stability signals are more specific, 1 is fine

  let rescueOffer = false;

  if (hasActivation) {
    await query(
      "UPDATE user_profiles SET current_emotional_state = 'activated', updated_at = NOW() WHERE user_id = $1 AND current_emotional_state = 'stable'",
      [userId]
    );

    // E-06: Increment activation streak (10-min rolling window)
    const streakKey = `activation_streak:${userId}`;
    const raw = await cache.get(streakKey).catch(() => null);
    const streak = raw ? JSON.parse(raw) : { count: 0 };
    streak.count += 1;
    await cache.set(streakKey, JSON.stringify(streak), 600).catch(() => {}); // 10-min TTL
    if (streak.count >= 2) {
      rescueOffer = true;
    }
  } else if (hasStability) {
    await query(
      "UPDATE user_profiles SET current_emotional_state = 'stable', updated_at = NOW() WHERE user_id = $1 AND current_emotional_state = 'activated'",
      [userId]
    );
    // Reset activation streak on stability signal
    await cache.del(`activation_streak:${userId}`).catch(() => {});
  }

  return rescueOffer;
}

module.exports = router;
