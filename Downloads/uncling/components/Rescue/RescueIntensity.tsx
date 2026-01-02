import React from 'react';

type IntensityLevel = 'mild' | 'moderate' | 'high';

interface RescueIntensityProps {
    onSelect: (level: IntensityLevel) => void;
}

const RescueIntensity: React.FC<RescueIntensityProps> = ({ onSelect }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full px-6 animate-fade-in text-center">
            <h2 className="text-2xl font-light text-textPrimary mb-8">
                How does it feel right now?
            </h2>

            <div className="w-full max-w-sm space-y-4">
                <button
                    onClick={() => onSelect('mild')}
                    className="w-full p-4 bg-white hover:bg-blue-50/50 border border-slate-100 rounded-2xl text-left transition-all active:scale-98 group"
                >
                    <span className="block text-lg font-medium text-textPrimary group-hover:text-forest mb-1">Unsettled</span>
                    <span className="block text-sm text-textSecondary">I feel a little uneasy or restless.</span>
                </button>

                <button
                    onClick={() => onSelect('moderate')}
                    className="w-full p-4 bg-white hover:bg-orange-50/50 border border-slate-100 rounded-2xl text-left transition-all active:scale-98 group"
                >
                    <span className="block text-lg font-medium text-textPrimary group-hover:text-orange-500 mb-1">Tense</span>
                    <span className="block text-sm text-textSecondary">My body feels tight or anxious.</span>
                </button>

                <button
                    onClick={() => onSelect('high')}
                    className="w-full p-4 bg-white hover:bg-red-50/50 border border-slate-100 rounded-2xl text-left transition-all active:scale-98 group"
                >
                    <span className="block text-lg font-medium text-textPrimary group-hover:text-red-500 mb-1">Overwhelmed</span>
                    <span className="block text-sm text-textSecondary">I feel panicky or unsafe.</span>
                </button>
            </div>
        </div>
    );
};

export default RescueIntensity;
