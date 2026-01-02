import React from 'react';
import Button from '../Button';

interface SessionCloseProps {
    onClose: () => void;
    onResume: () => void;
    copy?: {
        headline: string;
        body: string;
        primaryAction: string;
        secondaryAction: string;
        microCopy: string;
    };
}

const SessionClose: React.FC<SessionCloseProps> = ({ onClose, onResume, copy }) => {
    return (
        <div className="absolute inset-0 z-20 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center animate-fade-in">
            <div className="max-w-xs space-y-6">
                <h3 className="text-2xl font-light text-textPrimary leading-tight">
                    {copy?.headline || "That’s enough for now."}
                </h3>
                <p className="text-textSecondary leading-relaxed">
                    {copy?.body || "You did thoughtful work today. We can pause here and continue later if you want."}
                </p>
                <div className="w-16 h-1 my-8 bg-slate-100 rounded-full mx-auto" />

                <p className="text-sm text-textSecondary italic">
                    "{copy?.microCopy || 'No rush. No expectation.'}"
                </p>

                <div className="space-y-3 pt-8">
                    <Button onClick={onClose} className="w-full">{copy?.primaryAction || "Exit"}</Button>
                    <button
                        onClick={onResume}
                        className="w-full py-3 text-textSecondary hover:text-forest text-sm transition-colors"
                    >
                        Reflect a bit more
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SessionClose;
