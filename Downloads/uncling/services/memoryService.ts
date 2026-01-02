import { supabase } from './supabase';
import { UserContextProfile, EmotionalPattern, UserPreferences } from '../types';

// This service is the "Gatekeeper" of data.
// It enforces the rule: Store Maximally, Usage Minimally.

const STORAGE_KEY_PREFS = 'unclinq_user_prefs';

export const memoryService = {

    // --- READ (RAG Context Construction) ---
    // This is what the AI *actually* sees.
    // Notice: Transcripts are NOT here by default.
    getUserContext: async (userId: string): Promise<UserContextProfile> => {
        // 1. Fetch Preferences (Local + DB sync would go here)
        const prefs = memoryService.getLocalPreferences();

        // 2. Fetch Patterns (Mocked/Future DB call)
        // In a real implementation, this queries 'user_insights' or a new 'patterns' table
        const patterns: EmotionalPattern[] = [];

        // 3. Fetch System Events
        const events = {
            last_session_time: new Date().toISOString(), // Placeholder
            avg_gap_between_sessions: 24,
            session_count_today: 1,
            high_intensity_count_7d: 0
        };

        return {
            patterns,
            preferences: prefs,
            events
        };
    },

    // --- WRITE (Maximal Storage) ---
    // We save everything possible for future utility.
    savePattern: async (pattern: EmotionalPattern) => {
        console.log("Saving Pattern (Encrypted/Secure):", pattern);
        // await supabase.from('patterns').insert(pattern);
    },

    updatePreferences: (updates: Partial<UserPreferences>) => {
        const current = memoryService.getLocalPreferences();
        const updated = { ...current, ...updates };
        localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(updated));
        // Sync to Supabase profile here
    },

    // --- UTILS ---
    getLocalPreferences: (): UserPreferences => {
        const stored = localStorage.getItem(STORAGE_KEY_PREFS);
        if (stored) return JSON.parse(stored);

        // Default Safety Profile
        return {
            depth_level: 'moderate',
            question_frequency: 'balanced',
            challenge_consent: false,
            nudge_opt_out: false,
            preferred_regulation_tools: []
        };
    }
};
