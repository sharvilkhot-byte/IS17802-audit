import React from 'react';
import { ShieldAlert } from 'lucide-react';

interface RescueEntryProps {
    onStart: () => void;
}

const RescueEntry: React.FC<RescueEntryProps> = ({ onStart }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center px-6 animate-fade-in relative z-10">
            {/* Soft background shape */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-safe/50 rounded-full blur-3xl -z-10 animate-pulse-slow" />

            <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-moss mb-8 animate-bounce-gentle">
                <ShieldAlert size={32} />
            </div>

            <h1 className="text-3xl font-light text-textPrimary mb-4 leading-tight">
                You’re safe here.
            </h1>
            <p className="text-textSecondary text-lg mb-12 max-w-xs leading-relaxed">
                Let’s take a moment to slow things down. No pressure, no analysis.
            </p>

            <button
                onClick={onStart}
                className="w-full max-w-xs bg-safe hover:bg-safe text-white font-medium py-4 rounded-full shadow-md hover:shadow-lg transition-all transform hover:-translate-y-1 active:scale-95 text-lg"
            >
                Start
            </button>
        </div>
    );
};

export default RescueEntry;
