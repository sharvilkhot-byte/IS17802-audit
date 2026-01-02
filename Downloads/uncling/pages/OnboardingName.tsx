


import React, { useState } from 'react';
// Fix: Changed react-router-dom import to a namespace import to resolve module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { useAuth } from '../hooks/useAuth';
import LogoIcon from '../components/LogoIcon';

const OnboardingName: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const { user, updatePreferredName } = useAuth();
    const style = location.state?.style;
    const [name, setName] = useState(user?.preferred_name || '');
    const [loading, setLoading] = useState(false);

    if (!style) {
        return <ReactRouterDOM.Navigate to="/onboarding" replace />;
    }

    const handleContinue = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setLoading(true);
        await updatePreferredName(name.trim());
        setLoading(false);
        navigate('/onboarding/education', { state: { style } });
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <LogoIcon className="mb-8" />
                <Card className="w-full max-w-lg text-center p-8 md:p-12">
                    <h1 className="text-2xl sm:text-3xl font-bold text-textPrimary mb-4">
                        What should we call you?
                    </h1>
                    <p className="text-textSecondary mb-8 leading-relaxed">
                        This is private and will be used to personalize your experience.
                    </p>
                    <form onSubmit={handleContinue} className="space-y-6">
                        <Input
                            id="name"
                            type="text"
                            placeholder="Enter your preferred name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                        <Button type="submit" disabled={loading || !name.trim()} className="w-full">
                            {loading ? 'Saving...' : 'Continue'}
                        </Button>
                    </form>
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

export default OnboardingName;
