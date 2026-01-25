
import React from 'react';
import { FlowStep } from '../types';

interface Props {
    step: FlowStep;
    onNext: (data?: any) => void;
    data: Record<string, any>;
}

const QuestionScreen: React.FC<Props> = ({ step, onNext }) => {
    const handleOptionClick = (value: any) => {
        onNext(value);
    };

    return (
        <div className="flex flex-col items-center justify-center h-full p-6 animate-fade-in max-w-xl mx-auto">
            {step.context && (
                <p className="text-brand-deep/60 font-medium mb-4 uppercase tracking-wider text-xs">
                    {step.context}
                </p>
            )}

            <h2 className="text-2xl sm:text-3xl font-heading font-medium text-brand-deep text-center mb-12 leading-snug">
                {step.heading || step.body}
            </h2>

            <div className="w-full space-y-4">
                {step.options?.map((option, i) => (
                    <button
                        key={i}
                        onClick={() => handleOptionClick(option.value)}
                        className="w-full p-6 text-left bg-white/60 hover:bg-white backdrop-blur-sm border border-brand-rose/20 hover:border-brand-lavender/50 rounded-2xl transition-all duration-200 group shadow-sm hover:shadow-md"
                    >
                        <span className="text-lg font-medium text-brand-deep group-hover:text-brand-deep/80 transition-colors">
                            {option.label}
                        </span>
                    </button>
                ))}
            </div>

            {step.footer && (
                <p className="mt-8 text-brand-deep/50 text-sm font-medium italic">
                    {step.footer}
                </p>
            )}
        </div>
    );
};

export default QuestionScreen;
