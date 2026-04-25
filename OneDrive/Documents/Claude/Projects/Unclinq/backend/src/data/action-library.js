/**
 * UNCLINQ ACTION LIBRARY
 * Clinically grounded micro-actions organized by: style, category, tier, situation.
 * The Action Matcher (Gemini) selects from this library and personalizes the text.
 *
 * Styles: anxious | dismissive_avoidant | fearful_avoidant | secure_leaning | all
 * Tiers:  1 = awareness stage  2 = interruption stage  3 = replacement stage
 * Situations: ['all'] or subset of ['in_relationship','dating','post_breakup','single_healing']
 */

const ACTION_LIBRARY = [
  // ═══════════════════════════════════════════════════════════
  // ANXIOUS ATTACHMENT
  // ═══════════════════════════════════════════════════════════

  // ── Delay & Interrupt ──────────────────────────────────────
  { id: 'anx_delay_t1_01', style: 'anxious', category: 'delay_interrupt', tier: 1, situations: ['all'],
    text: "Notice the urge to check their activity right now. Write down what you're afraid is happening. Don't check.",
    brief_why: '',
    completion_ack: "You caught the urge. That's the beginning of the gap." },

  { id: 'anx_delay_t1_02', style: 'anxious', category: 'delay_interrupt', tier: 1, situations: ['in_relationship', 'dating', 'unrequited'],
    text: "Before you send the next message, read the last three you sent first.",
    brief_why: '',
    completion_ack: "Reading your own pattern is harder than it sounds." },

  { id: 'anx_delay_t1_03', style: 'anxious', category: 'delay_interrupt', tier: 1, situations: ['all'],
    text: "Set your phone face down for 15 minutes. Notice what the anxiety feels like in your body without acting on it.",
    brief_why: '',
    completion_ack: "15 minutes of not acting. That's more than it looks." },

  { id: 'anx_delay_t1_04', style: 'anxious', category: 'delay_interrupt', tier: 1, situations: ['post_breakup'],
    text: "Today: no looking at their profile, their stories, their mutual friends' posts. One full day of not feeding the loop.",
    brief_why: '',
    completion_ack: "One day of not reopening the wound." },

  { id: 'anx_delay_t2_01', style: 'anxious', category: 'delay_interrupt', tier: 2, situations: ['in_relationship', 'dating', 'unrequited'],
    text: "Write the message you want to send. Save it as a note. Don't send it. Read it again in 30 minutes.",
    brief_why: "Externalizing the urge breaks the automatic loop without suppressing the feeling.",
    completion_ack: "The message exists. You chose what to do with it." },

  { id: 'anx_delay_t2_02', style: 'anxious', category: 'delay_interrupt', tier: 2, situations: ['in_relationship', 'dating', 'unrequited'],
    text: "Set a 2-hour no-check window. No checking their location, last seen, story views, or social profiles.",
    brief_why: "Each check resets the anxiety clock instead of lowering it.",
    completion_ack: "Two hours. That's the nervous system learning something new." },

  { id: 'anx_delay_t2_03', style: 'anxious', category: 'delay_interrupt', tier: 2, situations: ['post_breakup'],
    text: "Today: no looking at their social media at all. One full day.",
    brief_why: "Contact with their profile keeps the attachment system activated.",
    completion_ack: "One day of not feeding the loop. It matters more than it feels." },

  { id: 'anx_delay_t2_04', style: 'anxious', category: 'delay_interrupt', tier: 2, situations: ['post_breakup'],
    text: "Write what you'd want to say to them — all of it, unfiltered. Save it as a note. This is for you, not for sending.",
    brief_why: "Externalizing the unsent message releases pressure without reopening contact.",
    completion_ack: "The words exist now. You decided what to do with them." },

  { id: 'anx_delay_t3_01', style: 'anxious', category: 'delay_interrupt', tier: 3, situations: ['in_relationship', 'dating', 'unrequited'],
    text: "Go one full day without initiating contact. Let them come to you once.",
    brief_why: "This interrupts the reassurance-seeking cycle at its behavioral root.",
    completion_ack: "You stayed with the discomfort instead of relieving it. That's the work." },

  { id: 'anx_delay_t3_02', style: 'anxious', category: 'delay_interrupt', tier: 3, situations: ['post_breakup'],
    text: "Implement a one-week no-contact window. No checking, no reaching out, no indirect contact through mutual people.",
    brief_why: "The nervous system cannot begin to recalibrate while it is still receiving intermittent signals.",
    completion_ack: "Seven days of not feeding the cycle. That's a different choice than any you made before." },

  // ── Reassurance Source Shifting ────────────────────────────
  { id: 'anx_reassurance_t1_01', style: 'anxious', category: 'reassurance_shift', tier: 1, situations: ['all'],
    text: "Name 3 things you did today that had nothing to do with them or the relationship.",
    brief_why: '',
    completion_ack: "You exist outside of this. That list is proof." },

  { id: 'anx_reassurance_t1_02', style: 'anxious', category: 'reassurance_shift', tier: 1, situations: ['all'],
    text: "Text or call one person from your life who isn't them — just to connect.",
    brief_why: '',
    completion_ack: "One connection that didn't require them." },

  { id: 'anx_reassurance_t1_03', style: 'anxious', category: 'reassurance_shift', tier: 1, situations: ['in_relationship', 'dating', 'unrequited'],
    text: "When the urge to ask 'are we okay?' hits — answer it yourself first. What do you actually know to be true right now?",
    brief_why: '',
    completion_ack: "You didn't outsource that question. Small shift, real weight." },

  { id: 'anx_reassurance_t2_01', style: 'anxious', category: 'reassurance_shift', tier: 2, situations: ['all'],
    text: "Do one thing today that makes you feel capable and good — completely alone.",
    brief_why: "Building a source of self-worth that doesn't require their input.",
    completion_ack: "You generated that feeling without anyone else. That's what you're building." },

  { id: 'anx_reassurance_t2_02', style: 'anxious', category: 'reassurance_shift', tier: 2, situations: ['in_relationship', 'dating', 'unrequited'],
    text: "The next time you feel the urge to ask 'are we okay?' — wait 2 hours. If you still need to ask, ask. If not, don't.",
    brief_why: "Most reassurance-seeking urges pass if given 2 hours of space.",
    completion_ack: "You held the question. That's different from suppressing it." },

  { id: 'anx_reassurance_t3_01', style: 'anxious', category: 'reassurance_shift', tier: 3, situations: ['all'],
    text: "Spend a full day doing things you love without mentioning the relationship to anyone — friends, family, anyone.",
    brief_why: "The narrative around the relationship keeps the attachment system primed.",
    completion_ack: "One day where you were a whole person, not a person in a relationship situation." },

  { id: 'anx_reassurance_t3_02', style: 'anxious', category: 'reassurance_shift', tier: 3, situations: ['post_breakup'],
    text: "Tell the story of the relationship — to yourself, in writing — without making them the villain or yourself the victim. Just what happened.",
    brief_why: "Narrative coherence about a loss reduces its grip on the attachment system.",
    completion_ack: "A clearer story. That's the beginning of a way through." },

  // ── Needs Expression ───────────────────────────────────────
  { id: 'anx_needs_t1_01', style: 'anxious', category: 'needs_expression', tier: 1, situations: ['all'],
    text: "Next time you feel anxious in the relationship, name the emotion to yourself before you name it to them.",
    brief_why: '',
    completion_ack: "You found it before you reached for them. That's the gap you're building." },

  { id: 'anx_needs_t2_01', style: 'anxious', category: 'needs_expression', tier: 2, situations: ['in_relationship', 'dating'],
    text: "Tell them what you need using one sentence that starts with 'I need' — not 'Why don't you' or 'You never'.",
    brief_why: "Clean needs expression reduces protest behavior at its source.",
    completion_ack: "You asked directly. That takes more than it looks like." },

  { id: 'anx_needs_t3_01', style: 'anxious', category: 'needs_expression', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Ask them for one specific thing you actually want — not reassurance, something concrete.",
    brief_why: "Specific requests replace the anxious loop of hoping they'll intuit your needs.",
    completion_ack: "You named a want instead of waiting for it to be noticed." },

  // ── Self-Worth ─────────────────────────────────────────────
  { id: 'anx_selfworth_t1_01', style: 'anxious', category: 'self_worth', tier: 1, situations: ['all'],
    text: "Write down one thing you like about yourself that has nothing to do with this relationship.",
    brief_why: '',
    completion_ack: "That exists independently of them. It always did." },

  { id: 'anx_selfworth_t1_02', style: 'anxious', category: 'self_worth', tier: 1, situations: ['post_breakup', 'single_healing'],
    text: "Write down one thing you're good at. Not something they complimented — something you know yourself.",
    brief_why: '',
    completion_ack: "You found that without asking anyone." },

  { id: 'anx_selfworth_t2_01', style: 'anxious', category: 'self_worth', tier: 2, situations: ['all'],
    text: "Say no to one request today — from anyone. Something you'd normally agree to out of anxiety, not want.",
    brief_why: "Each no that comes from clarity rather than fear builds the self-trust muscle.",
    completion_ack: "One boundary that came from you, not from them." },

  { id: 'anx_selfworth_t3_01', style: 'anxious', category: 'self_worth', tier: 3, situations: ['all'],
    text: "Write one opinion you have that they'd probably disagree with. Then say it out loud to yourself.",
    brief_why: "Distinct selfhood is what makes you safe to love — not easier to leave.",
    completion_ack: "You have a position. That's a self." },

  { id: 'anx_selfworth_t3_02', style: 'anxious', category: 'self_worth', tier: 3, situations: ['single_healing'],
    text: "Spend one full day doing something entirely for yourself — not to become more attractive or to have something to say. Just because you wanted to.",
    brief_why: "Self-directed pleasure decoupled from external validation builds the foundation secure relationships grow from.",
    completion_ack: "One day that had nothing to do with being ready for someone else." },

  // ── Somatic Regulation (new) ───────────────────────────────
  { id: 'anx_somatic_t1_01', style: 'anxious', category: 'somatic_regulation', tier: 1, situations: ['all'],
    text: "Right now: place one hand on your chest and breathe in for 4, out for 6. Do this for 2 minutes.",
    brief_why: '',
    completion_ack: "Two minutes of working directly with the nervous system, not against it." },

  { id: 'anx_somatic_t2_01', style: 'anxious', category: 'somatic_regulation', tier: 2, situations: ['all'],
    text: "When the anxiety spikes today, notice where it lives in your body — chest, neck, stomach. Put your hand there. Don't try to fix it, just make contact.",
    brief_why: "Locating sensation in the body interrupts the cognitive spiral that feeds anxiety.",
    completion_ack: "You went to the body instead of the story. Different direction." },

  { id: 'anx_somatic_t3_01', style: 'anxious', category: 'somatic_regulation', tier: 3, situations: ['all'],
    text: "The next time the anxiety spikes in a relational context — do the physical thing first before any message or reach-out. Walk, stretch, cold water on your face. Change the body state before you engage.",
    brief_why: "A body in activation cannot reason clearly. Regulating the body first produces a genuinely different response.",
    completion_ack: "You changed the state before acting. That's the whole skill." },

  // ═══════════════════════════════════════════════════════════
  // DISMISSIVE-AVOIDANT
  // ═══════════════════════════════════════════════════════════

  // ── Emotion Awareness ──────────────────────────────────────
  { id: 'da_emotion_t1_01', style: 'dismissive_avoidant', category: 'emotion_awareness', tier: 1, situations: ['all'],
    text: "At the end of today, name one emotion you felt. Just one word is enough.",
    brief_why: '',
    completion_ack: "One word. That's contact." },

  { id: 'da_emotion_t1_02', style: 'dismissive_avoidant', category: 'emotion_awareness', tier: 1, situations: ['all'],
    text: "Before you leave a difficult conversation today, notice where you feel it in your body. Just locate it — don't analyze it.",
    brief_why: '',
    completion_ack: "You noticed something before the mind covered it." },

  { id: 'da_emotion_t1_03', style: 'dismissive_avoidant', category: 'emotion_awareness', tier: 1, situations: ['all'],
    text: "Find a feelings wheel today. Find one emotion word that's more specific than 'fine' or 'stressed'.",
    brief_why: '',
    completion_ack: "Precision about what's happening inside. That's the beginning." },

  { id: 'da_emotion_t2_01', style: 'dismissive_avoidant', category: 'emotion_awareness', tier: 2, situations: ['all'],
    text: "Write 3 sentences about how a recent difficult conversation made you feel. No analysis — only feeling words.",
    brief_why: "Avoidant processing often goes straight to analysis, skipping the feeling entirely.",
    completion_ack: "Three sentences. You stayed with the feeling long enough to describe it." },

  { id: 'da_emotion_t2_02', style: 'dismissive_avoidant', category: 'emotion_awareness', tier: 2, situations: ['post_breakup'],
    text: "Don't immediately fill this space with activity. Set 20 minutes aside today to just sit with what this ending actually means. Not to analyze it — to feel it.",
    brief_why: "Avoidant grieving tends to skip the feeling entirely, leaving the loss unprocessed and carried forward.",
    completion_ack: "20 minutes of not running from it." },

  { id: 'da_emotion_t3_01', style: 'dismissive_avoidant', category: 'emotion_awareness', tier: 3, situations: ['all'],
    text: "Tell someone what you're actually feeling instead of what you think about it. Use 'I feel' without 'I think' following immediately.",
    brief_why: "Translating internal experience into relational language creates new neural pathways.",
    completion_ack: "That was different. You said what was underneath." },

  // ── Micro-Vulnerability ────────────────────────────────────
  { id: 'da_vuln_t1_01', style: 'dismissive_avoidant', category: 'micro_vulnerability', tier: 1, situations: ['all'],
    text: "Tell one person 'I appreciated that' about something they did this week.",
    brief_why: '',
    completion_ack: "You let something land and said so." },

  { id: 'da_vuln_t1_02', style: 'dismissive_avoidant', category: 'micro_vulnerability', tier: 1, situations: ['all'],
    text: "Share one small preference with someone today instead of 'I don't mind' or 'whatever you want'.",
    brief_why: '',
    completion_ack: "You had a preference. You said it." },

  { id: 'da_vuln_t1_03', style: 'dismissive_avoidant', category: 'micro_vulnerability', tier: 1, situations: ['all'],
    text: "When someone shares something difficult today, don't offer a solution. Just say: 'That sounds really hard.'",
    brief_why: '',
    completion_ack: "You stayed with their experience instead of fixing it." },

  { id: 'da_vuln_t2_01', style: 'dismissive_avoidant', category: 'micro_vulnerability', tier: 2, situations: ['in_relationship', 'dating', 'single_healing'],
    text: "Share something minor that bothered you before it becomes too big or too late to say.",
    brief_why: "Avoidant accumulation leads to shutdown — early naming keeps the channel open.",
    completion_ack: "You said it while it was still small. That changes the dynamic." },

  { id: 'da_vuln_t3_01', style: 'dismissive_avoidant', category: 'micro_vulnerability', tier: 3, situations: ['in_relationship', 'dating', 'single_healing'],
    text: "Tell someone you trust one thing that actually scared or hurt you recently. Not intellectualized — the raw version.",
    brief_why: "Earned secure attachment forms through repeated moments of being seen and not rejected.",
    completion_ack: "You said the thing. That's corrective experience in real time." },

  { id: 'da_vuln_t3_02', style: 'dismissive_avoidant', category: 'micro_vulnerability', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Tell someone something about yourself that they don't know and couldn't guess. Not a fact — something about how you work inside.",
    brief_why: "Voluntary self-disclosure is the core building block of earned intimacy for avoidant attachment.",
    completion_ack: "You let someone in a layer deeper. That's what intimacy actually is." },

  // ── Stay Present ───────────────────────────────────────────
  { id: 'da_present_t1_01', style: 'dismissive_avoidant', category: 'stay_present', tier: 1, situations: ['all'],
    text: "When you feel the urge to change the subject in a hard conversation — stay for one more minute.",
    brief_why: '',
    completion_ack: "One more minute. The conversation didn't break you." },

  { id: 'da_present_t1_02', style: 'dismissive_avoidant', category: 'stay_present', tier: 1, situations: ['all'],
    text: "Reply to the message you've been avoiding. Keep it short — just reply.",
    brief_why: '',
    completion_ack: "You ended the avoidance loop." },

  { id: 'da_present_t2_01', style: 'dismissive_avoidant', category: 'stay_present', tier: 2, situations: ['in_relationship', 'dating'],
    text: "When you feel crowded or need space — name it to yourself first before you physically or mentally leave.",
    brief_why: "Naming the pull toward distance gives you a choice. Unnamed, it just happens.",
    completion_ack: "You caught the pull before acting on it." },

  { id: 'da_present_t3_01', style: 'dismissive_avoidant', category: 'stay_present', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Stay in one conflict until it's actually resolved — not until you've gone quiet enough that they stop pursuing.",
    brief_why: "Shutdown as conflict resolution is the avoidant pattern at its most powerful. Breaking it requires staying.",
    completion_ack: "You didn't exit. That's the hardest thing for your system to do." },

  // ── Needs Expression ───────────────────────────────────────
  { id: 'da_needs_t1_01', style: 'dismissive_avoidant', category: 'needs_expression', tier: 1, situations: ['all'],
    text: "Ask for one thing you want today — from anyone. One request.",
    brief_why: '',
    completion_ack: "You named a need. That's the whole first step." },

  { id: 'da_needs_t2_01', style: 'dismissive_avoidant', category: 'needs_expression', tier: 2, situations: ['all'],
    text: "Tell someone you need help with something this week — even something small. Ask them directly.",
    brief_why: "Avoidant suppression of needs creates a self-sufficiency wall that blocks intimacy.",
    completion_ack: "You let someone help. That's more than maintenance — that's a door opening." },

  { id: 'da_needs_t3_01', style: 'dismissive_avoidant', category: 'needs_expression', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Express one relationship need directly — not as a hint, not embedded in a complaint. Just the need.",
    brief_why: "Direct need expression is the core skill of secure attachment. For avoidants, it's the hardest.",
    completion_ack: "You said what you needed. That changes the whole dynamic." },

  // ── Intimacy Expansion (new) ───────────────────────────────
  { id: 'da_intimacy_t2_01', style: 'dismissive_avoidant', category: 'intimacy_expansion', tier: 2, situations: ['in_relationship', 'dating', 'single_healing'],
    text: "Ask someone a question you actually want to know the answer to — not small talk. Something that shows you were paying attention.",
    brief_why: "Avoidant relational style often retreats to surface conversation as protection. Real curiosity is a form of intimacy.",
    completion_ack: "You were curious out loud. That's a different kind of contact." },

  { id: 'da_intimacy_t2_02', style: 'dismissive_avoidant', category: 'intimacy_expansion', tier: 2, situations: ['in_relationship', 'dating'],
    text: "The next time you start to mentally check out during an emotional conversation — stay for one more exchange. One question, one response.",
    brief_why: "Incremental presence in difficult emotional moments slowly rewires the withdrawal response.",
    completion_ack: "One more exchange than you would have had." },

  { id: 'da_intimacy_t3_01', style: 'dismissive_avoidant', category: 'intimacy_expansion', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Initiate a difficult conversation you've been avoiding — not waiting for them to bring it up. You start it.",
    brief_why: "Dismissive avoidants rarely initiate difficult conversations. Starting one changes the relational pattern structurally.",
    completion_ack: "You opened the door this time. That's not what your pattern usually does." },

  // ═══════════════════════════════════════════════════════════
  // FEARFUL-AVOIDANT (DISORGANIZED)
  // ═══════════════════════════════════════════════════════════

  // ── Cycle Recognition ──────────────────────────────────────
  { id: 'fa_cycle_t1_01', style: 'fearful_avoidant', category: 'cycle_recognition', tier: 1, situations: ['all'],
    text: "Right now — are you pulling toward someone or pushing away? Just name it. No action required.",
    brief_why: '',
    completion_ack: "Naming the direction is the first time it's no longer unconscious." },

  { id: 'fa_cycle_t1_02', style: 'fearful_avoidant', category: 'cycle_recognition', tier: 1, situations: ['all'],
    text: "Before the next relational decision you make — ask yourself: 'Am I doing this from fear or from want?'",
    brief_why: '',
    completion_ack: "One moment of asking that question is the whole awareness stage." },

  { id: 'fa_cycle_t2_01', style: 'fearful_avoidant', category: 'cycle_recognition', tier: 2, situations: ['all'],
    text: "Write down what you want AND what you're afraid of — side by side. Notice if they're the same thing.",
    brief_why: "Fearful-avoidant patterns are often fear and want pointing in the same direction simultaneously.",
    completion_ack: "You mapped both. Most people only see one." },

  { id: 'fa_cycle_t2_02', style: 'fearful_avoidant', category: 'cycle_recognition', tier: 2, situations: ['in_relationship', 'dating', 'post_breakup'],
    text: "When the hot-cold shift happens in you today — notice it in real time. Not after. During.",
    brief_why: "Real-time noticing is the only way to interrupt a cycle that has been unconscious.",
    completion_ack: "You saw it happening. That's rare." },

  { id: 'fa_cycle_t3_01', style: 'fearful_avoidant', category: 'cycle_recognition', tier: 3, situations: ['post_breakup'],
    text: "Notice if you're oscillating between wanting them back and knowing it was right. If yes: make a decision and hold it for 48 hours without reconsidering.",
    brief_why: "Oscillation keeps the nervous system in chronic activation. Temporary commitment to one position breaks the loop.",
    completion_ack: "48 hours in one direction. The system needed that." },

  // ── Safety Anchoring ───────────────────────────────────────
  { id: 'fa_safety_t1_01', style: 'fearful_avoidant', category: 'safety_anchoring', tier: 1, situations: ['all'],
    text: "Before you reach out or pull away from someone today — do 5 slow breaths first. Then decide.",
    brief_why: '',
    completion_ack: "5 breaths between the impulse and the action. That gap matters." },

  { id: 'fa_safety_t1_02', style: 'fearful_avoidant', category: 'safety_anchoring', tier: 1, situations: ['all'],
    text: "Identify one person, place, or object that feels genuinely safe to you. Spend time there today.",
    brief_why: '',
    completion_ack: "You went somewhere that doesn't require anything from you." },

  { id: 'fa_safety_t2_01', style: 'fearful_avoidant', category: 'safety_anchoring', tier: 2, situations: ['all'],
    text: "Name the fear underneath the urge right now. Not 'I want to text them' — what are you actually afraid will happen if you don't?",
    brief_why: "Fearful-avoidant behavior is almost always fear-driven — naming the fear separates it from the behavior.",
    completion_ack: "You found the fear under the urge. That's the actual work." },

  { id: 'fa_safety_t3_01', style: 'fearful_avoidant', category: 'safety_anchoring', tier: 3, situations: ['in_relationship', 'dating'],
    text: "The next time you feel the push-pull — stay with the discomfort for 60 seconds without acting on either direction.",
    brief_why: "Tolerating the activation without acting on it is the core skill for disorganized attachment.",
    completion_ack: "60 seconds of holding both. That's enormous." },

  // ── Self-Consistency ───────────────────────────────────────
  { id: 'fa_consistency_t1_01', style: 'fearful_avoidant', category: 'self_consistency', tier: 1, situations: ['all'],
    text: "Do one thing today you said you'd do — for yourself, not for anyone else.",
    brief_why: '',
    completion_ack: "A kept promise to yourself. That builds the internal secure base." },

  { id: 'fa_consistency_t2_01', style: 'fearful_avoidant', category: 'self_consistency', tier: 2, situations: ['all'],
    text: "Name one boundary you want to have in this relationship. You don't have to set it yet — just name it clearly.",
    brief_why: "Clarity precedes action. Naming a boundary you want is the first form of having it.",
    completion_ack: "You know what you want. That's more than you had before." },

  { id: 'fa_consistency_t3_01', style: 'fearful_avoidant', category: 'self_consistency', tier: 3, situations: ['all'],
    text: "Follow through on one small commitment to yourself this week. No exceptions for the full 7 days.",
    brief_why: "Disorganized attachment often involves broken self-trust. Kept self-commitments rebuild it.",
    completion_ack: "7 days. You kept a promise to yourself. That's a new data point." },

  { id: 'fa_consistency_t3_02', style: 'fearful_avoidant', category: 'self_consistency', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Set one boundary with them this week — something small, not the biggest issue. Just one, clearly.",
    brief_why: "Fearful-avoidant attachment often abandons self to avoid conflict. One small boundary builds the pattern.",
    completion_ack: "One boundary held. That's a self showing up." },

  // ── Co-regulation (new) ────────────────────────────────────
  { id: 'fa_coreg_t1_01', style: 'fearful_avoidant', category: 'co_regulation', tier: 1, situations: ['all'],
    text: "When you're dysregulated today — don't isolate completely and don't flood someone. Call one person and say 'I'm having a hard time. Can you just talk to me for a bit?'",
    brief_why: '',
    completion_ack: "You reached toward someone instead of away from them." },

  { id: 'fa_coreg_t2_01', style: 'fearful_avoidant', category: 'co_regulation', tier: 2, situations: ['in_relationship', 'dating'],
    text: "When you feel the urge to go cold — tell them: 'I need some space right now but I'm coming back.' Then actually come back.",
    brief_why: "A stated return changes withdrawal from abandonment signal into regulation. For the relationship and for you.",
    completion_ack: "You named the withdrawal and made a return commitment. Both matter." },

  { id: 'fa_coreg_t3_01', style: 'fearful_avoidant', category: 'co_regulation', tier: 3, situations: ['in_relationship', 'dating'],
    text: "After a period of withdrawal, initiate repair. You don't need a full explanation — just show up and say you pulled back, and you're back.",
    brief_why: "FA repair gets indefinitely delayed by the need to have everything figured out first. You don't need that to start.",
    completion_ack: "Repair initiated. The rest can come later." },

  // ═══════════════════════════════════════════════════════════
  // SECURE LEANING
  // ═══════════════════════════════════════════════════════════

  // ── Secure Modeling ────────────────────────────────────────
  { id: 'sl_model_t2_01', style: 'secure_leaning', category: 'secure_modeling', tier: 2, situations: ['in_relationship', 'dating'],
    text: "The next time your partner is activated — don't try to fix or explain. Just say 'I'm here. Take your time.' Then mean it.",
    brief_why: "Secure presence during someone else's dysregulation doesn't require solving. It requires staying.",
    completion_ack: "You stayed present in their storm without getting swept into it." },

  { id: 'sl_model_t2_02', style: 'secure_leaning', category: 'secure_modeling', tier: 2, situations: ['all'],
    text: "When conflict starts today — name what you're feeling before you name what they did. 'I feel hurt' before 'You always...'",
    brief_why: "Leading with feeling rather than accusation is the communication pattern that breaks conflict cycles.",
    completion_ack: "Your feeling first. That changes the whole dynamic." },

  { id: 'sl_model_t3_01', style: 'secure_leaning', category: 'secure_modeling', tier: 3, situations: ['in_relationship', 'dating'],
    text: "This week, repair one thing that's been sitting unaddressed — something small enough it seems unnecessary. Address it anyway.",
    brief_why: "Secure attachment is built in small repairs, not grand gestures. Keeping accounts current is the whole practice.",
    completion_ack: "A repair that didn't need to wait. That's the pattern you're building." },

  // ── Needs Expression ───────────────────────────────────────
  { id: 'sl_needs_t2_01', style: 'secure_leaning', category: 'needs_expression', tier: 2, situations: ['all'],
    text: "Ask for what you need without softening it until it disappears. Just the need, clean.",
    brief_why: "Secure people can still over-qualify needs to manage others' reactions. Clear requests are more respectful than hinted ones.",
    completion_ack: "The need without the apology. Cleaner." },

  { id: 'sl_needs_t3_01', style: 'secure_leaning', category: 'needs_expression', tier: 3, situations: ['in_relationship', 'dating'],
    text: "Tell your partner one thing that's been true for a while that you've been managing alone — not to burden them, but to let them actually know you.",
    brief_why: "Even secure-leaning people can over-manage their internal experience. Sharing it deepens intimacy.",
    completion_ack: "You let them see something real. That's what this is for." },

  { id: 'sl_awareness_t2_01', style: 'secure_leaning', category: 'awareness', tier: 2, situations: ['all'],
    text: "Notice one moment today where you felt genuinely secure — not because everything was perfect, but because you stayed with yourself through uncertainty.",
    brief_why: "Tracking security in practice (not just in theory) builds the internal model that shapes how you show up.",
    completion_ack: "You named a moment of real security. That's how it becomes more consistent." },

  // ═══════════════════════════════════════════════════════════
  // UNIVERSAL (ALL STYLES)
  // ═══════════════════════════════════════════════════════════

  { id: 'all_journal_t1_01', style: 'all', category: 'awareness', tier: 1, situations: ['all'],
    text: "Write for 5 minutes about what happened today in one relationship — not what you think about it. What actually happened.",
    brief_why: '',
    completion_ack: "Five minutes of facts instead of interpretation." },

  { id: 'all_body_t1_01', style: 'all', category: 'awareness', tier: 1, situations: ['all'],
    text: "Right now: scan from head to feet. Where are you holding tension? Just name it. Don't fix it.",
    brief_why: '',
    completion_ack: "You found the body before the story took over." },

  { id: 'all_pattern_t2_01', style: 'all', category: 'awareness', tier: 2, situations: ['all'],
    text: "Write down one pattern you've noticed yourself repeating in relationships this week. Just describe it — no judgment, no solution.",
    brief_why: "Naming a pattern without immediately trying to fix it is how you actually see it clearly.",
    completion_ack: "You saw the pattern without rushing to change it. That's different." },

  { id: 'all_body_t2_01', style: 'all', category: 'awareness', tier: 2, situations: ['all'],
    text: "Track your body's response to one specific relational situation this week — every time it comes up, note where you feel it and how intense it is.",
    brief_why: "Somatic tracking across multiple instances reveals the nervous system's true pattern, separate from the story.",
    completion_ack: "A week of body data. That's more than most people collect in a year." },

  { id: 'all_pattern_t3_01', style: 'all', category: 'awareness', tier: 3, situations: ['all'],
    text: "Write a letter to yourself from 2 years in the future, describing one thing you finally understood about your relationship patterns.",
    brief_why: "Future-self perspective creates psychological distance from current activation, often surfacing the core truth.",
    completion_ack: "A longer view. Those are rare and worth keeping." },

  // ═══════════════════════════════════════════════════════════
  // UNREQUITED / ONE-SIDED ATTACHMENT (all styles)
  // ═══════════════════════════════════════════════════════════

  // ── Fantasy Interruption ───────────────────────────────────
  { id: 'ur_fantasy_t1_01', style: 'all', category: 'fantasy_interrupt', tier: 1, situations: ['unrequited'],
    text: "The next time you catch yourself imagining a future conversation with them — write down what you're actually imagining. Just describe it factually.",
    brief_why: '',
    completion_ack: "You made the fantasy visible. That's the first step to having a choice about it." },

  { id: 'ur_fantasy_t1_02', style: 'all', category: 'fantasy_interrupt', tier: 1, situations: ['unrequited'],
    text: "Name 3 things you actually know to be true about them — not hoped, not assumed. What do you know for certain?",
    brief_why: '',
    completion_ack: "The gap between what you know and what you've built — that gap matters." },

  { id: 'ur_fantasy_t2_01', style: 'all', category: 'fantasy_interrupt', tier: 2, situations: ['unrequited'],
    text: "Write two columns: what you know about them from actual interactions, and what you've filled in yourself. Don't judge either column.",
    brief_why: "One-sided attachment survives on inference. Separating fact from projection reduces the grip.",
    completion_ack: "You looked at what you actually know. That's different from what you feel." },

  { id: 'ur_fantasy_t3_01', style: 'all', category: 'fantasy_interrupt', tier: 3, situations: ['unrequited'],
    text: "For one full day: every time a fantasy about them starts, notice it and redirect to something in the present. Don't suppress — just redirect.",
    brief_why: "Fantasy interruption isn't about willpower; it's about noticing the pull early enough to make a different choice.",
    completion_ack: "A day of catching the drift. That's new behavior." },

  // ── Evidence Reality-Testing ───────────────────────────────
  { id: 'ur_reality_t1_01', style: 'all', category: 'reality_testing', tier: 1, situations: ['unrequited'],
    text: "Write down the last clear signal they gave you about where you stand — not what you hoped it meant, what it actually said.",
    brief_why: '',
    completion_ack: "You looked at the actual signal. That takes something." },

  { id: 'ur_reality_t2_01', style: 'all', category: 'reality_testing', tier: 2, situations: ['unrequited'],
    text: "List every 'maybe' — every moment that felt like possibility. Then ask: if a friend showed you this list, what would you tell them it means?",
    brief_why: "We interpret ambiguity in the direction we want. The outside-observer question breaks the bias.",
    completion_ack: "You gave yourself the perspective you'd give a friend. That's harder than it sounds." },

  { id: 'ur_reality_t3_01', style: 'all', category: 'reality_testing', tier: 3, situations: ['unrequited'],
    text: "Write down what you would need to see — specifically — to accept that this isn't going to happen. Then ask if you've already seen it.",
    brief_why: "Defining the threshold in advance externalizes the decision, making it less about hope and more about evidence.",
    completion_ack: "You looked at the threshold. Whatever you found — that's real information." },

  // ── Hope Regulation ────────────────────────────────────────
  { id: 'ur_hope_t2_01', style: 'all', category: 'hope_regulation', tier: 2, situations: ['unrequited'],
    text: "Notice today every time you interpret something they do as a sign of interest. Count them. Don't act on any of them.",
    brief_why: "Tracking evidence-gathering without acting on it creates awareness of how the hope-feeding loop works.",
    completion_ack: "You watched the loop without feeding it. That's a different relationship with the pattern." },

  { id: 'ur_hope_t3_01', style: 'all', category: 'hope_regulation', tier: 3, situations: ['unrequited'],
    text: "Spend one day acting as if the answer is already no. Not in despair — just as an experiment. Notice how differently you move through the day.",
    brief_why: "Temporarily assuming closure removes the cognitive load of constant re-evaluation and reveals how much energy the hope is consuming.",
    completion_ack: "One day without the question open. That's what it could feel like." },

  // ── Redirecting Investment ─────────────────────────────────
  { id: 'ur_redirect_t1_01', style: 'all', category: 'self_investment', tier: 1, situations: ['unrequited', 'single_healing'],
    text: "Spend 30 minutes today on something that belongs entirely to you — not something you do to become more interesting to them.",
    brief_why: '',
    completion_ack: "Thirty minutes that were just yours." },

  { id: 'ur_redirect_t2_01', style: 'all', category: 'self_investment', tier: 2, situations: ['unrequited', 'single_healing'],
    text: "Identify one area of your life that's been on hold while this has been taking up space. Do one small thing in that area today.",
    brief_why: "Unrequited attachment consumes attention that has real opportunity costs. Reclaiming one area concretely demonstrates the choice.",
    completion_ack: "One step in a direction that has nothing to do with them." },

  { id: 'ur_redirect_t3_01', style: 'all', category: 'self_investment', tier: 3, situations: ['unrequited', 'single_healing'],
    text: "Make a plan for one thing you want to do in the next month that excites you. Not to distract — because it's yours. Make it concrete enough that you can actually start.",
    brief_why: "Future-investment builds self-narrative independent of the attachment figure, which is what lets the attachment begin to loosen.",
    completion_ack: "A plan that belongs to you. That's building the life you'll step into." },
];

module.exports = { ACTION_LIBRARY };
