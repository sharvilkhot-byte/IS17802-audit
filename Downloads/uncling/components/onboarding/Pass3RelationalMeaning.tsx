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

const Pass3RelationalMeaning: React.FC<Props> = ({ data, update, onNext, onBack }) => {
    const [step, setStep] = useState(1);

    const handleSelection = (field: keyof ReflectionState, value: any) => {
        update({ [field]: value });
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    // Screen 1: Closeness Signal
    if (step === 1) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <p className="text-moss uppercase tracking-widest text-xs font-bold mb-2">Pass 3: Connection</p>
                    <h1 className="text-xl font-light text-textPrimary">When someone feels important to you, what tends to happen inside?</h1>
                </header>

                <div className="space-y-3">
                    {[
                        "I feel more connected and grounded",
                        "I feel closer but also more alert",
                        "I want to be close but worry about losing them",
                        "I enjoy closeness but need space to stay myself",
                        "Closeness feels confusing or heavy",
                        "It really depends on the person"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('closenessSignal', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.closenessSignal === opt
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
                    <Button onClick={nextStep} disabled={!data.closenessSignal}>Next</Button>
                </div>
            </div>
        );
    }

    // Screen 2: Distance Interpretation
    if (step === 2) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">When someone important feels distant, your mind often goes to…</h1>
                </header>

                <div className="space-y-3">
                    {[
                        "“Something might be wrong between us.”",
                        "“They probably need space.”",
                        "“I should give space too.”",
                        "“I did something wrong.”",
                        "“I’m not sure — it just feels uncomfortable.”"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('distanceInterpretation', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.distanceInterpretation === opt
                                ? 'bg-moss/20 border-moss font-medium'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={!data.distanceInterpretation} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Screen 3: Needs Expression
    if (step === 3) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">When you need reassurance or clarity, you usually…</h1>
                </header>
                <div className="space-y-3">
                    {[
                        "Ask directly",
                        "Hint or wait for them to notice",
                        "Hold it in to avoid pressure",
                        "Pull back and self-soothe",
                        "It varies a lot"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('needsExpression', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.needsExpression === opt
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={!data.needsExpression} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Screen 4: Conflict Safety
    if (step === 4) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <h1 className="text-xl font-light text-textPrimary">During emotional tension or conflict, you tend to…</h1>
                </header>
                <div className="space-y-3">
                    {[
                        "Try to resolve it quickly",
                        "Need time before engaging",
                        "Feel overwhelmed or shut down",
                        "Worry about losing the connection",
                        "Avoid conflict when possible",
                        "Depends on the situation"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('conflictSafety', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.conflictSafety === opt
                                ? 'bg-moss/20 border-moss'
                                : 'bg-white border-slate-200 hover:bg-slate-50'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                <Button onClick={nextStep} disabled={!data.conflictSafety} className="w-full mt-6">Continue</Button>
            </div>
        );
    }

    // Micro-Screen: Check-in
    if (step === 5) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-12 text-center animate-fade-in">
                <h1 className="text-xl font-light text-textPrimary mb-6">How does reflecting on relationships feel right now?</h1>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {["Grounding", "Insightful", "A bit heavy", "Uncomfortable", "Neutral"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                handleSelection('pass3Feeling', opt);
                                setTimeout(onNext, 400);
                            }}
                            className={`p-3 rounded-lg border text-sm transition-all ${data.pass3Feeling === opt
                                ? 'bg-forest/10 border-forest text-forest'
                                : 'bg-white border-slate-200 hover:border-forest/30'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>

                {data.pass3Feeling && (
                    <p className="text-textSecondary italic animate-pulse">
                        “Relationships shape us deeply. There’s nothing wrong with how you learned to adapt.”
                    </p>
                )}
            </div>
        );
    }

    return null;
};

export default Pass3RelationalMeaning;
