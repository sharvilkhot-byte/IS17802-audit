
import React, { useEffect } from 'react';
import { FlowStep } from '../types';

interface Props {
    step: FlowStep;
    onNext: () => void;
}

import { motion } from 'framer-motion';
import GlassCard from '../../ui/GlassCard';

const TransitionScreen: React.FC<Props> = ({ step, onNext }) => {

    useEffect(() => {
        const timer = setTimeout(() => {
            onNext();
        }, step.duration || 3000);
        return () => clearTimeout(timer);
    }, [step, onNext]);

    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <GlassCard className="max-w-md p-10 flex flex-col items-center backdrop-blur-2xl bg-white/40" hoverEffect={false}>
                <motion.div
                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-16 h-16 rounded-full bg-gradient-to-tr from-brand-lavender/40 to-brand-sky/40 mb-8 blur-sm"
                />

                <h2 className="text-2xl sm:text-3xl font-heading font-bold text-brand-deep mb-4 drop-shadow-sm">
                    {step.heading}
                </h2>
                {step.body && (
                    <p className="text-lg text-brand-deep/70 font-medium leading-relaxed">
                        {step.body}
                    </p>
                )}
            </GlassCard>
        </div>
    );
};

export default TransitionScreen;
