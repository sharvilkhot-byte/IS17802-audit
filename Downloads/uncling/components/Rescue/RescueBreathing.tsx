import React, { useEffect, useState } from 'react';

interface RescueBreathingProps {
    onComplete: () => void;
    durationSeconds?: number;
}

const RescueBreathing: React.FC<RescueBreathingProps> = ({ onComplete, durationSeconds = 30 }) => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [secondsLeft, setSecondsLeft] = useState(durationSeconds);
    const [instruction, setInstruction] = useState('Breathe in slowly...');

    // Phase Timer
    useEffect(() => {
        const cycle = () => {
            setPhase('inhale');
            setInstruction('Breathe in...');
            setTimeout(() => {
                setPhase('hold');
                setInstruction('Hold gently...');
                setTimeout(() => {
                    setPhase('exhale');
                    setInstruction('Breathe out slowly...');
                }, 4000); // Hold for 4s
            }, 4000); // Inhale for 4s
        };

        cycle(); // Initial
        const interval = setInterval(cycle, 12000); // Total 12s cycle (4+4+4)

        return () => clearInterval(interval);
    }, []);

    // Countdown Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setSecondsLeft(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    onComplete();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [onComplete]);

    // Dynamic sizes based on phase
    const circleSize = phase === 'inhale' ? 'scale-150' : phase === 'hold' ? 'scale-150' : 'scale-100';
    const opacity = phase === 'inhale' ? 'opacity-30' : 'opacity-80';

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                {/* Outer Glow */}
                <div className={`absolute inset-0 bg-green-200 rounded-full blur-3xl transition-all duration-[4000ms] ${phase === 'inhale' ? 'opacity-40 scale-110' : 'opacity-20 scale-90'}`} />

                {/* Breathing Circle */}
                <div className={`w-32 h-32 bg-green-500 rounded-full shadow-lg transition-transform duration-[4000ms] ease-in-out ${circleSize} flex items-center justify-center relative`}>
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
