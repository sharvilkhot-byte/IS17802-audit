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

const Pass3RelationalMeaning: React.FC<Props> = ({ data, update, onNext, onBack }) => {
    const [step, setStep] = useState(1);

    const handleSelection = (field: keyof ReflectionState, value: any) => {
        update({ [field]: value });
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
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3
                ${selected
                    ? 'bg-lime-glow/20 border-forest text-forest shadow-md'
                    : 'bg-white border-transparent hover:border-forest/30 text-textPrimary shadow-sm'
                }`}
        >
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 
                ${selected ? 'bg-forest text-white' : 'bg-sage/30 text-transparent'}`}>
                {selected && <CheckCircle2 size={14} />}
            </div>
            <span className="font-medium text-lg">{label}</span>
        </motion.div>
    );

    return (
        <Layout>
            <div className="flex-1 flex flex-col justify-center items-center py-6 min-h-[85vh]">
                <AnimatePresence mode="wait">

                    {/* Screen 1: Closeness Signal */}
                    {step === 1 && (
                        <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-forest">
                                <h1 className="text-xl font-bold text-forest uppercase tracking-widest mb-4 opacity-80">Pass 3: Connection</h1>
                                <h2 className="text-2xl font-heading font-bold text-textPrimary mb-8">When someone feels important to you, what tends to happen inside?</h2>

                                <div className="space-y-3">
                                    {[
                                        "I feel more connected and grounded",
                                        "I feel closer but also more alert",
                                        "I want to be close but worry about losing them",
                                        "I enjoy closeness but need space to stay myself",
                                        "Closeness feels confusing or heavy",
                                        "It really depends on the person"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.closenessSignal === opt}
                                            onClick={() => handleSelection('closenessSignal', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={onBack}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.closenessSignal} className="shadow-lg">Next</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 2: Distance Interpretation */}
                    {step === 2 && (
                        <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-peach-fuzz">
                                <h1 className="text-2xl font-heading font-bold text-textPrimary mb-8">When someone important feels distant, your mind often goes to…</h1>

                                <div className="space-y-3">
                                    {[
                                        "“Something might be wrong between us.”",
                                        "“They probably need space.”",
                                        "“I should give space too.”",
                                        "“I did something wrong.”",
                                        "“I’m not sure — it’s just uncomfortable.”"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.distanceInterpretation === opt}
                                            onClick={() => handleSelection('distanceInterpretation', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.distanceInterpretation} className="shadow-lg">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 3: Needs Expression */}
                    {step === 3 && (
                        <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-sage">
                                <h1 className="text-2xl font-heading font-bold text-textPrimary mb-8">When you need reassurance or clarity, you usually…</h1>

                                <div className="space-y-3">
                                    {[
                                        "Ask directly",
                                        "Hint or wait for them to notice",
                                        "Hold it in to avoid pressure",
                                        "Pull back and self-soothe",
                                        "It varies a lot"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.needsExpression === opt}
                                            onClick={() => handleSelection('needsExpression', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.needsExpression} className="shadow-lg">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 4: Conflict Safety */}
                    {step === 4 && (
                        <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-lime-glow">
                                <h1 className="text-2xl font-heading font-bold text-textPrimary mb-8">During emotional tension or conflict, you tend to…</h1>

                                <div className="space-y-3">
                                    {[
                                        "Try to resolve it quickly",
                                        "Need time before engaging",
                                        "Feel overwhelmed or shut down",
                                        "Worry about losing the connection",
                                        "Avoid conflict when possible",
                                        "Depends on the situation"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.conflictSafety === opt}
                                            onClick={() => handleSelection('conflictSafety', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(3)}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.conflictSafety} className="shadow-lg">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 5: Check-in */}
                    {step === 5 && (
                        <motion.div key="step5" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="white" className="mb-8 p-8 shadow-soft-xl">
                                <h1 className="text-2xl font-heading font-bold text-textPrimary mb-8 text-center">How does reflecting on relationships feel right now?</h1>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {["Grounding", "Insightful", "A bit heavy", "Uncomfortable", "Neutral"].map((opt) => (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                handleSelection('pass3Feeling', opt);
                                                setTimeout(onNext, 400);
                                            }}
                                            className={`p-4 rounded-xl font-medium text-lg transition-colors
                                                ${data.pass3Feeling === opt
                                                    ? 'bg-forest text-white shadow-md'
                                                    : 'bg-sage/20 text-textPrimary hover:bg-sage/40'}`}
                                        >
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>

                                {data.pass3Feeling && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center font-medium text-forest italic leading-relaxed"
                                    >
                                        “Relationships shape us deeply. There’s nothing wrong with how you learned to adapt.”
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

export default Pass3RelationalMeaning;
