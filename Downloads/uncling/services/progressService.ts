export type ProgressStep =
    | 'entry'
    | 'emotional_pattern_graph'
    | 'trigger_map'
    | 'recovery_speed_insight'
    | 'regulation_method_effectiveness'
    | 'relational_themes'
    | 'pattern_spotlight'
    | 'small_insight'
    | 'biology_card'
    | 'coping_strategy'
    | 'weekly_overview'
    | 'trigger_intensity_timeline'
    | 'recovery_timeline'
    | 'technique_effectiveness_chart'
    | 'relational_theme_shifts'
    | 'deep_dive_optional'
    | 'encouragement'
    | 'plateau'
    | 'overwhelm'
    | 'exit';

export interface ProgressContent {
    step: ProgressStep;
    headline: string;
    body: string; // Can be a string or a list? Keeping string for simplicity, or we can add optional array.
    primaryAction: string;
    secondaryAction: string;
    microCopy?: string;
    // For specific steps we might need list data (e.g. methods list)
    listItems?: string[];
}

export const PROGRESS_CONTENT: Record<ProgressStep, ProgressContent> = {
    entry: {
        step: 'entry',
        headline: "Let’s look at your patterns over time.",
        body: "This isn’t about streaks or achievements. Just a gentle overview of what your nervous system has been doing.",
        primaryAction: "View overview",
        secondaryAction: "Exit",
        microCopy: "Take as much or as little time as you want."
    },
    emotional_pattern_graph: {
        step: 'emotional_pattern_graph',
        headline: "Emotional trends this month",
        body: "Notice the peaks and valleys. These are signals, not failures.",
        primaryAction: "Explore triggers",
        secondaryAction: "Return",
        microCopy: "Hover or tap to see details."
    },
    trigger_map: {
        step: 'trigger_map',
        headline: "What often sparks these reactions",
        body: "Gentle patterns emerge. Some triggers repeat. This helps you understand yourself, not judge.",
        primaryAction: "View examples",
        secondaryAction: "Return",
        microCopy: "Seeing patterns is curiosity, not criticism."
    },
    recovery_speed_insight: {
        step: 'recovery_speed_insight',
        headline: "Recovery is getting smoother",
        body: "Notice how long it takes you to return to calm. Small improvements are real progress.",
        primaryAction: "See detailed chart",
        secondaryAction: "Skip"
    },
    regulation_method_effectiveness: {
        step: 'regulation_method_effectiveness',
        headline: "What helps you settle",
        body: "These methods tend to reduce intensity faster:",
        listItems: ["Safe Space / breathing", "Reflection in chat", "Pausing and noticing"],
        primaryAction: "Explore methods",
        secondaryAction: "Close"
    },
    relational_themes: {
        step: 'relational_themes',
        headline: "Patterns in relationships",
        body: "Certain themes appear repeatedly. Noticing them helps you understand your responses.",
        primaryAction: "Learn more",
        secondaryAction: "Return",
        microCopy: "This is observation, not blame."
    },
    pattern_spotlight: {
        step: 'pattern_spotlight',
        headline: "You seem to notice [pattern] often.",
        body: "Many people with your style notice this. You can explore it or simply observe.",
        primaryAction: "Explore",
        secondaryAction: "Skip"
    },
    small_insight: {
        step: 'small_insight',
        headline: "What this pattern means",
        body: "This reaction is linked to your system’s way of staying safe. It’s natural and understandable.",
        primaryAction: "Expand",
        secondaryAction: "Close"
    },
    biology_card: {
        step: 'biology_card',
        headline: "Why this happens biologically",
        body: "Your nervous system reacts to perceived uncertainty in predictable ways. Awareness helps regulate it more efficiently.",
        primaryAction: "Expand",
        secondaryAction: "Collapse"
    },
    coping_strategy: {
        step: 'coping_strategy',
        headline: "What tends to help people like you",
        body: "Gentle regulation, noticing patterns, pausing, reflecting slowly.",
        primaryAction: "Save / Try",
        secondaryAction: "Close"
    },
    weekly_overview: {
        step: 'weekly_overview',
        headline: "Your week at a glance",
        body: "No pressure, no streaks. Just a visual summary of your emotional patterns.",
        primaryAction: "Explore daily entries",
        secondaryAction: "Return"
    },
    trigger_intensity_timeline: {
        step: 'trigger_intensity_timeline',
        headline: "How intense triggers have been",
        body: "Notice if intensity is reducing — a sign of progress.",
        primaryAction: "Explore more",
        secondaryAction: "Close"
    },
    recovery_timeline: {
        step: 'recovery_timeline',
        headline: "Recovery speed over time",
        body: "Faster recovery shows improved regulation. Celebrate small shifts — silently, if you like.",
        primaryAction: "View details",
        secondaryAction: "Return"
    },
    technique_effectiveness_chart: {
        step: 'technique_effectiveness_chart',
        headline: "What worked best for you",
        body: "Safe Space, brief grounding, and reflection often help most. Use what feels natural.",
        primaryAction: "Learn how to use methods",
        secondaryAction: "Skip"
    },
    relational_theme_shifts: {
        step: 'relational_theme_shifts',
        headline: "Notice how themes shift",
        body: "Over time, your reactions to similar situations may change. Observation matters more than perfection.",
        primaryAction: "Explore examples",
        secondaryAction: "Return"
    },
    deep_dive_optional: {
        step: 'deep_dive_optional',
        headline: "A deeper look (optional)",
        body: "Small insight: your system sometimes reacts to subtle uncertainty signals. Pausing before responding can help.",
        primaryAction: "Expand",
        secondaryAction: "Collapse"
    },
    encouragement: {
        step: 'encouragement',
        headline: "You’re noticing patterns",
        body: "Simply observing is meaningful. No streaks, no badges, no judgment.",
        primaryAction: "Continue exploring",
        secondaryAction: "Pause"
    },
    plateau: {
        step: 'plateau',
        headline: "Plateaus are normal",
        body: "Sometimes change slows. Observation alone still builds understanding.",
        primaryAction: "Explore patterns again",
        secondaryAction: "Pause"
    },
    overwhelm: {
        step: 'overwhelm',
        headline: "Too much at once?",
        body: "Focus on one card at a time. You don’t need to see everything today.",
        primaryAction: "View single card",
        secondaryAction: "Pause / exit"
    },
    exit: {
        step: 'exit',
        headline: "That’s a lot of insight for now",
        body: "You can return anytime to explore more. Reflection happens at your pace.",
        primaryAction: "Exit",
        secondaryAction: "Continue tomorrow", // Adapted for button, microcopy serves as "Continue tomorrow"
        microCopy: "Nothing is lost. You can continue tomorrow."
    }
};
