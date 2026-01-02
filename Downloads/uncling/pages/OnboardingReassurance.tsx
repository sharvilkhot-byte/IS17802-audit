



import React from 'react';
// Fix: Changed react-router-dom import to a namespace import to resolve module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import LogoIcon from '../components/LogoIcon';

const OnboardingReassurance: React.FC = () => {
    const location = ReactRouterDOM.useLocation();
    const navigate = ReactRouterDOM.useNavigate();
    const style = location.state?.style;

    if (!style) {
        return <ReactRouterDOM.Navigate to="/onboarding" replace />;
    }

    const handleContinue = () => {
        navigate('/onboarding/name', { state: { style } });
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col items-center justify-center animate-fade-in">
                <LogoIcon className="mb-8" />
                <Card className="w-full max-w-2xl text-center p-8 md:p-12">
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-textPrimary leading-snug mb-6">
                        This is not a permanent label. It is a starting point for understanding, growth, and building a more secure sense of self.
                    </h1>
                    <p className="text-base sm:text-lg text-textSecondary mb-10">
                        Take a deep breath. This is a moment for reflection, not judgment.
                    </p>
                    <Button onClick={handleContinue}>
                        Continue &rarr;
                    </Button>
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

export default OnboardingReassurance;
