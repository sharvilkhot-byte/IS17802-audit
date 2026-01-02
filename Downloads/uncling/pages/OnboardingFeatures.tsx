

import React, { useState } from 'react';
// Fix: Changed react-router-dom import to a namespace import to resolve module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import LogoIcon from '../components/LogoIcon';
import { trackEvent } from '../services/analytics';

// Icons from DashboardScreen, enlarged for visual impact
const SmileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M8 14s1.5 2 4 2 4-2 4-2"></path><line x1="9" y1="9" x2="9.01" y2="9"></line><line x1="15" y1="9" x2="15.01" y2="9"></line></svg>;
const ChatIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>;
const HeartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3"></path></svg>;

const features = [
    {
        icon: <SmileIcon />,
        title: "Daily Reflection",
        description: "Your daily ritual to check in with your mood and thoughts, building a foundation of self-awareness."
    },
    {
        icon: <ChatIcon />,
        title: "Secure Self Chat",
        description: "A private, AI-powered journal to explore any feeling or situation in a safe, non-judgmental space."
    },
    {
        icon: <HeartIcon />,
        title: "Rescue Me Now",
        description: "Immediate, guided support for when you feel overwhelmed, helping you find your center."
    },
    {
        icon: <ChartIcon />,
        title: "Progress",
        description: "See how your moods, themes, and triggers connect over time, revealing your unique journey of growth."
    }
];

const OnboardingFeatures: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isFading, setIsFading] = useState(false);

    const totalSlides = features.length;

    const changeSlide = (newIndex: number) => {
        setIsFading(true);
        setTimeout(() => {
            setCurrentSlide(newIndex);
            setIsFading(false);
        }, 300); // Corresponds to animation duration
    };

    const handleNext = () => {
        if (currentSlide < totalSlides - 1) {
            changeSlide(currentSlide + 1);
        } else {
            trackEvent('onboarding_completed');
            navigate('/dashboard');
        }
    };

    const handleBack = () => {
        if (currentSlide > 0) {
            changeSlide(currentSlide - 1);
        }
    };

    const currentFeature = features[currentSlide];

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <LogoIcon className="mb-8" />
                <Card className="w-full max-w-2xl flex flex-col p-8 md:p-12">
                    <div className={`flex-1 flex flex-col items-center justify-center text-center transition-opacity duration-300 ${isFading ? 'opacity-0' : 'opacity-100'}`}>
                        <div className="text-forest mb-6">
                            {currentFeature.icon}
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-4">
                            {currentFeature.title}
                        </h1>
                        <p className="text-textSecondary leading-relaxed max-w-md">
                            {currentFeature.description}
                        </p>
                    </div>

                    <div className="mt-8 pt-6 border-t border-moss/30">
                        <div className="flex justify-center items-center mb-6 gap-3">
                            {Array.from({ length: totalSlides }).map((_, index) => (
                                <div
                                    key={index}
                                    className={`w-3 h-3 rounded-full transition-colors ${index === currentSlide ? 'bg-forest' : 'bg-moss/50'
                                        }`}
                                />
                            ))}
                        </div>
                        <div className="flex justify-between items-center">
                            <Button variant="secondary" onClick={handleBack} disabled={currentSlide === 0} className={`transition-opacity ${currentSlide === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
                                Back
                            </Button>
                            <Button onClick={handleNext}>
                                {currentSlide === totalSlides - 1 ? 'Go to Dashboard →' : 'Next'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
            `}</style>
        </Layout>
    );
};

export default OnboardingFeatures;
