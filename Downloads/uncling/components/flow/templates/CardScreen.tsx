
import React from 'react';
import { FlowStep } from '../types';
import GlassCard from '../../ui/GlassCard';
import Button from '../../Button';

interface Props {
    step: FlowStep;
    onNext: () => void;
}

const CardScreen: React.FC<Props> = ({ step, onNext }) => {
    return (
        <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <GlassCard className="w-full max-w-lg p-8 sm:p-12 mb-10 border-t-4 border-t-brand-lavender/50" hoverEffect={false}>
                {step.heading && (
                    <h1 className="text-3xl font-heading font-bold text-brand-deep mb-6 drop-shadow-sm">
                        {step.heading}
                    </h1>
                )}

                <div className="space-y-4 text-brand-deep/80 text-lg leading-relaxed font-medium">
                    {step.body?.split('\n').map((line, i) => (
                        line.trim().startsWith('•') ?
                            <li key={i} className="list-none pl-4 text-left relative before:content-[''] before:absolute before:left-0 before:top-2.5 before:w-1.5 before:h-1.5 before:bg-brand-lavender before:rounded-full">{line.substring(1).trim()}</li> :
                            <p key={i}>{line}</p>
                    ))}
                </div>

                {step.cta && (
                    <div className="mt-10">
                        <Button onClick={onNext} className="w-full sm:w-auto shadow-xl shadow-brand-lavender/20 hover:shadow-brand-lavender/40 transition-shadow duration-300">
                            {step.cta}
                        </Button>
                    </div>
                )}
                {step.secondaryCta && (
                    <div className="mt-4">
                        <Button onClick={onNext} variant="ghost" className="text-sm text-brand-deep/60 hover:text-brand-deep">
                            {step.secondaryCta}
                        </Button>
                    </div>
                )}
            </GlassCard>
        </div>
    );
};

export default CardScreen;
