import React, { useEffect, useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import UnclinqCharacter from '../components/UnclinqCharacter';
import Button from '../components/Button';

// Icons for iOS instructions
const ShareIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mx-1 text-forest"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path><polyline points="16 6 12 2 8 6"></polyline><line x1="12" y1="2" x2="12" y2="15"></line></svg>;
const PlusIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mx-1 text-forest"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>;

const SplashScreen: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [fading, setFading] = useState(false);
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [isStandalone, setIsStandalone] = useState(false);
    const [showInstructions, setShowInstructions] = useState(false);

    useEffect(() => {
        const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
        setIsStandalone(isStandaloneMode);
    }, []);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setInstallPrompt(e);
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    useEffect(() => {
        if (fading || showInstructions) return;

        let timeoutId: ReturnType<typeof setTimeout>;

        if (!isStandalone) {
            timeoutId = setTimeout(() => {
                setFading(true);
            }, 8000); // Shorter wait for web, but long enough to breathe
        } else {
            timeoutId = setTimeout(() => {
                setFading(true);
            }, 3000); // 3 seconds for installed app (slower than before)
        }

        return () => clearTimeout(timeoutId);
    }, [isStandalone, fading, showInstructions]);

    useEffect(() => {
        if (fading) {
            const fadeOutTimer = setTimeout(() => {
                navigate('/dashboard');
            }, 1000);
            return () => clearTimeout(fadeOutTimer);
        }
    }, [fading, navigate]);

    const handleInstallClick = async () => {
        if (installPrompt) {
            installPrompt.prompt();
            const { outcome } = await installPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            setInstallPrompt(null);
        } else {
            setShowInstructions(true);
        }
    };

    const handleSkip = () => {
        setFading(true);
    };

    return (
        <div className={`flex flex-col items-center justify-center h-full bg-background transition-all duration-1000 ease-in-out ${fading ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'} p-6 relative`}>
            <div className="animate-[fade-in_2s_ease-out]">
                <UnclinqCharacter
                    state="Ambient"
                    glow="faint"
                    className="w-32 h-32 mb-8 opacity-90"
                />
            </div>
            <p className="text-textPrimary text-xl font-light mt-4 animate-[fade-in_2.5s_ease-out] text-center tracking-wide">A quiet space for self-reflection</p>

            {!isStandalone && !showInstructions && (
                <div className="mt-16 w-full max-w-xs flex flex-col items-center gap-6 animate-[fade-in_3s_ease-out]" style={{ opacity: 0, animationFillMode: 'forwards' }}>
                    <Button onClick={handleInstallClick} className="w-full !rounded-full !py-3 !text-sm !font-normal shadow-sm hover:shadow-md transition-all bg-white !text-forest border border-forest/10">
                        Install App
                    </Button>
                    <button
                        onClick={handleSkip}
                        className="text-xs text-textSecondary/60 hover:text-forest transition-colors"
                    >
                        Continue in browser
                    </button>
                </div>
            )}

            {showInstructions && (
                <div className="absolute inset-0 bg-background/95 z-50 flex flex-col items-center justify-center p-6 animate-fade-in backdrop-blur-sm">
                    <div className="bg-white/80 p-8 rounded-3xl shadow-2xl max-w-sm w-full border border-white/50">
                        <h3 className="text-xl font-light text-textPrimary mb-6 text-center">Install Uncling</h3>

                        <div className="space-y-6 mb-8">
                            <div className="flex items-center gap-4 text-sm text-textPrimary/80">
                                <span className="bg-forest/10 text-forest font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">1</span>
                                <p>Tap <span className="font-medium">Share</span> <ShareIcon /></p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-textPrimary/80">
                                <span className="bg-forest/10 text-forest font-medium rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">2</span>
                                <p>Select <span className="font-medium">Add to Home Screen</span> <PlusIcon /></p>
                            </div>
                        </div>

                        <Button onClick={() => setFading(true)} className="w-full !rounded-full">
                            Done
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SplashScreen;
