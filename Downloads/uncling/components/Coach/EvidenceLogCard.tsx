import React from 'react';
import { EvidenceLog } from '../../types';
import { Shield, CheckCircle2 } from 'lucide-react';

interface EvidenceLogCardProps {
    log: EvidenceLog;
    compact?: boolean;
}

const EvidenceLogCard: React.FC<EvidenceLogCardProps> = ({ log, compact = false }) => {
    return (
        <div className={`bg-white/70 backdrop-blur-sm border border-slate-200 rounded-xl p-4 shadow-sm ${compact ? 'max-w-xs' : 'w-full'}`}>
            <div className="flex items-start gap-3">
                <div className="mt-1 text-slate-400">
                    <Shield size={16} />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                        Old Belief
                    </p>
                    <p className="text-slate-700 italic mb-3">
                        "{log.negative_belief}"
                    </p>

                    <div className="flex items-start gap-2 bg-forest/5 p-3 rounded-lg border border-forest/10">
                        <CheckCircle2 size={16} className="text-forest mt-0.5 shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-forest uppercase tracking-wide mb-1">
                                The Evidence
                            </p>
                            <p className="text-brand-deep text-sm leading-relaxed">
                                {log.counter_evidence}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EvidenceLogCard;
