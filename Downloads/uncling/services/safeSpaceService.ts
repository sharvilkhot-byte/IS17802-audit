export type SafeSpaceStep =
    | 'entry'
    | 'intensity'
    | 'breathing'
    | 'grounding'
    | 'body'
    | 'validation'
    | 'loop'
    | 'still_activated'
    | 'exit';

export interface SafeSpaceContent {
    step: SafeSpaceStep;
    headline: string;
    body: string;
    primaryAction: string;
    secondaryAction: string;
    microCopy?: string;
}

export const SAFE_SPACE_CONTENT: Record<SafeSpaceStep, SafeSpaceContent> = {
    entry: {
        step: 'entry',
        headline: "I’m here with you.",
        body: "Let’s focus only on helping your system settle. Nothing else needs attention right now.",
        primaryAction: "Enter Safe Space",
        secondaryAction: "Exit",
        microCopy: "You can leave at any time."
    },
    intensity: {
        step: 'intensity',
        headline: "How intense is this moment?",
        body: "This helps me match the pace to you.",
        primaryAction: "Continue",
        secondaryAction: "Cancel"
    },
    breathing: {
        step: 'breathing',
        headline: "Let’s start with your breath.",
        body: "Breathe slowly in… and out. Notice the air entering and leaving your body.",
        primaryAction: "Follow guided breath",
        secondaryAction: "Skip to next grounding",
        microCopy: "Even a few breaths help."
    },
    grounding: {
        step: 'grounding',
        headline: "Let's anchor in the present.",
        body: "Look around. Find things you can see, touch, and hear. Connect to the physical world.",
        primaryAction: "Start 5-4-3-2-1",
        secondaryAction: "Skip to body check",
        microCopy: "Use your senses to find safety."
    },
    body: {
        step: 'body',
        headline: "Let’s check in with your body.",
        body: "Notice your feet on the floor, your back supported. Feel the points of contact. Relax where you can.",
        primaryAction: "Continue",
        secondaryAction: "Skip"
    },
    validation: {
        step: 'validation',
        headline: "What you’re feeling is valid.",
        body: "It’s okay to feel this way. Your nervous system is doing what it needs to.",
        primaryAction: "Continue",
        secondaryAction: "Pause"
    },
    loop: {
        step: 'loop',
        headline: "Let’s keep it simple.",
        body: "Breathe, notice your body, let tension soften. We don’t need to analyze or solve anything.",
        primaryAction: "Repeat loop",
        secondaryAction: "Move to exit",
        microCopy: "Even one cycle helps."
    },
    still_activated: {
        step: 'still_activated',
        headline: "You’re still feeling stirred.",
        body: "That’s okay. We can continue gently, at your pace.",
        primaryAction: "Continue Safe Space",
        secondaryAction: "Pause"
    },
    exit: {
        step: 'exit',
        headline: "You did well to pause and settle.",
        body: "There’s no right ending — just a moment of calm. You can return any time, or continue with reflection if ready.",
        primaryAction: "Exit",
        secondaryAction: "Reflect now", // Slightly adapted to fit secondary action pattern
        microCopy: "You can return whenever it feels right."
    }
};

export const getStepDuration = (intensity: 'mild' | 'moderate' | 'high'): number => {
    switch (intensity) {
        case 'mild': return 30; // seconds
        case 'moderate': return 60;
        case 'high': return 90;
        default: return 60;
    }
};
