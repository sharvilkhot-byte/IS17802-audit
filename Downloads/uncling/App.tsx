import React, { useContext, Suspense, lazy, useEffect } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { GardenProvider } from './context/GardenContext';
import { identifyUser, resetUser } from './services/analytics';

// Lazy-loaded page components
const TheVoid = lazy(() => import('./pages/TheVoid'));
const OnboardingScreen = lazy(() => import('./pages/OnboardingScreen')); // NEW FLOW
const OnboardingResult = lazy(() => import('./pages/OnboardingResult')); // NEW RESULT SCREEN
const AuthScreen = lazy(() => import('./pages/AuthScreen'));

const DashboardScreen = lazy(() => import('./pages/DashboardScreen'));
const SecureSelfChat = lazy(() => import('./pages/SecureSelfChat'));
const RescueMeNow = lazy(() => import('./pages/RescueMeNow'));
const ReportView = lazy(() => import('./components/Analytics/ReportView')); // Phase 4

// Pillar Hub Pages
const RegulateHub = lazy(() => import('./pages/RegulateHub'));
const CoachHub = lazy(() => import('./pages/CoachHub'));
const TrackerHub = lazy(() => import('./pages/TrackerHub'));

// Feature Pages
const FeelingsCompass = lazy(() => import('./pages/FeelingsCompass'));
const AndJournal = lazy(() => import('./pages/AndJournal'));
const EvidenceLogList = lazy(() => import('./pages/EvidenceLogList'));
const RepairScripts = lazy(() => import('./pages/RepairScripts'));
const PartsCheckIn = lazy(() => import('./pages/PartsCheckIn'));
const SecurityStreaks = lazy(() => import('./pages/SecurityStreaks'));





const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full bg-slate-50">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-brand-lavender"></div>
    </div>
);

const ProtectedRoute: React.FC = () => {
    const auth = useContext(AuthContext);
    const location = ReactRouterDOM.useLocation();
    if (!auth) return null; // Should not happen within provider

    if (auth.loading) {
        return <LoadingSpinner />;
    }

    if (!auth.user) {
        return <ReactRouterDOM.Navigate to="/auth" replace />;
    }

    const needsOnboarding = !auth.user.attachment_style;
    const isOnboardingFlow = location.pathname.startsWith('/onboarding');

    if (needsOnboarding && !isOnboardingFlow) {
        // User needs to onboard. Redirect to the start of the New Flow.
        return <ReactRouterDOM.Navigate to="/onboarding" replace />;
    }

    // Otherwise, the user is authorized for the page they are on.
    return <ReactRouterDOM.Outlet />;
};

const AppRoutes: React.FC = () => {
    const auth = useContext(AuthContext);

    useEffect(() => {
        if (auth?.user) {
            identifyUser(auth.user);
        } else if (!auth?.loading) {
            resetUser();
        }
    }, [auth?.user, auth?.loading]);

    return (
        <ReactRouterDOM.HashRouter>
            <Suspense fallback={<LoadingSpinner />}>
                <ReactRouterDOM.Routes>
                    {/* Unclinq 3.0 Flow */}
                    <ReactRouterDOM.Route path="/" element={<TheVoid />} />

                    {/* NEW DYNAMIC ONBOARDING FLOW */}
                    {/* NEW DYNAMIC ONBOARDING FLOW */}
                    <ReactRouterDOM.Route path="/onboarding" element={<OnboardingScreen />} />
                    <ReactRouterDOM.Route path="/onboarding/result" element={<OnboardingResult />} />
                    <ReactRouterDOM.Route path="/auth" element={<AuthScreen />} />


                    <ReactRouterDOM.Route element={<ProtectedRoute />}>
                        {/* <ReactRouterDOM.Route path="/onboarding" element={<GuidedReflection />} />  REMOVED OLD FLOW */}
                        <ReactRouterDOM.Route path="/dashboard" element={<DashboardScreen />} />

                        {/* Pillar Hub Pages */}
                        <ReactRouterDOM.Route path="/regulate" element={<RegulateHub />} />
                        <ReactRouterDOM.Route path="/coach" element={<CoachHub />} />
                        <ReactRouterDOM.Route path="/tracker" element={<TrackerHub />} />
                        <ReactRouterDOM.Route path="/chat/:sessionId?" element={<SecureSelfChat />} />
                        <ReactRouterDOM.Route path="/rescue" element={<RescueMeNow />} />
                        <ReactRouterDOM.Route path="/report" element={<ReportView />} />

                        {/* Feature Pages */}
                        <ReactRouterDOM.Route path="/feelings" element={<FeelingsCompass />} />
                        <ReactRouterDOM.Route path="/journal" element={<AndJournal />} />
                        <ReactRouterDOM.Route path="/evidence-log" element={<EvidenceLogList />} />
                        <ReactRouterDOM.Route path="/scripts" element={<RepairScripts />} />
                        <ReactRouterDOM.Route path="/parts-checkin" element={<PartsCheckIn />} />
                        <ReactRouterDOM.Route path="/streaks" element={<SecurityStreaks />} />
                    </ReactRouterDOM.Route>
                </ReactRouterDOM.Routes>
            </Suspense>
        </ReactRouterDOM.HashRouter>
    );
};


const App: React.FC = () => {
    return (
        <AuthProvider>
            <SettingsProvider>
                <GardenProvider>
                    <AppRoutes />
                </GardenProvider>
            </SettingsProvider>
        </AuthProvider>
    );
};

export default App;
