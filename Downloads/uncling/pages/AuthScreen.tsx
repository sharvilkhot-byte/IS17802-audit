import React, { useState, useEffect, useMemo } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../services/supabase';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';
import { motion, AnimatePresence } from 'framer-motion';

type AuthView = 'login' | 'signup' | 'verify';

const AuthScreen: React.FC = () => {
    const { user, loading: authLoading, updateOnboardingData } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();

    // State management
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const location = ReactRouterDOM.useLocation();

    // Robust data retrieval: State > LocalStorage
    const onboardingData = useMemo(() => {
        if (location.state?.onboardingData) return location.state.onboardingData;

        try {
            const local = localStorage.getItem('unclinq_pending_onboarding');
            return local ? JSON.parse(local) : null;
        } catch (e) {
            console.error("Error parsing local onboarding data", e);
            return null;
        }
    }, [location.state]);

    // Removed duplicate updateOnboardingData destructuring

    useEffect(() => {
        const finalizeAuth = async () => {
            console.log("AuthScreen: Check finalize. User:", !!user, "Loading:", authLoading, "Has Onboarding Data:", !!onboardingData);

            if (!authLoading && user) {
                if (onboardingData) {
                    console.log("AuthScreen: Attempting to save onboarding data for user:", user.id);
                    // We have pending onboarding data to save!
                    try {
                        const { calculateAndSaveReflection } = await import('../services/onboardingService');
                        await calculateAndSaveReflection(
                            user.id,
                            onboardingData,
                            async (updates: any) => {
                                console.log("AuthScreen: Calling updateOnboardingData with:", updates);
                                await updateOnboardingData({
                                    style: updates.attachment_style,
                                    anxietyScore: updates.anxiety_score,
                                    avoidanceScore: updates.avoidance_score,
                                    traitScores: {},
                                    relationshipStatus: undefined
                                });
                            }
                        );
                        console.log("AuthScreen: Data saved. Navigating to dashboard.");
                        localStorage.removeItem('unclinq_pending_onboarding'); // Cleanup
                        navigate('/dashboard', { replace: true });
                    } catch (e) {
                        console.error("AuthScreen: Failed to save onboarding data", e);
                        // If save fails, we should probably ALERT the user rather than redirecting to a broken loop
                        // prevent infinite loop by staying here? Or redirecting?
                        // For now, let's just log and maybe NOT redirect if it fails, so they can see the error?
                        // Actually, if we redirect to dashboard, ProtectedRoute sends them to onboarding.
                        // If we stay, they are logged in but stuck.
                        navigate('/dashboard', { replace: true });
                    }
                } else if (user.attachment_style) {
                    console.log("AuthScreen: User already onboarded. Going to dashboard.");
                    navigate('/dashboard', { replace: true });
                } else {
                    console.warn("AuthScreen: User logged in but NO onboarding data found. Redirecting to start.");
                    navigate('/onboarding', { replace: true });
                }
            }
        };

        finalizeAuth();
    }, [user, authLoading, navigate, onboardingData, updateOnboardingData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'login') {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    if (signInError.message.includes('Email not confirmed')) {
                        setView('verify');
                        setError('Please enter the code sent to your email to verify your account.');
                        setLoading(false);
                        return;
                    }
                    throw signInError;
                }
            } else if (view === 'signup') {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                if (signUpError) throw signUpError;
                setView('verify');
            } else if (view === 'verify') {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email,
                    token: otp,
                    type: 'signup'
                });
                if (verifyError) throw verifyError;
            }
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const getTitle = () => {
        switch (view) {
            case 'login': return 'Welcome Back';
            case 'signup': return 'Start Your Journey';
            case 'verify': return 'Verify Email';
        }
    };

    const getDescription = () => {
        switch (view) {
            case 'login': return 'Reconnect with your inner calm.';
            case 'signup': return 'Create a safe space for your mind.';
            case 'verify': return `We sent a code to ${email || 'your email'}.`;
        }
    };

    if (authLoading || (!authLoading && user)) {
        return (
            <Layout>
                <div className="flex items-center justify-center flex-1 h-[80vh]">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-lavender"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh]">
                <Logo className="mb-8 scale-110" />

                <Card variant="glass" className="w-full max-w-md shadow-glass backdrop-blur-3xl bg-white/70 border-t-4 border-t-brand-lavender">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={view}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <h2 className="text-3xl font-heading font-bold text-brand-deep mb-2 text-center">
                                {getTitle()}
                            </h2>
                            <p className="text-brand-deep/60 mb-8 text-center font-medium">
                                {getDescription()}
                            </p>

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-brand-coral/10 text-brand-coral p-4 rounded-2xl mb-6 text-sm text-center border border-brand-coral/20 font-medium"
                                >
                                    {error}
                                </motion.p>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-5">
                                {view === 'verify' && (
                                    <>
                                        <Input
                                            id="verify-email"
                                            type="email"
                                            placeholder="you@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            label="Email Address"
                                        />
                                        <Input
                                            id="otp"
                                            type="text"
                                            placeholder="123456"
                                            value={otp}
                                            onChange={e => setOtp(e.target.value)}
                                            required
                                            autoFocus
                                            label="Verification Code"
                                            className="text-center text-2xl tracking-[1em] font-heading font-bold text-brand-deep"
                                            maxLength={6}
                                        />
                                    </>
                                )}

                                {(view === 'login' || view === 'signup') && (
                                    <>
                                        <Input
                                            id="email"
                                            type="email"
                                            placeholder="hello@example.com"
                                            value={email}
                                            onChange={e => setEmail(e.target.value)}
                                            required
                                            label="Email"
                                        />
                                        <Input
                                            id="password"
                                            type="password"
                                            placeholder="••••••••"
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            minLength={6}
                                            label="Password"
                                        />
                                    </>
                                )}

                                <div className="pt-4">
                                    <Button type="submit" className="w-full text-lg shadow-lg shadow-brand-lavender/30" disabled={loading} isLoading={loading}>
                                        {view === 'login' ? 'Sign In' : view === 'signup' ? 'Create Account' : 'Verify'}
                                    </Button>
                                </div>
                            </form>

                            <div className="mt-8 text-center space-y-3">
                                {view === 'login' && (
                                    <>
                                        <button onClick={() => { setView('signup'); setError(null); }} className="block w-full text-sm font-semibold text-brand-deep hover:text-brand-lavender transition-colors">
                                            New here? <span className="underline decoration-2 underline-offset-4 decoration-brand-lavender/50">Create an account</span>
                                        </button>
                                        <button onClick={() => { setView('verify'); setError(null); }} className="block w-full text-xs text-brand-deep/50 hover:text-brand-deep transition-colors mt-4">
                                            I have a verification code
                                        </button>
                                    </>
                                )}

                                {view === 'signup' && (
                                    <>
                                        <button onClick={() => { setView('login'); setError(null); }} className="block w-full text-sm font-semibold text-brand-deep hover:text-brand-lavender transition-colors">
                                            Already have an account? <span className="underline decoration-2 underline-offset-4 decoration-brand-lavender/50">Sign in</span>
                                        </button>
                                        <button onClick={() => { setView('verify'); setError(null); }} className="block w-full text-xs text-brand-deep/50 hover:text-brand-deep transition-colors mt-4">
                                            I have a verification code
                                        </button>
                                    </>
                                )}

                                {view === 'verify' && (
                                    <button onClick={() => { setView('signup'); setError(null); }} className="text-sm font-medium text-brand-deep/60 hover:text-brand-deep transition-colors">
                                        Wrong email? Go back
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </Card>
            </div>
        </Layout>
    );
};

export default AuthScreen;
