import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import Layout from '../components/Layout';
import Button from '../components/Button';
import EvidenceLogModal from '../components/Coach/EvidenceLogModal';
import { ArrowLeft, Archive, Plus, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface EvidenceLog {
    id: string;
    negative_belief: string;
    counter_evidence: string;
    coherence_score: number;
    created_at: string;
}

const EvidenceLogList: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [logs, setLogs] = useState<EvidenceLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const fetchLogs = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('evidence_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setLogs(data || []);
        } catch (error) {
            console.error('Error fetching evidence logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [user]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to remove this truth?')) return;

        setDeletingId(id);
        try {
            const { error } = await supabase
                .from('evidence_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setLogs(logs.filter(log => log.id !== id));
        } catch (error) {
            console.error('Error deleting evidence log:', error);
            alert('Failed to delete. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-brand-lavender/5 to-slate-50 pb-24">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <button
                        onClick={() => navigate('/coach')}
                        className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex items-start justify-between">
                        <div>
                            <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                                Truth Bank
                            </h1>
                            <p className="text-brand-deep/60 leading-relaxed">
                                {logs.length} {logs.length === 1 ? 'truth' : 'truths'} planted
                            </p>
                        </div>
                        <Button
                            onClick={() => setShowModal(true)}
                            className="flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Plant
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-brand-lavender"></div>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 bg-brand-lavender/10 rounded-full flex items-center justify-center mb-6">
                                <Archive size={40} className="text-brand-lavender" />
                            </div>
                            <h2 className="text-xl font-serif font-bold text-brand-deep mb-3 text-center">
                                No truths planted yet
                            </h2>
                            <p className="text-brand-deep/60 text-center max-w-sm mb-8 leading-relaxed">
                                Start building your evidence against negative beliefs.
                            </p>
                            <Button onClick={() => setShowModal(true)} className="flex items-center gap-2">
                                <Plus size={18} />
                                Plant Your First Truth
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {logs.map((log, index) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: index * 0.05 }}
                                    className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 hover:border-brand-lavender/30 transition-all"
                                >
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex-1">
                                            <div className="text-xs text-slate-400 mb-2">
                                                {formatDate(log.created_at)}
                                            </div>
                                            <div className="mb-3">
                                                <div className="text-xs font-semibold text-slate-500 mb-1">Old Belief</div>
                                                <p className="text-slate-700 leading-relaxed line-through opacity-60">
                                                    {log.negative_belief}
                                                </p>
                                            </div>
                                            <div>
                                                <div className="text-xs font-semibold text-forest mb-1">The Truth</div>
                                                <p className="text-brand-deep leading-relaxed font-medium">
                                                    {log.counter_evidence}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDelete(log.id)}
                                            disabled={deletingId === log.id}
                                            className="ml-4 p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-brand-lavender to-forest rounded-full transition-all"
                                                style={{ width: `${log.coherence_score * 10}%` }}
                                            />
                                        </div>
                                        <span className="text-xs font-semibold text-slate-500">
                                            {log.coherence_score}/10
                                        </span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <EvidenceLogModal
                    onClose={() => setShowModal(false)}
                    onSaved={() => {
                        setShowModal(false);
                        fetchLogs();
                    }}
                />
            )}
        </Layout>
    );
};

export default EvidenceLogList;
