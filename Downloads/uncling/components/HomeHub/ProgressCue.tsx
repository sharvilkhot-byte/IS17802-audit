import React from 'react';
import { ArrowRight } from 'lucide-react';

interface ProgressCueProps {
    onClick: () => void;
}

const ProgressCue: React.FC<ProgressCueProps> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="w-full max-w-md mt-12 group flex items-center justify-between p-4 rounded-xl hover:bg-slate-50 transition-colors duration-300"
        >
            <div className="flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-moss/50 group-hover:bg-moss transition-colors" />
                <span className="text-textSecondary text-sm">Your patterns and growth are unfolding</span>
            </div>
            <ArrowRight size={16} className="text-slate-300 group-hover:text-textSecondary transition-colors" />
        </button>
    );
};

export default ProgressCue;
