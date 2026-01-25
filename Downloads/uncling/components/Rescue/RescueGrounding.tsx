import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../Button';
import { Eye, Hand, Ear, Wind, Coffee } from 'lucide-react';

interface RescueGroundingProps {
    onComplete: () => void;
}

const STEPS = [
    { count: 5, icon: Eye, label: 'Things you see', prompt: 'Look around. Name 5 distinct objects.' },
    { count: 4, icon: Hand, label: 'Things you feel', prompt: 'Touch your clothes, the chair, the air.' },
    { count: 3, icon: Ear, label: 'Things you hear', prompt: 'Listen past the silence. A clock? Traffic?' },
    { count: 2, icon: Wind, label: 'Things you smell', prompt: 'Scent safety. Or just fresh air.' },
    { count: 1, icon: Coffee, label: 'Thing you taste', prompt: 'A sip of water. Or just awareness.' },
];

const RescueGrounding: React.FC<RescueGroundingProps> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            onComplete();
        }
    };

    const step = STEPS[currentStep];

    if (!step) return null;

    const Icon = step.icon;

    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in max-w-sm mx-auto">
            <h2 className="text-xl font-serif text-slate-400 mb-8 uppercase tracking-widest">
                5-4-3-2-1 Grounding
            </h2>

            <AnimatePresence mode='wait'>
                <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex flex-col items-center w-full"
                >
                    <div className="w-24 h-24 bg-white rounded-full shadow-xl flex items-center justify-center text-brand-deep mb-8 relative">
                        <Icon size={40} strokeWidth={1.5} />
                        <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand-lavender text-white rounded-full flex items-center justify-center font-bold">
                            {step.count}
                        </div>
                    </div>

                    <h3 className="text-2xl font-serif text-slate-800 mb-4">
                        {step.label}
                    </h3>

                    <p className="text-slate-600 mb-12 text-lg leading-relaxed">
                        {step.prompt}
                    </p>

                    <Button onClick={handleNext} className="w-full">
                        I found them
                    </Button>
                </motion.div>
            </AnimatePresence>

            {/* Progress Dots */}
            <div className="flex gap-2 mt-12">
                {STEPS.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-colors ${idx === currentStep ? 'bg-brand-deep' : 'bg-slate-200'}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default RescueGrounding;
