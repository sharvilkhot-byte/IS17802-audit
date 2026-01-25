import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import FeatureCard from '../components/dashboard/FeatureCard';
import { Wind, Compass, BookOpen, ArrowLeft } from 'lucide-react';

const RegulateHub: React.FC = () => {
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-brand-rose/5 to-slate-50 pb-24">
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
                        Regulate & Reflect
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Calm your nervous system and process emotions
                    </p>
                </div>

                {/* Features Grid */}
                <div className="px-6 space-y-4">
                    <FeatureCard
                        title="Somatic SOS"
                        description="Breathing, Voo sound, and orientation exercises"
                        icon={Wind}
                        to="/rescue"
                        delay={0.1}
                    />
                    <FeatureCard
                        title="Feelings Compass"
                        description="Name and understand your emotions"
                        icon={Compass}
                        to="/feelings"
                        delay={0.2}
                    />
                    <FeatureCard
                        title="AND Journal"
                        description="Integrate your story with compassion"
                        icon={BookOpen}
                        to="/journal"
                        delay={0.3}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default RegulateHub;
