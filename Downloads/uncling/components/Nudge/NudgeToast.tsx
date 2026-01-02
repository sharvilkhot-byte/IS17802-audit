import React, { useEffect, useState } from 'react';
import { X, Sparkles } from 'lucide-react';

interface NudgeToastProps {
    message: string;
    type: 'observation' | 'pattern';
    onDismiss: () => void;
    onAction?: () => void;
}

const NudgeToast: React.FC<NudgeToastProps> = ({ message, type, onDismiss, onAction }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Slide up animation
        setTimeout(() => setVisible(true), 100);
    }, []);

    const handleDismiss = () => {
        setVisible(false);
        setTimeout(onDismiss, 300); // Wait for animation
    };

    return (
        <div
            className={`
                fixed bottom-24 left-4 right-4 md:left-auto md:right-8 md:w-96 
                bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-4 
                z-50 transition-all duration-500 ease-out transform
                ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}
            `}
        >
            <div className="flex items-start gap-3">
                <div className="mt-1 text-forest bg-calm p-1.5 rounded-full">
                    <Sparkles size={16} />
                </div>

                <div className="flex-1">
                    <p className="text-sm text-textPrimary leading-relaxed">
                        {message}
                    </p>

                    {onAction && (
                        <button
                            onClick={onAction}
                            className="mt-2 text-xs font-medium text-forest hover:text-forest transition-colors"
                        >
                            Explore this
                        </button>
                    )}
                </div>

                <button
                    onClick={handleDismiss}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={18} />
                </button>
            </div>
        </div>
    );
};

export default NudgeToast;
