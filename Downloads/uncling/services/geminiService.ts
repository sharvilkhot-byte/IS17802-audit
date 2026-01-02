
import { supabase } from './supabase';
import { AttachmentStyle } from "../types";



/**
 * Secure Chat (AI)
 * Calls 'chat-secure' Edge Function.
 * Note: Currently non-streaming (Unary).
 */
export const sendSecureChatMessage = async (
    userId: string,
    sessionId: string,
    message: string
): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('chat-secure', {
            body: { user_id: userId, session_id: sessionId, message }
        });

        if (error) throw error;
        return data.reply;
    } catch (error) {
        console.error("Secure Chat Error:", error);
        return "I am listening, but I'm having trouble connecting right now.";
    }
};

/**
 * Safe Space (Rescue)
 * Calls 'safe-space' Edge Function.
 */
export const enterSafeSpace = async (
    userId: string,
    intensity: number,
    note?: string
): Promise<string> => {
    try {
        const { data, error } = await supabase.functions.invoke('safe-space', {
            body: { user_id: userId, intensity, note }
        });

        if (error) throw error;
        return data.message;
    } catch (error) {
        console.error("Safe Space Error:", error);
        return "Breathe. I am here with you.";
    }
};

/**
 * Onboarding Analysis
 * Calls 'onboarding-analyze' Edge Function.
 */
export const analyzeOnboarding = async (
    userId: string,
    scores: { anxiety: number, avoidance: number }
): Promise<{ attachment: string }> => {
    try {
        const { data, error } = await supabase.functions.invoke('onboarding-analyze', {
            body: { user_id: userId, scores }
        });

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("Onboarding Analysis Error:", error);
        throw error;
    }
};
