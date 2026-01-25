
import { FlowStep } from '../components/flow/types';

// ==========================================
// PHASE 1: DISCOVERY (9-10 Questions)
// ==========================================
export const ONBOARDING_FLOW_INITIAL: FlowStep[] = [
    // 0.1 APP LAUNCH & CONTEXT
    {
        id: '0.1-launch',
        type: 'TextOnly',
        body: 'A quiet space to understand yourself.\n\nNothing here is judged.\nNothing here is rushed.',
        duration: 3500,
        autoAdvance: true
    },
    {
        id: '0.2-welcome',
        type: 'Card',
        heading: 'Welcome.',
        body: 'This isn’t therapy.\nIt isn’t advice.\nAnd it isn’t about fixing you.\n\nIt’s a space to notice patterns — gently.',
        cta: 'Continue'
    },
    {
        id: '0.3-contract',
        type: 'Card',
        heading: 'Safe harbor.',
        body: '• You can stop anytime\n• There are no right answers\n• You won’t be labeled or diagnosed\n• You’re always in control',
        cta: 'That feels okay'
    },

    // Q1: Baseline
    {
        id: 'p1-q1',
        type: 'SeedQuestion',
        body: 'Right now, in this moment, how do things feel inside?',
        options: [
            { label: 'Calm / steady', value: 'secure_calm' },
            { label: 'A little tense / buzzy', value: 'anxious_tense' },
            { label: 'Heavy / numb', value: 'avoidant_numb' },
            { label: 'I’m not sure', value: 'unsure' }
        ],
        variableName: 'p1_baseline'
    },

    // Q2: Reaction to distance
    {
        id: 'p1-q2',
        type: 'SeedQuestion',
        body: 'When someone important to you pulls back or becomes distant, your first instinct is to…',
        options: [
            { label: 'Try harder to reconnect / fix it', value: 'anxious_fix' },
            { label: 'Pull back too / protect myself', value: 'avoidant_protect' },
            { label: 'Wait and see what happens', value: 'secure_wait' },
            { label: 'Freeze / feel overwhelmed', value: 'fearful_freeze' }
        ],
        variableName: 'p1_distance'
    },

    // Q3: Dependency
    {
        id: 'p1-q3',
        type: 'SeedQuestion',
        body: 'Relying on others usually feels…',
        options: [
            { label: 'Natural / safe', value: 'secure_safe' },
            { label: 'Risky (I might get hurt)', value: 'anxious_risky' },
            { label: 'Suffocating / unnecessary', value: 'avoidant_suffocating' },
            { label: 'Confusing (I want it but fear it)', value: 'fearful_confused' }
        ],
        variableName: 'p1_dependency'
    },

    // Q4: Self-perception in love
    {
        id: 'p1-q4',
        type: 'SeedQuestion',
        body: 'In relationships, I often worry that…',
        options: [
            { label: 'I am "too much" for them', value: 'anxious_too_much' },
            { label: 'They will want too much from me', value: 'avoidant_engulfed' },
            { label: 'I will mess it up somehow', value: 'fearful_mess_up' },
            { label: 'I don’t worry about this much', value: 'secure_confident' }
        ],
        variableName: 'p1_worry'
    },

    // Q5: Conflict style
    {
        id: 'p1-q5',
        type: 'SeedQuestion',
        body: 'When a conflict starts, I typically…',
        options: [
            { label: 'Pursue it to resolve it FAST', value: 'anxious_pursue' },
            { label: 'Withdraw / need space immediately', value: 'avoidant_withdraw' },
            { label: 'Try to understand their side', value: 'secure_empathy' },
            { label: 'Shut down completely', value: 'fearful_shutdown' }
        ],
        variableName: 'p1_conflict'
    },

    // Q6: Texting habits (Modern context)
    {
        id: 'p1-q6',
        type: 'SeedQuestion',
        body: 'If I send a text and don’t get a reply for a few hours…',
        options: [
            { label: 'I check my phone constantly', value: 'anxious_check' },
            { label: 'I barely notice', value: 'secure_notice' },
            { label: 'I feel annoyed they are ignoring me', value: 'anxious_annoyed' },
            { label: 'I assume they are busy', value: 'secure_busy' },
            { label: 'I feel relieved I don’t have to chat', value: 'avoidant_relieved' }
        ],
        variableName: 'p1_texting'
    },

    // Q7: Emotional expression
    {
        id: 'p1-q7',
        type: 'SeedQuestion',
        body: 'Sharing my deepest feelings usually makes me feel…',
        options: [
            { label: 'Exposed / weak', value: 'avoidant_weak' },
            { label: 'Relieved / connected', value: 'secure_connected' },
            { label: 'Anxious (will they judge me?)', value: 'anxious_judge' },
            { label: 'Depends who it is', value: 'mixed_depends' }
        ],
        variableName: 'p1_expression'
    },

    // Q8: Independence
    {
        id: 'p1-q8',
        type: 'SeedQuestion',
        body: 'I value my independence…',
        options: [
            { label: 'Above almost everything else', value: 'avoidant_high_value' },
            { label: 'Ideally, but I often lose myself', value: 'anxious_lose_self' },
            { label: 'Within a balance of closeness', value: 'secure_balance' },
            { label: 'I don’t really know who I am alone', value: 'anxious_identity' }
        ],
        variableName: 'p1_independence'
    },

    // Q9: Reassurance
    {
        id: 'p1-q9',
        type: 'SeedQuestion',
        body: 'I need reassurance from my partner…',
        options: [
            { label: 'Often / Daily', value: 'anxious_high_need' },
            { label: 'Rarely / Never', value: 'avoidant_low_need' },
            { label: 'Sometimes, when things are hard', value: 'secure_moderate' },
            { label: 'I want it but don’t ask for it', value: 'fearful_wanting' }
        ],
        variableName: 'p1_reassurance'
    },

    // Q10: Past Patterns
    {
        id: 'p1-q10',
        type: 'SeedQuestion',
        body: 'Looking back at my history, I tend to pick partners who are…',
        options: [
            { label: 'Distant or unavailable', value: 'anxious_pattern' },
            { label: 'Clingy or demanding', value: 'avoidant_pattern' },
            { label: 'Secure and kind', value: 'secure_pattern' },
            { label: 'Chaotic or unpredictable', value: 'fearful_pattern' }
        ],
        variableName: 'p1_history'
    },

    // Transition to Phase 2
    {
        id: '0.9-transition',
        type: 'Transition',
        heading: 'Thank you.',
        body: 'We’re going to go a little deeper into what came up for you.',
        duration: 3000
    }
];


// ==========================================
// PHASE 2: DEEP DIVES (10-11 Questions per style)
// ==========================================

const ANXIOUS_FLOW: FlowStep[] = [
    {
        id: 'anx-intro',
        type: 'TextOnly',
        body: 'It seems you care deeply about connection.\n\nSometimes, that caring can feel like worry.',
        duration: 4000,
        autoAdvance: true
    },
    // Q1
    {
        id: 'anx-q1',
        type: 'SeedQuestion',
        body: 'When you feel uncertain in a relationship, where do you feel it in your body?',
        options: [
            { label: 'Tight chest / rapid heart', value: 'chest' },
            { label: 'Knot in my stomach', value: 'stomach' },
            { label: 'Restless energy / pacing', value: 'limbs' },
            { label: 'Thinking loops (head)', value: 'mind' }
        ],
        variableName: 'anx_body'
    },
    // Q2
    {
        id: 'anx-q2',
        type: 'SeedQuestion',
        body: 'Complete this sentence: "If I stop making effort…"',
        options: [
            { label: 'They will leave me.', value: 'leave' },
            { label: 'The relationship will fade away.', value: 'fade' },
            { label: 'They might not notice.', value: 'unnoticed' },
            { label: 'I will finally be free.', value: 'free' }
        ],
        variableName: 'anx_effort'
    },
    // Q3
    {
        id: 'anx-q3',
        type: 'SeedQuestion',
        body: 'Do you ever feel like you have to "earn" love?',
        options: [
            { label: 'Yes, constantly', value: 'yes_constantly' },
            { label: 'Sometimes', value: 'sometimes' },
            { label: 'Only when I make a mistake', value: 'mistake' },
            { label: 'No, love should be free', value: 'no' }
        ],
        variableName: 'anx_earn'
    },
    // Q4
    {
        id: 'anx-q4',
        type: 'SeedQuestion',
        body: 'Wait time (between texts or calls) feels like:',
        options: [
            { label: 'Abandonment', value: 'abandonment' },
            { label: 'Disinterest', value: 'disinterest' },
            { label: 'Just waiting', value: 'waiting' },
            { label: 'Proof I said something wrong', value: 'guilt' }
        ],
        variableName: 'anx_waittime'
    },
    // Q5
    {
        id: 'anx-q5',
        type: 'SeedQuestion',
        body: 'When a partner asks for space, you translate that as:',
        options: [
            { label: 'They are breaking up with me', value: 'breakup' },
            { label: 'I am annoying them', value: 'annoying' },
            { label: 'They need time to recharge', value: 'logical_but_fearful' },
            { label: 'They found someone else', value: 'jealousy' }
        ],
        variableName: 'anx_space_meaning'
    },
    // Q6
    {
        id: 'anx-q6',
        type: 'SeedQuestion',
        body: 'After a conflict, how long does it take your nervous system to settle?',
        options: [
            { label: 'Hours or days', value: 'long_time' },
            { label: 'Only after we apologize', value: 'dependent' },
            { label: 'I can soothe myself quickly', value: 'quick' },
            { label: 'I don’t until they reach out', value: 'external' }
        ],
        variableName: 'anx_soothe'
    },
    // Q7
    {
        id: 'anx-q7',
        type: 'SeedQuestion',
        body: 'Do you tend to over-function (do everything) to keep things smooth?',
        options: [
            { label: 'Yes, I fix everything', value: 'fixer' },
            { label: 'I try to predict their needs', value: 'mindreader' },
            { label: 'No, I state my needs clearly', value: 'assertive' },
            { label: 'I do it so they won\'t leave', value: 'fear_drive' }
        ],
        variableName: 'anx_overfunction'
    },
    // Q8
    {
        id: 'anx-q8',
        type: 'SeedQuestion',
        body: 'When you are happy, do you worry it won’t last?',
        options: [
            { label: 'Almost always ("waiting for the other shoe")', value: 'foreboding' },
            { label: 'Sometimes', value: 'sometimes' },
            { label: 'No, I enjoy the moment', value: 'present' },
            { label: 'I don’t trust happiness', value: 'distrust' }
        ],
        variableName: 'anx_joy_fear'
    },
    // Q9
    {
        id: 'anx-q9',
        type: 'SeedQuestion',
        body: 'True or False: "I often feel more committed to the relationship than my partner."',
        options: [
            { label: 'True', value: 'true' },
            { label: 'False', value: 'false' },
            { label: 'It feels equal', value: 'equal' },
            { label: 'I am not sure', value: 'unsure' }
        ],
        variableName: 'anx_imbalance'
    },
    // Q10
    {
        id: 'anx-q10',
        type: 'SeedQuestion',
        body: 'What would feel like a "miracle" in your relationships?',
        options: [
            { label: 'Knowing for sure they aren’t leaving', value: 'security' },
            { label: 'Not overthinking every word', value: 'peace_of_mind' },
            { label: 'Feeling chosen, consistently', value: 'chosen' },
            { label: 'Being able to be alone happily', value: 'independence' }
        ],
        variableName: 'anx_miracle'
    }
];

const AVOIDANT_FLOW: FlowStep[] = [
    {
        id: 'avo-intro',
        type: 'TextOnly',
        body: 'It seems you value your autonomy greatly.\n\nSometimes, closeness can feel like a loss of self.',
        duration: 4000,
        autoAdvance: true
    },
    // Q1
    {
        id: 'avo-q1',
        type: 'SeedQuestion',
        body: 'When someone gets "too close," what is the sensation?',
        options: [
            { label: 'Suffocation / trapped', value: 'trapped' },
            { label: 'Numbness / blank wall', value: 'numb' },
            { label: 'Irritation / annoyance', value: 'annoyed' },
            { label: 'Boredom', value: 'bored' }
        ],
        variableName: 'avo_sensation'
    },
    // Q2
    {
        id: 'avo-q2',
        type: 'SeedQuestion',
        body: 'Do you often feel that partners are "needy"?',
        options: [
            { label: 'Yes, almost everyone', value: 'yes_general' },
            { label: 'Only when they cry/emote', value: 'yes_emotional' },
            { label: 'No, I just need space', value: 'no' },
            { label: 'I pick needy people', value: 'pattern' }
        ],
        variableName: 'avo_view_needs'
    },
    // Q3
    {
        id: 'avo-q3',
        type: 'SeedQuestion',
        body: 'Your ideal relationship looks like:',
        options: [
            { label: 'Two independent islands', value: 'parallel' },
            { label: 'Together but with separate lives', value: 'autonomous' },
            { label: 'Occasional intense connection', value: 'sporadic' },
            { label: 'A deep merger (secretly)', value: 'secret_yearning' }
        ],
        variableName: 'avo_ideal'
    },
    // Q4
    {
        id: 'avo-q4',
        type: 'SeedQuestion',
        body: 'When you are stressed, the best thing a partner can do is:',
        options: [
            { label: 'Leave me completely alone', value: 'alone' },
            { label: 'Sit nearby but not talk', value: 'parallel_presence' },
            { label: 'Ask me what is wrong', value: 'ask' },
            { label: 'Fix it for me', value: 'fix' }
        ],
        variableName: 'avo_stress_need'
    },
    // Q5
    {
        id: 'avo-q5',
        type: 'SeedQuestion',
        body: 'Do you have a "Phantom Ex" (someone from the past who was perfect)?',
        options: [
            { label: 'Yes, I think of them often', value: 'yes' },
            { label: 'No, the past is past', value: 'no' },
            { label: 'I focus on flaws of current partners', value: 'flaw_focus' },
            { label: 'I don’t really miss people', value: 'detached' }
        ],
        variableName: 'avo_phantom'
    },
    // Q6
    {
        id: 'avo-q6',
        type: 'SeedQuestion',
        body: 'Sharing feelings feels like:',
        options: [
            { label: 'Giving away power', value: 'power_loss' },
            { label: 'A waste of time', value: 'inefficient' },
            { label: 'Dangerous', value: 'dangerous' },
            { label: 'Uncomfortable but necessary', value: 'trying' }
        ],
        variableName: 'avo_feelings_view'
    },
    // Q7
    {
        id: 'avo-q7',
        type: 'SeedQuestion',
        body: 'If a partner cries, your instinct is:',
        options: [
            { label: 'To freeze / do nothing', value: 'freeze' },
            { label: 'Get angry / frustrated', value: 'anger' },
            { label: 'Want to escape the room', value: 'escape' },
            { label: 'Try to solve the problem logically', value: 'logic' }
        ],
        variableName: 'avo_tears_reaction'
    },
    // Q8
    {
        id: 'avo-q8',
        type: 'SeedQuestion',
        body: 'Do you pride yourself on not needing others?',
        options: [
            { label: 'Yes, independence is key', value: 'pride_high' },
            { label: 'I need people, just not too much', value: 'moderate' },
            { label: 'I wish I could need them', value: 'wish' },
            { label: 'No, I am dependent', value: 'no' }
        ],
        variableName: 'avo_independence_pride'
    },
    // Q9
    {
        id: 'avo-q9',
        type: 'SeedQuestion',
        body: 'Commitment often feels like:',
        options: [
            { label: 'A trap door closing', value: 'trap' },
            { label: 'Giving up my freedom', value: 'freedom_loss' },
            { label: 'Okay if there is an exit strategy', value: 'conditional' },
            { label: 'Something I want eventually', value: 'eventual' }
        ],
        variableName: 'avo_commitment_feel'
    },
    // Q10
    {
        id: 'avo-q10',
        type: 'SeedQuestion',
        body: 'What would be a relief?',
        options: [
            { label: 'Not having to manage anyone’s emotions', value: 'no_management' },
            { label: 'Being fully understood without talking', value: 'telepathy' },
            { label: 'Knowing I can leave anytime', value: 'exit_option' },
            { label: 'Feeling safe enough to stay', value: 'safe_stay' }
        ],
        variableName: 'avo_relief'
    }
];

const FEARFUL_FLOW: FlowStep[] = [
    {
        id: 'fear-intro',
        type: 'TextOnly',
        body: 'It feels like you are caught in a tug-of-war.\n\nYou want closeness, but it also feels dangerous.',
        duration: 4000,
        autoAdvance: true
    },
    // Q1
    {
        id: 'fear-q1',
        type: 'SeedQuestion',
        body: 'Does love feel like a trap you want to enter?',
        options: [
            { label: 'Yes, exactly that', value: 'yes_exact' },
            { label: 'It feels like chaos', value: 'chaos' },
            { label: 'Just dangerous', value: 'dangerous' },
            { label: 'No', value: 'no' }
        ],
        variableName: 'fear_paradox'
    },
    // Q2
    {
        id: 'fear-q2',
        type: 'SeedQuestion',
        body: 'When you really like someone…',
        options: [
            { label: 'I panic and push them away', value: 'push' },
            { label: 'I obsess but act distant', value: 'obsess_distant' },
            { label: 'I wait for them to hurt me', value: 'expect_pain' },
            { label: 'I feel sick', value: 'somatic' }
        ],
        variableName: 'fear_reaction'
    },
    // Q3
    {
        id: 'fear-q3',
        type: 'SeedQuestion',
        body: 'Do you trust your own judgment of people?',
        options: [
            { label: 'Not at all', value: 'no_trust' },
            { label: 'Sometimes', value: 'sometimes' },
            { label: 'I trust my gut but ignore it', value: 'ignore_gut' },
            { label: 'Yes', value: 'yes' }
        ],
        variableName: 'fear_self_trust'
    },
    // Q4
    {
        id: 'fear-q4',
        type: 'SeedQuestion',
        body: 'When things are going well, do you sometimes pick a fight just to feel something?',
        options: [
            { label: 'Yes, chaos feels familiar', value: 'chaos_familiar' },
            { label: 'No, I hate fighting', value: 'no_fight' },
            { label: 'I test them to see if they stay', value: 'test' },
            { label: 'I just freeze', value: 'freeze' }
        ],
        variableName: 'fear_sabotage'
    },
    // Q5
    {
        id: 'fear-q5',
        type: 'SeedQuestion',
        body: 'Do you feel you have a "true self" in relationships?',
        options: [
            { label: 'No, I became who they want', value: 'mirror' },
            { label: 'I hide my true self', value: 'hide' },
            { label: 'Yes, but it is rejected', value: 'rejected' },
            { label: 'I don’t know who I am', value: 'unknown' }
        ],
        variableName: 'fear_identity'
    },
    // Q6
    {
        id: 'fear-q6',
        type: 'SeedQuestion',
        body: 'A partner’s kindness often makes you feel:',
        options: [
            { label: 'Suspicious ("What do they want?")', value: 'suspicious' },
            { label: 'Unworthy / Guilty', value: 'unworthy' },
            { label: 'Warm but terrified', value: 'warm_scared' },
            { label: 'Angry', value: 'angry' }
        ],
        variableName: 'fear_kindness'
    },
    // Q7
    {
        id: 'fear-q7',
        type: 'SeedQuestion',
        body: 'Do you fear you are "unlovable" at your core?',
        options: [
            { label: 'Yes, ashamed', value: 'shame' },
            { label: 'I worry about it', value: 'worry' },
            { label: 'No', value: 'no' },
            { label: 'I know I am, that is the problem', value: 'certainty' }
        ],
        variableName: 'fear_core'
    },
    // Q8
    {
        id: 'fear-q8',
        type: 'SeedQuestion',
        body: 'When you are hurt, you want to:',
        options: [
            { label: 'Hurt them back instantly', value: 'lash_out' },
            { label: 'Disappear forever', value: 'vanish' },
            { label: 'Beg them to stay', value: 'beg' },
            { label: 'All of the above at once', value: 'all' }
        ],
        variableName: 'fear_hurt_response'
    },
    // Q9
    {
        id: 'fear-q9',
        type: 'SeedQuestion',
        body: 'Do you feel "checked out" or like you are watching yourself from above?',
        options: [
            { label: 'Often (Dissociation)', value: 'dissociation' },
            { label: 'When I am stressed', value: 'stress_only' },
            { label: 'No, I am too present', value: 'hyper_present' },
            { label: 'I daydream a lot', value: 'daydream' }
        ],
        variableName: 'fear_dissociation'
    },
    // Q10
    {
        id: 'fear-q10',
        type: 'SeedQuestion',
        body: 'What is the hardest thing to believe?',
        options: [
            { label: 'That safety is possible', value: 'safety_impossible' },
            { label: 'That anyone is truly honest', value: 'honesty_impossible' },
            { label: 'That I can be normal', value: 'normal_impossible' },
            { label: 'That love doesn’t have to hurt', value: 'love_hurt' }
        ],
        variableName: 'fear_belief'
    }
];

// Fallback for Secure (shorter or focusing on maintenance)
const SECURE_FLOW: FlowStep[] = [
    {
        id: 'sec-intro',
        type: 'TextOnly',
        body: 'Relationships generally feel like a safe base for you.\n\nLet’s check for any hidden cracks or areas to deepen.',
        duration: 4000,
        autoAdvance: true
    },
    // Q1
    {
        id: 'sec-q1',
        type: 'SeedQuestion',
        body: 'When you do argue, you focus on…',
        options: [
            { label: 'finding a solution together', value: 'solve' },
            { label: 'Being right / winning', value: 'win' },
            { label: 'Calming them down', value: 'soothe' },
            { label: 'Getting it over with', value: 'end' }
        ],
        variableName: 'sec_argue'
    },
    // Q2
    {
        id: 'sec-q2',
        type: 'SeedQuestion',
        body: 'Do you ever hide your own needs to keep the peace?',
        options: [
            { label: 'Rarely, I am open', value: 'open' },
            { label: 'Sometimes, if they are stressed', value: 'adapt' },
            { label: 'More than I admit', value: 'hidden_people_pleasing' },
            { label: 'No, I state them clearly', value: 'clear' }
        ],
        variableName: 'sec_needs'
    },
    // Q3
    {
        id: 'sec-q3',
        type: 'SeedQuestion',
        body: 'When a partner is acting insecurely (clingy or distant), you feel:',
        options: [
            { label: 'Compassionate and steady', value: 'steady' },
            { label: 'Annoyed / drained', value: 'drained' },
            { label: 'Like I must be doing something wrong', value: 'doubt' },
            { label: 'I want to fix them', value: 'fix' }
        ],
        variableName: 'sec_reaction'
    },
    // Q4
    {
        id: 'sec-q4',
        type: 'SeedQuestion',
        body: 'Vulnerability is:',
        options: [
            { label: 'Essential for connection', value: 'essential' },
            { label: 'Hard but worth it', value: 'hard' },
            { label: 'Something I still struggle with', value: 'struggle' },
            { label: 'Overrated', value: 'overrated' }
        ],
        variableName: 'sec_vuln'
    },
    // Q5
    {
        id: 'sec-q5',
        type: 'SeedQuestion',
        body: 'Do you tend to fall for people who need "saving"?',
        options: [
            { label: 'In the past, yes', value: 'past_hero' },
            { label: 'No, I want an equal', value: 'equal' },
            { label: 'Sometimes', value: 'sometimes' },
            { label: 'Yes, I like being the strong one', value: 'hero_complex' }
        ],
        variableName: 'sec_saving'
    },
    // Q6
    {
        id: 'sec-q6',
        type: 'SeedQuestion',
        body: 'How are your boundaries?',
        options: [
            { label: 'Clear and flexible', value: 'healthy' },
            { label: 'Sometimes too rigid', value: 'rigid' },
            { label: 'Sometimes too loose', value: 'loose' },
            { label: 'I feel guilty setting them', value: 'guilt' }
        ],
        variableName: 'sec_boundaries'
    },
    // Q7
    {
        id: 'sec-q7',
        type: 'SeedQuestion',
        body: 'When you are under high stress, what is your "shadow" side?',
        options: [
            { label: 'I get critical', value: 'critical' },
            { label: 'I withdraw', value: 'withdraw' },
            { label: 'I get anxious', value: 'anxious' },
            { label: 'I over-work', value: 'work' }
        ],
        variableName: 'sec_shadow'
    },
    // Q8
    {
        id: 'sec-q8',
        type: 'SeedQuestion',
        body: 'Do you feel you rely on your partner enough?',
        options: [
            { label: 'Yes, we are a team', value: 'team' },
            { label: 'I could probably lean more', value: 'lean_more' },
            { label: 'I prefer to handle things alone', value: 'too_independent' },
            { label: 'I rely too much', value: 'too_dependent' }
        ],
        variableName: 'sec_reliance'
    },
    // Q9
    {
        id: 'sec-q9',
        type: 'SeedQuestion',
        body: 'How do you handle apologies?',
        options: [
            { label: 'Easily, if I am wrong', value: 'easy' },
            { label: 'It is hard for me', value: 'hard' },
            { label: 'I apologize too much', value: 'too_much' },
            { label: 'I wait for them to start', value: 'wait' }
        ],
        variableName: 'sec_apology'
    },
    // Q10
    {
        id: 'sec-q10',
        type: 'SeedQuestion',
        body: 'What is your goal for using Unclinq?',
        options: [
            { label: 'To understand my partner better', value: 'partner_focus' },
            { label: 'To maintain my good habits', value: 'maintain' },
            { label: 'To help me through a rough patch', value: 'rough_patch' },
            { label: 'Just curious', value: 'curious' }
        ],
        variableName: 'sec_goal'
    }
];

export const ONBOARDING_FLOWS_SPECIFIC: Record<string, FlowStep[]> = {
    'anxious': ANXIOUS_FLOW,
    'avoidant': AVOIDANT_FLOW,
    'fearful': FEARFUL_FLOW,
    'secure': SECURE_FLOW,
    'unknown': SECURE_FLOW
};

// Export the "default" as strict generic for backward compatibility if needed, but we essentially replaced it.
export const MODULE_1_ONBOARDING = ONBOARDING_FLOW_INITIAL;
