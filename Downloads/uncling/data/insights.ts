
import { AttachmentStyle } from '../types';

export const DAILY_INSIGHTS: Record<string, string[]> = {
    [AttachmentStyle.Anxious]: [
        "Your needs are valid. You do not need to earn love by fixing everything.",
        "Pause. Take a deep breath. You are safe in this moment, even in the silence.",
        "Anxiety often tries to predict the future. Remind yourself: 'I can handle whatever happens.'",
        "It is okay to ask for reassurance, but try giving it to yourself first today.",
        "You are worthy of love simply because you exist, not because of what you do for others.",
        "Check in with your body. Are your shoulders tense? Let them drop.",
        "Consistency is safer than intensity. Look for the slow, steady signs of care.",
        "You are allowed to take up space in your relationships.",
        "Someone else's mood is not your responsibility to fix.",
        "Trust yourself. You have survived 100% of your bad days."
    ],
    [AttachmentStyle.Avoidant]: [
        "Independence is a strength, but connection is a biological need. You can have both.",
        "Feelings are just data. They are not a threat to your freedom.",
        "It is okay to take space, but try to communicate it first: 'I need a moment' goes a long way.",
        "Vulnerability is not weakness; it is the courage to be seen.",
        "Notice if you are intellectualizing a feeling. Can you just feel it for 10 seconds?",
        "You don't have to carry everything alone. Sharing a burden often makes it lighter.",
        "Intimacy does not mean losing yourself. It means sharing yourself.",
        "It is safe to let people in, little by little.",
        "Needs are not 'needy'. They are human.",
        "Conflict can be a bridge to closeness, not just a threat to peace."
    ],
    [AttachmentStyle.Fearful]: [
        "You are safe. This moment is different from the past.",
        "Trust is built in small moments. You don't have to decide everything right now.",
        "When you feel the urge to push away or pull close, try to just pause.",
        "Your feelings are valid, but they are not always facts. Check the evidence.",
        "It is okay to set a boundary. It is also okay to let someone in. Trust your pace.",
        "You are capable of stability. You are building it right now.",
        "Be gentle with yourself. You are unlearning years of survival patterns.",
        "You don't have to be perfect to be loved.",
        "Healing is not a straight line. Be patient with the zigzag.",
        "Your intuition is a guide, but fear is a loud distraction. Learn the difference."
    ],
    [AttachmentStyle.Secure]: [
        "Your stability is a gift to those around you.",
        "Deepen your self-awareness today. What is a nuance of your feelings you haven't explored?",
        "Conflict is an opportunity for repair and deeper understanding.",
        "How can you extend your sense of safety to someone else today?",
        "Check in on your boundaries. Are they flexible where they need to be?",
        "Celebrate the healthy connections in your life today.",
        "Growth happens when we step slightly outside of our comfort zone.",
        "Your ability to regulate your emotions is a superpower.",
        "Relationships thrive on repair, not just harmony.",
        "Listen to understand, not just to respond."
    ],
    [AttachmentStyle.Unknown]: [
        "Self-awareness is the first step to change.",
        "Be kind to your mind today.",
        "Every small step forward is a victory.",
        "You are capable of amazing growth.",
        "Take a moment to just breathe and be.",
        "Your feelings matter.",
        "Today is a fresh start."
    ]
};

// Gets a consistent insight for the day (based on date)
export const getDailyInsight = (style: AttachmentStyle | null): string => {
    const key = style || AttachmentStyle.Unknown;
    const insights = DAILY_INSIGHTS[key] || DAILY_INSIGHTS[AttachmentStyle.Unknown];
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
    return insights[dayOfYear % insights.length];
};

// Gets a random insight (for refresh button)
export const getRandomInsight = (style: AttachmentStyle | null): string => {
    const key = style || AttachmentStyle.Unknown;
    const insights = DAILY_INSIGHTS[key] || DAILY_INSIGHTS[AttachmentStyle.Unknown];
    const randomIndex = Math.floor(Math.random() * insights.length);
    return insights[randomIndex];
};
