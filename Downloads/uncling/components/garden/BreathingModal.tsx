
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import Button from '../Button';

interface BreathingModalProps {
    isOpen: boolean;
    onComplete: () => void;
    onCancel: () => void;
}

const BreathingModal: React.FC<BreathingModalProps> = ({ isOpen, onComplete, onCancel }) => {
    const [phase, setPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
    const [cycle, setCycle] = useState(0);
    const CYCLES_REQUIRED = 3;

    useEffect(() => {
        if (!isOpen) {
            setCycle(0);
            setPhase('inhale');
            return;
        }

        if (cycle >= CYCLES_REQUIRED) {
            setTimeout(onComplete, 1000); // Auto-complete after cycles
            return;
        }

        let timer: NodeJS.Timeout;

        const runCycle = () => {
            setPhase('inhale');
            timer = setTimeout(() => {
                setPhase('hold');
                timer = setTimeout(() => {
                    setPhase('exhale');
                    timer = setTimeout(() => {
                        setCycle(c => c + 1);
                    }, 4000); // Exhale 4s
                }, 2000); // Hold 2s
            }, 4000); // Inhale 4s
        };

        runCycle();

        return () => clearTimeout(timer);
    }, [isOpen, cycle, onComplete]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-brand-deep/60 backdrop-blur-sm">
            <GlassCard className="w-80 p-8 flex flex-col items-center">
                <h3 className="text-xl font-serif text-brand-deep mb-8">
                    Watering your inner world...
                </h3>

                {/* Breathing Circle */}
                <div className="relative w-40 h-40 flex items-center justify-center mb-8">
                    {/* Outer Rings */}
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? 1.5 : (phase === 'exhale' ? 1 : 1.5),
                            opacity: phase === 'inhale' ? 0.5 : (phase === 'exhale' ? 0.2 : 0.5)
                        }}
                        transition={{ duration: phase === 'inhale' ? 4 : (phase === 'exhale' ? 4 : 0) }}
                        className="absolute inset-0 bg-brand-lavender/30 rounded-full"
                    />

                    {/* Core Circle */}
                    <motion.div
                        animate={{
                            scale: phase === 'inhale' ? 1.2 : (phase === 'exhale' ? 0.8 : 1.2),
                        }}
                        transition={{ duration: phase === 'inhale' ? 4 : (phase === 'exhale' ? 4 : 0) }}
                        className="w-24 h-24 bg-brand-lavender rounded-full flex items-center justify-center text-white font-heading font-bold"
                    >
                        {phase.toUpperCase()}
                    </motion.div>
                </div>

                <p className="text-brand-deep/60 text-sm mb-4">
                    Breath {cycle + 1} of {CYCLES_REQUIRED}
                </p>

                <button onClick={onCancel} className="text-xs text-brand-deep/40 hover:text-brand-deep">
                    Cancel
                </button>
            </GlassCard>
        </div>
    );
};

export default BreathingModal;
