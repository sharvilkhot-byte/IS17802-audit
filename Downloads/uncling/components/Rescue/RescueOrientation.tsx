import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface RescueOrientationProps {
    onComplete: () => void;
}

const RescueOrientation: React.FC<RescueOrientationProps> = ({ onComplete }) => {
    // Stage 1: 5 Red things, Stage 2: 3 Square things
    const [stage, setStage] = useState<1 | 2>(1);
    const [count, setCount] = useState(0);

    const target = stage === 1 ? 5 : 3;
    const task = stage === 1 ? "Find 5 RED objects around you." : "Find 3 SQUARE objects.";

    const handleTap = () => {
        const newCount = count + 1;
        setCount(newCount);

        if (newCount >= target) {
            if (stage === 1) {
                // Transition to stage 2
                setTimeout(() => {
                    setStage(2);
                    setCount(0);
                }, 500);
            } else {
                // Done
                setTimeout(onComplete, 500);
            }
        }
    };

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in cursor-pointer" onClick={handleTap}>
            <p className="text-secondary text-sm font-semibold uppercase tracking-widest mb-4">
                Tap screen when you find one
            </p>

            <h2 className="text-2xl font-serif text-brand-deep mb-8 max-w-xs transition-all">
                {task}
            </h2>

            {/* Progress Visual */}
            <div className="flex gap-3 mb-12">
                {Array.from({ length: target }).map((_, i) => (
                    <div
                        key={i}
                        className={`w-6 h-6 rounded-full border-2 transition-all duration-300 flex items-center justify-center
                            ${i < count
                                ? 'bg-forest border-forest scale-110'
                                : 'border-slate-300 bg-transparent'}
                        `}
                    >
                        {i < count && <CheckCircle size={14} className="text-white" />}
                    </div>
                ))}
            </div>

            <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl max-w-xs">
                <p className="text-textSecondary text-sm">
                    Move your eyes. Turn your head. <br />
                    Tell your brain: "I am here."
                </p>
            </div>

            <p className="absolute bottom-8 text-slate-300 text-xs">
                Tap anywhere to count
            </p>
        </div>
    );
};

export default RescueOrientation;
