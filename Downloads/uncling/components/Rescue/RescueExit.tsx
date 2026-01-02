import React from 'react';

interface RescueExitProps {
    onFinish: () => void;
    onRepeat: () => void;
    onTalk: () => void;
}

const RescueExit: React.FC<RescueExitProps> = ({ onFinish, onRepeat, onTalk }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-white border border-green-100 rounded-full flex items-center justify-center text-green-500 mb-6">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            </div>

            <h2 className="text-2xl font-light text-textPrimary mb-4">
                You’ve taken a moment for yourself.
            </h2>
            <p className="text-textSecondary mb-12 max-w-xs mx-auto leading-relaxed">
                Take a gentle breath before returning to your day. You can come back here anytime.
            </p>

            <div className="space-y-4 w-full max-w-xs">
                <button
                    onClick={onFinish}
                    className="w-full bg-slate-900 text-white font-medium py-3.5 rounded-full hover:bg-slate-800 transition-colors shadow-sm"
                >
                    I feel better (Finish)
                </button>
                <button
                    onClick={onRepeat}
                    className="w-full bg-white text-textSecondary font-medium py-3.5 rounded-full hover:text-textPrimary transition-colors border border-slate-100 hover:border-slate-200"
                >
                    Stay a little longer
                </button>
                <button
                    onClick={onTalk}
                    className="w-full bg-emerald-50 text-emerald-700 font-medium py-3.5 rounded-full hover:bg-emerald-100 transition-colors"
                >
                    I need to talk
                </button>
            </div>
        </div>
    );
};

export default RescueExit;
