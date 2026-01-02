import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { ReflectionState } from '../../types';

interface Props {
    data: ReflectionState;
    update: (updates: Partial<ReflectionState>) => void;
    onNext: () => void;
    onBack: () => void;
}

const Pass2ResponsePattern: React.FC<Props> = ({ data, update, onNext, onBack }) => {
    const [step, setStep] = useState(1);

    const handleSelection = (field: keyof ReflectionState, value: any) => {
        update({ [field]: value });
    };

    const toggleSelection = (field: keyof ReflectionState, value: string) => {
        const current = (data[field] as string[]) || [];
        const updated = current.includes(value)
            ? current.filter(item => item !== value)
            : [...current, value];
        update({ [field]: updated });
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    // Screen 1: First Impulse
    if (step === 1) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <p className="text-moss uppercase tracking-widest text-xs font-bold mb-2">Pass 2: Response</p>
                    <h1 className="text-xl font-light text-textPrimary">When something emotionally uncomfortable happens, your first instinct is usually to…</h1>
                </header>

                <div className="space-y-3">
                    {[
                        "Try to fix or resolve it immediately",
                        "Reach out or seek reassurance",
                        "Pull back and deal with it privately",
                        "Distract yourself or stay busy",
                        "Freeze or feel unsure what to do"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('firstImpulse', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.firstImpulse === opt
                                ? 'bg-moss/20 border-moss font-medium'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button onClick={onBack} className="text-textSecondary text-sm px-4">Back to Context</button>
                    <Button onClick={nextStep} disabled={!data.firstImpulse}>Next</Button>
                </div>
            </div>
        );
    }

    // Screen 2: What Makes It Worse
    if (step === 2) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">What tends to make this harder for you?</h1>
                </header>

                <div className="space-y-3">
                    {[
                        "Not knowing where I stand",
                        "Feeling misunderstood",
                        "Feeling like I might be too much",
                        "Feeling ignored or distant",
                        "Pressure to be okay quickly",
                        "I’m not sure"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => toggleSelection('worseningFactors', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.worseningFactors.includes(opt)
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={data.worseningFactors.length === 0} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Screen 3: Regulation Direction
    if (step === 3) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">When you’re emotionally activated, what helps most?</h1>
                </header>
                <div className="space-y-3">
                    {[
                        "Talking it through with someone",
                        "Time and space to process alone",
                        "Understanding why I feel this way",
                        "Physical grounding (movement, breathing)",
                        "Distraction or changing focus",
                        "I don’t really know yet"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('regulationDirection', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.regulationDirection === opt
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={!data.regulationDirection} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Screen 4: Aftermath
    if (step === 4) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">After the moment passes, you usually…</h1>
                </header>
                <div className="space-y-3">
                    {[
                        "Replay it and analyze what happened",
                        "Feel relief but avoid thinking about it",
                        "Worry about how it affected the relationship",
                        "Feel emotionally drained",
                        "Move on quickly",
                        "It depends a lot"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('aftermathPattern', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.aftermathPattern === opt
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={!data.aftermathPattern} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Micro-Screen: Confirmation
    if (step === 5) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-12 text-center animate-fade-in">
                <h1 className="text-xl font-light text-textPrimary mb-6">Does this feel like it describes you reasonably well?</h1>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {["Yes, mostly", "Somewhat", "Not really", "I’m unsure"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                handleSelection('pass2Feeling', opt);
                                setTimeout(onNext, 400);
                            }}
                            className={`p-3 rounded-lg border text-sm transition-all ${data.pass2Feeling === opt
                                ? 'bg-forest/10 border-forest text-forest'
                                : 'bg-white border-slate-200 hover:border-forest/30'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {data.pass2Feeling && (
                    <p className="text-textSecondary italic animate-pulse">
                        “These responses aren’t problems. They’re learned ways of staying safe.”
                    </p>
                )}
            </div>
        );
    }

    return null;
};

export default Pass2ResponsePattern;
