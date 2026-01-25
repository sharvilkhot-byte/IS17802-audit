import React, { useEffect, useState } from 'react';

interface RescueVooProps {
    onComplete: () => void;
}

const RescueVoo: React.FC<RescueVooProps> = ({ onComplete }) => {
    const [phase, setPhase] = useState<'inhale' | 'voo' | 'rest'>('inhale');
    const [cycleCount, setCycleCount] = useState(0);

    useEffect(() => {
        const runCycle = () => {
            setPhase('inhale');
            // Inhale 4s
            setTimeout(() => {
                setPhase('voo');
                // Voo 8s - Long exhale
                setTimeout(() => {
                    setPhase('rest');
                    // Rest 4s
                    setTimeout(() => {
                        setCycleCount(prev => {
                            const newCount = prev + 1;
                            if (newCount >= 3) { // End after 3 cycles for MVP
                                onComplete();
                            } else {
                                runCycle();
                            }
                            return newCount;
                        });
                    }, 4000);
                }, 8000);
            }, 4000);
        };

        runCycle();
        // Cleanup not strictly necessary for self-terminating recursion in effect, but good practice if valid flags used
    }, [onComplete]);

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
            <h2 className="text-xl font-medium text-brand-deep mb-8 relative z-10">
                {phase === 'inhale' && "Inhale deeply..."}
                {phase === 'voo' && "Make a low 'Voooo' sound..."}
                {phase === 'rest' && "Rest..."}
            </h2>

            <div className="relative w-64 h-64 flex items-center justify-center mb-12">
                {/* Core Circle */}
                <div className={`w-32 h-32 rounded-full flex items-center justify-center transition-all duration-[4000ms] ease-in-out
                    ${phase === 'inhale' ? 'bg-forest/20 scale-125' :
                        phase === 'voo' ? 'bg-brand-deep/20 scale-90' : 'bg-slate-100 scale-100'}
                `}>
                    {/* Vibration Rings (Only visible during Voo) */}
                    {phase === 'voo' && (
                        <>
                            <div className="absolute inset-0 bg-brand-deep/30 rounded-full animate-ping opacity-20" style={{ animationDuration: '1s' }} />
                            <div className="absolute inset-0 bg-brand-deep/20 rounded-full animate-ping opacity-20" style={{ animationDuration: '1.5s', animationDelay: '0.2s' }} />
                        </>
                    )}

                    <div className="w-4 h-4 rounded-full bg-brand-deep opacity-50" />
                </div>
            </div>

            <p className="text-textSecondary max-w-xs leading-relaxed">
                The vibration stimulates your Vagus nerve to signal safety.
            </p>
        </div>
    );
};

export default RescueVoo;
