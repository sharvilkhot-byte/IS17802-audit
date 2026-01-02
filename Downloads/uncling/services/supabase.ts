
import { createClient } from '@supabase/supabase-js';
import { AttachmentStyle, QuestionAxis } from '../types';
import { ONBOARDING_QUESTIONS } from '../constants';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase URL and Anon Key are required. Please check your .env file.');
}

// --- REAL SUPABASE CLIENT ---
export const supabase = createClient(supabaseUrl, supabaseAnonKey);


// Util function for onboarding - this is a pure function and remains unchanged.
export const calculateAttachmentStyle = (ratings: number[]): {
    style: AttachmentStyle,
    anxietyScore: number,
    avoidanceScore: number,
    traitScores: { [key: string]: number }
} => {
    let anxietyScore = 0;
    let avoidanceScore = 0;
    const traitScores: { [key: string]: number } = {
        'Conflict-Avoidance': 0,
        'People-Pleasing': 0,
        'Emotional Dysregulation': 0
    };

    ONBOARDING_QUESTIONS.forEach((q, index) => {
        const rating = ratings[index] || 0; // Default to 0 if undefined
        if (q.axis === QuestionAxis.Anxiety) {
            anxietyScore += rating;
        } else if (q.axis === QuestionAxis.Avoidance) {
            avoidanceScore += rating;
        } else if (q.axis === QuestionAxis.Trait) {
            if (q.id === 13) traitScores['Conflict-Avoidance'] = rating;
            if (q.id === 14) traitScores['People-Pleasing'] = rating;
            if (q.id === 15) traitScores['Emotional Dysregulation'] = rating;
        }
    });

    // Each axis has 6 questions rated 1-5. Score range: 6-30. Midpoint: 18.
    const anxietyThreshold = 18;
    const avoidanceThreshold = 18;

    const isHighAnxiety = anxietyScore >= anxietyThreshold;
    const isHighAvoidance = avoidanceScore >= avoidanceThreshold;

    let style: AttachmentStyle;
    if (isHighAnxiety && isHighAvoidance) {
        style = AttachmentStyle.Fearful;
    } else if (isHighAnxiety && !isHighAvoidance) {
        style = AttachmentStyle.Anxious;
    } else if (!isHighAnxiety && isHighAvoidance) {
        style = AttachmentStyle.Avoidant;
    } else {
        style = AttachmentStyle.Secure;
    }

    return { style, anxietyScore, avoidanceScore, traitScores };
};

export const savePushSubscription = async (userId: string, subscription: PushSubscriptionJSON): Promise<{ error: any }> => {
    if (!userId || !subscription) {
        return { error: 'User ID and subscription are required.' };
    }

    const { error } = await supabase.from('push_subscriptions').upsert(
        {
            user_id: userId,
            subscription_details: subscription,
            endpoint: subscription.endpoint,
        },
        { onConflict: 'endpoint' } // Use endpoint as the unique identifier to prevent duplicates
    );

    return { error };
};
