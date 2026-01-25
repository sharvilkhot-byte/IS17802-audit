import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { InternalState } from '../types';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ArrowLeft, Users, Sparkles, Shield, AlertCircle, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckIn {
    id: string;
    state: InternalState;
    created_at: string;
    note?: string;
}

const PARTS = [
    {
        state: 'Anxious' as InternalState,
        icon: AlertCircle,
        color: 'amber',
        title: 'Anxious Part',
        description: 'Seeking connection and reassurance',
        prompt: 'What is this part worried about?',
        affirmation: 'Your nervous system is trying to connect. You are safe.'
    },
    {
        state: 'Secure' as InternalState,
        icon: Sparkles,
        color: 'forest',
        title: 'Secure Self',
        description: 'Grounded and present',
        prompt: 'What helped you feel grounded today?',
        affirmation: 'Leading from your Self. Well done.'
    },
    {
        state: 'Avoidant' as InternalState,
        icon: Shield,
        color: 'slate',
        title: 'Avoidant Part',
        description: 'Protecting through distance',
        prompt: 'What does this part need space from?',
        affirmation: 'Your nervous system needs space. You are allowed to pause.'
    }
];

const PartsCheckIn: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [step, setStep] = useState<'select' | 'reflect' | 'complete'>('select');
    const [selectedPart, setSelectedPart] = useState<typeof PARTS[0] | null>(null);
    const [reflection, setReflection] = useState('');
    const [saving, setSaving] = useState(false);
    const [recentCheckIns, setRecentCheckIns] = useState<CheckIn[]>([]);

    useEffect(() => {
        fetchRecentCheckIns();
    }, [user]);

    const fetchRecentCheckIns = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('daily_check_ins')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(7);

            if (error) throw error;
            setRecentCheckIns(data || []);
        } catch (error) {
            console.error('Error fetching check-ins:', error);
        }
    };

    const handleSelectPart = (part: typeof PARTS[0]) => {
        setSelectedPart(part);
        setStep('reflect');
    };

    const handleSave = async () => {
        if (!user || !selectedPart) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('daily_check_ins')
                .insert({
                    user_id: user.id,
                    state: selectedPart.state,
                    note: reflection.trim() || null
                });

            if (error) throw error;
            setStep('complete');
            fetchRecentCheckIns();
        } catch (error) {
            console.error('Error saving check-in:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        setStep('select');
        setSelectedPart(null);
        setReflection('');
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return 'Today';
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const getPartColor = (state: InternalState) => {
        const part = PARTS.find(p => p.state === state);
        return part?.color || 'slate';
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-forest/5 to-slate-50 pb-24">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <button
                        onClick={() => navigate('/tracker')}
                        className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                        Parts Check-In
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Who is driving today?
                    </p>
                </div>

                {/* Content */}
                <div className="px-6">
                    {step === 'select' && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4"
                        >
                            <p className="text-center text-brand-deep/60 mb-6">
                                Notice which part is present right now
                            </p>
                            {PARTS.map((part, index) => {
                                const Icon = part.icon;
                                return (
                                    <motion.button
                                        key={part.state}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        onClick={() => handleSelectPart(part)}
                                        className={`
                                            w-full p-6 rounded-2xl border-2 transition-all text-left
                                            ${part.color === 'forest'
                                                ? 'bg-gradient-to-br from-forest/10 to-forest/5 border-forest/30 hover:border-forest/50'
                                                : part.color === 'amber'
                                                    ? 'bg-gradient-to-br from-amber-50 to-amber-50/50 border-amber-200 hover:border-amber-300'
                                                    : 'bg-white/60 border-slate-200 hover:border-slate-300'
                                            }
                                            hover:shadow-lg
                                        `}
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className={`
                                                w-12 h-12 rounded-xl flex items-center justify-center
                                                ${part.color === 'forest' ? 'bg-forest text-white' :
                                                    part.color === 'amber' ? 'bg-amber-100 text-amber-600' :
                                                        'bg-slate-100 text-slate-500'}
                                            `}>
                                                <Icon size={24} />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-heading font-bold text-brand-deep mb-1">
                                                    {part.title}
                                                </h3>
                                                <p className="text-sm text-brand-deep/60">
                                                    {part.description}
                                                </p>
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}

                            {/* Recent Check-Ins */}
                            {recentCheckIns.length > 0 && (
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Calendar size={16} className="text-brand-deep/60" />
                                        <h3 className="font-heading font-bold text-brand-deep">
                                            Recent Check-Ins
                                        </h3>
                                    </div>
                                    <div className="space-y-2">
                                        {recentCheckIns.map((checkIn) => (
                                            <div key={checkIn.id} className="flex items-center justify-between py-2">
                                                <span className="text-sm text-brand-deep/60">
                                                    {formatDate(checkIn.created_at)}
                                                </span>
                                                <span className={`
                                                    px-3 py-1 rounded-full text-xs font-semibold
                                                    ${getPartColor(checkIn.state) === 'forest' ? 'bg-forest/10 text-forest' :
                                                        getPartColor(checkIn.state) === 'amber' ? 'bg-amber-100 text-amber-700' :
                                                            'bg-slate-100 text-slate-600'}
                                                `}>
                                                    {checkIn.state}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    )}

                    {step === 'reflect' && selectedPart && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-6"
                        >
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                                <div className="flex items-center gap-3 mb-4">
                                    {React.createElement(selectedPart.icon, {
                                        size: 24,
                                        className: selectedPart.color === 'forest' ? 'text-forest' :
                                            selectedPart.color === 'amber' ? 'text-amber-600' :
                                                'text-slate-500'
                                    })}
                                    <h3 className="font-heading font-bold text-brand-deep">
                                        {selectedPart.title}
                                    </h3>
                                </div>
                                <p className="text-brand-deep/60 leading-relaxed">
                                    {selectedPart.affirmation}
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-brand-deep mb-2">
                                    {selectedPart.prompt}
                                </label>
                                <textarea
                                    value={reflection}
                                    onChange={(e) => setReflection(e.target.value)}
                                    placeholder="Optional reflection..."
                                    className="w-full h-32 p-4 bg-white/60 rounded-xl border border-slate-200 focus:ring-2 focus:ring-forest focus:border-transparent outline-none resize-none"
                                />
                                <p className="text-xs text-brand-deep/50 mt-2">
                                    You can skip this and just check in
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <Button
                                    onClick={handleReset}
                                    variant="secondary"
                                    className="flex-1"
                                >
                                    Back
                                </Button>
                                <Button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1"
                                >
                                    {saving ? 'Saving...' : 'Complete Check-In'}
                                </Button>
                            </div>
                        </motion.div>
                    )}

                    {step === 'complete' && selectedPart && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center justify-center py-12"
                        >
                            <div className="w-20 h-20 bg-forest/10 rounded-full flex items-center justify-center mb-6">
                                <Sparkles size={40} className="text-forest" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-brand-deep mb-3 text-center">
                                Check-In Complete
                            </h2>
                            <p className="text-brand-deep/60 text-center max-w-sm mb-8 leading-relaxed">
                                Awareness is the first step. You're building the muscle of self-observation.
                            </p>
                            <div className="flex gap-3">
                                <Button onClick={handleReset} variant="secondary">
                                    Check In Again
                                </Button>
                                <Button onClick={() => navigate('/tracker')}>
                                    Back to Internal Family
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default PartsCheckIn;
