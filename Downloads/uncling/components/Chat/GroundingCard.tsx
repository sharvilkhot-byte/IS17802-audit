import React from 'react';
import { ShieldAlert, Wind } from 'lucide-react';

interface GroundingCardProps {
    onAccept: () => void; // "Pause and breathe"
    onDecline: () => void; // "Continue"
}

const GroundingCard: React.FC<GroundingCardProps> = ({ onAccept, onDecline }) => {
    return (
        <div className="w-full mx-auto max-w-sm mt-4 mb-6">
            <div className="bg-white/90 backdrop-blur-md border border-orange-100 rounded-2xl p-6 shadow-lg animate-slide-up transform transition-all">
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 shrink-0">
                        <Wind size={20} />
                    </div>
                    <div>
                        <h3 className="text-lg font-medium text-textPrimary mb-1">Let's pause for a moment.</h3>
                        <p className="text-textSecondary text-sm leading-relaxed">
                            It seems like things feel intense right now. Would you like to take a slow breath with me?
                        </p>
                    </div>
                </div>

                <div className="flex gap-3 mt-2">
                    <button
                        onClick={onAccept}
                        className="flex-1 bg-orange-50 hover:bg-orange-100 text-orange-700 text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                        Pause & Breathe
                    </button>
                    <button
                        onClick={onDecline}
                        className="flex-1 bg-transparent hover:bg-slate-50 text-textSecondary text-sm font-medium py-2.5 rounded-xl transition-colors"
                    >
                        I'm okay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GroundingCard;
