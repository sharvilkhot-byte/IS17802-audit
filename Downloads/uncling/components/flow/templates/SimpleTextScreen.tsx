
import React from 'react';
import { motion } from 'framer-motion';
import { FlowStep } from '../types';
import LogoIcon from '../../LogoIcon';
import GlassCard from '../../ui/GlassCard';
import Button from '../../Button';

interface Props {
    step: FlowStep;
    onNext?: () => void;
}

const SimpleTextScreen: React.FC<Props> = ({ step, onNext }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center z-10 w-full max-w-3xl mx-auto">
            {/* Optional Logo for very first screen */}
            {step.id === '0.1-launch' && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 0.8, scale: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <LogoIcon className="mb-12 w-20 h-20 text-brand-lavender" />
                </motion.div>
            )}

            <GlassCard className="w-full p-10 border-none shadow-none bg-transparent backdrop-blur-0" hoverEffect={false}>
                <div className="space-y-8">
                    {step.body?.split('\n').map((line, i) => (
                        line.trim() === '' ? <div key={i} className="h-6" /> :
                            <motion.p
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.2 + 0.5, duration: 0.8 }}
                                className="text-2xl sm:text-3xl font-heading font-medium text-brand-deep leading-relaxed drop-shadow-sm"
                            >
                                {line}
                            </motion.p>
                    ))}
                </div>

                {step.cta && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 2.5 }}
                        className="mt-16"
                    >
                        <Button
                            onClick={() => onNext && onNext()}
                            className="text-lg px-8 py-4 shadow-xl shadow-brand-lavender/20"
                        >
                            {step.cta}
                        </Button>
                    </motion.div>
                )}
            </GlassCard>
        </div>
    );
};

export default SimpleTextScreen;
