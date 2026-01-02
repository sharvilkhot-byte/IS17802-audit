import React, { useEffect } from 'react';

interface RescueValidationProps {
    onNext: () => void;
}

const RescueValidation: React.FC<RescueValidationProps> = ({ onNext }) => {

    // Auto-advance after reading
    useEffect(() => {
        const timer = setTimeout(onNext, 4000);
        return () => clearTimeout(timer);
    }, [onNext]);

    return (
        <div className="flex flex-col items-center justify-center h-full px-8 text-center animate-fade-in relative">
            <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-48 bg-white/50 backdrop-blur-sm border border-slate-100 shadow-md rounded-2xl flex items-center justify-center p-6">
                <div>
                    <p className="text-xl font-light text-textPrimary mb-2 leading-relaxed">
                        "It makes sense that you feel this way."
                    </p>
                    <div className="w-12 h-1 bg-safe rounded-full mx-auto mt-4 mb-4" />
                    <p className="text-sm text-textSecondary">
                        Your feelings are real and valid.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RescueValidation;
