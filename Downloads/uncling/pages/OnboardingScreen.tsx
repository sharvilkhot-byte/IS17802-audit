import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ONBOARDING_QUESTIONS } from '../constants';
import { calculateAttachmentStyle } from '../services/supabase';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Logo from '../components/Logo';
import { Shield, Heart, Lock, ArrowRight, Pause, Database, Brain } from 'lucide-react';

type OnboardingStep =
    | 'welcome'
    | 'not_therapy'
    | 'emotional_consent'
    | 'question_framing'
    | 'questions_pass_1'
    | 'micro_pause'
    | 'questions_pass_2'
    | 'reframed_option'
    | 'questions_pass_3'
    | 'values_context'
    | 'regulation_prefs'
    | 'data_transparency'
    | 'permission'
    | 'transition';

const OnboardingScreen: React.FC = () => {
    const [step, setStep] = useState<OnboardingStep>('welcome');
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [ratings, setRatings] = useState<number[]>([]);
    const [currentRating, setCurrentRating] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);

    // Additional Context Data (Mocked for now, ready for DB)
    const [values, setValues] = useState<string[]>([]);
    const [regulationPref, setRegulationPref] = useState<'somatic' | 'cognitive' | 'mixed' | null>(null);

    const { updateOnboardingData } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();

    // --- LOGIC HANDLERS ---

    const handleRating = (rating: number) => {
        const newRatings = [...ratings, rating];
        setRatings(newRatings);

        if (currentQuestionIndex < ONBOARDING_QUESTIONS.length - 1) {
            const nextIndex = currentQuestionIndex + 1;
            setCurrentQuestionIndex(nextIndex);

            // Breakpoints for Passes
            if (nextIndex === 5) setStep('micro_pause'); // After Q5
            if (nextIndex === 10) setStep('reframed_option'); // After Q10
            if (nextIndex === 15) setStep('values_context'); // After Q15 (End)
        } else {
            setStep('values_context');
        }
    };

    const handleFinish = () => {
        setLoading(true);
        setTimeout(() => {
            const result = calculateAttachmentStyle(ratings);
            navigate('/onboarding/result', { state: { result } });
        }, 1500); // Gentle transition delay
    };

    // --- RENDERERS ---

    const renderContent = () => {
        switch (step) {
            case 'welcome':
                return (
                    <div className="text-center space-y-6 animate-fade-in">
                        <Logo className="mx-auto w-24 h-24 mb-8 opacity-90" />
                        <h1 className="text-3xl font-serif text-slate-800">Welcome to Unclinq.</h1>
                        <p className="text-lg text-slate-600 max-w-md mx-auto leading-relaxed">
                            A quiet space to understand your patterns without judgment.
                        </p>
                        <div className="pt-8">
                            <Button onClick={() => setStep('not_therapy')} className="w-full sm:w-auto">
                                Begin slightly
                            </Button>
                        </div>
                    </div>
                );

            case 'not_therapy':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Shield className="text-slate-500" size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-slate-800 text-center">First, clarity.</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Unclinq is an emotional mirror, not a doctor. We do not diagnose, treat, or fix you.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            We help you notice patterns so you can navigate them with more choice.
                        </p>
                        <div className="pt-8 flex justify-center">
                            <Button onClick={() => setStep('emotional_consent')} variant="secondary">
                                I understand
                            </Button>
                        </div>
                    </div>
                );

            case 'emotional_consent':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md">
                        <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Heart className="text-rose-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-slate-800 text-center">Emotional Safety</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Some questions might stir up feelings. That is okay.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            You can pause, leave, or skip anything that feels like too much right now.
                        </p>
                        <div className="pt-8 flex justify-center">
                            <Button onClick={() => setStep('question_framing')}>
                                I'm ready to look
                            </Button>
                        </div>
                    </div>
                );

            case 'question_framing':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md text-center">
                        <h2 className="text-2xl font-serif text-slate-800">Framing the questions</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We ask about your instincts in relationships.
                            There are no "wrong" answers—only human ones.
                        </p>
                        <p className="text-slate-500 text-sm italic">
                            Answer based on what you *feel*, not what you think you *should* feel.
                        </p>
                        <div className="pt-8">
                            <Button onClick={() => setStep('questions_pass_1')}>
                                Start Part 1
                            </Button>
                        </div>
                    </div>
                );

            case 'questions_pass_1':
            case 'questions_pass_2':
            case 'questions_pass_3':
                const question = ONBOARDING_QUESTIONS[currentQuestionIndex];
                return (
                    <div className="w-full max-w-xl animate-fade-in">
                        <div className="mb-8 text-center">
                            <span className="text-xs font-bold text-slate-400 tracking-widest uppercase">
                                Question {currentQuestionIndex + 1} of {ONBOARDING_QUESTIONS.length}
                            </span>
                        </div>
                        <h2 className="text-xl sm:text-2xl font-medium text-slate-800 text-center mb-12 min-h-[5rem]">
                            {question.question}
                        </h2>

                        <div className="flex justify-between max-w-xs mx-auto mb-2 text-xs text-slate-400 font-medium uppercase tracking-wide">
                            <span>Never</span>
                            <span>Always</span>
                        </div>
                        <div className="flex justify-center gap-3 sm:gap-4">
                            {[1, 2, 3, 4, 5].map((val) => (
                                <button
                                    key={val}
                                    onClick={() => handleRating(val)}
                                    className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 hover:border-slate-300 transition-all duration-300 text-lg font-semibold text-slate-600 focus:ring-2 focus:ring-slate-200 focus:outline-none"
                                >
                                    {val}
                                </button>
                            ))}
                        </div>
                    </div>
                );

            case 'micro_pause':
                return (
                    <div className="text-center space-y-6 animate-fade-in max-w-md">
                        <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Pause className="text-blue-400" size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-slate-800">Breath.</h2>
                        <p className="text-slate-600 leading-relaxed">
                            You're doing well. That was the first section.
                        </p>
                        <p className="text-slate-600">
                            Take a moment if you need it.
                        </p>
                        <div className="pt-8">
                            <Button onClick={() => setStep('questions_pass_2')}>
                                Continue to Part 2
                            </Button>
                        </div>
                    </div>
                );

            case 'reframed_option':
                return (
                    <div className="text-center space-y-6 animate-fade-in max-w-md">
                        <h2 className="text-2xl font-serif text-slate-800">Almost there.</h2>
                        <p className="text-slate-600 leading-relaxed">
                            This final section looks at smaller, subtle habits.
                        </p>
                        <p className="text-slate-600 italic">
                            Honesty here helps us find the "hidden" strengths in your pattern.
                        </p>
                        <div className="pt-8">
                            <Button onClick={() => setStep('questions_pass_3')}>
                                Start Final Part
                            </Button>
                        </div>
                    </div>
                );

            case 'values_context':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md text-center">
                        <h2 className="text-2xl font-serif text-slate-800">What matters to you?</h2>
                        <p className="text-slate-600">
                            (This helps us tailor your insights.)
                        </p>
                        <div className="space-y-3">
                            {/* Mock selection for now */}
                            <button className="w-full p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-slate-600">
                                Stability & Peace
                            </button>
                            <button className="w-full p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-slate-600">
                                Deep Connection
                            </button>
                            <button className="w-full p-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-left text-slate-600">
                                Self-Understanding
                            </button>
                        </div>
                        <div className="pt-4">
                            <Button onClick={() => setStep('regulation_prefs')} variant="secondary">
                                Continue
                            </Button>
                        </div>
                    </div>
                );

            case 'regulation_prefs':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md text-center">
                        <h2 className="text-2xl font-serif text-slate-800">When you're overwhelmed...</h2>
                        <p className="text-slate-600">
                            What usually helps more?
                        </p>
                        <div className="flex gap-4 justify-center">
                            <button onClick={() => setStep('data_transparency')} className="flex-1 p-6 rounded-2xl border border-slate-200 hover:border-slate-400 transition-all text-slate-700 font-medium">
                                Thinking it through
                            </button>
                            <button onClick={() => setStep('data_transparency')} className="flex-1 p-6 rounded-2xl border border-slate-200 hover:border-slate-400 transition-all text-slate-700 font-medium">
                                Moving / Breathing
                            </button>
                        </div>
                    </div>
                );

            case 'data_transparency':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md">
                        <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Database className="text-emerald-500" size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-slate-800 text-center">Your Data</h2>
                        <p className="text-slate-600 leading-relaxed">
                            We store patterns to help you grow, but we do not sell your emotional life.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Transcripts are kept cold—only you bring them up.
                        </p>
                        <div className="pt-8 flex justify-center">
                            <Button onClick={() => setStep('permission')} variant="secondary">
                                That feels safe
                            </Button>
                        </div>
                    </div>
                );

            case 'permission':
                return (
                    <div className="space-y-6 animate-fade-in max-w-md">
                        <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Brain className="text-purple-500" size={24} />
                        </div>
                        <h2 className="text-2xl font-serif text-slate-800 text-center">One last thing</h2>
                        <p className="text-slate-600 leading-relaxed">
                            Do I have permission to gently point out patterns if I see them recurring?
                        </p>
                        <div className="pt-8 flex justify-center gap-4">
                            <Button onClick={() => setStep('transition')} className="w-full">
                                Yes, gently
                            </Button>
                        </div>
                        <Button onClick={() => setStep('transition')} variant="secondary" className="w-full bg-transparent shadow-none hover:bg-slate-50">
                            Not right now
                        </Button>
                    </div>
                );

            case 'transition':
                // Auto-trigger finish
                setTimeout(handleFinish, 3000);
                return (
                    <div className="text-center space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-serif text-slate-800">Processing...</h2>
                        <p className="text-slate-600">
                            Bringing it all together.
                        </p>
                        <div className="w-12 h-12 border-4 border-slate-200 border-t-slate-500 rounded-full animate-spin mx-auto mt-8"></div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <Layout showHeader={false} showBottomNav={false}>
            <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50/50 min-h-screen">
                {renderContent()}
            </div>
        </Layout>
    );
};

export default OnboardingScreen;
