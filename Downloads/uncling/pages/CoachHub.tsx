import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeatureCard from '../components/dashboard/FeatureCard';
import { MessageSquare, Archive, FileText, ArrowLeft } from 'lucide-react';

const CoachHub: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-brand-lavender/5 to-slate-50 pb-24">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                        Secure Base Coach
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Reframe thoughts and reconnect with clarity
                    </p>
                </div>

                {/* Features Grid */}
                <div className="px-6 space-y-4">
                    <FeatureCard
                        title="Chat Modes"
                        description="Vent, gain clarity, or draft messages"
                        icon={MessageSquare}
                        to="/chat"
                        delay={0.1}
                    />
                    <FeatureCard
                        title="Truth Bank"
                        description="Your collection of counter-evidence"
                        icon={Archive}
                        to="/evidence-log"
                        delay={0.2}
                    />
                    <FeatureCard
                        title="Repair Scripts"
                        description="Templates for difficult conversations"
                        icon={FileText}
                        to="/scripts"
                        delay={0.3}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default CoachHub;
