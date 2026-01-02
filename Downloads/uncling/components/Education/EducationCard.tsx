import React, { useState } from 'react';
import { BookOpen, Sparkles, AlertCircle, X, ArrowRight } from 'lucide-react';
import { EducationContent } from '../../services/educationService';

interface EducationCardProps {
    content: EducationContent;
    onPrimary?: () => void;
    onSecondary?: () => void;
    onDismiss?: () => void;
}

const EducationCard: React.FC<EducationCardProps> = ({ content, onPrimary, onSecondary, onDismiss }) => {
    const [isExpanded, setIsExpanded] = useState(false);

    // Styling based on type
    const getStyles = () => {
        switch (content.type) {
            case 'edge_state':
                return "bg-stone-50 border-stone-200 text-stone-800";
            case 'nudge':
                return "bg-indigo-50/50 border-indigo-100 text-slate-800";
            default: // insight
                return "bg-white border-slate-100 shadow-sm text-slate-800";
        }
    };

    const getIcon = () => {
        switch (content.type) {
            case 'edge_state': return <AlertCircle size={18} className="text-stone-400" />;
            case 'nudge': return <Sparkles size={18} className="text-indigo-400" />;
            default: return <BookOpen size={18} className="text-slate-400" />;
        }
    };

    return (
        <div className={`relative w-full rounded-xl border p-5 transition-all duration-300 animate-fade-in ${getStyles()}`}>

            {/* Dismiss optional */}
            {onDismiss && (
                <button
                    onClick={onDismiss}
                    className="absolute top-3 right-3 p-1 rounded-full hover:bg-black/5 text-slate-400 transition-colors"
                >
                    <X size={14} />
                </button>
            )}

            <div className="flex gap-4">
                <div className="mt-0.5 shrink-0">{getIcon()}</div>

                <div className="flex-1 space-y-2">
                    <h3 className="font-medium text-sm md:text-base leading-tight">
                        {content.headline}
                    </h3>

                    <div className={`text-sm text-slate-600 leading-relaxed transition-all ${isExpanded ? '' : 'line-clamp-3'}`}>
                        {content.body}
                    </div>

                    {/* Actions */}
                    <div className="pt-3 flex items-center gap-3">
                        {content.primaryAction && (
                            <button
                                onClick={onPrimary}
                                className="text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded-md bg-white border border-black/5 shadow-sm hover:bg-slate-50 transition-colors"
                            >
                                {content.primaryAction}
                            </button>
                        )}
                        {content.secondaryAction && (
                            <button
                                onClick={onSecondary}
                                className="text-xs text-slate-500 hover:text-slate-700 transition-colors"
                            >
                                {content.secondaryAction}
                            </button>
                        )}
                    </div>

                    {content.microCopy && (
                        <p className="text-[10px] text-slate-400 italic pt-1">
                            {content.microCopy}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EducationCard;
