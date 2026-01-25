
import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import AmbientBackground from '../ui/AmbientBackground';
import { useGarden } from '../../context/GardenContext';
import DraggableSeed from './DraggableSeed';
import GlassCard from '../ui/GlassCard';
import Button from '../Button';
import Lumi from '../lumi/Lumi';

interface SeedOption {
    id: string;
    type: 'vine' | 'stone' | 'oak' | 'thistle' | 'shell' | 'reed';
    label: string;
    description?: string;
}

interface ScreenProps {
    title: string;
    question: string;
    options: SeedOption[];
    answerKey: 'soil' | 'roots' | 'branches' | 'weather'; // Matches OnboardingAnswers keys
    nextRoute: string; // Keep for backward compat if needed
    bgWeather?: 'sunny' | 'cloudy' | 'rainy' | 'stormy' | 'foggy';
    onCustomNext?: (value: any) => void; // New prop for FlowEngine
}

const SeedQuestionScreen: React.FC<ScreenProps> = ({
    title, question, options, answerKey, nextRoute, bgWeather = 'sunny', onCustomNext
}) => {
    const navigate = useNavigate();
    const { setAnswer } = useGarden();

    const [step, setStep] = useState<'intro' | 'interaction' | 'outro'>('intro');
    const [selectedOption, setSelectedOption] = useState<SeedOption | null>(null);

    const dropZoneRef = useRef<HTMLDivElement>(null);

    const handleDrop = (id: string, point: { x: number, y: number }) => {
        if (!dropZoneRef.current) return;
        const rect = dropZoneRef.current.getBoundingClientRect();

        if (point.x >= rect.left && point.x <= rect.right && point.y >= rect.top && point.y <= rect.bottom) {
            const option = options.find(o => o.id === id);
            if (option) {
                setSelectedOption(option);
                setAnswer(answerKey, option.id); // Save to context
                setStep('outro');
            }
        }
    };

    const handleNext = () => {
        if (onCustomNext && selectedOption) {
            onCustomNext(selectedOption.id);
        } else {
            navigate(nextRoute);
        }
    };

    return (
        <div className="relative w-full h-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50">
            <AmbientBackground weather={step === 'outro' ? 'cloudy' : bgWeather} />

            <div className="absolute top-20 z-20">
                <Lumi mood={step === 'outro' ? 'happy' : 'calm'} size="md" />
            </div>

            <div className="z-10 w-full max-w-lg px-6 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {step === 'intro' && (
                        <motion.div
                            key="intro"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center space-y-6"
                        >
                            <h1 className="text-3xl font-serif text-brand-deep">{title}</h1>
                            <p className="text-xl text-brand-deep/70 leading-relaxed max-w-md">
                                {question}
                            </p>
                            <Button onClick={() => setStep('interaction')} className="mt-8">
                                I Know This One
                            </Button>
                        </motion.div>
                    )}

                    {step === 'interaction' && (
                        <motion.div
                            key="interaction"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="w-full h-[60vh] flex flex-col justify-between py-10"
                        >
                            <div className="flex justify-center gap-4 flex-wrap">
                                {options.map(opt => (
                                    <DraggableSeed
                                        key={opt.id}
                                        {...opt}
                                        onDragEnd={handleDrop}
                                    />
                                ))}
                            </div>

                            <div
                                ref={dropZoneRef}
                                className="w-full h-48 border-2 border-dashed border-brand-lavender/50 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mt-12 transition-colors duration-300"
                            >
                                <p className="text-brand-deep/40 font-heading tracking-widest uppercase text-sm">
                                    Plant your truth here
                                </p>
                            </div>
                        </motion.div>
                    )}

                    {step === 'outro' && selectedOption && (
                        <motion.div
                            key="outro"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center"
                        >
                            <GlassCard className="p-8">
                                <h2 className="text-2xl font-serif text-brand-deep mb-4">
                                    You chose {selectedOption.label}
                                </h2>
                                <p className="text-brand-deep/70 mb-8">
                                    This seed helps complete the garden.
                                </p>
                                <Button onClick={handleNext}>
                                    Continue
                                </Button>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default SeedQuestionScreen;
