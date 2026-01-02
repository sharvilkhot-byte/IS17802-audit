
import React, { useState, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { supabase } from '../services/supabase';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Logo from '../components/Logo';
import { useAuth } from '../hooks/useAuth';

type AuthView = 'login' | 'signup' | 'verify';

const AuthScreen: React.FC = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = ReactRouterDOM.useNavigate();
    
    // State management
    const [view, setView] = useState<AuthView>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            if (user.attachment_style) {
                navigate('/dashboard', { replace: true });
            } else {
                navigate('/onboarding', { replace: true });
            }
        }
    }, [user, authLoading, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (view === 'login') {
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                if (signInError) {
                    // If login fails because email is not confirmed, help the user verify
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
                
                // Success: Move to verify step
                setView('verify');
            } else if (view === 'verify') {
                const { error: verifyError } = await supabase.auth.verifyOtp({
                    email,
                    token: otp,
                    type: 'signup'
                });
                if (verifyError) throw verifyError;
                // Auth listener in App.tsx will handle redirect
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
            case 'signup': return 'Create Account';
            case 'verify': return 'Verify Email';
        }
    };

    const getDescription = () => {
        switch (view) {
            case 'login': return 'Sign in to continue your journey.';
            case 'signup': return 'A safe space to explore your feelings.';
            case 'verify': return `Enter the code sent to ${email || 'your email'}.`;
        }
    };

    const getButtonText = () => {
        if (loading) return 'Processing...';
        switch (view) {
            case 'login': return 'Sign In';
            case 'signup': return 'Sign Up';
            case 'verify': return 'Verify Code';
        }
    };

    if (authLoading || (!authLoading && user)) {
        return (
             <Layout>
                <div className="flex items-center justify-center flex-1">
                    <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-forest"></div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center">
                <Logo className="mb-6" />
                <Card className="w-full max-w-md">
                    <h2 className="text-xl sm:text-2xl font-semibold text-textPrimary mb-2 text-center">
                        {getTitle()}
                    </h2>
                    <p className="text-textSecondary mb-6 text-center">
                        {getDescription()}
                    </p>
                    
                    {error && <p className="bg-warning-bg text-warning-text p-3 rounded-lg mb-4 text-sm">{error}</p>}
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {view === 'verify' && (
                            <div className="animate-fade-in space-y-4">
                                {/* Always show email in verify step to allow correction or re-entry after refresh */}
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
                                    className="text-center text-lg tracking-widest"
                                    maxLength={6}
                                />
                                <p className="text-xs text-textSecondary text-center">
                                    Check your spam folder if you don't see the email.
                                </p>
                            </div>
                        )}

                        {(view === 'login' || view === 'signup') && (
                            <>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    label="Email Address"
                                />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="Your password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    minLength={6}
                                    label="Password"
                                />
                            </>
                        )}

                        <div className="pt-2">
                           <Button type="submit" className="w-full" disabled={loading}>
                               {getButtonText()}
                           </Button>
                        </div>
                    </form>

                    <div className="mt-6 text-center space-y-3">
                        {view === 'login' && (
                            <>
                                <button
                                    onClick={() => { setView('signup'); setError(null); }}
                                    className="block w-full text-sm text-forest hover:underline"
                                >
                                    Don't have an account? Sign up
                                </button>
                                <button
                                    onClick={() => { setView('verify'); setError(null); }}
                                    className="block w-full text-sm text-textSecondary hover:text-textPrimary hover:underline"
                                >
                                    I already have a code
                                </button>
                            </>
                        )}

                        {view === 'signup' && (
                            <>
                                <button
                                    onClick={() => { setView('login'); setError(null); }}
                                    className="block w-full text-sm text-forest hover:underline"
                                >
                                    Already have an account? Sign in
                                </button>
                                <button
                                    onClick={() => { setView('verify'); setError(null); }}
                                    className="block w-full text-sm text-textSecondary hover:text-textPrimary hover:underline"
                                >
                                    I already have a code
                                </button>
                            </>
                        )}

                        {view === 'verify' && (
                            <button
                                onClick={() => { setView('signup'); setError(null); }}
                                className="text-sm text-textSecondary hover:text-forest hover:underline"
                            >
                                Incorrect email or need to sign up? Go back
                            </button>
                        )}
                    </div>
                </Card>
            </div>
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(5px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.3s ease-out forwards;
                }
            `}</style>
        </Layout>
    );
};

export default AuthScreen;
