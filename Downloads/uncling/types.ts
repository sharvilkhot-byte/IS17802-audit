

export enum AttachmentStyle {
    Anxious = 'Anxious',
    Avoidant = 'Avoidant',
    Secure = 'Secure',
    Fearful = 'Fearful',
    Unknown = 'Unknown'
}

export enum QuestionAxis {
    Anxiety = 'Anxiety',
    Avoidance = 'Avoidance',
    Trait = 'Trait'
}

export type ChatMode = 'standard' | 'deep' | 'rescue' | 'review';

export enum RelationshipStatus {
    Single = 'Single',
    Dating = 'Dating',
    Partnered = 'Partnered',
    Complicated = 'Complicated'
}

export interface User {
    id: string;
    email: string;
    preferred_name: string | null;
    attachment_style: AttachmentStyle | null;
    relationship_status?: RelationshipStatus;
    anxiety_score?: number;
    avoidance_score?: number;
    created_at: string;
    daily_streak_count: number;
    last_check_in_date: string | null;
}

export interface ChatSession {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    summary?: string | null;
}

export interface ChatMessage {
    id: string;
    user_id: string;
    session_id: string;
    message: string;
    reply: string;
    created_at: string;
}

export interface CheckIn {
    id: string;
    user_id: string;
    mood: number; // 1-5 scale
    prompt?: string;
    note?: string;
    ai_feedback: string;
    created_at: string;
}

export interface RescueSession {
    id: string;
    user_id: string;
    note: string;
    ai_reply: string;
    created_at: string;
}

export interface OnboardingQuestion {
    id: number;
    question: string;
    axis: QuestionAxis;
}

export interface InsightTheme {
    theme: string;
    explanation: string;
    evidence: string[];
}

export interface InsightTrigger {
    trigger: string;
    reaction: string;
    explanation: string;
    evidence: string[];
}

export interface CombinedAnalysis {
    moodAnalysis: string;
    themes: InsightTheme[];
    triggers: InsightTrigger[];
}

export interface UserInsight {
    insights_json: CombinedAnalysis;
    last_analyzed_at: string;
}

// --- MAXIMAL STORAGE TYPES (Phase 13) ---

export interface EmotionalPattern {
    id: string; // "fear_of_conflict", "shutdown_response"
    category: 'trigger' | 'regulation' | 'avoidance' | 'attachment';
    confidence: number; // 0.0 to 1.0 (AI confidence)
    frequency: 'rare' | 'occasional' | 'frequent' | 'chronic';
    first_detected: string; // ISO Date
    last_detected: string; // ISO Date
    triggers: string[]; // ["criticism", "silence"]
    typical_reaction: string; // "withdraws", "apologizes"
}

export interface UserPreferences {
    depth_level: 'surface' | 'moderate' | 'deep'; // "Just listen" vs "Help me dig"
    question_frequency: 'minimal' | 'balanced' | 'active';
    challenge_consent: boolean; // Has agreed to gentle pushes
    nudge_opt_out: boolean;
    preferred_regulation_tools: string[]; // ["breathing", "journaling"]
}

export interface SystemEvents {
    last_session_time: string;
    avg_gap_between_sessions: number; // Hours
    session_count_today: number;
    high_intensity_count_7d: number; // Safety metric
}

// Data accumulator for the "Memory Context"
export interface UserContextProfile {
    patterns: EmotionalPattern[];
    preferences: UserPreferences;
    events: SystemEvents;
}

export interface ReflectionState {
    emotionalPatterns: string[];
    firstImpulse: string;
    closenessSignal: string;
    distanceInterpretation: string;
    needsExpression: string;
    intensity: string;
    timingContext: string;
    regulationDirection: string;
    copingTools: string[];
    worseningFactors: string[];
    aftermathPattern: string;
}

export interface ResultContent {
    patterns: string[];
    dailyLife: string[];
    supportMechanisms: string[];
    stuckPoints: string[];
    educationSnippet: string;
}
