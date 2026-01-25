import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ArrowLeft, Compass, Check } from 'lucide-react';
import { motion } from 'framer-motion';

type Quadrant = 'high-pleasant' | 'high-unpleasant' | 'low-pleasant' | 'low-unpleasant';

interface Emotion {
    name: string;
    quadrant: Quadrant;
}

const EMOTIONS: Emotion[] = [
    // High Energy + Pleasant
    { name: 'Excited', quadrant: 'high-pleasant' },
    { name: 'Joyful', quadrant: 'high-pleasant' },
    { name: 'Energized', quadrant: 'high-pleasant' },
    { name: 'Hopeful', quadrant: 'high-pleasant' },
    { name: 'Playful', quadrant: 'high-pleasant' },

    // High Energy + Unpleasant
    { name: 'Anxious', quadrant: 'high-unpleasant' },
    { name: 'Angry', quadrant: 'high-unpleasant' },
    { name: 'Frustrated', quadrant: 'high-unpleasant' },
    { name: 'Overwhelmed', quadrant: 'high-unpleasant' },
    { name: 'Panicked', quadrant: 'high-unpleasant' },

    // Low Energy + Pleasant
    { name: 'Peaceful', quadrant: 'low-pleasant' },
    { name: 'Content', quadrant: 'low-pleasant' },
    { name: 'Relaxed', quadrant: 'low-pleasant' },
    { name: 'Grateful', quadrant: 'low-pleasant' },
    { name: 'Serene', quadrant: 'low-pleasant' },

    // Low Energy + Unpleasant
    { name: 'Sad', quadrant: 'low-unpleasant' },
    { name: 'Tired', quadrant: 'low-unpleasant' },
    { name: 'Numb', quadrant: 'low-unpleasant' },
    { name: 'Lonely', quadrant: 'low-unpleasant' },
    { name: 'Hopeless', quadrant: 'low-unpleasant' }
];

const QUADRANTS = [
    {
        id: 'high-pleasant' as Quadrant,
        label: 'High Energy + Pleasant',
        color: 'from-yellow-100 to-amber-100',
        borderColor: 'border-amber-300',
        textColor: 'text-amber-700'
    },
    {
        id: 'high-unpleasant' as Quadrant,
        label: 'High Energy + Unpleasant',
        color: 'from-red-100 to-orange-100',
        borderColor: 'border-red-300',
        textColor: 'text-red-700'
    },
    {
        id: 'low-pleasant' as Quadrant,
        label: 'Low Energy + Pleasant',
        color: 'from-green-100 to-teal-100',
        borderColor: 'border-green-300',
        textColor: 'text-green-700'
    },
    {
        id: 'low-unpleasant' as Quadrant,
        label: 'Low Energy + Unpleasant',
        color: 'from-blue-100 to-slate-100',
        borderColor: 'border-blue-300',
        textColor: 'text-blue-700'
    }
];

const FeelingsCompass: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<'quadrant' | 'emotion' | 'complete'>('quadrant');
    const [selectedQuadrant, setSelectedQuadrant] = useState<Quadrant | null>(null);
    const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
    const [saving, setSaving] = useState(false);

    const handleSelectQuadrant = (quadrant: Quadrant) => {
        setSelectedQuadrant(quadrant);
        setStep('emotion');
    };

    const handleSelectEmotion = async (emotion: string) => {
        setSelectedEmotion(emotion);

        if (!user) {
            setStep('complete');
            return;
        }

        setSaving(true);
        try {
            const { error } = await supabase
                .from('emotion_check_ins')
                .insert({
                    user_id: user.id,
                    emotion: emotion,
                    quadrant: selectedQuadrant
                });

            if (error) {
                console.log('Emotion table not found, skipping save');
            }
            setStep('complete');
        } catch (error) {
            console.error('Error saving emotion:', error);
            setStep('complete');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setStep('quadrant');
        setSelectedQuadrant(null);
        setSelectedEmotion(null);
    };

    const filteredEmotions = selectedQuadrant
        ? EMOTIONS.filter(e => e.quadrant === selectedQuadrant)
        : [];

    const selectedQuadrantData = QUADRANTS.find(q => q.id === selectedQuadrant);

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-brand-rose/5 to-slate-50 pb-24">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <button
                        onClick={() => navigate('/regulate')}
                        className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                        Feelings Compass
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Name and understand your emotions
                    </p>
                </div>

                {/* Content */}
                <div className="px-6">
                    {step === 'quadrant' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <p className="text-center text-brand-deep/60 mb-6">
                                Start by choosing your energy level and valence
                            </p>
                            <div className="grid grid-cols-1 gap-4">
                                {QUADRANTS.map((quadrant, index) => (
                                    <motion.button
                                        key={quadrant.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleSelectQuadrant(quadrant.id)}
                                        className={`
                                            p-6 rounded-2xl border-2 transition-all text-left
                                            bg-gradient-to-br ${quadrant.color}
                                            ${quadrant.borderColor}
                                            hover:shadow-lg hover:scale-102
                                        `}
                                    >
                                        <h3 className={`font-heading font-bold mb-1 ${quadrant.textColor}`}>
                                            {quadrant.label}
                                        </h3>
                                        <p className="text-sm text-brand-deep/60">
                                            Tap to explore specific emotions
                                        </p>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {step === 'emotion' && selectedQuadrantData && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className={`
                                p-4 rounded-xl mb-6 border-2
                                bg-gradient-to-br ${selectedQuadrantData.color}
                                ${selectedQuadrantData.borderColor}
                            `}>
                                <p className={`text-sm font-semibold ${selectedQuadrantData.textColor}`}>
                                    {selectedQuadrantData.label}
                                </p>
                            </div>

                            <p className="text-center text-brand-deep/60 mb-6">
                                Which emotion feels most accurate?
                            </p>

                            <div className="grid grid-cols-2 gap-3">
                                {filteredEmotions.map((emotion, index) => (
                                    <motion.button
                                        key={emotion.name}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleSelectEmotion(emotion.name)}
                                        disabled={saving}
                                        className="
                                            p-4 rounded-xl bg-white/60 backdrop-blur-sm
                                            border border-slate-200 hover:border-brand-rose/50
                                            hover:bg-white hover:shadow-md
                                            transition-all
                                            disabled:opacity-50
                                        "
                                    >
                                        <span className="font-heading font-bold text-brand-deep">
                                            {emotion.name}
                                        </span>
                                    </motion.button>
                                ))}
                            </div>

                            <div className="mt-6">
                                <Button
                                    onClick={handleReset}
                                    variant="secondary"
                                    className="w-full"
                                >
                                    Back to Quadrants
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'complete' && selectedEmotion && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <div className="w-20 h-20 bg-brand-rose/10 rounded-full flex items-center justify-center mb-6">
                                <Check size={40} className="text-brand-rose" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-brand-deep mb-3 text-center">
                                You're feeling {selectedEmotion.toLowerCase()}
                            </h2>
                            <p className="text-brand-deep/60 text-center max-w-sm mb-8 leading-relaxed">
                                Naming your emotion is the first step to understanding and regulating it.
                            </p>
                            <div className="flex gap-3">
                                <Button onClick={handleReset} variant="secondary">
                                    Check Again
                                </Button>
                                <Button onClick={() => navigate('/regulate')}>
                                    Back to Regulate
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default FeelingsCompass;
