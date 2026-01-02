export type EdgeStateType =
    | 'shutdown'
    | 'avoidance'
    | 'silence'
    | 'skepticism'
    | 'overuse'
    | 'plateau'
    | null;

export interface EdgeStateContent {
    title: string;
    body: string;
    options: { label: string; action: string }[];
}

const STORAGE_KEY_LAST_SEEN = 'unclinq_last_seen';
const STORAGE_KEY_SESSION_COUNT = 'unclinq_daily_sessions'; // storing { date: '2023-01-01', count: 5 }

export const edgeStateContent: Record<string, EdgeStateContent> = {
    avoidance: {
        title: "There's nothing to catch up on.",
        body: "You didn't fall behind. You're allowed to come back exactly as you are.",
        options: [
            { label: "Start fresh", action: "dismiss" },
            { label: "Just look around", action: "dismiss" },
            { label: "Leave again", action: "exit_app" }
        ]
    },
    overuse: {
        title: "I'm noticing you come here when things spike quickly.",
        body: "We can slow this down—not because it's wrong, but so your system learns it can settle on its own too.",
        options: [
            { label: "Ground without chat", action: "go_rescue" },
            { label: "Set a pause", action: "snooze" },
            { label: "Continue anyway", action: "dismiss" }
        ]
    },
    shutdown: {
        title: "Sometimes the system goes quiet to protect itself.",
        body: "You don't need to feel anything right now.",
        options: [
            { label: "Sit quietly", action: "dismiss" },
            { label: "Ground with body", action: "go_rescue" }
        ]
    },
    silence: {
        title: "You don't have to explain anything.",
        body: "We can just be quiet.",
        options: [
            { label: "Breathe (30s)", action: "go_rescue" },
            { label: "Exit", action: "exit_flow" }
        ]
    }
};

export const edgeStateService = {
    // --- Avoidance Logic ---
    updateLastSeen: () => {
        localStorage.setItem(STORAGE_KEY_LAST_SEEN, new Date().toISOString());
    },

    checkAvoidance: (): boolean => {
        const lastSeen = localStorage.getItem(STORAGE_KEY_LAST_SEEN);
        if (!lastSeen) {
            edgeStateService.updateLastSeen();
            return false; // First time user or cleared data
        }

        const diffTime = Math.abs(new Date().getTime() - new Date(lastSeen).getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Edge case: Update stored time immediately after check so we don't trigger it loop
        edgeStateService.updateLastSeen();

        return diffDays > 3;
    },

    // --- Overuse Logic ---
    incrementSessionCount: () => {
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(STORAGE_KEY_SESSION_COUNT);
        let data = { date: today, count: 0 };

        if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed.date === today) {
                data = parsed;
            }
        }

        data.count += 1;
        localStorage.setItem(STORAGE_KEY_SESSION_COUNT, JSON.stringify(data));
        return data.count;
    },

    checkOveruse: (): boolean => {
        const today = new Date().toISOString().split('T')[0];
        const stored = localStorage.getItem(STORAGE_KEY_SESSION_COUNT);
        if (!stored) return false;

        const parsed = JSON.parse(stored);
        if (parsed.date !== today) return false;

        return parsed.count > 5; // e.g., >5 meaningful sessions in a day
    },

    // --- Shutdown/Chat Logic ---
    detectShutdownPattern: (recentUserMessageLengths: number[]): boolean => {
        // Simple heuristic: 3 consecutive messages under 15 chars
        if (recentUserMessageLengths.length < 3) return false;
        const last3 = recentUserMessageLengths.slice(-3);
        return last3.every(len => len < 15);
    }
};
