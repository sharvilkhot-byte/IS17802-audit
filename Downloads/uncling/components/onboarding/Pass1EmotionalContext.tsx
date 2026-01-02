import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { ReflectionState } from '../../types';

interface Props {
    data: ReflectionState;
    update: (updates: Partial<ReflectionState>) => void;
    onNext: () => void;
}

const Pass1EmotionalContext: React.FC<Props> = ({ data, update, onNext }) => {
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

    // Screen 1: Gentle Entry
    if (step === 1) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-light text-textPrimary mb-2">Let’s start where you are.</h1>
                    <p className="text-textSecondary text-sm">There’s no right answer. Just notice what feels closest right now.</p>
                </header>

                <div className="space-y-6">
                    <p className="font-medium text-textPrimary text-lg text-center">When emotions get heavy, what usually shows up first?</p>

                    <div className="grid gap-3">
                        {[
                            "My mind starts replaying things over and over",
                            "I feel it in my body before I can explain it",
                            "I want reassurance or clarity from someone",
                            "I go quiet or pull back to protect myself",
                            "I distract myself to avoid feeling too much",
                            "I’m not sure — it’s just uncomfortable"
                        ].map((opt) => (
                            <button
                                key={opt}
                                onClick={() => toggleSelection('emotionalPatterns', opt)}
                                className={`p-4 text-left rounded-xl border transition-all ${data.emotionalPatterns.includes(opt)
                                    ? 'bg-moss/20 border-moss shadow-inner'
                                    : 'bg-white border-slate-200 hover:border-moss/50'
                                    }`}
                            >
                                <span className="text-textPrimary">{opt}</span>
                            </button>
                        ))}
                    </div>

                    <Button
                        onClick={nextStep}
                        disabled={data.emotionalPatterns.length === 0}
                        className="w-full mt-6"
                    >
                        Continue
                    </Button>
                </div>
            </div>
        );
    }

    // Screen 2: Intensity
    if (step === 2) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-light text-textPrimary mb-2">How intense does this usually feel?</h1>
                    <p className="text-textSecondary text-sm">Think in terms of impact, not severity.</p>
                </header>

                <div className="space-y-4">
                    {[
                        "Manageable — I can still function",
                        "Distracting — it’s hard to focus",
                        "Overwhelming — it takes over",
                        "It comes in waves",
                        "It varies a lot"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('intensity', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.intensity === opt
                                ? 'bg-moss/20 border-moss font-medium'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="mt-8 flex justify-between">
                    <button onClick={() => setStep(1)} className="text-textSecondary text-sm px-4">Back</button>
                    <Button onClick={nextStep} disabled={!data.intensity}>Next</Button>
                </div>
            </div>
        );
    }

    // Screen 3: Temporal Context
    if (step === 3) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-light text-textPrimary mb-2">When does this usually show up?</h1>
                    <p className="text-textSecondary text-sm">Notice when this tends to surface most.</p>
                </header>

                <div className="space-y-4">
                    {[
                        "After closeness or connection",
                        "When something feels uncertain",
                        "When I’m alone with my thoughts",
                        "After conflict or tension",
                        "At night or when things slow down",
                        "There’s no clear pattern"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => toggleSelection('timingContext', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.timingContext.includes(opt)
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                <Button
                    onClick={nextStep}
                    disabled={data.timingContext.length === 0}
                    className="w-full mt-8"
                >
                    Continue
                </Button>
            </div>
        );
    }

    // Micro-Screen: Emotional Safety Check
    if (step === 4) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-12 text-center animate-fade-in">
                <h1 className="text-xl font-light text-textPrimary mb-6">How does seeing this feel?</h1>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {["Relieved", "Seen", "Curious", "A bit heavy", "Unsure"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                handleSelection('pass1Feeling', opt);
                                // Small delay for effect before moving to next Pass
                                setTimeout(onNext, 400);
                            }}
                            className={`p-3 rounded-lg border text-sm transition-all ${data.pass1Feeling === opt
                                ? 'bg-forest/10 border-forest text-forest'
                                : 'bg-white border-slate-200 hover:border-forest/30'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {data.pass1Feeling && (
                    <p className="text-textSecondary italic animate-pulse">
                        “Thank you for noticing this. These patterns help me understand how to support you — not to put you in a box.”
                    </p>
                )}
            </div>
        );
    }

    return null;
};

export default Pass1EmotionalContext;
