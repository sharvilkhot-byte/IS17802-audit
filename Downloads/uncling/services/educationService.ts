export type EducationStep =
    | 'education_insight'
    | 'biology_why'
    | 'what_helps'
    | 'contextual_nudge'
    | 'open_app_nudge'
    | 'safe_space_nudge'
    | 'shutdown'
    | 'avoidance_guilt'
    | 'dont_want_to_talk'
    | 'skepticism';

export interface EducationContent {
    id: EducationStep;
    type: 'insight' | 'nudge' | 'edge_state';
    headline: string;
    body: string;
    primaryAction?: string;
    secondaryAction?: string;
    microCopy?: string;
}

export const EDUCATION_CONTENT: Record<EducationStep, EducationContent> = {
    education_insight: {
        id: 'education_insight',
        type: 'insight',
        headline: "A small thing to know.",
        body: "Your nervous system is constantly scanning for safety. This isn't anxiety—it's intelligence working to protect you.",
        primaryAction: "Read more",
        secondaryAction: "Dismiss"
    },
    biology_why: {
        id: 'biology_why',
        type: 'insight',
        headline: "Why this happens biologically.",
        body: "When certainty drops, your amygdala prepares for action. It’s a survival response, not a personality flaw.",
        primaryAction: "Expand",
        secondaryAction: "Close"
    },
    what_helps: {
        id: 'what_helps',
        type: 'insight',
        headline: "What helps people like you.",
        body: "Small moments of grounding often work better than big efforts. A pause, a deep breath, or simply naming the feeling.",
        primaryAction: "Try a pause",
        secondaryAction: "Save for later"
    },
    contextual_nudge: {
        id: 'contextual_nudge',
        type: 'nudge',
        headline: "Noticing a pattern?",
        body: "It seems this feeling often comes up around this time. Just an observation to hold lightly.",
        primaryAction: "Explore pattern",
        secondaryAction: "Dismiss",
        microCopy: "You know yourself best."
    },
    open_app_nudge: {
        id: 'open_app_nudge',
        type: 'nudge',
        headline: "Good to see you.",
        body: "No agenda today. Just a space to check in if you need it.",
        primaryAction: "Check in",
        secondaryAction: "Just browsing"
    },
    safe_space_nudge: {
        id: 'safe_space_nudge',
        type: 'nudge',
        headline: "It seems intense right now.",
        body: "Would you like to step into a quieter space for a moment? No pressure to fix anything.",
        primaryAction: "Go to Safe Space",
        secondaryAction: "Stay here"
    },
    shutdown: {
        id: 'shutdown',
        type: 'edge_state',
        headline: "It’s okay to feel nothing.",
        body: "Numbness is a valid way your system rests. We don't need to force a feeling.",
        primaryAction: "Rest here",
        secondaryAction: "Exit",
        microCopy: "We can wait."
    },
    avoidance_guilt: {
        id: 'avoidance_guilt',
        type: 'edge_state',
        headline: "No need to apologize.",
        body: "You can come and go as you please. Unclinq is here whenever you return, exactly as you left it.",
        primaryAction: "Continue",
        secondaryAction: "Close"
    },
    dont_want_to_talk: {
        id: 'dont_want_to_talk',
        type: 'edge_state',
        headline: "We don’t have to talk.",
        body: "Silence is a perfect way to use this space. We can just be here.",
        primaryAction: "Sit in silence",
        secondaryAction: "Leave",
        microCopy: "No words required."
    },
    skepticism: {
        id: 'skepticism',
        type: 'edge_state',
        headline: "It’s good to question.",
        body: "If this doesn't feel right, trust that instinct. You are the expert on your own experience.",
        primaryAction: "Share feedback",
        secondaryAction: "Okay"
    }
};
