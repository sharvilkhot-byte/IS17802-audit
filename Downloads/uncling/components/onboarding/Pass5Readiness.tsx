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

                    {/* Screen 1: Challenge Consent */}
                    {step === 1 && (
                        <motion.div key="step1" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-deep">
                                <h1 className="text-xl font-bold text-brand-deep/60 uppercase tracking-widest mb-4">Pass 5: Permission</h1>
                                <h2 className="text-2xl font-heading font-bold text-brand-deep mb-2">When you feel stuck in familiar patterns…</h2>
                                <p className="text-brand-deep/70 mb-8 text-lg">How would you like Unclinq to support you?</p>

                                <div className="space-y-3">
                                    {[
                                        "Mostly gentle support — help me feel steady first",
                                        "Gentle support, with occasional honest nudges",
                                        "I’m open to being challenged when patterns repeat",
                                        "I want to decide in the moment",
                                        "I’m not sure yet"
                                    ].map((opt) => (
                                        <OptionTile
                                            key={opt}
                                            label={opt}
                                            selected={data.challengeConsent === opt}
                                            onClick={() => handleSelection('challengeConsent', opt)}
                                        />
                                    ))}
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={onBack}>Back</Button>
                                <Button onClick={nextStep} disabled={!data.challengeConsent} className="shadow-lg shadow-brand-lavender/30">Next</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 2: Speaking Rules */}
                    {step === 2 && (
                        <motion.div key="step2" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-coral">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8">Here’s how I’ll interact with you</h1>

                                <div className="space-y-6">
                                    <div className="flex gap-4">
                                        <div className="w-3 h-3 rounded-full bg-brand-coral mt-2 shrink-0 shadow-sm" />
                                        <div>
                                            <h3 className="font-bold text-lg text-brand-deep mb-1">I will speak when it helps</h3>
                                            <p className="text-brand-deep/70 leading-relaxed">When you open the app, inside Rescue Now, or occasionally if a pattern repeats.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-3 h-3 rounded-full bg-brand-lavender mt-2 shrink-0 shadow-sm" />
                                        <div>
                                            <h3 className="font-bold text-lg text-brand-deep mb-1">I won’t interrupt your life</h3>
                                            <p className="text-brand-deep/70 leading-relaxed">No constant reminders. No pressure to respond. No guilt-based nudges.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-3 h-3 rounded-full bg-brand-sky mt-2 shrink-0 shadow-sm" />
                                        <div>
                                            <h3 className="font-bold text-lg text-brand-deep mb-1">In intense moments</h3>
                                            <p className="text-brand-deep/70 leading-relaxed">I focus on calming first. No insight or challenge during Rescue Now.</p>
                                        </div>
                                    </div>
                                </div>
                            </Card>
                            <div className="flex justify-between items-center">
                                <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
                                <Button onClick={nextStep} className="shadow-lg shadow-brand-coral/20 bg-brand-coral hover:bg-brand-coral/90">Continue</Button>
                            </div>
                        </motion.div>
                    )}

                    {/* Screen 3: Final Emotional Check */}
                    {step === 3 && (
                        <motion.div key="step3" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg">
                            <Card variant="white" className="mb-8 p-8 shadow-soft border-t-4 border-t-brand-sky">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-8 text-center">Before we continue — how does this approach feel to you?</h1>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {["Reassuring", "Empowering", "Neutral", "Uncertain", "A bit uncomfortable"].map((opt) => (
                                        <motion.button
                                            key={opt}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => {
                                                handleSelection('pass5Feeling', opt);
                                                setTimeout(nextStep, 400);
                                            }}
                                            className={`p-4 rounded-xl font-medium text-lg transition-colors
                                                ${data.pass5Feeling === opt
                                                    ? 'bg-brand-lavender text-white shadow-md'
                                                    : 'bg-brand-light text-brand-deep hover:bg-brand-rose/20'}`}
                                        >
                                            {opt}
                                        </motion.button>
                                    ))}
                                </div>

                                {data.pass5Feeling && (
                                    <motion.p
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-center font-medium text-brand-deep italic leading-relaxed"
                                    >
                                        “Acknowledged. Let’s proceed gently.”
                                    </motion.p>
                                )}
                            </Card>
                        </motion.div>
                    )}

                    {/* Screen 4: Commitment */}
                    {step === 4 && (
                        <motion.div key="step4" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full max-w-lg text-center">
                            <Card variant="glass" className="mb-8 p-8 border-t-4 border-t-brand-lavender">
                                <h1 className="text-2xl font-heading font-bold text-brand-deep mb-4">This is a space for honesty, not perfection.</h1>
                                <p className="text-brand-deep/70 mb-8 text-lg">You can change your preferences anytime. Unclinq adapts as you do.</p>

                                <Button
                                    onClick={onSubmit}
                                    disabled={isSubmitting}
                                    className="w-full max-w-xs shadow-xl text-lg py-4 shadow-brand-lavender/30"
                                >
                                    {isSubmitting ? 'Personalizing...' : 'Continue'}
                                </Button>

                                <p className="mt-6 text-sm text-brand-deep/60 font-medium animate-pulse">Let’s take this one step at a time.</p>
                            </Card>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </Layout>
    );
};

export default Pass5Readiness;
