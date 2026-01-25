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

                    {/* Screen 1: Inner Voice */}
                    {step === 1 && (
                        <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-deep">
                                <h1 className="text-xl font-bold text-brand-deep/60 uppercase tracking-widest mb-4">Pass 4: Inner World</h1>
                                <h2 className="text-2xl font-heading font-bold text-brand-deep mb-8">When you’re struggling, your inner voice is usually…</h2>

                                <div className="space-y-3">
                                    {[
                                        "Supportive — it tries to calm me",
                                        "Understanding but worried",
                                        "Critical or pressuring",
                                        "Quiet or disconnected",
                                        "Inconsistent — it shifts",
                                        "I’m not sure"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.innerVoice === opt}
                                            onClick={() => handleSelection('innerVoice', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={onBack}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.innerVoice} className="shadow-lg shadow-brand-lavender/30">Next</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 2: Current Coping Tools */}
                    {step === 2 && (
                        <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-coral">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-2">When emotions feel intense, what do you already do that helps?</h1>
                                <p className="text-brand-deep/70 mb-8 text-lg">Select all that apply.</p>

                                <div className="space-y-3">
                                    {[
                                        "Talk to someone I trust",
                                        "Write or reflect privately",
                                        "Movement or physical grounding",
                                        "Breathing or calming techniques",
                                        "Distraction or immersion",
                                        "I’m still figuring this out"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.copingTools.includes(opt)}
                                            onClick={() => toggleSelection('copingTools', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={nextStep} disabled={data.copingTools.length === 0} className="shadow-lg shadow-brand-coral/20 bg-brand-coral hover:bg-brand-coral/90">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 3: Recovery Speed */}
                    {step === 3 && (
                        <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-sky">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8">After an emotional moment, you usually feel steady again…</h1>

                                <div className="space-y-3">
                                    {[
                                        "Quickly",
                                        "After some time",
                                        "Only with reassurance",
                                        "It takes a while",
                                        "It varies a lot"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.recoverySpeed === opt}
                                            onClick={() => handleSelection('recoverySpeed', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.recoverySpeed} className="shadow-lg shadow-brand-lavender/30">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 4: Capacity Check */}
                    {step === 4 && (
                        <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="white" className="mb-8 p-8 shadow-soft">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8 text-center">Right now, what feels most helpful from Unclinq?</h1>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {["Gentle support", "Clear guidance", "Space to reflect", "I’m not sure yet"].map((opt) => (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                handleSelection('capacityNeeds', opt);
                                                setTimeout(onNext, 400);
                                            }}
                                            className={`p-4 rounded-xl font-medium text-lg transition-colors
                                                ${data.capacityNeeds === opt
                                                    ? 'bg-brand-lavender text-white shadow-md'
                                                    : 'bg-brand-light text-brand-deep hover:bg-brand-rose/20'}`}
                                        >
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>

                                {data.capacityNeeds && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center font-medium text-brand-deep italic leading-relaxed"
                                    >
                                        “You don’t need to fix anything here. We’ll work with what’s already true for you.”
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

export default Pass4SelfTalk;
