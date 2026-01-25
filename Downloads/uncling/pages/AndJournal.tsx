import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ArrowLeft, BookOpen, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface JournalEntry {
    id: string;
    feeling: string;
    fact: string;
    created_at: string;
}

const AndJournal: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [feeling, setFeeling] = useState('');
    const [fact, setFact] = useState('');
    const [saving, setSaving] = useState(false);
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [showForm, setShowForm] = useState(true);

    useEffect(() => {
        fetchEntries();
    }, [user]);

    const fetchEntries = async () => {
        if (!user) return;

        try {
            const { data, error } = await supabase
                .from('and_journal_entries')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false })
                .limit(10);

            if (error) {
                // Table might not exist yet - that's okay
                console.log('Journal table not found, will create on first save');
                return;
            }
            setEntries(data || []);
        } catch (error) {
            console.error('Error fetching entries:', error);
        }
    };

    const handleSave = async () => {
        if (!user || !feeling.trim() || !fact.trim()) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('and_journal_entries')
                .insert({
                    user_id: user.id,
                    feeling: feeling.trim(),
                    fact: fact.trim()
                });

            if (error) throw error;

            setFeeling('');
            setFact('');
            setShowForm(false);
            fetchEntries();
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

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
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                                AND Journal
                            </h1>
                            <p className="text-brand-deep/60 leading-relaxed">
                                Integrate your story with compassion
                            </p>
                        </div>
                        {!showForm && (
                            <Button
                                onClick={() => setShowForm(true)}
                                className="flex items-center gap-2"
                            >
                                <Plus size={18} />
                                New
                            </Button>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6"
                        >
                            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200">
                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-slate-400" />
                                        <h3 className="font-heading font-bold text-brand-deep">
                                            I feel...
                                        </h3>
                                    </div>
                                    <p className="text-sm text-brand-deep/60 mb-3">
                                        Validate your emotion without judgment
                                    </p>
                                    <textarea
                                        value={feeling}
                                        onChange={(e) => setFeeling(e.target.value)}
                                        placeholder="I feel overwhelmed and anxious..."
                                        className="w-full h-32 p-4 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-rose focus:border-transparent outline-none resize-none"
                                    />
                                </div>

                                <div className="mb-6">
                                    <div className="flex items-center gap-2 mb-3">
                                        <div className="w-2 h-2 rounded-full bg-forest" />
                                        <h3 className="font-heading font-bold text-forest">
                                            AND I know...
                                        </h3>
                                    </div>
                                    <p className="text-sm text-brand-deep/60 mb-3">
                                        Integrate the facts of your story
                                    </p>
                                    <textarea
                                        value={fact}
                                        onChange={(e) => setFact(e.target.value)}
                                        placeholder="AND I know I've handled difficult things before..."
                                        className="w-full h-32 p-4 bg-forest/5 rounded-xl border border-forest/20 focus:ring-2 focus:ring-forest focus:border-transparent outline-none resize-none"
                                    />
                                </div>

                                <div className="bg-brand-rose/5 rounded-xl p-4 mb-6 border border-brand-rose/20">
                                    <p className="text-sm text-brand-deep/70 leading-relaxed">
                                        <span className="font-semibold">The "AND" is key:</span> It allows both your feelings and the facts to be true at the same time. This is how we build coherent narratives.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    {entries.length > 0 && (
                                        <Button
                                            onClick={() => setShowForm(false)}
                                            variant="secondary"
                                            className="flex-1"
                                        >
                                            Cancel
                                        </Button>
                                    )}
                                    <Button
                                        onClick={handleSave}
                                        disabled={!feeling.trim() || !fact.trim() || saving}
                                        className="flex-1"
                                    >
                                        {saving ? 'Saving...' : 'Save Entry'}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* Previous Entries */}
                    {entries.length > 0 && (
                        <div>
                            <h3 className="font-heading font-bold text-brand-deep mb-4">
                                Previous Entries
                            </h3>
                            <div className="space-y-4">
                                {entries.map((entry, index) => (
                                    <motion.div
                                        key={entry.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50"
                                    >
                                        <div className="text-xs text-slate-400 mb-3">
                                            {formatDate(entry.created_at)}
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                                                <span className="text-xs font-semibold text-slate-500">I feel...</span>
                                            </div>
                                            <p className="text-brand-deep/80 leading-relaxed pl-3.5">
                                                {entry.feeling}
                                            </p>
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-2">
                                                <div className="w-1.5 h-1.5 rounded-full bg-forest" />
                                                <span className="text-xs font-semibold text-forest">AND I know...</span>
                                            </div>
                                            <p className="text-brand-deep leading-relaxed font-medium pl-3.5">
                                                {entry.fact}
                                            </p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {entries.length === 0 && !showForm && (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 bg-brand-rose/10 rounded-full flex items-center justify-center mb-6">
                                <BookOpen size={40} className="text-brand-rose" />
                            </div>
                            <h2 className="text-xl font-serif font-bold text-brand-deep mb-3 text-center">
                                No entries yet
                            </h2>
                            <p className="text-brand-deep/60 text-center max-w-sm mb-8 leading-relaxed">
                                Start integrating your story with the AND journal
                            </p>
                            <Button onClick={() => setShowForm(true)} className="flex items-center gap-2">
                                <Plus size={18} />
                                Write First Entry
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default AndJournal;
