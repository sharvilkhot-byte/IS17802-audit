import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { SAFE_SPACE_CONTENT, SafeSpaceStep, getStepDuration } from '../services/safeSpaceService';

// import Step Components (We will likely need to make these more generic or verify they can take props)
// For now, let's assume we can refactor them or they are simple enough.
// Actually, to ensure exact copy, I will render the layout directly here or use a generic "SafeSpaceStepLayout"
// creating a generic layout file might be cleaner, but I'll check if I can reuse existing for structure.
// Let's implement a clean single-file render for now to guarantee the copy matches "World Class".

// Reusing specific components where logic is complex (Breathing), otherwise using a generic content card.
import RescueBreathing from '../components/Rescue/RescueBreathing';
import RescueIntensity from '../components/Rescue/RescueIntensity';
import Button from '../components/Button'; // Assuming we have a basic Button

const SafeSpaceScreen: React.FC = () => {
    const navigate = useNavigate();
    const [step, setStep] = useState<SafeSpaceStep>('entry');
    const [intensity, setIntensity] = useState<'mild' | 'moderate' | 'high'>('moderate');
    const content = SAFE_SPACE_CONTENT[step];

    const handleClose = () => {
        if (window.confirm("You can return anytime. Exit Safe Space?")) {
            navigate('/dashboard');
        }
    };

    const handleNext = () => {
        switch (step) {
            case 'entry': setStep('intensity'); break;
            case 'intensity': setStep('breathing'); break;
            case 'breathing': setStep('body'); break;
            case 'body': setStep('validation'); break;
            case 'validation': setStep('loop'); break;
            // Loop choice handled in render
            case 'loop': setStep('exit'); break;
            case 'still_activated': setStep('breathing'); break; // Loop back
            case 'exit': navigate('/dashboard', { state: { fromRescue: true } }); break;
        }
    };

    const handleLoop = () => {
        setStep('breathing'); // Restart loop
    };

    const renderContent = () => {
        // Special Case: Intensity Selector
        if (step === 'intensity') {
            return (
                <div className="text-center space-y-8 animate-fade-in">
                    <h1 className="text-3xl font-serif text-slate-800">{content.headline}</h1>
                    <RescueIntensity onSelect={(level) => {
                        setIntensity(level);
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
                    onComplete={() => setStep('body')}
                />
            );
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
                                if (step === 'loop') setStep('exit');
                                else if (step === 'entry') navigate('/dashboard');
                                else if (step === 'exit') navigate('/chat'); // Reflect now
                                else handleNext(); // Skip behavior usually moves forward or to specific next
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
        <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden transition-colors duration-1000">
            {/* Header */}
            <div className="absolute top-0 right-0 p-6 z-50">
                <button onClick={handleClose} className="p-2 rounded-full bg-white/50 backdrop-blur-sm hover:bg-white text-slate-400 hover:text-slate-600 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            {/* Background Gradient */}
            <div className={`absolute inset-0 transition-colors duration-1000 -z-10 ${step === 'breathing' ? 'bg-green-50/40' :
                    step === 'intensity' ? 'bg-blue-50/30' :
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
