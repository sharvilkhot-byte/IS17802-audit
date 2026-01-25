import React, { useEffect, useState } from 'react';

interface RescueBreathingProps {
    onComplete: () => void;
    durationSeconds?: number;
}

const RescueBreathing: React.FC<RescueBreathingProps> = ({ onComplete, durationSeconds = 30 }) => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
    const [instruction, setInstruction] = useState('Breathe in slowly...');

    // Phase Timer (4-7-8 Pattern)
    useEffect(() => {
        const cycle = () => {
            setPhase('inhale');
            setInstruction('Inhale deeply through nose...');

            // Inhale 4s
            setTimeout(() => {
                setPhase('hold');
                setInstruction('Hold breath...');

                // Hold 7s
                setTimeout(() => {
                    setPhase('exhale');
                    setInstruction('Whoosh exhale through mouth...');

                    // Exhale 8s - Cycle restarts after total 19s
                }, 7000);
            }, 4000);
        };

        cycle(); // Initial
        const interval = setInterval(cycle, 19000); // Total 19s cycle (4+7+8)

        return () => clearInterval(interval);
    }, []);

    // Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Handle Completion
    useEffect(() => {
        if (secondsLeft === 0) {
            onComplete();
        }
    }, [secondsLeft, onComplete]);



    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                {/* Outer Glow */}
                <div
                    className={`absolute inset-0 bg-safe rounded-full blur-3xl transition-all ease-in-out ${phase === 'inhale' ? 'opacity-40 scale-110 duration-[4000ms]' : phase === 'hold' ? 'opacity-40 scale-110 duration-[0ms]' : 'opacity-20 scale-90 duration-[8000ms]'}`}
                />

                {/* Breathing Circle */}
                <div
                    className={`w-32 h-32 bg-safe0 rounded-full shadow-lg transition-transform ease-in-out flex items-center justify-center relative ${phase === 'inhale' ? 'scale-150 duration-[4000ms]' : phase === 'hold' ? 'scale-150 duration-[0ms]' : 'scale-100 duration-[8000ms]'}`}
                >
                    <div className="absolute inset-0 bg-white rounded-full opacity-20 animate-pulse" />
                </div>
            </div>

            <h2 className="text-2xl font-light text-textPrimary mb-2 transition-opacity duration-500">
                {instruction}
            </h2>
            <p className="text-textSecondary text-sm">
                Follow the rhythm. No rush.
            </p>

            <button
                onClick={onComplete}
                className="absolute bottom-12 text-sm text-textSecondary hover:text-textPrimary underline decoration-2 decoration-transparent hover:decoration-slate-200 transition-all"
            >
                I'm feeling steadier
            </button>
        </div>
    );
};

export default RescueBreathing;
