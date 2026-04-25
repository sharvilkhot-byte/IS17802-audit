const router = require('express').Router();
const { query } = require('../database');
const { authenticateUser } = require('../middleware/auth');
const { claudeMessage } = require('../ai/clients');
const { ATTACHMENT_SCORER_PROMPT, INTENTION_REFLECTION_PROMPT } = require('../ai/prompts/onboarding');
const { logEvent } = require('../services/analytics');

/**
 * POST /api/onboarding/complete
 * Receives all onboarding answers, scores attachment style, saves profile,
 * and returns Emora's first reflection.
 */
router.post('/complete', authenticateUser, async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      entry_text,              // Step 1: What brought you here
      struggle_level,          // Step 2: How much are you struggling (1-3)
      attachment_familiarity,  // Step 3: 'aware' | 'unaware' — routes coaching approach
      current_situation,       // Step 4: in_relationship | dating | post_breakup | single_healing | unrequited
      how_shows_up,            // Step 4: Which option (maps to style)
      primary_pattern,         // Step 4: Biggest pattern to break (free text, aware path only)
      pattern_duration,        // Step 5: How long this pattern has been present
      scenarios,               // Step 6: Array of {question, answer, style_signal}
      awareness_level,         // Step 7: 1–4 (numeric, direct from frontend)
      color_preference,        // Step 9: User's chosen theme color key
      intention                // Step 11: What would feel different
    } = req.body;

    // Validate required fields
    if (!current_situation || !intention) {
      return res.status(400).json({ error: 'Missing required onboarding fields' });
    }

    // Validate scenarios — must have at least 1 answer for scoring to be meaningful
    if (!Array.isArray(scenarios) || scenarios.length === 0) {
      return res.status(400).json({ error: 'Scenario responses are required' });
    }

    // Validate awareness_level is a number 1–4 (default to 1 if invalid)
    const validatedAwarenessLevel = Number.isInteger(Number(awareness_level)) &&
      Number(awareness_level) >= 1 && Number(awareness_level) <= 4
      ? Number(awareness_level)
      : 1;

    // Fix #7: Sanitize all user-supplied free-text before injecting into AI prompts.
    // Prevents prompt injection via onboarding answers.
    function sanitizeInput(str, maxLen = 500) {
      if (!str || typeof str !== 'string') return '';
      return str
        .replace(/<[^>]*>/g, '')
        .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '')
        .trim()
        .slice(0, maxLen);
    }

    const safeEntryText     = sanitizeInput(entry_text, 2000);
    const safeHowShowsUp    = sanitizeInput(how_shows_up, 300);
    const safePrimaryPattern = sanitizeInput(primary_pattern, 500);
    const safeIntention     = sanitizeInput(intention, 1000);

    // Validate attachment_familiarity
    const safeAttachmentFamiliarity = ['aware', 'unaware'].includes(attachment_familiarity)
      ? attachment_familiarity : 'aware';

    // Build the assessment input for Claude
    const assessmentInput = `
User's onboarding responses:

Prior attachment theory knowledge: "${safeAttachmentFamiliarity}"
Entry text: "${safeEntryText || 'Not provided'}"
How it shows up: "${safeHowShowsUp || 'Not specified'}"
Primary pattern to break: "${safePrimaryPattern || 'Not provided'}"
Pattern duration: "${pattern_duration || 'Not provided'}"
Scenario responses: ${JSON.stringify((scenarios || []).slice(0, 10))}
Awareness level (self-rated 1–4): "${validatedAwarenessLevel}"
Intention: "${safeIntention}"
    `.trim();

    // Call Claude to score the attachment style
    let attachmentResult = {
      primary_style: 'anxious', // Default fallback
      secondary_style: null,
      confidence: 'low',
      style_notes: 'Defaulted due to insufficient data'
    };

    try {
      const scorerResponse = await claudeMessage({
        system: ATTACHMENT_SCORER_PROMPT,
        messages: [{ role: 'user', content: assessmentInput }],
        maxTokens: 300
      });
      const cleaned = scorerResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      attachmentResult = JSON.parse(cleaned);
    } catch (aiError) {
      console.warn('Attachment scoring failed, using fallback:', aiError.message);
      // Try to infer from how_shows_up option
      if (how_shows_up) {
        if (how_shows_up.includes('reassurance') || how_shows_up.includes('constant')) {
          attachmentResult.primary_style = 'anxious';
        } else if (how_shows_up.includes('pull away') || how_shows_up.includes('space')) {
          attachmentResult.primary_style = 'dismissive_avoidant';
        } else if (how_shows_up.includes('back and forth')) {
          attachmentResult.primary_style = 'fearful_avoidant';
        }
        attachmentResult.confidence = 'low';
      }
    }

    // Get Emora's first reflection on the user's intention
    let emora_reflection = '';
    try {
      emora_reflection = await claudeMessage({
        system: INTENTION_REFLECTION_PROMPT,
        messages: [{ role: 'user', content: `User's intention: "${safeIntention}"` }],
        maxTokens: 100
      });
    } catch (aiError) {
      emora_reflection = "You're here because something's ready to shift. Let's find out what that is.";
    }

    // Validate pattern_duration
    const validDurations = ['recent', '1-2_years', '3-5_years', 'most_of_life', 'always'];
    const safePatternDuration = validDurations.includes(pattern_duration) ? pattern_duration : null;
    const safeStruggleLevel = [1, 2, 3].includes(Number(struggle_level)) ? Number(struggle_level) : 2;
    const validColorKeys = ['anxious', 'dismissive_avoidant', 'fearful_avoidant', 'secure_leaning'];
    const safeColorPreference = validColorKeys.includes(color_preference) ? color_preference : null;
    const validConfidences = ['high', 'medium', 'low'];
    const safeConfidence = validConfidences.includes(attachmentResult.confidence)
      ? attachmentResult.confidence : 'medium';

    // Unaware users start in 'discovery' phase — Emora introduces concepts gently
    // before moving into pattern interruption work. Aware users start in 'awareness'.
    const startingPhase = safeAttachmentFamiliarity === 'unaware' ? 'discovery' : 'awareness';

    // Save everything to the profile — including free text fields that feed Emora's context
    await query(`
      UPDATE user_profiles SET
        primary_style = $2,
        secondary_style = $3,
        relationship_situation = $4,
        awareness_level = $5,
        action_stage = 'awareness',
        current_phase = $6,
        current_emotional_state = 'stable',
        onboarding_completed = true,
        onboarding_entry_text = $7,
        onboarding_intention = $8,
        onboarding_pattern_text = $9,
        pattern_duration = $10,
        struggle_level = $11,
        assessment_confidence = $12,
        style_notes = $13,
        attachment_familiarity = $14,
        color_preference = $15,
        last_active = NOW(),
        updated_at = NOW()
      WHERE user_id = $1
    `, [
      userId,
      attachmentResult.primary_style,
      attachmentResult.secondary_style || null,
      current_situation,
      validatedAwarenessLevel,
      startingPhase,
      safeEntryText || null,
      safeIntention,
      safePrimaryPattern || null,   // Store user's own words — Emora references this
      safePatternDuration,
      safeStruggleLevel,
      safeConfidence,               // Store confidence — triggers re-assessment if 'low'
      attachmentResult.style_notes || null,  // Store Claude's reasoning
      safeAttachmentFamiliarity,
      safeColorPreference
    ]);

    logEvent(userId, 'onboarding_completed', {
      primary_style: attachmentResult.primary_style,
      situation: current_situation,
      awareness_level: validatedAwarenessLevel,
      attachment_familiarity: safeAttachmentFamiliarity,
      starting_phase: startingPhase,
    }).catch(() => {});

    res.json({
      primary_style: attachmentResult.primary_style,
      secondary_style: attachmentResult.secondary_style,
      emora_reflection,
      onboarding_completed: true
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/onboarding/status
 */
router.get('/status', authenticateUser, async (req, res, next) => {
  try {
    const result = await query(
      'SELECT onboarding_completed, primary_style FROM user_profiles WHERE user_id = $1',
      [req.user.id]
    );
    const profile = result.rows[0];
    res.json({
      completed: profile?.onboarding_completed || false,
      primary_style: profile?.primary_style || null
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
