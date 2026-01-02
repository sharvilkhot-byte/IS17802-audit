import React, { useState } from 'react';
import Card from '../Card';
import Button from '../Button';
import { ReflectionState } from '../../types';

interface Props {
    data: ReflectionState;
    update: (updates: Partial<ReflectionState>) => void;
    onSubmit: () => void;
    onBack: () => void;
    isSubmitting: boolean;
}

const Pass5Readiness: React.FC<Props> = ({ data, update, onSubmit, onBack, isSubmitting }) => {
    const [step, setStep] = useState(1);

    const handleSelection = (field: keyof ReflectionState, value: any) => {
        update({ [field]: value });
    };

    const nextStep = () => {
        setStep(prev => prev + 1);
        window.scrollTo(0, 0);
    };

    // Screen 1: Challenge Consent
    if (step === 1) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-6 text-center">
                    <p className="text-moss uppercase tracking-widest text-xs font-bold mb-2">Final Pass: Permission</p>
                    <h1 className="text-xl font-light text-textPrimary mb-2">When you feel stuck in familiar patterns…</h1>
                    <p className="text-textSecondary">How would you like Unclinq to support you?</p>
                </header>

                <div className="space-y-3">
                    {[
                        "Mostly gentle support — help me feel steady first",
                        "Gentle support, with occasional honest nudges",
                        "I’m open to being challenged when patterns repeat",
                        "I want to decide in the moment",
                        "I’m not sure yet"
                    ].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => handleSelection('challengeConsent', opt)}
                            className={`p-4 w-full text-left rounded-xl border transition-all ${data.challengeConsent === opt
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
                    <Button onClick={nextStep} disabled={!data.challengeConsent}>Next</Button>
                </div>
            </div>
        );
    }

    // Screen 2: Speaking Rules
    if (step === 2) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-8">
                <header className="mb-8 text-center">
                    <h1 className="text-2xl font-light text-textPrimary">Here’s how I’ll interact with you</h1>
                </header>

                <div className="space-y-6">
                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-safe0 mt-2 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-textPrimary">I will speak when it helps</h3>
                            <p className="text-sm text-textSecondary">When you open the app, inside Rescue Now, or occasionally if a pattern repeats.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-calm0 mt-2 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-textPrimary">I won’t interrupt your life</h3>
                            <p className="text-sm text-textSecondary">No constant reminders. No pressure to respond. No guilt-based nudges.</p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
                        <div>
                            <h3 className="font-semibold text-textPrimary">In intense moments</h3>
                            <p className="text-sm text-textSecondary">I focus on calming first. No insight or challenge during Rescue Now.</p>
                        </div>
                    </div>
                </div>

                <Button onClick={nextStep} className="w-full mt-10">Continue</Button>
            </div>
        );
    }

    // Screen 3: Final Emotional Check
    if (step === 3) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-12 text-center">
                <h1 className="text-xl font-light text-textPrimary mb-6">Before we continue — how does this approach feel to you?</h1>

                <div className="grid grid-cols-2 gap-3 mb-8">
                    {["Reassuring", "Empowering", "Neutral", "Uncertain", "A bit uncomfortable"].map((opt) => (
                        <button
                            key={opt}
                            onClick={() => {
                                handleSelection('pass5Feeling', opt);
                                setTimeout(nextStep, 400);
                            }}
                            className={`p-3 rounded-lg border text-sm transition-all ${data.pass5Feeling === opt
                                    ? 'bg-forest/10 border-forest text-forest'
                                    : 'bg-white border-slate-200 hover:border-forest/30'
                                }`}
                        >
                            {opt}
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    // Screen 4: Commitment
    if (step === 4) {
        return (
            <div className="p-6 max-w-lg mx-auto mt-12 text-center animate-fade-in-up">
                <div className="mb-8">
                    <h1 className="text-2xl font-light text-textPrimary mb-4">This is a space for honesty, not perfection.</h1>
                    <p className="text-textSecondary">You can change your preferences anytime. Unclinq adapts as you do.</p>
                </div>

                <Button onClick={onSubmit} disabled={isSubmitting} className="w-full py-4 text-lg shadow-lg">
                    {isSubmitting ? 'Personalizing...' : 'Continue'}
                </Button>

                <p className="mt-6 text-sm text-moss font-medium animate-pulse">Let’s take this one step at a time.</p>
            </div>
        );
    }

    return null;
};

export default Pass5Readiness;
