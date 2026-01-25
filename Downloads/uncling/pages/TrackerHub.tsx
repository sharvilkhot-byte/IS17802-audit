import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeatureCard from '../components/dashboard/FeatureCard';
import { Users, Calendar, TrendingUp, ArrowLeft } from 'lucide-react';

const TrackerHub: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-forest/5 to-slate-50 pb-24">
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
                        Internal Family
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Know your patterns and track your growth
                    </p>
                </div>

                {/* Features Grid */}
                <div className="px-6 space-y-4">
                    <FeatureCard
                        title="Parts Check-In"
                        description="Who is driving today?"
                        icon={Users}
                        to="/parts-checkin"
                        delay={0.1}
                    />
                    <FeatureCard
                        title="Security Streaks"
                        description="Track your days of awareness"
                        icon={Calendar}
                        to="/streaks"
                        delay={0.2}
                    />
                    <FeatureCard
                        title="Insights Report"
                        description="Your 15-day growth summary"
                        icon={TrendingUp}
                        to="/report"
                        delay={0.3}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default TrackerHub;
