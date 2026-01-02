import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { determineHubState } from '../services/hubStateService';
import HomeStateCard from '../components/HomeHub/HomeStateCard';
import EmotionalTemperature from '../components/HomeHub/EmotionalTemperature';
import ProgressCue from '../components/HomeHub/ProgressCue';
import EducationCard from '../components/Education/EducationCard';
import { EDUCATION_CONTENT } from '../services/educationService';

const DashboardScreen: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();

    // Determine the Hub State
    const [hubState, setHubState] = useState(determineHubState(user, location.state));
    const [showEducation, setShowEducation] = useState(true);

    // Refresh state if user or location changes
    useEffect(() => {
        setHubState(determineHubState(user, location.state));
    }, [user, location.state]);

    // Derived content for Hub States that map to Edge Cases
    // Note: We map HubState (e.g. 'Shutdown') to EducationContent ('shutdown')
    const getEdgeCard = () => {
        if (hubState === 'Shutdown') return EDUCATION_CONTENT.shutdown;
        if (hubState === 'Avoidant') return EDUCATION_CONTENT.avoidance_guilt;
        if (hubState === 'Skeptical') return EDUCATION_CONTENT.skepticism;
        return null;
    };

    const edgeContent = getEdgeCard();

    // Random Insight Logic (Mock for demo)
    // In production, this would be driven by backend logic 'hasUnseenInsight'
    // For now, 30% chance to show an insight if no edge state is active
    const dailyInsight = !edgeContent && Math.random() > 0.7 ? EDUCATION_CONTENT.education_insight : null;

    return (
        <Layout showHeader={false} showBottomNav={true}>
            <div className={`min-h-screen transition-colors duration-700 pb-24
                ${hubState === 'Rescue' || hubState === 'PostRescue' ? 'bg-emerald-50/50' :
                    hubState === 'Deep' || hubState === 'PostDeepChat' ? 'bg-indigo-50/50' :
                        hubState === 'Shutdown' ? 'bg-stone-100' :
                            'bg-slate-50'
                }`}
            >
                {/* Greeting Area handled by HomeStateCard now, but we keep top spacing */}
                <div className="pt-12 px-6">
                    {/* Primary State Card */}
                    <HomeStateCard
                        state={hubState}
                        onPrimaryAction={() => {
                            if (hubState === 'Rescue' || hubState === 'PostRescue') navigate('/rescue');
                            else navigate('/chat');
                        }}
                        onSecondaryAction={() => {
                            if (hubState === 'Activated') navigate('/rescue');
                            else navigate('/journey');
                        }}
                    />
                </div>

                {/* Edge State / Education Injection */}
                {(edgeContent || dailyInsight) && showEducation && (
                    <div className="px-6 mt-6 animate-slide-up">
                        <EducationCard
                            content={edgeContent || dailyInsight!}
                            onDismiss={() => setShowEducation(false)}
                            onPrimary={() => {
                                // Simple routing logic for demo actions
                                if (edgeContent?.id === 'safe_space_nudge') navigate('/rescue');
                                else if (edgeContent?.id === 'contextual_nudge') navigate('/journey');
                            }}
                        />
                    </div>
                )}

                {/* Core Widgets */}
                <div className="px-6 mt-8 space-y-6">
                    <EmotionalTemperature
                        value={user?.emotional_baseline || 5}
                        onChange={(val) => {
                            // Update logic would go here
                            console.log('Temperature updated:', val);
                        }}
                    />

                    <ProgressCue
                        streak={0} // Streak hidden/ignored as per "Non-Gamified" rule
                        message="Your pattern awareness is growing."
                        onClick={() => navigate('/journey')}
                    />
                </div>
            </div>
        </Layout>
    );
};

export default DashboardScreen;
