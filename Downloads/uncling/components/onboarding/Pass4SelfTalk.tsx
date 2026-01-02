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

const Pass4SelfTalk: React.FC<Props> = ({ data, update, onNext, onBack }) => {
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

    // Screen 1: Inner Voice
    if (step === 1) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <p className="text-moss uppercase tracking-widest text-xs font-bold mb-2">Pass 4: Inner World</p>
                    <h1 className="text-xl font-light text-textPrimary">When you’re struggling, your inner voice is usually…</h1>
                </header>

                <div className="space-y-3">
                    {[
                        "Supportive — it tries to calm me",
                        "Understanding but worried",
                        "Critical or pressuring",
                        "Quiet or disconnected",
                        "Inconsistent — it shifts",
                        "I’m not sure"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('innerVoice', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.innerVoice === opt
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <div className="mt-6 flex justify-between items-center">
                    <button onClick={onBack} className="text-textSecondary text-sm px-4">Back</button>
                    <Button onClick={nextStep} disabled={!data.innerVoice}>Next</Button>
                </div>
            </div>
        );
    }

    // Screen 2: Current Coping Tools
    if (step === 2) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">When emotions feel intense, what do you already do that helps — even a little?</h1>
                </header>

                <div className="space-y-3">
                    {[
                        "Talk to someone I trust",
                        "Write or reflect privately",
                        "Movement or physical grounding",
                        "Breathing or calming techniques",
                        "Distraction or immersion",
                        "I’m still figuring this out"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => toggleSelection('copingTools', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.copingTools.includes(opt)
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={data.copingTools.length === 0} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Screen 3: Recovery Speed
    if (step === 3) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">After an emotional moment, you usually feel steady again…</h1>
                </header>
                <div className="space-y-3">
                    {[
                        "Quickly",
                        "After some time",
                        "Only with reassurance",
                        "It takes a while",
                        "It varies a lot"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('recoverySpeed', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.recoverySpeed === opt
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={!data.recoverySpeed} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Micro-Screen: Capacity Check
    if (step === 4) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-12 text-center animate-fade-in">
                <h1 className="text-xl font-light text-textPrimary mb-6">Right now, what feels most helpful from Unclinq?</h1>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {["Gentle support", "Clear guidance", "Space to reflect", "I’m not sure yet"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                handleSelection('capacityNeeds', opt);
                                setTimeout(onNext, 400);
                            }}
                            className={`p-3 rounded-lg border text-sm transition-all ${data.capacityNeeds === opt
                                ? 'bg-forest/10 border-forest text-forest'
                                : 'bg-white border-slate-200 hover:border-forest/30'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {data.capacityNeeds && (
                    <p className="text-textSecondary italic animate-pulse">
                        “You don’t need to fix anything here. We’ll work with what’s already true for you.”
                    </p>
                )}
            </div>
        );
    }

    return null;
};

export default Pass4SelfTalk;
