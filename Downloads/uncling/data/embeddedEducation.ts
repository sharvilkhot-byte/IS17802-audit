import { EducationContent } from '../services/educationService';

export const embeddedEducation: Record<string, EducationContent> = {
    'pattern_fluctuation': {
        id: 'education_insight', // Mapping to generic type for now, or need to extend types
        type: 'insight',
        headline: "It's normal for emotions to move in waves.",
        body: "Fluctuation means your system is responding, not stuck. Stiff lines would mean suppression. Seeing these waves shows that you are moving through states.",
        primaryAction: "Learn more"
    },
    'recovery_speed': {
        id: 'biology_why',
        type: 'insight',
        headline: "You’re bouncing back faster.",
        body: "This is a sign of improved 'vagal tone'—how quickly your parasympathetic nervous system (the 'brake') kicks in after stress.",
        primaryAction: "Deep Dive"
    },
    'trigger_awareness': {
        id: 'what_helps',
        type: 'insight',
        headline: "Noticing a trigger is 50% of the work.",
        body: "When you name a trigger, you engage your prefrontal cortex. This dampens the amygdala's alarm bell, moving reaction from 'instinct' to 'choice'.",
        primaryAction: "Practice Naming"
    },
    'grounding_effect': {
        id: 'education_insight',
        type: 'insight',
        headline: "Grounding works best when you don't 'need' it to.",
        body: "The goal isn't to force calm, but to reconnect with the physical present. Feeling your feet sends a safety signal that builds up over minutes.",
        primaryAction: "Try it"
    },
    'connection_seeking': {
        id: 'education_insight',
        type: 'insight',
        headline: "Seeking connection is a healthy instinct.",
        body: "Reaching out is a biological strategy to borrow safety (co-regulation). It is not 'neediness'.",
        primaryAction: "Read more"
    }
};
