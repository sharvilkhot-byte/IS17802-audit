
import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FlowStep } from './types';
import SimpleTextScreen from './templates/SimpleTextScreen';
import CardScreen from './templates/CardScreen';
import QuestionScreen from './templates/QuestionScreen';
import TransitionScreen from './templates/TransitionScreen';
import SeedQuestionWrapper from './templates/SeedQuestionWrapper';

interface FlowEngineProps {
    flow: FlowStep[];
    onComplete: (data: Record<string, any>) => void;
    onExit?: () => void;
    initialStepId?: string;
}

const FlowEngine: React.FC<FlowEngineProps> = ({ flow, onComplete, initialStepId }) => {
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [data, setData] = useState<Record<string, any>>({});
    const [direction, setDirection] = useState(1); // 1 = forward, -1 = back

    // Find initial index if provided
    useEffect(() => {
        if (initialStepId) {
            const idx = flow.findIndex(s => s.id === initialStepId);
            if (idx !== -1) setCurrentStepIndex(idx);
        }
    }, [initialStepId, flow]);

    const currentStep = flow[currentStepIndex];

    const handleNext = (stepData?: any) => {
        if (currentStep.variableName && stepData !== undefined) {
            setData(prev => ({ ...prev, [currentStep.variableName!]: stepData }));
        }

        if (currentStepIndex < flow.length - 1) {
            setDirection(1);
            setCurrentStepIndex(prev => prev + 1);
        } else {
            onComplete(data);
        }
    };

    const handleBack = () => {
        if (currentStepIndex > 0) {
            setDirection(-1);
            setCurrentStepIndex(prev => prev - 1);
        }
    };

    // Auto-advance logic
    useEffect(() => {
        if (currentStep?.autoAdvance && currentStep.duration) {
            const timer = setTimeout(() => {
                handleNext();
            }, currentStep.duration);
            return () => clearTimeout(timer);
        }
    }, [currentStep]);

    const renderStep = () => {
        if (!currentStep) return null;

        const props = {
            step: currentStep,
            onNext: handleNext,
            onBack: handleBack,
            data
        };

        switch (currentStep.type) {
            case 'TextOnly':
                return <SimpleTextScreen {...props} />;
            case 'Card':
                return <CardScreen {...props} />;
            case 'Question':
                return <QuestionScreen {...props} />;
            case 'Transition':
                return <TransitionScreen {...props} />;
            case 'SeedQuestion':
                return <SeedQuestionWrapper {...props} />;
            default:
                return <div>Unknown Step Type: {currentStep.type}</div>;
        }
    };

    return (
        <div className="w-full h-full relative overflow-hidden flex flex-col z-10">
            <AnimatePresence mode="wait" initial={false}>
                <motion.div
                    key={currentStep.id}
                    className="flex-1 w-full h-full absolute inset-0"
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 1.05, y: -20 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                >
                    {renderStep()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default FlowEngine;
