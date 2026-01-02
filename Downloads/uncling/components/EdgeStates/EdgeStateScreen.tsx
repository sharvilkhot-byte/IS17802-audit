import React from 'react';
import { EdgeStateType, edgeStateContent } from '../../services/edgeStateService';

interface EdgeStateScreenProps {
    type: EdgeStateType;
    onOptionSelect: (action: string) => void;
}

const EdgeStateScreen: React.FC<EdgeStateScreenProps> = ({ type, onOptionSelect }) => {
    if (!type || !edgeStateContent[type]) return null;

    const content = edgeStateContent[type];

    return (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-8 animate-fade-in">
            <div className="max-w-md w-full text-center space-y-8">

                {/* Minimal Content */}
                <div className="space-y-4">
                    <h2 className="text-2xl font-serif text-slate-800 leading-tight">
                        {content.title}
                    </h2>
                    <p className="text-slate-500 leading-relaxed text-lg">
                        {content.body}
                    </p>
                </div>

                {/* Soft Options */}
                <div className="space-y-3 pt-8">
                    {content.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => onOptionSelect(opt.action)}
                            className="w-full py-4 text-slate-600 border-b border-slate-100 hover:bg-slate-50 transition-colors last:border-0 font-medium"
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default EdgeStateScreen;
