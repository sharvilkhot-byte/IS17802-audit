import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SAFE_SPACE_CONTENT, SafeSpaceStep, getStepDuration } from '../services/safeSpaceService';
import { useGarden } from '../context/GardenContext';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';

import RescueBreathing from '../components/Rescue/RescueBreathing';
import RescueIntensity from '../components/Rescue/RescueIntensity';
import RescueBodyMap from '../components/Rescue/RescueBodyMap';
import RescueActionPlan from '../components/Rescue/RescueActionPlan';
import RescueGrounding from '../components/Rescue/RescueGrounding';
import Button from '../components/Button';

const SafeSpaceScreen: React.FC = () => {
    const navigate = useNavigate();
    const { profile } = useGarden();
    const { user } = useAuth();
    const [step, setStep] = useState<SafeSpaceStep>('entry');
    const [intensity, setIntensity] = useState<'mild' | 'moderate' | 'high'>('moderate');
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [toolsUsed, setToolsUsed] = useState<Set<string>>(new Set());
    const content = SAFE_SPACE_CONTENT[step];

    // Map intensity string to approximate 1-10 scale for DB
    const getIntensityScore = (level: string): number => {
        switch (level) {
            case 'mild': return 3;
            case 'moderate': return 6;
            case 'high': return 9;
            default: return 5;
        }
    };

    const handleStartSession = async () => {
        if (!user) {
            setStep('intensity');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('rescue_sessions')
                .insert({
                    user_id: user.id
                })
                .select()
                .single();

            if (error) throw error;
            if (data) setSessionId(data.id);
        } catch (error) {
            console.error('Error starting rescue session:', error);
        }
        setStep('intensity');
    };

    const updateSession = async (updates: any) => {
        if (!sessionId) return;
        try {
            await supabase
                .from('rescue_sessions')
                .update(updates)
                .eq('id', sessionId);
        } catch (error) {
            console.error('Error updating rescue session:', error);
        }
    };

    const trackTool = (toolName: string) => {
        if (!toolsUsed.has(toolName)) {
            const newTools = new Set(toolsUsed).add(toolName);
            setToolsUsed(newTools);
            updateSession({ tools_used: Array.from(newTools) });
        }
    };

    const handleClose = () => {
        if (window.confirm("You can return anytime. Exit Safe Space?")) {
            navigate('/dashboard');
        }
    };

    const handleNext = () => {
        switch (step) {
            case 'entry':
                handleStartSession();
                break;
            case 'intensity':
                // Intensity is handled in onSelect prop
                break;
            case 'breathing':
                trackTool('Breathing');
                setStep('grounding');
                break;
            case 'grounding':
                trackTool('Sensory Grounding');
                setStep('body');
                break;
            case 'body':
                trackTool('Body Scan');
                setStep('validation');
                break;
            case 'validation':
                trackTool('Validation');
                setStep('loop');
                break;
            case 'loop':
                // Handled in completion logic
                setStep('exit');
                break;
            case 'still_activated':
                setStep('breathing');
                break;
            case 'exit':
                // Final update normally happens in ActionPlan onExit, 
                // but if we use generic next button here:
                navigate('/dashboard', { state: { fromRescue: true } });
                break;
        }
    };

    const handleLoop = () => {
        setStep('breathing');
    };

    const renderContent = () => {
        // Special Case: Intensity Selector
        if (step === 'intensity') {
            return (
                <div className="text-center space-y-8 animate-fade-in">
                    <h1 className="text-3xl font-serif text-slate-800">{content.headline}</h1>
                    <RescueIntensity onSelect={(level) => {
                        setIntensity(level);
                        updateSession({ initial_distress: getIntensityScore(level) });
                        setStep('breathing');
                    }} />
                    <p className="text-slate-500 mt-4">{content.body}</p>
                </div>
            );
        }

        // Special Case: Breathing (Animation)
        if (step === 'breathing') {
            return (
                <RescueBreathing
                    durationSeconds={getStepDuration(intensity)}
                    onComplete={() => {
                        trackTool('Breathing');
                        setStep('grounding');
                    }}
                />
            );
        }

        // Special Case: Sensory Grounding
        if (step === 'grounding') {
            return (
                <RescueGrounding
                    onComplete={() => {
                        trackTool('Sensory Grounding');
                        setStep('body');
                    }}
                />
            );
        }

        // Special Case: Body Map
        if (step === 'body') {
            return (
                <RescueBodyMap
                    onSelect={(areaId) => {
                        // console.log("Selected body area:", areaId);
                        trackTool('Body Scan');
                        setStep('validation');
                    }}
                />
            );
        }

        // Special Case: Action Plan / Validation
        if (step === 'validation') {
            return (
                <RescueActionPlan
                    userStyle={profile.primaryStyle}
                    onExit={() => {
                        trackTool('Action Plan');
                        setStep('exit');
                    }}
                />
            );
        }

        // Special Case: Exit / Check-out
        // We can add a "final distress check" or just mark complete
        if (step === 'exit') {
            // Simplified exit for now - implies feeling better
            updateSession({
                final_distress: Math.max(1, getIntensityScore(intensity) - 3), // Assume improvement for now
                completed_at: new Date().toISOString()
            });
            navigate('/dashboard', { state: { fromRescue: true } });
            return null; // Or return a loading spinner while redirecting
        }

        // Standard Layout for other steps
        return (
            <div className="text-center space-y-8 max-w-sm mx-auto animate-fade-in">
                <h1 className="text-3xl font-serif text-slate-800 leading-tight">
                    {content.headline}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed">
                    {content.body}
                </p>

                <div className="space-y-3 pt-4">
                    <Button onClick={step === 'loop' ? handleLoop : handleNext} className="w-full">
                        {content.primaryAction}
                    </Button>

                    {content.secondaryAction && (
                        <button
                            onClick={() => {
                                if (step === 'loop') {
                                    updateSession({
                                        final_distress: Math.max(1, getIntensityScore(intensity) - 3),
                                        completed_at: new Date().toISOString()
                                    });
                                    setStep('exit');
                                }
                                else if (step === 'entry') navigate('/dashboard');
                                else if (step === 'exit') navigate('/chat');
                                else handleNext();
                            }}
                            className="block w-full text-sm text-slate-500 hover:text-slate-800 py-2 transition-colors"
                        >
                            {content.secondaryAction}
                        </button>
                    )}
                </div>

                {content.microCopy && (
                    <p className="text-xs text-slate-400 italic mt-6">
                        {content.microCopy}
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden transition-colors duration-1000 pb-32">
            {/* Header */}
            <div className="absolute top-0 right-0 p-6 z-50">
                <button onClick={handleClose} className="p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white text-slate-400 hover:text-slate-600 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Background Gradient */}
            <div className={`absolute inset-0 transition-colors duration-1000 -z-10 ${step === 'breathing' ? 'bg-safe/40' :
                step === 'intensity' ? 'bg-calm/30' :
                    step === 'validation' ? 'bg-indigo-50/30' :
                        'bg-slate-50'
                }`} />

            {/* Main Content */}
            <main className="flex-1 flex flex-col justify-center items-center p-6 w-full">
                {renderContent()}
            </main>
        </div>
    );
};

export default SafeSpaceScreen;
