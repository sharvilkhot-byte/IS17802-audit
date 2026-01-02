import { User } from '../types';

export enum HubState {
    Neutral = 'Neutral',
    Activated = 'Activated', // High anxiety / recent trigger
    PostRescue = 'PostRescue', // Immediately after rescue
    PostDeepChat = 'PostDeepChat', // Immediately after a long session
    Returning = 'Returning', // Returning after > 3 days
    Avoidant = 'Avoidant', // Low engagement pattern detected
    Shutdown = 'Shutdown', // Very short/no engagement detected
    Skeptical = 'Skeptical', // User expressed doubt/resistance
}

export const determineHubState = (user: User | null, recentRescue?: boolean, recentDeepChat?: boolean): HubState => {
    if (!user) return HubState.Neutral;

    // 1. Immediate Context (Navigation State)
    if (recentRescue) return HubState.PostRescue;
    if (recentDeepChat) return HubState.PostDeepChat;

    // 2. Temporal Context
    if (user.last_check_in_date) {
        const lastDate = new Date(user.last_check_in_date);
        const diffTime = Math.abs(new Date().getTime() - lastDate.getTime());
        const diffDays = diffTime / (1000 * 60 * 60 * 24);
        if (diffDays > 3) return HubState.Returning;
    }

    // 3. Pattern / Emotional Context
    const anxiety = user.anxiety_score || 0;
    const avoidance = user.avoidance_score || 0;

    // Mock logic for specific states (would be fueled by more robust tracking in production)
    if (avoidance >= 25) return HubState.Shutdown;
    if (avoidance >= 20) return HubState.Avoidant;
    if (anxiety >= 20) return HubState.Activated;

    // Skeptical state is usually set via a specific user action/flag (mocking here if needed or default to Neutral)

    return HubState.Neutral;
};
