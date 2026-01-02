import React from 'react';

interface EmotionalTemperatureProps {
    minimized?: boolean;
}

const EmotionalTemperature: React.FC<EmotionalTemperatureProps> = ({ minimized = false }) => {
    // In a real implementation, this would pull from today's check-in or latest sentiment analysis.
    // For MVP, we'll keep it as a subtle static prompt that could be interactive.

    if (minimized) return null;

    return (
        <div className="w-full max-w-sm mb-6 animate-fade-in-down">
            <div className="bg-white/50 backdrop-blur-sm border border-slate-100 rounded-full px-4 py-2 flex items-center justify-center gap-2 shadow-sm mx-auto cursor-pointer hover:bg-white/80 transition-all duration-300">
                <span className="text-xl">🌿</span>
                <span className="text-textSecondary text-sm font-medium">Feeling calm today</span>
            </div>
        </div>
    );
};

export default EmotionalTemperature;
