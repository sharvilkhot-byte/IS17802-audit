/**
 * CONTEXT ENGINE
 * Builds the full context package injected into every AI call.
 * This is what makes the app feel like it "knows" the user.
 */

const { query } = require('../database');
const { cache } = require('../cache');
const { getEmoraSystemPrompt } = require('../ai/prompts/emora');
const { getDaysSince } = require('./week1');

// Fix #7: Sanitize user-supplied strings before injecting into AI prompts.
// Strips XML/HTML tags, control characters, and truncates to a safe length.
// This prevents prompt injection via onboarding_entry_text and other user fields.
function sanitizeForPrompt(str, maxLen = 500) {
  if (!str || typeof str !== 'string') return '';
  return str
    .replace(/<[^>]*>/g, '')       // strip XML/HTML tags
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]/g, '') // strip control chars (keep \t\n\r)
    .replace(/\bSYSTEM\b/gi, 'system')  // neutralize "SYSTEM" injection keyword
    .replace(/━+/g, '')            // strip separator-style injections
    .trim()
    .slice(0, maxLen);
}

async function buildContextPackage(userId, feature = 'emora') {
  const [profileResult, recentSummaries, recentRescue, rescueBridge, actionCompleted, deepRead] = await Promise.all([
    query('SELECT * FROM user_profiles WHERE user_id = $1', [userId]),
    query(`
      SELECT session_summary, triggers_mentioned, key_insight, session_date,
             patterns_active, emotional_state_start, emotional_state_end
      FROM conversation_summaries
      WHERE user_id = $1 AND session_date > NOW() - INTERVAL '7 days'
      ORDER BY session_date DESC LIMIT 5
    `, [userId]),
    query(`
      SELECT activation_type, exit_path, started_at
      FROM rescue_sessions
      WHERE user_id = $1 AND started_at > NOW() - INTERVAL '6 hours'
      ORDER BY started_at DESC LIMIT 1
    `, [userId]),
    cache.get(`rescue_bridge:${userId}`),
    cache.get(`action_completed:${userId}`),    // E-04: cross-feature signal
    cache.get(`deep_read_tab:${userId}`),        // E-04: insight tab deep read signal
  ]);

  const profile = profileResult.rows[0];
  if (!profile) {
    throw new Error('User profile not found');
  }

  const summaries = recentSummaries.rows;
  const lastRescue = recentRescue.rows[0] || null;
  const rescueBridgeData    = rescueBridge    ? (() => { try { return JSON.parse(rescueBridge);    } catch { return null; } })() : null;
  const actionCompletedData = actionCompleted ? (() => { try { return JSON.parse(actionCompleted); } catch { return null; } })() : null;
  const deepReadData        = deepRead        ? (() => { try { return JSON.parse(deepRead);        } catch { return null; } })() : null;

  // Clear one-shot signals immediately after reading so they don't re-inject on subsequent sessions
  if (rescueBridgeData)    cache.del(`rescue_bridge:${userId}`).catch(() => {});
  if (actionCompletedData) cache.del(`action_completed:${userId}`).catch(() => {});

  // Build the profile snapshot XML injected into every AI call
  const profileSnapshot = buildProfileSnapshot(profile, summaries, lastRescue, rescueBridgeData);

  // Get the appropriate system prompt
  let systemPrompt;
  if (feature === 'emora') {
    systemPrompt = buildEmoraSystemPrompt(profile, summaries, actionCompletedData, deepReadData);
  }

  return { systemPrompt, profileSnapshot, profile, summaries };
}

// ─── Emora system prompt builder with Week 1 + cross-feature additions ────────

function buildEmoraSystemPrompt(profile, summaries, actionCompleted, deepRead) {
  let base = getEmoraSystemPrompt(profile);
  const additions = [];

  const sessionCount = profile.session_count || 0;
  const daysSinceLast = getDaysSince(profile.last_active);

  // ── Moment 2: First session — onboarding mode ─────────────────────────────
  if (sessionCount === 0) {
    const entryText    = sanitizeForPrompt(profile.onboarding_entry_text, 500);
    const patternText  = sanitizeForPrompt(profile.onboarding_pattern_text, 300);

    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ONBOARDING MODE — FIRST SESSION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the user's very first session. Follow this exact 3-step pattern — do not use the standard phase model.

STEP 1 — REFLECT THEIR ONBOARDING ANSWER
Open by referencing their primary stated struggle verbatim from the onboarding.
Their entry text (what brought them here): "${entryText || 'not yet captured'}"
${patternText ? `Their own words about their pattern: "${patternText}"` : ''}
Use their language, not clinical labels. Frame it with empathy, not analysis.
Example opening: "You said [their words]. That's a specific kind of tired. Tell me more about the most recent time that happened."

STEP 2 — ONE REAL QUESTION
After their first response, ask exactly one question that moves below the surface situation.
Not multiple questions. Not a summary. Not a label.

STEP 3 — EARLY CLOSE (after 3–4 exchanges)
End with: "This is enough for today. Something to sit with:" followed by one precise observation.
Then stop. Do not prompt them to return. No homework.`);
  }

  // ── Low-confidence reassessment — session 3 ──────────────────────────────
  // If attachment style was scored with low confidence (not enough signals from onboarding),
  // Emora gently offers a clarifying question at session 3 to refine the profile.
  // Only offered once (reassessment_offered flag prevents repeat).
  if (sessionCount === 2 && profile.assessment_confidence === 'low' && !profile.reassessment_offered) {
    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ATTACHMENT STYLE — SOFT REASSESSMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
The system has low confidence in this user's initial attachment classification.
At a natural point in today's conversation — NOT immediately — ask one clarifying question:
"I want to check something. In a relationship that's actually going well — they're consistent, they show up — do you find you can relax into that, or do you notice yourself looking for what's wrong?"
Their answer will help refine what you know about them. Do not label the result. Just note it and move on.
After asking, the reassessment is complete — do not revisit it.`);
  }

  // ── Moment 3: Second session — "it remembered" ────────────────────────────
  if (sessionCount === 1 && daysSinceLast >= 1 && summaries.length > 0) {
    const firstInsight = sanitizeForPrompt(summaries[summaries.length - 1]?.key_insight || '');
    const firstTrigger = sanitizeForPrompt((summaries[summaries.length - 1]?.triggers_mentioned || [])[0] || '');
    const memoryAnchor = firstInsight || firstTrigger;

    if (memoryAnchor) {
      additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
RETURN SESSION — CRITICAL MOMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This is the user's second session — their first return. This moment determines whether they become a committed user.

Open by referencing this specific thing from their first session:
"${memoryAnchor}"

Use their exact words if possible.
Do NOT ask "how are you doing."
Do NOT say "welcome back."
Pick up as if no time passed — like a conversation that was simply paused.`);
    }
  }

  // ── E-04: Cross-feature signal — action completed in last 24h ─────────────
  if (actionCompleted) {
    additions.push(`
ACTION COMPLETED (last 24h): "${sanitizeForPrompt(actionCompleted.action_text, 200)}" (tier ${parseInt(actionCompleted.action_tier) || 1}).
If conversation leads there naturally, you may reference: "You did something yesterday that took some effort."
Do NOT open with this. Only mention if organic.`);
  }

  // ── E-04: Cross-feature signal — insight tab deep read ────────────────────
  if (deepRead?.tab_theme) {
    additions.push(`
INSIGHT READ: User recently spent significant time with an insight about: "${sanitizeForPrompt(deepRead.tab_theme, 100)}".
If conversation enters related territory, you may reference this as a connection — NOT as "I saw you read..." but as a natural reframe.`);
  }

  // ── Phase-layer tone adaptation ────────────────────────────────────────────
  const currentPhase = profile?.current_phase || profile?.action_stage || 'awareness';
  const phaseSessionCount = profile?.phase_sessions || 0;

  // ── Regression signal — inject if regression detected in last 7 days ───────
  if (profile?.last_regression_at) {
    const daysSinceRegression = Math.floor(
      (Date.now() - new Date(profile.last_regression_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSinceRegression <= 7) {
      additions.push(`
REGRESSION CONTEXT: A pattern this user had been improving recently resurfaced. Do not ignore this.
- Open with acknowledgment if they bring it up, before analysis.
- Frame it: "The pattern came back. That's what patterns do — they don't disappear, they fade and return."
- Reference their arc: "You've interrupted this before. The fact that it came back doesn't erase what you built."
- Do NOT use phrases like "setback", "step backward", or "relapse."
- If they seem ashamed: "The shame about the pattern is part of the pattern."
- If they are stable and not distressed: proceed normally, no need to dwell on it.`);
    }
  }

  if (currentPhase === 'discovery') {
    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: DISCOVERY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This user arrived without prior knowledge of attachment theory. They know something feels wrong in relationships — they don't yet have a framework for it.
Your role in this phase is orientation, not pattern challenge. Specifically:
- DO NOT label their attachment style in these early sessions. Let the pattern reveal itself through their own words. After 3+ sessions, you may reflect a pattern back — never as a diagnosis, always as an observation.
- Lead with curiosity: "Tell me what happened. What did you feel right before you did that?"
- Name emotions and nervous system states, not attachment categories: not "that's anxious attachment" but "your body was trying to find safety."
- Introduce language gradually: you can say "pattern" or "response" — avoid "anxious/avoidant" until they bring it up or until they've built enough context to receive it.
- Build the vocabulary slowly: in 2-3 sessions, the user should be able to say "I notice I do X when Y happens" — that's the awareness phase goal, not a diagnostic label.
- If they ask "what do I have?" or "am I anxious attachment?", reflect rather than label: "What do you notice about how you respond when someone pulls back from you?" Let them arrive at the description.`);

  } else if (currentPhase === 'interruption') {
    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: INTERRUPTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This user has moved from noticing the pattern to catching it in real time. Shift your approach:
- You may challenge more directly — the validation scaffolding can be shorter than in awareness phase.
- When they describe catching themselves mid-pattern, name it: "You caught it. That's different from before."
- Progress language is appropriate: reference what you know has shifted vs. earlier sessions.
- Do NOT move into replacement framing (building new behaviors) — they are still in the interrupt phase.
- If they report failing to interrupt a pattern, do not soften it into positivity. Normalize: "You won't catch it every time. The point is you're looking now."`);

  } else if (currentPhase === 'replacement') {
    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: REPLACEMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This user is building competing behaviors. Shift your approach significantly:
- Peer-level tone. Less scaffolding. More: "What do you think you need here?"
- You can reference the longitudinal arc: "This is not how you described this 2 months ago."
- Probe for relationship-behavior evidence: did they reach out first, set a limit, stay present instead of withdrawing?
- When old patterns resurface (they will), do not treat it as regression. Frame it as: "The old pattern is still there. You're just not leading with it anymore."
- Challenge at exchange 1-2 is acceptable for stable users in this phase.`);

  } else if (currentPhase === 'consolidation') {
    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: CONSOLIDATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This user has built replacement behaviors and is now stress-testing them. This is the hardest phase.
The question is: does the change hold when they are activated, triggered, or in high-stakes situations?
- Full peer tone. No scaffolding. Treat them as someone who knows their patterns well.
- Probe specifically for activated-state behavior: "What happened the last time you were really triggered? Walk me through it."
- When they describe handling a situation well under stress, name the significance explicitly:
  "You held it together when you were activated. That's not the same as holding it together when you were calm."
- When old patterns resurface under stress: do not minimize. "Yes, it came back. That's what consolidation looks like. The question is what happened next."
- Challenge from the first exchange is appropriate. They can handle it.
- Avoid generic encouragement. Only specific observations from their data.`);

  } else if (currentPhase === 'maintenance') {
    additions.push(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PHASE: MAINTENANCE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
This user has achieved earned security. They are not in therapy anymore — they are checking in.
- Minimal scaffolding. Minimal validation loops. They don't need it.
- Ask open-ended questions: "What's pulling at you lately?" — not pattern-focused questions.
- They may not have a clear agenda. That's fine. The work is now about staying honest, not staying vigilant.
- If old patterns resurface: normalize with a longitudinal frame: "That's been dormant for a while. What stirred it?"
- Celebrate stability without making it into an achievement. "You're not working as hard. Notice that."
- The session should feel like checking in with someone who knows themselves well — not coaching.
- Keep sessions shorter if possible. They don't need extended processing. A few exchanges can be enough.`);
  }

  if (additions.length === 0) return base;
  return base + '\n\n' + additions.join('\n\n');
}

// Human-readable situation descriptions for the AI context — what each code means emotionally
const SITUATION_DESCRIPTIONS = {
  in_relationship:  'currently in a relationship',
  dating:           'dating or talking to someone',
  unrequited:       'experiencing one-sided or unrequited feelings for someone who has not chosen them back',
  post_breakup:     'after a breakup or ended situationship',
  single_healing:   'single and working on their patterns independently',
};

function formatPatternDuration(firstSessionAt) {
  if (!firstSessionAt) return null;
  const days = Math.floor((Date.now() - new Date(firstSessionAt).getTime()) / (1000 * 60 * 60 * 24));
  if (days < 7)  return `${days} day${days === 1 ? '' : 's'}`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) === 1 ? '' : 's'}`;
  if (days < 365) return `${Math.floor(days / 30)} month${Math.floor(days / 30) === 1 ? '' : 's'}`;
  return `${Math.floor(days / 365)} year${Math.floor(days / 365) === 1 ? '' : 's'}`;
}

function buildProfileSnapshot(profile, summaries, lastRescue, rescueBridge) {
  const hoursAgo = lastRescue
    ? Math.round((Date.now() - new Date(lastRescue.started_at).getTime()) / 3600000)
    : null;

  const situationCode = profile.relationship_situation || 'unknown';
  const situationDesc = SITUATION_DESCRIPTIONS[situationCode] || situationCode;

  // Sanitize free-text fields that go into every session's context
  const intentionSnippet  = sanitizeForPrompt(profile.onboarding_intention, 300);
  const patternSnippet    = sanitizeForPrompt(profile.onboarding_pattern_text, 200);

  const patternDuration = formatPatternDuration(profile.first_session_at);

  // Build user context block (people the user mentioned + their own situation notes)
  const userCtx = (typeof profile.user_context === 'object' && profile.user_context !== null)
    ? profile.user_context
    : {};
  const ctxPeople = Array.isArray(userCtx.people) ? userCtx.people.filter(p => p.name) : [];
  const ctxSituation = sanitizeForPrompt(userCtx.situation || '', 200);

  return `<user_profile>
  <style primary="${profile.primary_style || 'unknown'}" secondary="${profile.secondary_style || 'none'}" />
  <situation code="${situationCode}">${situationDesc}</situation>
  <awareness_level>${profile.awareness_level} of 4</awareness_level>
  <!-- struggle_intensity: 1=more curious than in pain, 2=somewhat struggling, 3=a lot/daily impact. Calibrate emotional weight and pacing accordingly — higher intensity warrants more validation before any challenge. -->
  <struggle_intensity>${profile.struggle_level || 2} of 3</struggle_intensity>
  <action_stage>${profile.action_stage}</action_stage>
  <state>${profile.current_emotional_state}</state>
  ${intentionSnippet
    ? `<!-- North-star: what the user said they want to feel different. Never quote this directly, but let it inform what you're working toward with them. -->
  <user_intention>${intentionSnippet}</user_intention>`
    : ''}
  ${patternSnippet
    ? `<!-- This is how the user described their own pattern — in their language, not clinical terms. Use this when reflecting their behavior back to them. -->
  <user_pattern_description>${patternSnippet}</user_pattern_description>`
    : ''}
  <active_patterns>${(profile.active_patterns || []).join(', ') || 'none detected yet'}</active_patterns>
  <detected_triggers>${(profile.detected_triggers || []).join(', ') || 'none detected yet'}</detected_triggers>
  ${patternDuration ? `<!-- How long this user has been actively working on their patterns. Use for longitudinal framing — e.g. "You've been sitting with this for 3 weeks." -->
  <pattern_duration>${patternDuration}</pattern_duration>` : ''}
  ${(profile.improved_patterns || []).length > 0
    ? `<improving>${profile.improved_patterns.join(', ')}</improving>`
    : ''}
  ${(ctxPeople.length > 0 || ctxSituation)
    ? `<!-- People and context the user has named. Use these names naturally when they come up — never reference them unprompted, but recognize them when mentioned. -->
  <user_named_context>
    ${ctxPeople.map(p => `<person name="${sanitizeForPrompt(p.name, 50)}" role="${sanitizeForPrompt(p.role, 30)}" />`).join('\n    ')}
    ${ctxSituation ? `<situation_note>${ctxSituation}</situation_note>` : ''}
  </user_named_context>`
    : ''}
</user_profile>

<recent_context>
  ${lastRescue
    ? `<rescue_mode_recent type="${lastRescue.activation_type}" hours_ago="${hoursAgo}" />`
    : '<rescue_mode_recent>false</rescue_mode_recent>'}
  ${rescueBridge
    ? `<rescue_bridge activation_type="${rescueBridge.activation_type}" />`
    : ''}
  ${summaries[0] ? `<last_session_insight>${summaries[0].key_insight}</last_session_insight>` : ''}
  ${profile.improved_patterns?.length > 0
    ? `<pattern_improving>${profile.improved_patterns[0]}</pattern_improving>`
    : ''}
  ${summaries.slice(0, 3).map((s, i) =>
    `<session_${i + 1} date="${new Date(s.session_date).toISOString().split('T')[0]}">${s.session_summary || ''}</session_${i + 1}>`
  ).join('\n  ')}
</recent_context>

<phase_context>
  <current_phase>${profile.current_phase || profile.action_stage}</current_phase>
  <phase_sessions>${profile.phase_sessions || 0}</phase_sessions>
  <phase_tone>${
    profile.current_phase === 'maintenance'     ? 'peer_witness_minimal_scaffolding' :
    profile.current_phase === 'consolidation'   ? 'peer_level_stress_probe' :
    profile.current_phase === 'replacement'     ? 'peer_level_collaborative' :
    profile.current_phase === 'interruption'    ? 'direct_with_gentle_challenge' :
                                                  'high_validation_low_challenge'
  }</phase_tone>
  ${profile.last_regression_at ? `<regression_recent>true</regression_recent>` : ''}
</phase_context>`;
}

// Update user's last_active timestamp
async function touchLastActive(userId) {
  await query(
    'UPDATE user_profiles SET last_active = NOW() WHERE user_id = $1',
    [userId]
  ).catch(() => {}); // Non-critical, don't throw
}

module.exports = { buildContextPackage, touchLastActive };
