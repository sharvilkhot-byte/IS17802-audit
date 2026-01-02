export type IntegrationStep =
    | 'reflection_prompt_chat'
    | 'quick_note_prompt'
    | 'revisit_patterns'
    | 'weekly_summary_highlight'
    | 'daily_mood_micro_entry'
    | 'education_why_matters'
    | 'deep_dive_relational'
    | 'suggested_reflection'
    | 'feedback_prompt'
    | 'hub_return_nudge';

export interface IntegrationContent {
    id: IntegrationStep;
    headline: string;
    body: string;
    primaryAction?: string;
    secondaryAction?: string;
    microCopy?: string;
}

export const INTEGRATION_CONTENT: Record<IntegrationStep, IntegrationContent> = {
    reflection_prompt_chat: {
        id: 'reflection_prompt_chat',
        headline: "What did you notice?",
        body: "Take a moment to name one shift or feeling that stood out.",
        primaryAction: "Save a note",
        secondaryAction: "Skip",
        microCopy: "Even small noticings matter."
    },
    quick_note_prompt: {
        id: 'quick_note_prompt',
        headline: "Jot it down",
        body: "Capture this thought before the day pulls you back in.",
        primaryAction: "Save",
        secondaryAction: "Discard"
    },
    revisit_patterns: {
        id: 'revisit_patterns',
        headline: "See how this fits",
        body: "This session touched on a theme we've seen before. Would you like to see the pattern?",
        primaryAction: "View Pattern",
        secondaryAction: "Not now"
    },
    weekly_summary_highlight: {
        id: 'weekly_summary_highlight',
        headline: "Your week in review",
        body: "You've been noticing a lot about your need for space this week. It's a valid need.",
        primaryAction: "See full summary",
        secondaryAction: "Dismiss"
    },
    daily_mood_micro_entry: {
        id: 'daily_mood_micro_entry',
        headline: "How is your system right now?",
        body: "Just a quick pulse check. No wrong answers.",
        primaryAction: "Check in",
        secondaryAction: "Skip"
    },
    education_why_matters: {
        id: 'education_why_matters',
        headline: "Why this matters biologically",
        body: "Naming the feeling calms the amygdala. You just did that.",
        primaryAction: "Learn more",
        secondaryAction: "Close"
    },
    deep_dive_relational: {
        id: 'deep_dive_relational',
        headline: "Relational Theme: Distance",
        body: "You often pull back when feeling overwhelmed. This is a safety strategy.",
        primaryAction: "Explore theme",
        secondaryAction: "Close"
    },
    suggested_reflection: {
        id: 'suggested_reflection',
        headline: "A question for later",
        body: "If I didn't need to be productive right now, what would my body ask for?",
        primaryAction: "Reflect now",
        secondaryAction: "Save for later"
    },
    feedback_prompt: {
        id: 'feedback_prompt',
        headline: "Is this helpful?",
        body: "We are learning with you. Let us know if this felt right.",
        primaryAction: "Yes",
        secondaryAction: "No"
    },
    hub_return_nudge: {
        id: 'hub_return_nudge',
        headline: "Return if you want to explore further",
        body: "We'll be here.",
        primaryAction: "Go to Hub",
        secondaryAction: "Dismiss"
    }
};
