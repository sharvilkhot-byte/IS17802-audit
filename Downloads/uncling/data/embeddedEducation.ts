
export interface EducationContent {
    id: string;
    mini: string;
    deepDive?: string;
    context: 'pattern' | 'recovery' | 'trigger' | 'general';
}

export const embeddedEducation: Record<string, EducationContent> = {
    'pattern_fluctuation': {
        id: 'pattern_fluctuation',
        context: 'pattern',
        mini: "It's normal for emotions to move in waves. Fluctuation means your system is responding, not stuck.",
        deepDive: "Your nervous system is designed to be dynamic. Stiff lines would mean suppression or numbness. Seeing these waves shows that you are moving through states, which is the definition of resilience."
    },
    'recovery_speed': {
        id: 'recovery_speed',
        context: 'recovery',
        mini: "You’re bouncing back faster. This is a sign of improved 'vagal tone'.",
        deepDive: "Vagal tone measures how quickly your parasympathetic nervous system (the 'brake') kicks in after stress. A shorter recovery time means your body is learning that it's safe to let go of tension."
    },
    'trigger_awareness': {
        id: 'trigger_awareness',
        context: 'trigger',
        mini: "Noticing a trigger is 50% of the work. It moves the reaction from 'instinct' to 'choice'.",
        deepDive: "When you name a trigger (like 'uncertainty' or 'criticism'), you engage your prefrontal cortex. This dampens the amygdala's alarm bell, making the emotional wave feel less overwhelming over time."
    },
    'grounding_effect': {
        id: 'grounding_effect',
        context: 'general',
        mini: "Grounding works best when you don't 'need' it to work perfectly.",
        deepDive: "The goal of grounding isn't to force calm, but to reconnect with the physical present. Even if your mind is still racing, feeling your feet on the floor sends a subtle safety signal that builds up over minutes."
    },
    'connection_seeking': {
        id: 'connection_seeking',
        context: 'pattern',
        mini: "Seeking connection when anxious is a healthy mammalian instinct, not 'neediness'.",
        deepDive: "We are wired to co-regulate. Reaching out is a biological strategy to borrow safety from another nervous system. The key is noticing if you can also find a baseline of safety within yourself."
    }
};
