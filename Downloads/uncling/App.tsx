

import React, { useContext, Suspense, lazy, useEffect } from 'react';
// Fix: Changed react-router-dom import to a namespace import to resolve module resolution issues.
import * as ReactRouterDOM from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import SplashScreen from './pages/SplashScreen';
import { identifyUser, resetUser } from './services/analytics';

// Lazy-loaded page components
const SplashScreenSecondary = lazy(() => import('./pages/SplashScreenSecondary'));
const AuthScreen = lazy(() => import('./pages/AuthScreen'));
const GuidedReflection = lazy(() => import('./pages/GuidedReflection'));
const GuidedResult = lazy(() => import('./pages/GuidedResult'));
const DashboardScreen = lazy(() => import('./pages/DashboardScreen'));
const SecureSelfChat = lazy(() => import('./pages/SecureSelfChat'));
const RescueMeNow = lazy(() => import('./pages/RescueMeNow'));
const PatternScreen = lazy(() => import('./pages/PatternScreen'));
const SettingsScreen = lazy(() => import('./pages/SettingsScreen'));

const JourneyScreen = lazy(() => import('./pages/JourneyScreen'));


const LoadingSpinner: React.FC = () => (
    <div className="flex items-center justify-center h-full bg-background">
        <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-forest"></div>
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
        // User needs to onboard. Redirect to the start of Guided Reflection.
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
                    <ReactRouterDOM.Route path="/" element={<SplashScreen />} />
                    <ReactRouterDOM.Route path="/welcome" element={<SplashScreenSecondary />} />
                    <ReactRouterDOM.Route path="/auth" element={<AuthScreen />} />
                    <ReactRouterDOM.Route element={<ProtectedRoute />}>
                        <ReactRouterDOM.Route path="/onboarding" element={<GuidedReflection />} />
                        <ReactRouterDOM.Route path="/onboarding/result" element={<GuidedResult />} />
                        <ReactRouterDOM.Route path="/dashboard" element={<DashboardScreen />} />
                        <ReactRouterDOM.Route path="/journey" element={<JourneyScreen />} />
                        <ReactRouterDOM.Route path="/chat/:sessionId?" element={<SecureSelfChat />} />
                        <ReactRouterDOM.Route path="/rescue" element={<RescueMeNow />} />
                        <ReactRouterDOM.Route path="/progress" element={<PatternScreen />} />
                        <ReactRouterDOM.Route path="/settings" element={<SettingsScreen />} />
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
                <AppRoutes />
            </SettingsProvider>
        </AuthProvider>
    );
};

export default App;
