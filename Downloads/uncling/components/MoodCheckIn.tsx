import React, { useState } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

// Use same icons as before, but simplified
const MoodVeryLow = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);
// ... Using generic circles for cleaner look if needed, or keep these expressive ones.
const MoodLow = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-1-4-1-4 1-4 1" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);
const MoodNeutral = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);
const MoodGood = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);
const MoodVeryGood = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
    </svg>
);

const MOOD_ICONS = [MoodVeryLow, MoodLow, MoodNeutral, MoodGood, MoodVeryGood];

export const MoodCheckIn: React.FC<{ onComplete?: () => void }> = ({ onComplete }) => {
    const { user } = useAuth();
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [saved, setSaved] = useState(false);

    const handleMoodSelect = async (index: number) => {
        if (!user) return;
        setSelectedMood(index);

        // Save immediately - frictionless
        try {
            await supabase.from('check_ins').insert({
                user_id: user.id,
                mood: index + 1,
                prompt: "Quick check-in",
                note: "",
                ai_feedback: ""
            });
            setSaved(true);
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 1000);
        } catch (e) {
            console.error("Failed to save mood", e);
        }
    };

    if (saved) {
        return (
            <div className="flex items-center justify-center p-4 animate-fade-in">
                <span className="text-textSecondary text-sm">Noted.</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center p-4 rounded-2xl bg-white/50 border border-moss/10">
            <p className="text-sm text-textSecondary mb-4 font-medium">How is your system feeling?</p>
            <div className="flex gap-4">
                {MOOD_ICONS.map((Icon, index) => (
                    <button
                        key={index}
                        onClick={() => handleMoodSelect(index)}
                        className="group transition-transform hover:scale-110 focus:outline-none"
                    >
                        <Icon className={`w-8 h-8 transition-colors ${selectedMood === index ? 'text-textPrimary' : 'text-textSecondary/40 hover:text-textSecondary'}`} />
                    </button>
                ))}
            </div>
        </div>
    );
};
