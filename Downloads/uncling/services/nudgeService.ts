
interface NudgeState {
    lastShownAt: string | null;
    dismissedCount: number;
    optedOut: boolean;
}

const STORAGE_KEY = 'unclinq_nudge_state';
const COOLDOWN_HOURS = 72; // 3 days (approx 2x per week max)

export const nudgeService = {
    getState: (): NudgeState => {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) return JSON.parse(stored);
        return { lastShownAt: null, dismissedCount: 0, optedOut: false };
    },

    saveState: (state: NudgeState) => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    },

    canShowNudge: (): boolean => {
        const state = nudgeService.getState();
        if (state.optedOut) return false;

        if (!state.lastShownAt) return true; // Never shown before

        const last = new Date(state.lastShownAt).getTime();
        const now = Date.now();
        const hoursDiff = (now - last) / (1000 * 60 * 60);

        return hoursDiff >= COOLDOWN_HOURS;
    },

    markShown: () => {
        const state = nudgeService.getState();
        state.lastShownAt = new Date().toISOString();
        nudgeService.saveState(state);
    },

    markDismissed: () => {
        const state = nudgeService.getState();
        state.dismissedCount += 1;
        // Logic: If dismissed 5 times in a row, maybe auto-opt-out or increase cooldown nicely
        nudgeService.saveState(state);
    },

    getAppOpenNudge: (): { message: string, type: 'observation' | 'pattern' } | null => {
        if (!nudgeService.canShowNudge()) return null;

        // Basic randomization for now, ideally strictly context-based
        const messages = [
            "I noticed you reflect often on Monday mornings.",
            "Your recovery speed seems to be improving lately.",
            "Remember, patterns are just habits asking to be seen."
        ];

        const randomMsg = messages[Math.floor(Math.random() * messages.length)];

        return {
            message: randomMsg,
            type: 'observation'
        };
    }
};
