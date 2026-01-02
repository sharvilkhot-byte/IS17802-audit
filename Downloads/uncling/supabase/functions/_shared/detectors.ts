
export function detectActivation(text: string): {
    level: 0 | 1 | 2;
    confidence: number;
} {
    const lower = text.toLowerCase();

    if (lower.match(/panic|can't breathe|overwhelmed|spiral/)) {
        return { level: 2, confidence: 0.8 };
    }

    if (lower.match(/anxious|stressed|uneasy|confused/)) {
        return { level: 1, confidence: 0.6 };
    }

    return { level: 0, confidence: 0.4 };
}
