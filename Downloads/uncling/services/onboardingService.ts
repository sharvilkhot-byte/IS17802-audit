import { supabase } from './supabase';
import { analyzeOnboarding } from './geminiService';
import { ReflectionState, AttachmentStyle, ResultContent } from '../types';

/**
 * Maps the "Guided Reflection" qualitative answers to the 
 * classic Attachment Theory axes (Anxiety vs Avoidance).
 */
export const calculateStyleFromReflection = (data: ReflectionState): {
    style: AttachmentStyle;
    anxietyScore: number;
    avoidanceScore: number;
} => {
    let anxiety = 10; // Baseline
    let avoidance = 10; // Baseline

    // --- Pass 1: Emotional Context ---
    // "My mind starts replaying things over and over" -> Anxiety
    if (data.emotionalPatterns.some(p => p.includes("replaying"))) anxiety += 4;
    // "I want reassurance or clarity" -> Anxiety
    if (data.emotionalPatterns.some(p => p.includes("reassurance"))) anxiety += 4;
    // "I go quiet or pull back" -> Avoidance
    if (data.emotionalPatterns.some(p => p.includes("pull back"))) avoidance += 4;
    // "I distract myself" -> Avoidance
    if (data.emotionalPatterns.some(p => p.includes("distract"))) avoidance += 3;

    // --- Pass 2: Response ---
    // "Try to fix or resolve it immediately" -> Anxiety (Protest behavior)
    if (data.firstImpulse.includes("fix or resolve")) anxiety += 5;
    // "Reach out or seek reassurance" -> Anxiety
    if (data.firstImpulse.includes("Reach out")) anxiety += 4;
    // "Pull back" -> Avoidance
    if (data.firstImpulse.includes("Pull back")) avoidance += 5;
    // "Distract" -> Avoidance
    if (data.firstImpulse.includes("Distract")) avoidance += 4;
    // "Freeze" -> Fearful (Both)
    if (data.firstImpulse.includes("Freeze")) { anxiety += 3; avoidance += 3; }

    // --- Pass 3: Relational Meaning (Deepest Signals) ---
    // Closeness
    if (data.closenessSignal.includes("connected and grounded")) { anxiety -= 2; avoidance -= 2; }
    if (data.closenessSignal.includes("closer but also more alert")) anxiety += 3;
    if (data.closenessSignal.includes("worry about losing")) anxiety += 5;
    if (data.closenessSignal.includes("need space")) avoidance += 5;
    if (data.closenessSignal.includes("confusing or heavy")) { anxiety += 3; avoidance += 3; } // Fearful

    // Distance Interpretation
    if (data.distanceInterpretation.includes("Something might be wrong")) anxiety += 5;
    if (data.distanceInterpretation.includes("need space")) { anxiety -= 1; avoidance += 1; } // Secure/Avoidant lean
    if (data.distanceInterpretation.includes("should give space")) avoidance += 4;
    if (data.distanceInterpretation.includes("I did something wrong")) anxiety += 5;

    // Needs Expression
    if (data.needsExpression.includes("Ask directly")) { anxiety -= 2; avoidance -= 2; } // Secure
    if (data.needsExpression.includes("Hint")) anxiety += 3;
    if (data.needsExpression.includes("Hold it in")) { avoidance += 3; anxiety += 2; } // Fearful/Avoidant
    if (data.needsExpression.includes("Pull back")) avoidance += 4;

    const threshold = 22; // Calibration point
    const isHighAnxiety = anxiety >= threshold;
    const isHighAvoidance = avoidance >= threshold;

    let style = AttachmentStyle.Secure;
    if (isHighAnxiety && isHighAvoidance) {
        style = AttachmentStyle.Fearful;
    } else if (isHighAnxiety) {
        style = AttachmentStyle.Anxious;
    } else if (isHighAvoidance) {
        style = AttachmentStyle.Avoidant;
    }

    return {
        style,
        anxietyScore: anxiety,
        avoidanceScore: avoidance
    };
};

export const generateResultContent = (data: ReflectionState): ResultContent => {
    const content: ResultContent = {
        patterns: [],
        dailyLife: [],
        supportMechanisms: [],
        stuckPoints: [],
        educationSnippet: ""
    };

    // --- Screen 3: Patterns (Verbs) ---
    if (data.emotionalPatterns.includes("My mind starts replaying things over and over")) {
        content.patterns.push("Process emotions deeply through reflection");
    }
    if (data.firstImpulse.includes("fix or resolve")) {
        content.patterns.push("Move quickly to resolve uncertainty");
    }
    if (data.firstImpulse.includes("Pull back")) {
        content.patterns.push("Seek space to regulate internally");
    }
    if (data.closenessSignal.includes("worry about losing")) {
        content.patterns.push("Stay alert to shifts in connection");
    }
    if (data.needsExpression.includes("Hold it in")) {
        content.patterns.push("Carry emotional needs privately");
    }
    // Fallback if low matches
    if (content.patterns.length < 3) {
        content.patterns.push("Navigate emotions with high awareness");
        content.patterns.push("Adapt to the needs of the moment");
    }


    // --- Screen 5: Daily Life (Situations) ---
    if (data.timingContext.includes("After conflict or tension")) {
        content.dailyLife.push("Overthinking conversations after they end");
    }
    if (data.distanceInterpretation.includes("Something might be wrong")) {
        content.dailyLife.push("Feeling unsettled when communication slows down");
    }
    if (data.intensity === "Distracting — it’s hard to focus") {
        content.dailyLife.push("Finding it hard to focus when emotions run high");
    }
    if (data.regulationDirection === "Time and space to process alone") {
        content.dailyLife.push("Needing quiet transition time after social interaction");
    }
    // Fallback
    if (content.dailyLife.length < 2) {
        content.dailyLife.push("Noticing subtle changes in tone or mood");
    }


    // --- Screen 6: Support (What helps) ---
    if (data.regulationDirection.includes("Talking it through")) {
        content.supportMechanisms.push("Gentle reassurance before problem-solving");
    }
    if (data.regulationDirection.includes("Time and space")) {
        content.supportMechanisms.push("Time to process without immediate pressure");
    }
    if (data.copingTools.includes("Movement or physical grounding")) {
        content.supportMechanisms.push("Physical grounding when thoughts race");
    }
    if (data.needsExpression.includes("Ask directly")) {
        content.supportMechanisms.push("Clear, direct communication");
    } else {
        content.supportMechanisms.push("A safe space where you don't have to explain everything");
    }


    // --- Screen 7: Stuck Points (Gentle Mirror) ---
    if (data.aftermathPattern.includes("Replay and analyze")) {
        content.stuckPoints.push("Analyzing situations instead of resting emotionally");
    }
    if (data.firstImpulse.includes("fix or resolve") && data.worseningFactors.includes("Not knowing where I stand")) {
        content.stuckPoints.push("Seeking clarity urgently, then feeling exhausted");
    }
    if (data.firstImpulse.includes("Pull back")) {
        content.stuckPoints.push("Withdrawing to stay safe, but feeling lonely");
    }
    if (content.stuckPoints.length === 0) {
        content.stuckPoints.push("Feeling like you're carrying the emotional load alone");
    }

    // --- Screen 9: Education ---
    content.educationSnippet = "Emotional systems learn through experience. When connection feels important, the nervous system becomes alert. Awareness helps the system feel safer over time.";

    return content;
};

export const calculateAndSaveReflection = async (
    userId: string,
    data: ReflectionState,
    updateLocalUser: (updates: any) => void
) => {
    const { style, anxietyScore, avoidanceScore } = calculateStyleFromReflection(data);

    // 1. Call Brain to Analyze & Persist
    try {
        const result = await analyzeOnboarding(userId, {
            anxiety: anxietyScore,
            avoidance: avoidanceScore
        });

        // 2. Update local context
        updateLocalUser({
            attachment_style: result.attachment || style, // Use server result if present
            anxiety_score: anxietyScore,
            avoidance_score: avoidanceScore
        });

        return (result.attachment as AttachmentStyle) || style;
    } catch (e) {
        console.error("Brain analysis failed, falling back to local calculation for UI", e);
        // Fallback local update if server fails (optional, but good for UX)
        updateLocalUser({
            attachment_style: style,
            anxiety_score: anxietyScore,
            avoidance_score: avoidanceScore
        });
        return style;
    }
};
