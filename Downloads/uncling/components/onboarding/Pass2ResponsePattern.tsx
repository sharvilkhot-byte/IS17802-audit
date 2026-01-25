import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2 } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
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

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
    };

    const OptionTile = ({ label, selected, onClick }: { label: string, selected: boolean, onClick: () => void }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-4 rounded-xl border transition-all cursor-pointer flex items-center gap-3
                ${selected
                    ? 'bg-brand-lavender/10 border-brand-lavender text-brand-deep shadow-md'
                    : 'bg-white border-transparent hover:border-brand-lavender/30 text-brand-deep shadow-sm'
                }`}
        >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 
                ${selected ? 'bg-brand-lavender text-white' : 'bg-brand-rose/30 text-transparent'}`}>
                {selected && <CheckCircle2 size={14} />}
            </div>
            <span className="font-medium text-lg leading-snug">{label}</span>
        </motion.div>
    );

    return (
        <Layout>
            <div className="flex-1 flex flex-col justify-center items-center py-6 min-h-[85vh]">
                <AnimatePresence mode="wait">

                    {/* Screen 1: First Impulse */}
                    {step === 1 && (
                        <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-deep">
                                <h1 className="text-xl font-bold text-brand-deep/60 uppercase tracking-widest mb-4">Pass 2: Response</h1>
                                <h2 className="text-2xl font-heading font-bold text-brand-deep mb-8">When something emotionally uncomfortable happens, your first instinct is usually to…</h2>

                                <div className="space-y-3">
                                    {[
                                        "Try to fix or resolve it immediately",
                                        "Reach out or seek reassurance",
                                        "Pull back and deal with it privately",
                                        "Distract yourself or stay busy",
                                        "Freeze or feel unsure what to do"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.firstImpulse === opt}
                                            onClick={() => handleSelection('firstImpulse', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={onBack}>Back to Context</Button>
                                <Button onClick={nextStep} disabled={!data.firstImpulse} className="shadow-lg shadow-brand-lavender/30">Next</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 2: What Makes It Worse */}
                    {step === 2 && (
                        <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-coral">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8">What tends to make this harder for you?</h1>

                                <div className="space-y-3">
                                    {[
                                        "Not knowing where I stand",
                                        "Feeling misunderstood",
                                        "Feeling like I might be too much",
                                        "Feeling ignored or distant",
                                        "Pressure to be okay quickly",
                                        "I’m not sure"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.worseningFactors.includes(opt)}
                                            onClick={() => toggleSelection('worseningFactors', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={nextStep} disabled={data.worseningFactors.length === 0} className="shadow-lg shadow-brand-coral/20 bg-brand-coral hover:bg-brand-coral/90">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 3: Regulation Direction */}
                    {step === 3 && (
                        <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-sky">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8">When you’re emotionally activated, what helps most?</h1>

                                <div className="space-y-3">
                                    {[
                                        "Talking it through with someone",
                                        "Time and space to process alone",
                                        "Understanding why I feel this way",
                                        "Physical grounding (movement, breathing)",
                                        "Distraction or changing focus",
                                        "I don’t really know yet"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.regulationDirection === opt}
                                            onClick={() => handleSelection('regulationDirection', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.regulationDirection} className="shadow-lg shadow-brand-lavender/30">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 4: Aftermath */}
                    {step === 4 && (
                        <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-lavender">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8">After the moment passes, you usually…</h1>

                                <div className="space-y-3">
                                    {[
                                        "Replay it and analyze what happened",
                                        "Feel relief but avoid thinking about it",
                                        "Worry about how it affected the relationship",
                                        "Feel emotionally drained",
                                        "Move on quickly",
                                        "It depends a lot"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.aftermathPattern === opt}
                                            onClick={() => handleSelection('aftermathPattern', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.aftermathPattern} className="shadow-lg shadow-brand-lavender/30">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 5: Confirmation */}
                    {step === 5 && (
                        <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="white" className="mb-8 p-8 shadow-soft">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8 text-center">Does this feel like it describes you reasonably well?</h1>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {["Yes, mostly", "Somewhat", "Not really", "I’m unsure"].map((opt) => (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                handleSelection('pass2Feeling', opt);
                                                setTimeout(onNext, 400);
                                            }}
                                            className={`p-4 rounded-xl font-medium text-lg transition-colors
                                                ${data.pass2Feeling === opt
                                                    ? 'bg-brand-lavender text-white shadow-md'
                                                    : 'bg-brand-light text-brand-deep hover:bg-brand-rose/20'}`}
                                        >
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>

                                {data.pass2Feeling && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center font-medium text-brand-deep italic leading-relaxed"
                                    >
                                        “These responses aren’t problems. They’re learned ways of staying safe.”
                                    </motion.p>
                                )}
                            </Card>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default Pass2ResponsePattern;
