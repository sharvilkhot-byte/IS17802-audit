import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { ReflectionState } from '../types';
import Pass1EmotionalContext from '../components/onboarding/Pass1EmotionalContext';
import Pass2ResponsePattern from '../components/onboarding/Pass2ResponsePattern';
import Pass3RelationalMeaning from '../components/onboarding/Pass3RelationalMeaning';
import Pass4SelfTalk from '../components/onboarding/Pass4SelfTalk';
import Pass5Readiness from '../components/onboarding/Pass5Readiness';
import { calculateAndSaveReflection } from '../services/onboardingService';

const GuidedReflection: React.FC = () => {
    const { user, updateUserProfile } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();
    const [currentPass, setCurrentPass] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial State
    const [answers, setAnswers] = useState<ReflectionState>({
        emotionalPatterns: [],
        intensity: '',
        timingContext: [],
        pass1Feeling: '',

        firstImpulse: '',
        worseningFactors: [],
        regulationDirection: '',
        aftermathPattern: '',
        pass2Feeling: '',

        closenessSignal: '',
        distanceInterpretation: '',
        needsExpression: '',
        conflictSafety: '',
        pass3Feeling: '',

        innerVoice: '',
        copingTools: [],
        recoverySpeed: '',
        capacityNeeds: '',

        challengeConsent: '',
        pass5Feeling: ''
    });

    const handleNext = () => {
        if (currentPass < 5) {
            window.scrollTo(0, 0);
            setCurrentPass(prev => prev + 1);
        } else {
            handleSubmit();
        }
    };

    const handleBack = () => {
        if (currentPass > 1) {
            window.scrollTo(0, 0);
            setCurrentPass(prev => prev - 1);
        }
    };

    const updateAnswers = (updates: Partial<ReflectionState>) => {
        setAnswers(prev => ({ ...prev, ...updates }));
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            await calculateAndSaveReflection(user!.id, answers, updateUserProfile);
            // Navigate to Result Reveal, passing the answers for content generation
            navigate('/onboarding/result', { state: { answers }, replace: true });
        } catch (error) {
            console.error('Check-in failed', error);
            setIsSubmitting(false);
        }
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col h-full bg-slate-50 relative overflow-hidden">
                {/* Progress Bar */}
                <div className="fixed top-0 left-0 right-0 h-1 bg-slate-200 z-50">
                    <div
                        className="h-full bg-moss transition-all duration-500 ease-out"
                        style={{ width: `${(currentPass / 5) * 100}%` }}
                    />
                </div>

                <div className="flex-1 overflow-y-auto pb-24 animate-fade-in">
                    {currentPass === 1 && (
                        <Pass1EmotionalContext
                            data={answers}
                            update={updateAnswers}
                            onNext={handleNext}
                        />
                    )}
                    {currentPass === 2 && (
                        <Pass2ResponsePattern
                            data={answers}
                            update={updateAnswers}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentPass === 3 && (
                        <Pass3RelationalMeaning
                            data={answers}
                            update={updateAnswers}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentPass === 4 && (
                        <Pass4SelfTalk
                            data={answers}
                            update={updateAnswers}
                            onNext={handleNext}
                            onBack={handleBack}
                        />
                    )}
                    {currentPass === 5 && (
                        <Pass5Readiness
                            data={answers}
                            update={updateAnswers}
                            onSubmit={handleSubmit}
                            onBack={handleBack}
                            isSubmitting={isSubmitting}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default GuidedReflection;
