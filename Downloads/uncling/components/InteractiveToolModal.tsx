import React, { useState, useEffect } from 'react';
import { CopingTool } from '../data/copingTools';
import Button from './Button';

interface InteractiveToolModalProps {
  tool: CopingTool;
  onClose: () => void;
}

const InteractiveToolModal: React.FC<InteractiveToolModalProps> = ({ tool, onClose }) => {
    const [step, setStep] = useState(0); // 0: Intro, 1 to N: Steps, N+1: Completion
    const [factText, setFactText] = useState('');
    const [feelingText, setFeelingText] = useState('');
    const [fade, setFade] = useState(true);

    const totalSteps = tool.instructions.length;
    const isLastStep = step === totalSteps;

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [onClose]);

    const handleNext = () => {
        setFade(false);
        setTimeout(() => {
            if (tool.type === 'fact-vs-feeling') {
                setStep(1); // Go straight to completion
            } else {
                setStep(s => s + 1);
            }
            setFade(true);
        }, 300);
    };

    const handleBack = () => {
        setFade(false);
        setTimeout(() => {
            setStep(s => s - 1);
            setFade(true);
        }, 300);
    };

    const renderIntro = () => (
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary mb-4">{tool.title}</h2>
            <p className="text-textSecondary mb-8">{tool.description}</p>
            <Button onClick={handleNext} className="w-full sm:w-auto">Start Exercise</Button>
        </div>
    );
    
    const renderCompletion = () => (
        <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-textPrimary mb-4">Well done!</h2>
            <p className="text-textSecondary mb-8">You've completed the {tool.title} exercise. Take a moment to notice how you feel.</p>
            <Button onClick={onClose} className="w-full sm:w-auto">Finish</Button>
        </div>
    );

    const renderGuidedStep = () => {
        if (step > totalSteps) return renderCompletion();
        const instruction = tool.instructions[step - 1];
        return (
             <div className="text-center">
                <p className="text-sm font-medium text-forest mb-4">Step {step} of {totalSteps}</p>
                <p className="text-xl md:text-2xl text-textPrimary min-h-[10rem] flex items-center justify-center">{instruction}</p>
            </div>
        );
    };

    const renderFactVsFeeling = () => {
        if (step > 1) return renderCompletion();
        return (
            <div>
                <p className="text-center text-textPrimary/90 mb-4">{tool.instructions[0]}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col">
                        <label className="font-semibold text-textPrimary mb-2 text-center">Facts</label>
                         <textarea
                            value={factText}
                            onChange={(e) => setFactText(e.target.value)}
                            placeholder="Objective, verifiable evidence..."
                            className="w-full h-48 md:h-64 p-3 bg-white rounded-xl border border-moss/50 focus:ring-2 focus:ring-forest outline-none transition-shadow"
                        />
                    </div>
                    <div className="flex flex-col">
                        <label className="font-semibold text-textPrimary mb-2 text-center">Feelings / Worries</label>
                        <textarea
                            value={feelingText}
                            onChange={(e) => setFeelingText(e.target.value)}
                            placeholder="Anxious thoughts, interpretations..."
                            className="w-full h-48 md:h-64 p-3 bg-white rounded-xl border border-moss/50 focus:ring-2 focus:ring-forest outline-none transition-shadow"
                        />
                    </div>
                </div>
            </div>
        )
    };
    
    // Special case for Brain Dump
    const renderBrainDump = () => {
        if (step > 1) return renderCompletion();
         return (
            <div>
                <p className="text-center text-textPrimary/90 mb-4">{tool.instructions[0]}</p>
                <textarea
                    value={factText}
                    onChange={(e) => setFactText(e.target.value)}
                    placeholder="Write whatever comes to mind..."
                    className="w-full h-64 sm:h-80 p-3 bg-white rounded-xl border border-moss/50 focus:ring-2 focus:ring-forest outline-none transition-shadow"
                />
            </div>
         )
    }

    const renderContent = () => {
        if (step === 0) return renderIntro();
        if (tool.key === 'brain-dump') return renderBrainDump();
        if (tool.type === 'fact-vs-feeling') return renderFactVsFeeling();
        return renderGuidedStep();
    };

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" aria-modal="true" role="dialog">
            <div className="bg-background p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col min-h-[60vh] max-h-[90vh]">
                <div className="flex justify-end mb-4">
                    <button onClick={onClose} className="text-textPrimary hover:text-forest" aria-label="Close exercise">
                        {/* Fix: Corrected SVG attribute casing from strokeLinecap/strokeLinejoin to strokeLineCap/strokeLineJoin. */}
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLineCap="round" strokeLineJoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>

                <div className={`flex-1 flex flex-col justify-center overflow-y-auto scroll-touch transition-opacity duration-300 ${fade ? 'opacity-100' : 'opacity-0'}`}>
                    {renderContent()}
                </div>

                <div className="mt-8 pt-4 border-t border-moss/30 flex justify-between items-center">
                    {step > 0 && step <= totalSteps && tool.type === 'guided-steps' ? (
                        <Button variant="secondary" onClick={handleBack} disabled={step === 1}>Back</Button>
                    ) : <div></div>}
                    
                    {step > 0 && step <= totalSteps && tool.type === 'guided-steps' ? (
                         <Button onClick={handleNext}>{isLastStep ? 'Finish' : 'Next'}</Button>
                    ) : null}

                    {step > 0 && (tool.type === 'fact-vs-feeling' || tool.key === 'brain-dump') && step <= 1 ? (
                        <Button onClick={handleNext} className="w-full">Finish</Button>
                    ) : null}
                </div>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default InteractiveToolModal;
