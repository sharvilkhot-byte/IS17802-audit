import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

interface PatternCardProps {
    pattern: string; // e.g. "Gentle Noticing"
    insight: string; // e.g. "It seems you pause to check for safety..."
    onDismiss: () => void;
    onExplore: () => void;
}

const PatternCard: React.FC<PatternCardProps> = ({ pattern, onDismiss, onExplore }) => {
    return (
        <div className="mx-4 my-6 bg-indigo-50/50 border border-indigo-100 rounded-xl p-6 shadow-sm animate-fade-in relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-4 -mr-4 -mt-4 opacity-5 pointer-events-none">
                <Sparkles size={100} />
            </div>

            <div className="flex items-start gap-4 relative z-10 text-left">
                <div className="mt-1 p-2 bg-indigo-100 rounded-full text-indigo-600 flex-shrink-0">
                    <Sparkles size={18} />
                </div>
                <div className="flex-1 space-y-2">
                    <h3 className="text-base font-semibold text-slate-800">I notice this keeps showing up.</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                        Around <span className="font-medium text-slate-800">{pattern}</span>, it seems similar reactions appear. We can explore this together — only if you want.
                    </p>
                    {/* Insight is kept hidden/implied for the explore phase or can be part of the pattern text */}
                </div>
            </div>

            <div className="flex items-center gap-3 mt-4 pl-[3.25rem]">
                <button
                    onClick={onExplore}
                    className="px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                    Explore
                    <ArrowRight size={14} />
                </button>
                <button
                    onClick={onDismiss}
                    className="px-4 py-2 text-slate-500 text-sm font-medium hover:text-slate-700 transition-colors"
                >
                    Skip
                </button>
            </div>
            <div className="mt-2 pl-[3.25rem] text-[10px] text-slate-400 italic">
                You decide if and when.
            </div>
        </div>
    );
};

export default PatternCard;
