const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');
const { cache } = require('../cache');
const { processRescueSessionEnd } = require('../services/write-back');
const { logEvent } = require('../services/analytics');

// ─────────────────────────────────────────────────────────────────────────────
// Exercise definitions — rule-based, no AI needed
// ─────────────────────────────────────────────────────────────────────────────
const EXERCISES = {
  // Anxious + "urge" (about to do something)
  urge_anxious: [
    {
      id: '20min_container',
      type: 'timer',
      title: '20-minute container',
      instruction: "The urge is real. Your nervous system thinks this is urgent. Set 20 minutes. If you still want to do it after — your choice. But give your system time to catch up with your mind.",
      duration_seconds: 1200,
      hasTimer: true
    },
    {
      id: 'body_interrupt',
      type: 'grounding',
      title: 'Physical interrupt',
      instruction: "Stand up. Walk to a different room. Put both feet flat on the floor. Name 5 things you can see right now. Say them out loud.",
      hasTimer: false
    }
  ],
  // Anxious + "spiral" (can't stop thinking)
  spiral_anxious: [
    {
      id: 'thought_interrupt',
      type: 'writing',
      title: 'Spiral interrupt',
      instruction: "Write down the worst case scenario. The full one — don't soften it. Then write one concrete reason it might not be true right now.",
      hasTimer: false
    },
    {
      id: '54321_grounding',
      type: 'grounding',
      title: 'Ground in the present',
      instruction: "5 things you can see. 4 you can touch. 3 you can hear. 2 you can smell. 1 you can taste. Go slowly. Take 3 seconds on each.",
      hasTimer: false
    }
  ],
  // Avoidant/FA + "shutdown"
  shutdown_avoidant: [
    {
      id: 'body_activation',
      type: 'movement',
      title: 'Physical activation',
      instruction: "Get up and do 10 jumping jacks. Or walk to one end of your space and back, 4 times. You're not exercising — you're shifting your nervous system's state.",
      hasTimer: false
    },
    {
      id: 'body_scan',
      type: 'somatic',
      title: 'Body contact',
      instruction: "Place your hand on the part of your body that feels most tense or numb right now. Leave it there for 30 seconds. You don't need to fix anything — just make contact.",
      duration_seconds: 30,
      hasTimer: true
    }
  ]
};

// Universal breathing exercise (added to every set)
const BREATHING_EXERCISE = {
  id: 'box_breathing',
  type: 'breath',
  title: 'Regulated breathing',
  instruction: "Inhale for 4 counts. Hold for 4. Exhale for 6. The longer exhale activates the calming response. Repeat 4 times.",
  cycles: 4,
  hasTimer: false
};

const SAFETY_STATEMENT = "You just stopped. That's the whole work.";

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rescue/start
// ─────────────────────────────────────────────────────────────────────────────
router.post('/start', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { entry_path = 'self', activation_type } = req.body;

    if (!activation_type || !['urge', 'spiral', 'shutdown'].includes(activation_type)) {
      return res.status(400).json({ error: 'activation_type must be urge, spiral, or shutdown' });
    }

    // Get user's attachment style and recent exercise history
    const [profileResult, recentRescues] = await Promise.all([
      query('SELECT primary_style FROM user_profiles WHERE user_id = $1', [userId]),
      query(`
        SELECT exercise_used FROM rescue_sessions
        WHERE user_id = $1 AND started_at > NOW() - INTERVAL '7 days'
        ORDER BY started_at DESC LIMIT 6
      `, [userId])
    ]);
    const style = profileResult.rows[0]?.primary_style || 'anxious';

    // #5: Track recently used exercise IDs to avoid repetition
    const recentlyUsed = new Set(
      recentRescues.rows.map(r => r.exercise_used).filter(Boolean)
    );

    // Select exercise pool based on activation type + style
    let pool = [];
    if (activation_type === 'shutdown' || style === 'dismissive_avoidant' || style === 'fearful_avoidant') {
      pool = EXERCISES.shutdown_avoidant;
    } else if (activation_type === 'spiral') {
      pool = EXERCISES.spiral_anxious;
    } else {
      pool = EXERCISES.urge_anxious;
    }

    // Prefer exercises not recently used; fall back to full pool if all were recent
    const fresh = pool.filter(e => !recentlyUsed.has(e.id));
    const exercises = [...(fresh.length > 0 ? fresh : pool), BREATHING_EXERCISE];

    // Mark session start in Redis
    await cache.set(
      `rescue:${userId}`,
      JSON.stringify({ entry_path, activation_type, started_at: Date.now(), exercises_offered: exercises.map(e => e.id) }),
      7200 // 2 hours
    );

    // Update user state to activated
    await query(
      "UPDATE user_profiles SET current_emotional_state = 'activated', updated_at = NOW() WHERE user_id = $1",
      [userId]
    );

    res.json({ exercises, safety_statement: SAFETY_STATEMENT });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/rescue/end
// ─────────────────────────────────────────────────────────────────────────────
router.post('/end', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { exercise_used, exit_path } = req.body;

    if (!exit_path || !['emora_bridge', 'close'].includes(exit_path)) {
      return res.status(400).json({ error: 'exit_path must be emora_bridge or close' });
    }

    const raw = await cache.get(`rescue:${userId}`);
    if (!raw) {
      return res.json({ ok: true, exit_path });
    }

    const session = JSON.parse(raw);
    const duration_seconds = Math.floor((Date.now() - session.started_at) / 1000);

    await processRescueSessionEnd(userId, {
      entry_path: session.entry_path,
      activation_type: session.activation_type,
      exercise_used: exercise_used || 'unknown',
      duration_seconds,
      exit_path
    });

    await cache.del(`rescue:${userId}`);

    // E-04: Flag post-rescue window so Action Lab serves tier 1 only for 6h
    await cache.set(
      `post_rescue:${userId}`,
      JSON.stringify({ activation_type: session.activation_type, ended_at: Date.now() }),
      21600 // 6 hours
    ).catch(() => {});

    // #6: Log rescue_completed event so pattern report can reference regulation behaviour
    logEvent(userId, 'rescue_completed', {
      activation_type: session.activation_type,
      exercise_used: exercise_used || 'unknown',
      duration_seconds,
      exit_path,
    }).catch(() => {});

    // After regulation, restore to stable state
    await query(
      "UPDATE user_profiles SET current_emotional_state = 'stable', updated_at = NOW() WHERE user_id = $1",
      [userId]
    );

    res.json({ ok: true, exit_path });
  } catch (err) {
    next(err);
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/rescue/history
// ─────────────────────────────────────────────────────────────────────────────
router.get('/history', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(`
      SELECT activation_type, exercise_used, exit_path, duration_seconds, started_at
      FROM rescue_sessions
      WHERE user_id = $1
      ORDER BY started_at DESC
      LIMIT 10
    `, [req.user.id]);

    res.json({ sessions: result.rows });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
