/**
 * UNCLINQ INSIGHT TABS
 * Pre-written perspective pieces. No AI needed at serve time.
 * Each tab: title (hook) → body (truth + reframe) → exit line
 *
 * Fields:
 *  difficulty: 1 = conceptual/accessible (served to awareness_level 1–2)
 *              2 = mechanistic/deeper (served to awareness_level 3–4, or after reading difficulty-1 tabs)
 *  situations: array — ['all'] or subset of ['in_relationship','dating','post_breakup','single_healing']
 *              Used as a serving boost, not a hard filter
 */

const INSIGHT_TABS = [
  // ─── Anxious ──────────────────────────────────────────────────────────────
  {
    id: 'it_anx_01',
    styles: ['anxious'],
    theme: 'reassurance_seeking',
    difficulty: 1,
    situations: ['all'],
    title: "You don't miss them. You miss the feeling of being chosen.",
    body: "After a cold text or two days of silence, the pain feels like it's about them. But the obsession is rarely about who they are — it's about what their attention was giving you. A feeling of being chosen, wanted, real. Your nervous system learned early that love comes with uncertainty. Chasing feels like love because that's what love felt like when it first got wired in.",
    exit: "The thing you're looking for isn't in them. It never was.",
    read_time_seconds: 45
  },
  {
    id: 'it_anx_02',
    styles: ['anxious'],
    theme: 'checking_behavior',
    difficulty: 1,
    situations: ['in_relationship', 'dating', 'post_breakup'],
    title: "Checking doesn't reduce anxiety. It resets it.",
    body: "Every time you check their last seen, their location, their story views — you get a moment of information. Then the anxiety comes back, often stronger. The check gives the nervous system a temporary answer and immediately asks a new question. It feels like relief but works like a drug. Each hit requires a slightly larger dose.",
    exit: "The anxiety isn't about information. It's about tolerance. That's what actually needs building.",
    read_time_seconds: 40
  },
  {
    id: 'it_anx_03',
    styles: ['anxious'],
    theme: 'protest_behavior',
    difficulty: 1,
    situations: ['in_relationship', 'dating'],
    title: "Protest behavior doesn't mean you're needy. It means you're scared.",
    body: "Sending six messages, going cold, manufacturing jealousy, picking fights — these are protest behaviors. They happen when the attachment system detects threat and tries to restore connection through force. They almost always make things worse. But they're not a character flaw. They're what happens when a nervous system that learned love is unreliable tries to hold on.",
    exit: "The behavior is protecting something real. The question is whether it's protecting you or the fear.",
    read_time_seconds: 50
  },
  {
    id: 'it_anx_04',
    styles: ['anxious'],
    theme: 'self_abandonment',
    difficulty: 2,
    situations: ['all'],
    title: "You're not 'too much.' You've been asking the wrong person.",
    body: "When someone can't meet your needs consistently, the natural conclusion is that your needs are the problem. They're not. Some people don't have the capacity. Some people aren't trying. The story 'I'm too much' protects you from the more painful truth — that they weren't enough. But it comes at the cost of shrinking yourself.",
    exit: "The right person won't make you feel like a burden for having needs. That's not a high bar.",
    read_time_seconds: 45
  },
  {
    id: 'it_anx_05',
    styles: ['anxious'],
    theme: 'intermittent_reinforcement',
    difficulty: 2,
    situations: ['in_relationship', 'dating', 'post_breakup', 'unrequited'],
    title: "You want them most when they pull away. That's not love — it's activation.",
    body: "The moments when someone becomes slightly distant, when they seem less interested — those are when the pull feels strongest. This is intermittent reinforcement. Unpredictable reward creates more powerful conditioning than consistent reward. The relationship feels intense because the nervous system is constantly trying to win something it's not sure it can have.",
    exit: "Intensity isn't the same thing as connection. You already know this. The question is what you do with it.",
    read_time_seconds: 50
  },
  {
    id: 'it_anx_06',
    styles: ['anxious'],
    theme: 'hypervigilance',
    difficulty: 2,
    situations: ['in_relationship', 'dating', 'unrequited'],
    title: "You're not paranoid. Your detector is just calibrated wrong.",
    body: "Reading every tone shift, every delayed response, every facial expression for signs of rejection — this isn't irrationality. It's hypervigilance. You learned early that emotional signals from people close to you mattered a great deal and could change fast. So you got very good at reading them. The problem is the detector keeps firing even in low-threat environments. The skill that protected you now exhausts you.",
    exit: "Hypervigilance was a survival tool. The work is teaching it when it's safe to rest.",
    read_time_seconds: 50
  },
  {
    id: 'it_anx_07',
    styles: ['anxious'],
    theme: 'people_pleasing',
    difficulty: 2,
    situations: ['all'],
    title: "People-pleasing isn't kindness. It's a preemptive strike against rejection.",
    body: "Agreeing when you don't, making yourself useful, softening the truth to avoid conflict — these feel like being a good person. But underneath most people-pleasing is a calculation: if I give them what they want, they won't leave. The impulse isn't wrong. The math just doesn't hold. Relationships built on performed goodness can't hold the real you. And a self built on constant approval-seeking eventually collapses inward.",
    exit: "The approval you've been chasing won't feel like enough when you finally get it. It never does.",
    read_time_seconds: 50
  },

  // ─── Dismissive-Avoidant ───────────────────────────────────────────────────
  {
    id: 'it_da_01',
    styles: ['dismissive_avoidant'],
    theme: 'emotional_suppression',
    difficulty: 1,
    situations: ['all'],
    title: "You say you don't need people. You just haven't found it safe to.",
    body: "Independence becomes a story after a while. 'I prefer to be alone' sounds true, especially if you've said it for years. But there's usually a moment — a small one — where something someone said or did felt important, and you moved away from it instead of toward it. Avoidance isn't a character trait. It's a learned protection. You didn't stop needing connection. You stopped expecting it to go well.",
    exit: "The need is still there. The wound is around trusting it.",
    read_time_seconds: 45
  },
  {
    id: 'it_da_02',
    styles: ['dismissive_avoidant'],
    theme: 'withdrawal_impact',
    difficulty: 1,
    situations: ['in_relationship', 'dating'],
    title: "Going quiet isn't neutral. It ends things slowly.",
    body: "When things get hard, going quiet feels like the safe choice. Not fighting, not making it worse, just withdrawing until it passes. But to the person on the other side, silence reads as rejection. You think you're managing the situation. They think the relationship is ending. Both of you are right about what's happening. Neither of you is talking about it.",
    exit: "Withdrawal protects you from conflict. It also prevents repair.",
    read_time_seconds: 45
  },
  {
    id: 'it_da_03',
    styles: ['dismissive_avoidant'],
    theme: 'devaluation',
    difficulty: 2,
    situations: ['in_relationship', 'dating'],
    title: "The closer they get, the more wrong they seem.",
    body: "When someone gets close enough to really see you, something in you starts noticing their flaws. The small annoyances get louder. The attraction dims. This isn't coincidence — it's a protection mechanism. Devaluation is how avoidant attachment creates distance when closeness feels threatening. It's the nervous system pulling the emergency brake.",
    exit: "What's the pattern underneath the pattern? What would happen if you let someone stay?",
    read_time_seconds: 45
  },
  {
    id: 'it_da_04',
    styles: ['dismissive_avoidant'],
    theme: 'self_sufficiency',
    difficulty: 1,
    situations: ['all'],
    title: "Self-sufficiency is a coping strategy, not a personality.",
    body: "Handling everything alone, not asking for help, being the person who 'doesn't need anyone' — this is adaptive. It worked. It kept you from disappointment and from depending on people who weren't reliable. The problem is that it doesn't turn off when you're around people who actually are reliable. The protection became the prison.",
    exit: "The goal isn't to need people less. It's to trust the right ones more.",
    read_time_seconds: 45
  },
  {
    id: 'it_da_05',
    styles: ['dismissive_avoidant'],
    theme: 'emotional_flooding_origin',
    difficulty: 2,
    situations: ['all'],
    title: "You don't fear closeness. You fear what closeness asks of you.",
    body: "What avoidant attachment actually protects against isn't people — it's the experience of needing someone and having that need go wrong. Depending and being let down. Showing something real and having it used. Being vulnerable and being overwhelmed. Closeness doesn't just mean connection. It means exposure. And somewhere along the way, exposure got expensive.",
    exit: "The protection made sense. The question is what it costs now.",
    read_time_seconds: 45
  },
  {
    id: 'it_da_06',
    styles: ['dismissive_avoidant'],
    theme: 'grief_avoidance',
    difficulty: 2,
    situations: ['post_breakup', 'single_healing'],
    title: "Moving on fast isn't healing. It's skipping a step.",
    body: "After a loss — a relationship, a friendship, a version of someone you believed in — avoidant attachment tends toward rapid forward movement. New project, new person, more busyness. This works as a short-term strategy. It doesn't work as processing. The grief that didn't happen doesn't disappear; it accumulates. Most avoidant patterns aren't about the current person. They're about what got carried forward unprocessed.",
    exit: "Staying with the loss isn't dwelling. It's the only way through it.",
    read_time_seconds: 45
  },

  // ─── Fearful-Avoidant ──────────────────────────────────────────────────────
  {
    id: 'it_fa_01',
    styles: ['fearful_avoidant'],
    theme: 'push_pull',
    difficulty: 1,
    situations: ['all'],
    title: "You want them close and then you run. Both are true at the same time.",
    body: "Wanting connection and fearing it simultaneously is exhausting in a way that's hard to explain. You reach out and then panic. You get close and then manufacture distance. The mixed signals aren't games — they're an honest expression of a system that learned love is both necessary and dangerous. Both parts of you are trying to keep you safe.",
    exit: "The conflict isn't between you and them. It's between two parts of you. That's a different problem.",
    read_time_seconds: 50
  },
  {
    id: 'it_fa_02',
    styles: ['fearful_avoidant'],
    theme: 'cycle_recognition',
    difficulty: 1,
    situations: ['all'],
    title: "You're not unstable. You're running two incompatible programs at once.",
    body: "The part of you that needs closeness is running one script. The part that's learned closeness leads to pain is running another. When they conflict — which is often — the result looks erratic from the outside. Hot and cold. Intense then gone. This isn't a character disorder. It's two nervous systems that never got integrated.",
    exit: "Integration takes time. But it starts with knowing both parts are trying to help.",
    read_time_seconds: 50
  },
  {
    id: 'it_fa_03',
    styles: ['fearful_avoidant'],
    theme: 'self_betrayal',
    difficulty: 2,
    situations: ['all'],
    title: "You keep choosing them over yourself. Not because they're worth it.",
    body: "When attachment feels dangerous, the mind finds a workaround: make yourself smaller. Agree when you don't. Stay when you should leave. Go silent when you have something to say. This isn't love — it's a bid to stay safe. If I don't have needs, I can't be abandoned for having them. Self-betrayal in fearful-avoidant attachment isn't cowardice. It's an old calculation about what keeps you close.",
    exit: "The question isn't whether you were right to protect yourself. It's whether that protection is still serving you.",
    read_time_seconds: 50
  },
  {
    id: 'it_fa_04',
    styles: ['fearful_avoidant'],
    theme: 'earned_trust',
    difficulty: 2,
    situations: ['in_relationship', 'dating'],
    title: "Trust isn't binary. You're allowed to build it in increments.",
    body: "The fearful-avoidant position on trust is usually all-or-nothing: either I'm fully in or I'm out, because halfway feels unbearable. But trust actually accumulates in small exchanges — one thing said and not used against you, one request made and met, one fight survived without catastrophe. You don't have to decide if someone is trustworthy. You can just watch what happens when you reveal something small. Then something slightly less small.",
    exit: "Trust isn't a decision you make about a person. It's a record you keep of what actually happened.",
    read_time_seconds: 45
  },
  {
    id: 'it_fa_05',
    styles: ['fearful_avoidant'],
    theme: 'hot_cold_origin',
    difficulty: 1,
    situations: ['all'],
    title: "The mixed signals aren't games. They're two systems trying to stay alive.",
    body: "When you run hot and cold — deeply present one day, gone the next — it reads as manipulation from the outside. It isn't. It's two nervous system states alternating control. One state craves connection. The other has been burned by it. They don't communicate with each other. They just take turns. The person on the other end experiences this as instability. You experience it as exhaustion. Both things are true.",
    exit: "Understanding where it comes from doesn't make it stop. But it makes it something you can work with instead of just be trapped by.",
    read_time_seconds: 45
  },
  {
    id: 'it_fa_06',
    styles: ['fearful_avoidant'],
    theme: 'repair_after_withdrawal',
    difficulty: 2,
    situations: ['in_relationship', 'dating'],
    title: "After you've gone cold, coming back is the actual work.",
    body: "Withdrawal has a logic: get safe, get distance, wait for the threat to pass. But the moment the threat passes — when the activation drops and you want to reconnect — comes the second problem. How do you come back? How do you explain something you don't fully understand yourself? Most fearful-avoidant repair attempts are too small to be visible, or come across as nothing happened. The gap between what you feel and what gets communicated is where relationships quietly end.",
    exit: "Repair doesn't have to be perfect or fully explained. It starts with showing up after you disappeared.",
    read_time_seconds: 45
  },
  {
    id: 'it_fa_07',
    styles: ['fearful_avoidant'],
    theme: 'body_dysregulation',
    difficulty: 2,
    situations: ['all'],
    title: "Your body learned the relationship was dangerous before your mind did.",
    body: "Fearful-avoidant attachment often develops in environments where closeness was both needed and threatening — where love came with unpredictability, volatility, or fear. The nervous system learns this directly, below conscious thought. So when closeness feels threatening now — even with a safe person, even in a calm moment — it's not irrational. It's a body that was trained. The problem isn't that you feel unsafe. It's that the old training fires even when the current situation doesn't warrant it.",
    exit: "The activation in your body is information about the past. It takes time to teach the nervous system to tell the difference.",
    read_time_seconds: 55
  },
  {
    id: 'it_fa_08',
    styles: ['fearful_avoidant'],
    theme: 'longing_beneath_avoidance',
    difficulty: 1,
    situations: ['all'],
    title: "The avoidance is louder than the longing. But the longing is real.",
    body: "Underneath the withdrawal, the cooling off, the exits — there is almost always a version of you that wants exactly what you're running from. Deep familiarity. Being known. Not having to explain yourself. Fearful-avoidant attachment doesn't kill the need for connection. It buries it under layers of protection so thick that even you forget it's there. The grief that surfaces in the quiet moments — that's the longing making itself known.",
    exit: "You want connection. You also fear it. Holding both without collapsing either — that's the work.",
    read_time_seconds: 45
  },

  // ─── Secure Leaning ────────────────────────────────────────────────────────
  {
    id: 'it_sl_01',
    styles: ['secure_leaning'],
    theme: 'what_secure_means',
    difficulty: 1,
    situations: ['all'],
    title: "Secure doesn't mean unaffected. It means you come back.",
    body: "Secure attachment is sometimes misread as emotional distance — as if caring less is what makes someone stable. It's the opposite. Secure people feel anxiety, hurt, longing, conflict. The difference is that the feeling doesn't take over. They can hold discomfort long enough to think. They can repair without it meaning the relationship is over. They can disagree without it becoming a verdict. Security isn't a thinner feeling. It's a more spacious container for the same feelings.",
    exit: "If you're reading this, you probably have more security than you give yourself credit for. The question is how you use it.",
    read_time_seconds: 45
  },
  {
    id: 'it_sl_02',
    styles: ['secure_leaning'],
    theme: 'earned_security',
    difficulty: 2,
    situations: ['all'],
    title: "If you had to work for this, it means something different.",
    body: "Some people come to security through a stable early environment. Others build it — through therapy, through relationships that slowly taught them it was safe, through the slow accumulation of self-knowledge. Earned security is often less taken for granted than native security. You know what instability costs because you paid it. You understand what a regulated nervous system feels like because you remember not having it. That awareness is worth something.",
    exit: "Earned security is the kind you built from understanding. That makes it yours in a way it can't be taken.",
    read_time_seconds: 45
  },
  {
    id: 'it_sl_03',
    styles: ['secure_leaning'],
    theme: 'with_insecure_partners',
    difficulty: 2,
    situations: ['in_relationship', 'dating'],
    title: "You can't regulate them. You can stay regulated yourself.",
    body: "When you're secure-leaning and your partner isn't, the instinct is often to help — to explain, reassure, create calm. Sometimes this works. More often it creates a dynamic where you're managing their nervous system at the cost of your own. You can't coregulate someone into security. What you can do is stay in contact without chasing, maintain your own groundedness when they're activated, repair without collapsing into their panic. Your steadiness is real. It's also not a substitute for their work.",
    exit: "You can be a safe person without being the source of their safety. That distinction matters.",
    read_time_seconds: 50
  },
  {
    id: 'it_sl_04',
    styles: ['secure_leaning'],
    theme: 'security_under_pressure',
    difficulty: 2,
    situations: ['all'],
    title: "Security gets tested when it costs something. That's the only time it counts.",
    body: "It's easy to feel secure in a good week, with a responsive partner, in the absence of real threat. The real question is what happens when there's a prolonged cold spell, when they pull away for reasons you can't read, when a pattern you thought was gone reappears. Security isn't a permanent state you earn once. It's a capacity that gets tested and rebuilt. The goal isn't to stop being triggered. It's to know what to do with the activation when it comes.",
    exit: "The security you demonstrate under pressure is the kind that actually shapes a relationship.",
    read_time_seconds: 50
  },

  // ─── Universal ─────────────────────────────────────────────────────────────
  {
    id: 'it_all_01',
    styles: ['all'],
    theme: 'closure',
    difficulty: 1,
    situations: ['post_breakup', 'single_healing', 'unrequited'],
    title: "Closure is not something they give you.",
    body: "You can't get it from a conversation, a confession, or a final message. Closure isn't information — it's the decision to stop waiting for an explanation that will finally make the ending make sense. Most endings don't make sense. Most people don't have the words. The thing you're waiting for from them is something only you can decide to have.",
    exit: "Closure is a choice you make, not a gift you receive.",
    read_time_seconds: 40
  },
  {
    id: 'it_all_02',
    styles: ['all'],
    theme: 'intensity_vs_love',
    difficulty: 1,
    situations: ['all'],
    title: "Intensity isn't intimacy. They can feel identical.",
    body: "The anxiety of not knowing, the high of being wanted after distance, the pain of someone who blows hot and cold — all of this feels like deep connection because it occupies so much space in your nervous system. But occupying space and creating safety are different things. Intensity activates you. Intimacy regulates you.",
    exit: "The most loving relationships often feel boring to a nervous system trained on chaos. That's a feature, not a bug.",
    read_time_seconds: 45
  },
  {
    id: 'it_all_03',
    styles: ['all'],
    theme: 'familiarity',
    difficulty: 1,
    situations: ['all'],
    title: "You're not attracted to unavailable people. You're attracted to familiar ones.",
    body: "It's rarely a coincidence that the person who is just slightly out of reach, who runs hot and cold, who keeps you wondering — feels so magnetically compelling. The nervous system doesn't seek love. It seeks the familiar shape of love. And for many people, love first arrived wrapped in uncertainty.",
    exit: "What feels like chemistry is often pattern recognition. That's not your fault. It is your responsibility.",
    read_time_seconds: 45
  },
  {
    id: 'it_all_04',
    styles: ['all'],
    theme: 'needs_vs_demands',
    difficulty: 2,
    situations: ['in_relationship', 'dating'],
    title: "There's a difference between a need and a demand. It matters more than you think.",
    body: "A need is something you require to feel safe and connected. A demand is a need that comes with an implicit punishment for not meeting it — withdrawal, anger, silence, guilt. Most relationship conflict isn't about the need itself. It's about the delivery. When needs are expressed cleanly, people can respond. When they're wrapped in demand, people get defensive.",
    exit: "Knowing what you need is step one. How you ask for it is step two. Both are skills.",
    read_time_seconds: 50
  },
  {
    id: 'it_all_05',
    styles: ['all'],
    theme: 'emotional_unavailability',
    difficulty: 1,
    situations: ['all'],
    title: "Emotionally unavailable people don't feel like a red flag. They feel like home.",
    body: "If the people who raised you were inconsistent, unavailable, or hard to reach — then someone who offers the same thing won't feel wrong. It'll feel familiar. And familiar feels like safety even when it isn't. This is why the pattern repeats. You're not making a bad choice. You're making an accurate one — accurate to what love has always looked like.",
    exit: "The work is teaching your nervous system what safe actually feels like. It takes longer than you'd hope.",
    read_time_seconds: 50
  },
  {
    id: 'it_all_06',
    styles: ['all'],
    theme: 'relational_grief',
    difficulty: 1,
    situations: ['post_breakup', 'single_healing', 'unrequited'],
    title: "You can grieve someone who's still alive. That's not dramatic — it's accurate.",
    body: "The grief of a relationship that ended, changed, or never became what you needed doesn't require a death. It requires a loss. Loss of the version of them you believed in. Loss of the future you were constructing. Loss of the person you were when it was good. This grief is real, it moves through the same stages, and it doesn't get shorter by calling it something else. The people who take longest to recover are often the ones who insist they shouldn't need to.",
    exit: "Letting yourself grieve isn't weakness. It's the only way the grief actually moves.",
    read_time_seconds: 45
  },
  {
    id: 'it_all_07',
    styles: ['all'],
    theme: 'anger_as_information',
    difficulty: 2,
    situations: ['all'],
    title: "The anger isn't the problem. What you do with it is.",
    body: "Anger in relationships gets pathologized quickly — it's messy, it scares people, it's associated with losing control. But anger is a signal. It says: something crossed a line, or kept crossing it. Something wasn't fair. Something you needed didn't happen. Suppressed anger becomes resentment, or it becomes depression, or it erupts sideways at the wrong moment. The anger itself is just a very loud piece of information about what matters to you.",
    exit: "The question isn't how to stop being angry. It's how to listen to it before it gets loud enough to break things.",
    read_time_seconds: 45
  },
  {
    id: 'it_all_08',
    styles: ['all'],
    theme: 'somatic_memory',
    difficulty: 2,
    situations: ['all'],
    title: "Your body keeps a record you didn't agree to keep.",
    body: "Long after the relationship ends — or long after the incident — your body responds to echoes of it. A tone of voice that sounds like theirs. A silence that feels like the silences. Someone getting close in a certain way. This isn't a cognitive choice; it's the nervous system running old pattern-matching. The body holds relational history more literally than the mind does. This is why insight alone doesn't change the response. The body needs different experiences, not better explanations.",
    exit: "You can understand exactly what happened and still have the body respond to it. Understanding is the beginning, not the end.",
    read_time_seconds: 50
  },
  {
    id: 'it_all_09',
    styles: ['all'],
    theme: 'talking_vs_communicating',
    difficulty: 2,
    situations: ['in_relationship', 'dating'],
    title: "You can talk about a problem for years without communicating it once.",
    body: "Talking about a problem — its history, whose fault it is, how many times it's happened — and actually communicating a need are different skills. The first is processing. The second is requesting. Most relationship conflict involves a lot of processing (rehashing, explaining, defending) and very little requesting. 'I need 20 minutes to decompress after work before I can talk' is a request. 'You never give me space' is processing. One of them can be responded to.",
    exit: "A complaint is a need in disguise. The work is finding the need.",
    read_time_seconds: 45
  },
  {
    id: 'it_all_10',
    styles: ['all'],
    theme: 'what_healing_looks_like',
    difficulty: 1,
    situations: ['all'],
    title: "Healing doesn't feel like getting better. It feels like seeing more clearly.",
    body: "People expect healing to feel like relief — like the pain decreasing, the patterns disappearing, the relationships suddenly working. It often feels like the opposite at first. You start to see things you didn't see. The clarity is uncomfortable. The work is hard. The patterns are more visible but not yet changed. This stage — where you know what's happening but can't stop it yet — is not regression. It's the most important part. You are building the gap between seeing and doing.",
    exit: "The goal isn't to stop feeling things. It's to get a little more space between the feeling and the reaction.",
    read_time_seconds: 45
  },

  // ─── Unrequited / One-Sided ────────────────────────────────────────────────
  {
    id: 'it_ur_01',
    styles: ['all'],
    theme: 'loving_the_idea',
    difficulty: 1,
    situations: ['unrequited'],
    title: "You're not in love with them. You're in love with who you become around them.",
    body: "Unrequited attachment rarely has much to do with the actual person. It has to do with the version of yourself that exists in the story you're building — the one where they choose you, where you feel finally seen, where the longing resolves. That version feels very real. The person you've constructed them to be feels very real. Neither is the same as what's actually there. Most one-sided loves are about a feeling the other person gives you access to, not about who they are when you're not watching.",
    exit: "The feeling is real. The person you've built in your head may not be.",
    read_time_seconds: 50
  },
  {
    id: 'it_ur_02',
    styles: ['all'],
    theme: 'hope_as_trap',
    difficulty: 2,
    situations: ['unrequited'],
    title: "Hope is keeping you in this. That's the honest part.",
    body: "Every ambiguous text, every moment of warmth, every occasion where they almost — these become evidence. And evidence feeds hope. Hope is not a character flaw. But in a one-sided situation, hope has a function: it prevents you from making the decision that would actually hurt in the short term and free you in the long term. The hope isn't about them. It's about not having to grieve something that never became real.",
    exit: "Grieving something that never happened is real grief. It's also the only way through.",
    read_time_seconds: 50
  },
  {
    id: 'it_ur_03',
    styles: ['all'],
    theme: 'unavailability_as_safety',
    difficulty: 2,
    situations: ['unrequited'],
    title: "The fact that they're unavailable might be part of why it feels so safe.",
    body: "A relationship that exists mostly in your head carries no risk. They can't disappoint you in ways you can't control. They can't leave, because they were never fully there. The longing feels like love, and it is — but it also functions as armor. If you're always pursuing someone who can't or won't choose you, you never have to find out what would happen if you were actually in it. Some people stay in unrequited attachment for years, not because they haven't moved on, but because the fantasy is doing important protective work.",
    exit: "The question isn't why you can't let go. It's what letting go would expose.",
    read_time_seconds: 55
  },
];

module.exports = { INSIGHT_TABS };
