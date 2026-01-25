import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';
import Layout from '../../components/Layout';
import Card from '../../components/Card';
import Button from '../../components/Button';
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

    const containerVariants = {
        hidden: { opacity: 0, x: 20 },
        visible: { opacity: 1, x: 0, transition: { duration: 0.4 } },
        exit: { opacity: 0, x: -20, transition: { duration: 0.3 } }
    };

    const OptionTile = ({ label, selected, onClick, multi = false }: { label: string, selected: boolean, onClick: () => void, multi?: boolean }) => (
        <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center gap-3
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

                    {/* Screen 1: Gentle Entry */}
                    {step === 1 && (
                        <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-lavender">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-2">Let’s start where you are.</h1>
                                <p className="text-brand-deep/70 mb-8 text-lg">There’s no right answer. Just notice what feels closest right now.</p>

                                <div className="space-y-3">
                                    {[
                                        "My mind starts replaying things over and over",
                                        "I feel it in my body before I can explain it",
                                        "I want reassurance or clarity from someone",
                                        "I go quiet or pull back to protect myself",
                                        "I distract myself to avoid feeling too much",
                                        "I’m not sure — it’s just uncomfortable"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.emotionalPatterns.includes(opt)}
                                            onClick={() => toggleSelection('emotionalPatterns', opt)}
                                            multi
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-end">
                                <Button onClick={nextStep} disabled={data.emotionalPatterns.length === 0} className="shadow-lg shadow-brand-lavender/30">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 2: Intensity */}
                    {step === 2 && (
                        <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-coral">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-2">How intense does this usually feel?</h1>
                                <p className="text-brand-deep/70 mb-8 text-lg">Think in terms of impact, not severity.</p>

                                <div className="space-y-3">
                                    {[
                                        "Manageable — I can still function",
                                        "Distracting — it’s hard to focus",
                                        "Overwhelming — it takes over",
                                        "It comes in waves",
                                        "It varies a lot"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.intensity === opt}
                                            onClick={() => handleSelection('intensity', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.intensity} className="shadow-lg shadow-brand-coral/20 bg-brand-coral hover:bg-brand-coral/90">Next</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 3: Temporal Context */}
                    {step === 3 && (
                        <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-sky">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-2">When does this usually show up?</h1>
                                <p className="text-brand-deep/70 mb-8 text-lg">Notice when this tends to surface most.</p>

                                <div className="space-y-3">
                                    {[
                                        "After closeness or connection",
                                        "When something feels uncertain",
                                        "When I’m alone with my thoughts",
                                        "After conflict or tension",
                                        "At night or when things slow down",
                                        "There’s no clear pattern"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={(data.timingContext as string[]).includes(opt)}
                                            onClick={() => toggleSelection('timingContext', opt)}
                                            multi
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-end">
                                <Button onClick={nextStep} disabled={data.timingContext.length === 0} className="shadow-lg shadow-brand-lavender/30">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 4: Safety Check */}
                    {step === 4 && (
                        <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="white" className="mb-8 p-8 shadow-soft">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8 text-center">How does seeing this feel?</h1>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {["Relieved", "Seen", "Curious", "A bit heavy", "Unsure"].map((opt) => (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                handleSelection('pass1Feeling', opt);
                                                setTimeout(onNext, 400);
                                            }}
                                            className={`p-4 rounded-xl font-medium text-lg transition-colors
                                                ${data.pass1Feeling === opt
                                                    ? 'bg-brand-lavender text-white shadow-md'
                                                    : 'bg-brand-light text-brand-deep hover:bg-brand-rose/20'}`}
                                        >
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>

                                {data.pass1Feeling && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center font-medium text-brand-deep italic leading-relaxed"
                                    >
                                        “Thank you for noticing this. These patterns help me understand how to support you — not to put you in a box.”
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

export default Pass1EmotionalContext;
