import { AttachmentStyle } from '../types';

export interface StyleTheme {
    id: AttachmentStyle;
    colors: {
        background: string; // The main ambient background
        primary: string; // Buttons, highlights
        accent: string; // Secondary elements
        text: string;
        textSecondary: string;
        cardBg: string; // Glassmorphism backdrop
        gradient: string; // The "living" background
    };
    copy: {
        greeting: (name: string) => string;
        checkInPrompt: string;
        rescueLabel: string;
        chatPlaceholder: string;
        emptyState: string;
    };
    vibe: {
        animationSpeed: string; // 'slow' | 'normal' | 'still'
        borderRadius: string; // 'rounded-3xl' (Soft) vs 'rounded-xl' (Structured)
        density: string; // 'compact' (Cozy) vs 'spacious' (Airy)
    };
}

export const ATTACHMENT_THEMES: Record<AttachmentStyle, StyleTheme> = {
    [AttachmentStyle.Anxious]: { // "The Guardian" - Needs Warmth & Connection
        id: AttachmentStyle.Anxious,
        colors: {
            background: 'bg-tense', // Anxious -> Tense
            primary: 'bg-tense', // Soft Muted Terracotta -> Tense
            accent: 'bg-[#F5E6DA]', // Very pale blush
            text: 'text-[#5C5552]', // Warm Charcoal
            textSecondary: 'text-[#8C8682]', // Warm Grey
            cardBg: 'bg-white/40',
            gradient: 'from-[#FFFBF5] via-[#FFF5EB] to-[#FAFAF9]', // Extremely subtle warm drift
        },
        copy: {
            greeting: (name) => `Welcome home, ${name}.`,
            checkInPrompt: "How is your heart feeling right now?",
            rescueLabel: "I need a hug",
            chatPlaceholder: "Tell me everything. I'm listening.",
            emptyState: "You are never too much.",
        },
        vibe: {
            animationSpeed: 'slow',
            borderRadius: 'rounded-[1.5rem]',
            density: 'compact',
        },
    },
    [AttachmentStyle.Avoidant]: { // "The Soloist" - Needs Space & Logic
        id: AttachmentStyle.Avoidant,
        colors: {
            background: 'bg-low', // Avoidant -> Low
            primary: 'bg-low', // Cool Slate Blue -> Low
            accent: 'bg-[#E2E8F0]', // Pale Slate
            text: 'text-[#475569]', // Cool Charcoal
            textSecondary: 'text-[#94A3B8]',
            cardBg: 'bg-white/60',
            gradient: 'from-[#F8FAFC] via-[#F1F5F9] to-white', // Subtle cool drift
        },
        copy: {
            greeting: (name) => `Your space, ${name}.`,
            checkInPrompt: "What is your battery level?",
            rescueLabel: "I need space",
            chatPlaceholder: "What's on your mind? (Logic/Facts)",
            emptyState: "No demands here. Just you.",
        },
        vibe: {
            animationSpeed: 'normal',
            borderRadius: 'rounded-xl',
            density: 'spacious',
        },
    },
    [AttachmentStyle.Fearful]: { // "The Sentinel" - Needs Stability & Clarity
        id: AttachmentStyle.Fearful,
        colors: {
            background: 'bg-background', // Fearful -> Background (Neutral/Safe)
            primary: 'bg-sage', // Sage Green -> Sage
            accent: 'bg-[#E7E5E4]', // Pale Stone
            text: 'text-[#44403C]', // Deep Stone
            textSecondary: 'text-[#A8A29E]',
            cardBg: 'bg-[#F5F5F4]/50',
            gradient: 'from-[#FAFAF9] via-[#F0FDF4] to-[#F5F5F4]', // Subtle earth drift
        },
        copy: {
            greeting: (name) => `You are safe here, ${name}.`,
            checkInPrompt: "Let's check the perimeter. Status?",
            rescueLabel: "Pause & Ground",
            chatPlaceholder: "It's safe to speak.",
            emptyState: "Stability is built one moment at a time.",
        },
        vibe: {
            animationSpeed: 'still',
            borderRadius: 'rounded-2xl',
            density: 'normal',
        },
    },
    [AttachmentStyle.Secure]: { // "The Anchor" - Needs Growth
        id: AttachmentStyle.Secure,
        colors: {
            background: 'bg-safe', // Secure -> Safe
            primary: 'bg-moss', // Soft Mint -> Moss
            accent: 'bg-[#DCFCE7]',
            text: 'text-[#14532D]',
            textSecondary: 'text-[#4ADE80]',
            cardBg: 'bg-white/70',
            gradient: 'from-[#F0FDF4] via-white to-[#F0FDF4]',
        },
        copy: {
            greeting: (name) => `Ready to grow, ${name}?`,
            checkInPrompt: "What are you building today?",
            rescueLabel: "Regulation Tools",
            chatPlaceholder: "Share your wins or challenges.",
            emptyState: "You are the anchor.",
        },
        vibe: {
            animationSpeed: 'normal',
            borderRadius: 'rounded-2xl',
            density: 'normal',
        },
    },
    [AttachmentStyle.Unknown]: { // Fallback (Neutral)
        id: AttachmentStyle.Unknown,
        colors: {
            background: 'bg-background', // Fallback -> Background
            primary: 'bg-gray-300', // Keep gray for now or switch to muted
            accent: 'bg-[#F3F4F6]', // Gray 100
            text: 'text-[#374151]', // Gray 700
            textSecondary: 'text-[#9CA3AF]', // Gray 400
            cardBg: 'bg-white',
            gradient: 'bg-white',
        },
        copy: {
            greeting: (name) => `Welcome, ${name}.`,
            checkInPrompt: "How are you?",
            rescueLabel: "Help",
            chatPlaceholder: "Type here...",
            emptyState: "Welcome to Unclinq.",
        },
        vibe: {
            animationSpeed: 'normal',
            borderRadius: 'rounded-xl',
            density: 'normal',
        },
    },
};
