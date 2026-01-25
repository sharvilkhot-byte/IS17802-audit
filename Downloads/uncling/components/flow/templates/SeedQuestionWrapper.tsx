import React from 'react';
import { FlowStep } from '../types';
import SeedQuestionScreen from '../../onboarding/SeedQuestionScreen';

interface Props {
    step: FlowStep;
    onNext: (data?: any) => void;
}

const SeedQuestionWrapper: React.FC<Props> = ({ step, onNext }) => {

    // Map generic options to SeedOptions
    const seedOptions = step.options?.map((opt, index) => {
        // We can infer seed types from values or just cycle them if not specified
        const seedTypes = ['vine', 'stone', 'oak', 'thistle', 'shell', 'reed'];
        const type = (seedTypes[index % seedTypes.length] as any);

        return {
            id: String(opt.value),
            type: type,
            label: opt.label,
            description: (opt as any).description || ""
        };
    }) || [];

    return (
        <SeedQuestionScreen
            title={step.heading || "Reflect"}
            question={step.body || ""}
            options={seedOptions}
            answerKey={step.variableName as any || "temp"}
            // We override the internal navigation of SeedQuestionScreen by passing a dummy route
            // and intercepting the "onNext" logic via a prop if possible, 
            // BUT SeedQuestionScreen currently uses `useNavigate` and internal state.
            // We need to slightly refactor SeedQuestionScreen OR mock the behavior here.

            // Actually, best approach is to pass a custom `onComplete` prop to SeedQuestionScreen
            // But first we must update SeedQuestionScreen to support it.
            // For now, let's pass a dummy nextRoute and rely on a Refactor of SeedQuestionScreen.
            nextRoute="#"
            onCustomNext={(value) => onNext(value)}
            bgWeather="sunny"
        />
    );
};

export default SeedQuestionWrapper;
