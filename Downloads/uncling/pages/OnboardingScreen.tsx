import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import FlowEngine from '../components/flow/FlowEngine';
import { ONBOARDING_FLOW_INITIAL, ONBOARDING_FLOWS_SPECIFIC } from '../config/module1';
import { calculateAttachmentStyle } from '../utils/attachmentLogic';

const OnboardingScreen: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [phase, setPhase] = React.useState<'initial' | 'specific'>('initial');
    const [detectedStyle, setDetectedStyle] = React.useState<string | null>(null);
    const [combinedData, setCombinedData] = React.useState<Record<string, any>>({});

    const handleInitialComplete = (data: Record<string, any>) => {
        console.log("Phase 1 Complete:", data);
        const style = calculateAttachmentStyle(data);
        console.log("Detected Style:", style);

        setCombinedData(prev => ({ ...prev, ...data }));
        setDetectedStyle(style);
        setPhase('specific');
    };

    const handleSpecificComplete = (data: Record<string, any>) => {
        console.log("Phase 2 Complete:", data);
        const finalData = { ...combinedData, ...data };

        // Navigate to result with full context
        navigate('/onboarding/result', {
            state: {
                result: {
                    style: detectedStyle,
                    scores: finalData
                }
            }
        });
    };

    const currentFlow = phase === 'initial'
        ? ONBOARDING_FLOW_INITIAL
        : (detectedStyle && ONBOARDING_FLOWS_SPECIFIC[detectedStyle]) || ONBOARDING_FLOWS_SPECIFIC['secure']; // Fallback

    return (
        <Layout>
            <div className="flex-1 h-screen w-full">
                <FlowEngine
                    key={phase} // Forces remount on phase change to reset internal index
                    flow={currentFlow || []}
                    onComplete={phase === 'initial' ? handleInitialComplete : handleSpecificComplete}
                    initialStepId={phase === 'initial' ? undefined : undefined}
                />
            </div>
        </Layout>
    );
};

export default OnboardingScreen;
