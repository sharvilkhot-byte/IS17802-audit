
export type AttachmentStyle = 'secure' | 'anxious' | 'avoidant' | 'fearful';

export const calculateAttachmentStyle = (answers: Record<string, any>): AttachmentStyle => {
    let anxiousScore = 0;
    let avoidantScore = 0;
    let secureScore = 0;

    // Iterate through all answer values
    Object.values(answers).forEach(value => {
        if (typeof value === 'string') {
            if (value.includes('anxious')) anxiousScore++;
            if (value.includes('avoidant') || value.includes('dismissive')) avoidantScore++;
            if (value.includes('secure') || value.includes('steady')) secureScore++;
            if (value.includes('fearful') || value.includes('disorganized')) {
                // Fearful is high anxiety + high avoidance
                anxiousScore += 1;
                avoidantScore += 1;
            }
        }
    });

    // Simple dominance logic
    if (secureScore > anxiousScore && secureScore > avoidantScore) return 'secure';

    // If Anxiety and Avoidance are both high and close, it's Fearful/Disorganized
    if (anxiousScore >= 3 && avoidantScore >= 3 && Math.abs(anxiousScore - avoidantScore) <= 1) {
        return 'fearful';
    }

    if (anxiousScore > avoidantScore) return 'anxious';
    if (avoidantScore > anxiousScore) return 'avoidant';

    // Fallback/Tie-breaker (err on the side of the more "active" disturbance usually, or secure if low)
    return anxiousScore > 0 ? 'anxious' : 'secure';
};
