
export type StepType =
    | 'TextOnly'
    | 'Card'
    | 'Question'
    | 'Transition'
    | 'Input'
    | 'SelectionList'
    | 'SeedQuestion';

export interface FlowStep {
    id: string;
    type: StepType;

    // Content
    heading?: string;
    subheading?: string;
    body?: string;
    context?: string; // Small uppercase label above heading
    footer?: string; // Small italic text below options

    // Logic
    duration?: number; // For auto-advance
    autoAdvance?: boolean;

    // Question/Input specific
    options?: { label: string; value: any }[];
    variableName?: string; // Key to store result in

    // CTA
    cta?: string;
    secondaryCta?: string;
}

export interface FlowState {
    stepId: string;
    data: Record<string, any>;
    history: string[]; // For back navigation
}
