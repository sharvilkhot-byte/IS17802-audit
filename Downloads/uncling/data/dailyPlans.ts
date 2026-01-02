
import { AttachmentStyle } from '../types';

export interface DailyAction {
    id: string;
    title: string;
    subtitle: string;
    recommendedPath?: string; // Optional link to a helper tool in the app
}

const ANXIOUS_ACTIONS: DailyAction[] = [
    {
        id: 'anx_pause',
        title: "The 10-Minute Pause",
        subtitle: "Feel an urge to double-text or fix something? Wait 10 minutes first.",
        recommendedPath: '/rescue'
    },
    {
        id: 'anx_fact_check',
        title: "Fact-Check Your Fear",
        subtitle: "Write down one worry and list evidence for and against it.",
        recommendedPath: '/chat'
    },
    {
        id: 'anx_self_soothe',
        title: "Physical Self-Soothing",
        subtitle: "Place a hand on your chest and take 5 deep breaths.",
        recommendedPath: '/rescue'
    },
    {
        id: 'anx_autonomy',
        title: "Do One Thing for You",
        subtitle: "Engage in a hobby or activity just for yourself, without involving others.",
    },
    {
        id: 'anx_affirmation',
        title: "Safety Affirmation",
        subtitle: "Repeat to yourself: 'I am safe, and I can handle uncertainty.'",
    }
];

const AVOIDANT_ACTIONS: DailyAction[] = [
    {
        id: 'av_emotion_label',
        title: "Name One Emotion",
        subtitle: "Pause and identify exactly what you are feeling right now.",
        recommendedPath: '/reflection'
    },
    {
        id: 'av_low_stakes',
        title: "Low-Stakes Connection",
        subtitle: "Send a text or meme to a friend just to say hello.",
    },
    {
        id: 'av_body_scan',
        title: "Check Your Body",
        subtitle: "Notice where you are holding tension. Drop your shoulders.",
        recommendedPath: '/rescue'
    },
    {
        id: 'av_share',
        title: "Micro-Vulnerability",
        subtitle: "Share one small thought or feeling with someone today.",
    },
    {
        id: 'av_needs',
        title: "Identify a Need",
        subtitle: "Ask yourself: 'What do I need right now?' (Rest? Connection? Space?)",
        recommendedPath: '/chat'
    }
];

const FEARFUL_ACTIONS: DailyAction[] = [
    {
        id: 'fa_grounding',
        title: "Sensory Grounding",
        subtitle: "Name 5 things you can see and 4 things you can feel.",
        recommendedPath: '/rescue'
    },
    {
        id: 'fa_consistency',
        title: "One Small Routine",
        subtitle: "Do one routine task (like making bed) at the same time today.",
    },
    {
        id: 'fa_trust',
        title: "Trust Your Gut",
        subtitle: "Make one small decision quickly without second-guessing.",
    },
    {
        id: 'fa_self_compassion',
        title: "Soften the Inner Critic",
        subtitle: "If you mess up, speak to yourself like you would a friend.",
        recommendedPath: '/chat'
    },
    {
        id: 'fa_boundaries',
        title: "Set a Small Boundary",
        subtitle: "Say 'no' to something small or protect your quiet time.",
    }
];

const SECURE_ACTIONS: DailyAction[] = [
    {
        id: 'sec_gratitude',
        title: "Express Gratitude",
        subtitle: "Tell someone specific why you appreciate them.",
    },
    {
        id: 'sec_deepen',
        title: "Deepen a Conversation",
        subtitle: "Ask a 'how are you really?' question today.",
    },
    {
        id: 'sec_reflect',
        title: "Reflect on a Win",
        subtitle: "Journal about a moment you handled well recently.",
        recommendedPath: '/reflection'
    },
    {
        id: 'sec_generosity',
        title: "Act of Kindness",
        subtitle: "Do something small and kind for a stranger or friend.",
    }
];

export const getDailyPlan = (style: AttachmentStyle | null): DailyAction[] => {
    // Select the pool based on style
    let pool: DailyAction[] = [];
    switch (style) {
        case AttachmentStyle.Anxious: pool = ANXIOUS_ACTIONS; break;
        case AttachmentStyle.Avoidant: pool = AVOIDANT_ACTIONS; break;
        case AttachmentStyle.Fearful: pool = FEARFUL_ACTIONS; break;
        case AttachmentStyle.Secure: pool = SECURE_ACTIONS; break;
        default: pool = [...ANXIOUS_ACTIONS, ...AVOIDANT_ACTIONS]; // Mix for unknown
    }

    // Use the current date to consistently select 3 items for the day
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    
    // Simple pseudo-random selection based on date
    const selected: DailyAction[] = [];
    const count = 3;
    
    for (let i = 0; i < count; i++) {
        const index = (dayOfYear + i * 7) % pool.length; // *7 adds some spacing to rotation
        selected.push(pool[index]);
    }

    return selected;
};
