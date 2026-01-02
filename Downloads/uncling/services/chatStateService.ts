import { ChatMode } from '../types';

export type ChatInternalState =
    | 'idle'
    | 'first_message'
    | 'active'
    | 'silence_holding'
    | 'pattern_reflection'
    | 'grounding'
    | 'closing';

interface ChatStateContent {
    headline: string;
    body: string;
    primaryAction: string;
    secondaryAction: string;
    microCopy: string;
}

export const getChatStateContent = (state: ChatInternalState, _mode: ChatMode): ChatStateContent => {
    switch (state) {
        case 'idle':
            return {
                headline: "I’m here when you’re ready.",
                body: "Take your time. You can type something, or just sit quietly.",
                primaryAction: "Start typing",
                secondaryAction: "Rescue Now",
                microCopy: "No need to rush."
            };
        case 'first_message':
            return {
                headline: "Good to see you again.",
                body: "Nothing to fix — only notice what’s on your mind.",
                primaryAction: "Begin conversation",
                secondaryAction: "Skip for now",
                microCopy: "We can start slow."
            };
        case 'silence_holding':
            return {
                headline: "Silence is okay.",
                body: "Take the time you need to think or feel. I’ll be here when you’re ready.",
                primaryAction: "Resume typing",
                secondaryAction: "Pause / exit",
                microCopy: "No pressure."
            };
        case 'closing':
            return {
                headline: "That’s enough for now.",
                body: "You did thoughtful work today. We can pause here and continue later if you want.",
                primaryAction: "Exit",
                secondaryAction: "Optional quick note",
                microCopy: "No expectation."
            };
        case 'grounding':
            return {
                headline: "Let’s pause for a breath.",
                body: "You don’t need to solve anything right now. Just notice your body.",
                primaryAction: "Guided breath",
                secondaryAction: "Skip",
                microCopy: "Even a short pause helps."
            };
        default:
            return {
                headline: "",
                body: "",
                primaryAction: "",
                secondaryAction: "",
                microCopy: ""
            };
    }
};

export const checkSilenceThreshold = (lastActivityTimestamp: number): boolean => {
    const NOW = Date.now();
    // 30 seconds of silence triggers the state
    return (NOW - lastActivityTimestamp) > 30000;
};

export const isFirstMessageOfDay = (lastChatDate?: string): boolean => {
    if (!lastChatDate) return true;
    const last = new Date(lastChatDate);
    const today = new Date();
    return last.getDate() !== today.getDate() || last.getMonth() !== today.getMonth() || last.getFullYear() !== today.getFullYear();
};
