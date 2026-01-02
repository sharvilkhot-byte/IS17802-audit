import React, { useState, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { useAuth } from '../hooks/useAuth';
import { generateResultContent } from '../services/onboardingService';
import { ReflectionState } from '../types';

// Using useLocation to retrieve the state passed from GuidedReflection
const GuidedResult: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const location = ReactRouterDOM.useLocation();
    const [step, setStep] = useState(1);

    // Retrieve answers from navigation state/location
    const answers = (location.state as { answers: ReflectionState })?.answers;

    // Generate content once based on answers
    const content = useMemo(() => {
        if (!answers) return null;
        return generateResultContent(answers);
    }, [answers]);

    // Safety check - if no answers, redirect (shouldn't happen in flow)
    if (!answers || !content) {
        return (
            <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
                <p className="mb-4">No reflection data found.</p>
                <Button onClick={() => navigate('/onboarding')}>Start Reflection</Button>
            </div>
        );
    }

    const next = () => {
        if (step < 10) {
            window.scrollTo(0, 0);
            setStep(prev => prev + 1);
        } else {
            navigate('/dashboard', { replace: true });
        }
    };

    // --- SCREENS ---

    // 1. Emotional Landing
    if (step === 1) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in h-screen bg-slate-50">
                <h1 className="text-2xl font-light text-textPrimary mb-6">What you shared paints a thoughtful picture.</h1>
                <p className="text-textSecondary text-lg max-w-md mx-auto leading-relaxed">
                    These aren’t traits or labels.<br />
                    They’re patterns that often form to help us cope.
                </p>
                <div className="mt-12">
                    <Button onClick={next} className="min-w-[120px]">Continue</Button>
                </div>
            </div>
        );
    }

    // 2. Pattern Framing
    if (step === 2) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in h-screen bg-slate-50">
                <h1 className="text-2xl font-light text-textPrimary mb-4">Here are the patterns that showed up most.</h1>
                <p className="text-textSecondary mb-8">
                    Patterns can change.<br />
                    They often soften with awareness and support.
                </p>
                <div className="grid grid-cols-2 gap-4 opacity-50 pointer-events-none mb-10">
                    <div className="w-24 h-32 bg-white rounded-lg border border-slate-200" />
                    <div className="w-24 h-32 bg-white rounded-lg border border-slate-200" />
                </div>
                <Button onClick={next}>See Patterns</Button>
            </div>
        );
    }

    // 3. Core Pattern Cluster
    if (step === 3) {
        return (
            <div className="flex-1 flex flex-col justify-center p-8 bg-slate-50 animate-fade-in min-h-screen">
                <h1 className="text-2xl font-light text-textPrimary mb-8 text-center">Your emotional system tends to…</h1>

                <div className="space-y-4 max-w-md mx-auto w-full">
                    {content.patterns.map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                            <div className="w-2 h-2 rounded-full bg-moss mt-2 shrink-0" />
                            <span className="text-textPrimary text-lg">{item}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={next}>Next</Button>
                </div>
            </div>
        );
    }

    // 4. Visual Pattern Map (Simplified CSS representation)
    if (step === 4) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 animate-fade-in min-h-screen">
                <h1 className="text-2xl font-light text-textPrimary mb-2">How these patterns relate</h1>

                <div className="relative w-64 h-64 my-10 flex items-center justify-center">
                    {/* Ring 1 */}
                    <div className="absolute inset-0 border-2 border-slate-100 rounded-full animate-pulse-slow" />
                    {/* Ring 2 */}
                    <div className="absolute inset-8 border border-slate-200 rounded-full" />

                    {/* Center */}
                    <div className="z-10 bg-white shadow-lg rounded-full w-24 h-24 flex items-center justify-center text-center p-2 text-xs font-bold text-moss tracking-widest uppercase">
                        Emotional<br />Activation
                    </div>

                    {/* Nodes simplistically placed */}
                    <div className="absolute top-0 bg-slate-50 border px-3 py-1 rounded text-xs text-textSecondary">Uncertainty</div>
                    <div className="absolute bottom-0 bg-slate-50 border px-3 py-1 rounded text-xs text-textSecondary">Self-Talk</div>
                    <div className="absolute left-0 bg-slate-50 border px-3 py-1 rounded text-xs text-textSecondary">Connection</div>
                    <div className="absolute right-0 bg-slate-50 border px-3 py-1 rounded text-xs text-textSecondary">Regulation</div>
                </div>

                <p className="text-textSecondary text-sm italic mb-8">“This isn’t a fixed loop — it’s a snapshot.”</p>
                <Button onClick={next}>Continue</Button>
            </div>
        );
    }

    // 5. Daily Life
    if (step === 5) {
        return (
            <div className="flex-1 flex flex-col justify-center p-8 bg-slate-50 animate-fade-in min-h-screen">
                <h1 className="text-2xl font-light text-textPrimary mb-8 text-center">This may show up as…</h1>

                <div className="space-y-4 max-w-md mx-auto w-full">
                    {content.dailyLife.map((item, i) => (
                        <div key={i} className="bg-white p-5 rounded-xl border border-l-4 border-l-forest border-r-0 border-t-0 border-b-0 shadow-sm animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                            <p className="text-textPrimary text-lg font-medium">“{item}”</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={next}>Next</Button>
                </div>
            </div>
        );
    }

    // 6. What Helps
    if (step === 6) {
        return (
            <div className="flex-1 flex flex-col justify-center p-8 bg-slate-50 animate-fade-in min-h-screen">
                <h1 className="text-2xl font-light text-textPrimary mb-2 text-center">What seems to support you best</h1>
                <p className="text-textSecondary text-sm text-center mb-8">These are starting points — not prescriptions.</p>

                <div className="space-y-4 max-w-md mx-auto w-full">
                    {content.supportMechanisms.map((item, i) => (
                        <div key={i} className="flex items-center gap-4 animate-slide-up" style={{ animationDelay: `${i * 150}ms` }}>
                            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-600">✓</div>
                            <p className="text-textPrimary text-lg">{item}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={next}>Next</Button>
                </div>
            </div>
        );
    }

    // 7. Stuck Points (Gentle Mirror)
    if (step === 7) {
        return (
            <div className="flex-1 flex flex-col justify-center p-8 bg-slate-50 animate-fade-in min-h-screen">
                <h1 className="text-2xl font-light text-textPrimary mb-8 text-center">When these patterns repeat, people sometimes notice…</h1>

                <div className="space-y-6 max-w-md mx-auto w-full">
                    {content.stuckPoints.map((item, i) => (
                        <p key={i} className="text-textSecondary text-lg text-center italic animate-fade-in" style={{ animationDelay: `${i * 300}ms` }}>
                            ... {item}
                        </p>
                    ))}
                </div>

                <div className="mt-12 text-center">
                    <Button onClick={next} className="bg-slate-800 hover:bg-slate-700">I recognize this</Button>
                </div>
            </div>
        );
    }

    // 8. How Unclinq Support
    if (step === 8) {
        return (
            <div className="flex-1 flex flex-col justify-center p-6 bg-slate-50 animate-fade-in min-h-screen">
                <h1 className="text-2xl font-light text-textPrimary mb-8 text-center">How I’ll support you</h1>

                <div className="space-y-6 max-w-lg mx-auto">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-moss font-bold text-sm uppercase tracking-wider mb-2">Regulation First</h3>
                        <p className="text-textPrimary">"When things feel intense, we’ll slow things down."</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-forest font-bold text-sm uppercase tracking-wider mb-2">Patterns, Not Pressure</h3>
                        <p className="text-textPrimary">"I’ll help you notice patterns — only when you’re ready."</p>
                    </div>

                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h3 className="text-purple-500 font-bold text-sm uppercase tracking-wider mb-2">Permission-Based</h3>
                        <p className="text-textPrimary">"I’ll challenge gently, and only with your consent."</p>
                    </div>
                </div>

                <div className="mt-10 text-center">
                    <Button onClick={next}>Next</Button>
                </div>
            </div>
        );
    }

    // 9. Optional Education
    if (step === 9) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center p-8 bg-slate-50 animate-fade-in min-h-screen">
                <div className="max-w-md w-full">
                    <details className="bg-white rounded-xl border border-slate-200 overflow-hidden group">
                        <summary className="p-6 cursor-pointer list-none flex items-center justify-between font-medium text-textPrimary">
                            Why these patterns make sense
                            <span className="group-open:rotate-180 transition-transform">▼</span>
                        </summary>
                        <div className="px-6 pb-6 text-textSecondary leading-relaxed bg-slate-50/50 border-t border-slate-100">
                            {content.educationSnippet}
                        </div>
                    </details>
                </div>

                <div className="mt-20">
                    <Button onClick={next}>Continue</Button>
                </div>
            </div>
        );
    }

    // 10. Transition
    if (step === 10) {
        return (
            <div className="flex-1 flex flex-col justify-center items-center p-8 text-center animate-fade-in min-h-screen bg-slate-50">
                <h1 className="text-3xl font-light text-textPrimary mb-6">Nothing here needs fixing right now.</h1>
                <p className="text-textSecondary text-xl mb-12">We’ll take this one moment at a time.</p>

                <Button onClick={next} className="py-4 px-12 text-lg shadow-lg">Go to Home</Button>
            </div>
        );
    }

    return null;
};

export default GuidedResult;
