import { supabase } from './supabase';

const FUNCTION_URL_BASE = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/functions/v1` : 'http://localhost:54321/functions/v1';

export const analyzeOnboarding = async (userId: string, data: any) => {
    const { data: result, error } = await supabase.functions.invoke('onboarding-analyze', {
        body: { user_id: userId, scores: data }
    });

    if (error) throw error;
    return result;
};

export const sendSecureChatMessage = async (userId: string, sessionId: string, message: string) => {
    const { data: result, error } = await supabase.functions.invoke('chat-secure', {
        body: { user_id: userId, session_id: sessionId, message }
    });

    if (error) throw error;
    return result.reply;
};

export const getTriggerSupport = async (trigger: any, attachmentStyle: string) => {
    const { data, error } = await supabase.functions.invoke('trigger-support', {
        body: { trigger, attachment_style: attachmentStyle }
    });

    if (error) {
        console.error("Trigger support error:", error);
        return null;
    }
    return data;
};


