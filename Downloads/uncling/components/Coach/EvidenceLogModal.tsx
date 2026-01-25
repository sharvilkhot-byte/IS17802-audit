import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import Button from '../Button';
import { X } from 'lucide-react';

interface EvidenceLogModalProps {
    onClose: () => void;
    onSaved?: () => void;
    initialBelief?: string;
}

const EvidenceLogModal: React.FC<EvidenceLogModalProps> = ({ onClose, onSaved, initialBelief = '' }) => {
    const { user } = useAuth();
    const [negativeBelief, setNegativeBelief] = useState(initialBelief);
    const [counterEvidence, setCounterEvidence] = useState('');
    const [coherenceScore, setCoherenceScore] = useState(5);
    const [saving, setSaving] = useState(false);

    const handleSave = async () => {
        if (!user || !negativeBelief.trim() || !counterEvidence.trim()) return;

        setSaving(true);
        try {
            const { error } = await supabase
                .from('evidence_logs')
                .insert({
                    user_id: user.id,
                    negative_belief: negativeBelief.trim(),
                    counter_evidence: counterEvidence.trim(),
                    coherence_score: coherenceScore
                });

            if (error) throw error;

            if (onSaved) onSaved();
            onClose();
        } catch (error) {
            console.error('Error saving evidence:', error);
            alert('Failed to save. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 relative">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={24} />
                </button>

                <h2 className="text-2xl font-serif text-brand-deep mb-2">Plant a Truth</h2>
                <p className="text-sm text-slate-500 mb-6">Root a new belief in your inner garden.</p>

                {/* Negative Belief */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        Old Belief
                    </label>
                    <textarea
                        value={negativeBelief}
                        onChange={(e) => setNegativeBelief(e.target.value)}
                        placeholder="I am too much..."
                        className="w-full h-20 p-3 bg-slate-50 rounded-xl border border-slate-200 focus:ring-2 focus:ring-forest focus:border-transparent outline-none resize-none text-sm"
                    />
                </div>

                {/* Counter Evidence */}
                <div className="mb-6">
                    <label className="block text-sm font-semibold text-forest mb-2">
                        The Evidence (The Truth)
                    </label>
                    <textarea
                        value={counterEvidence}
                        onChange={(e) => setCounterEvidence(e.target.value)}
                        placeholder="My friend thanked me yesterday for listening..."
                        className="w-full h-24 p-3 bg-forest/5 rounded-xl border border-forest/20 focus:ring-2 focus:ring-forest focus:border-transparent outline-none resize-none text-sm"
                    />
                </div>

                {/* Coherence Score */}
                <div className="mb-8">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">
                        How true does this feel? ({coherenceScore}/10)
                    </label>
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={coherenceScore}
                        onChange={(e) => setCoherenceScore(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-forest"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>Intellectually</span>
                        <span>Viscerally</span>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <Button
                        onClick={handleSave}
                        disabled={!negativeBelief.trim() || !counterEvidence.trim() || saving}
                        className="flex-1"
                    >
                        {saving ? 'Planting...' : 'Plant This Truth'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default EvidenceLogModal;
