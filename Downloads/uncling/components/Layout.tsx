
import React, { ReactNode } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import BottomNavigation from './BottomNavigation';



import { NudgeProvider } from './Nudge/NudgeProvider';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = ReactRouterDOM.useLocation();


  // Define paths where the bottom navigation should NOT appear
  const hideNavPaths = [
    '/onboarding',
    '/onboarding/result',
    '/onboarding/education_intro',
  ];

  const shouldShowNav = !hideNavPaths.includes(location.pathname);

  // Chat pages need to handle their own internal scrolling (for messages)
  // while keeping the input fixed. Other pages scroll the entire body.
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <NudgeProvider>
      <div className="flex-1 flex flex-col bg-background font-sans text-textPrimary overflow-hidden h-full pt-safe-top transition-colors duration-700 ease-in-out">
        {/* Ambient Gradient Background Layer - Simplified for Unclinq 'Grounded Calm' */}
        <div className="absolute inset-0 bg-sage/20 opacity-40 pointer-events-none z-0" />

        <main
          className={`
          relative z-10 flex-1 w-full flex flex-col
          ${isChatPage ? 'overflow-hidden' : 'overflow-y-auto scroll-touch'} 
          ${shouldShowNav ? 'pb-[calc(4rem+env(safe-area-inset-bottom))]' : 'pb-safe-bottom'}
        `}
        >
          <div className={`container mx-auto px-4 py-4 sm:py-6 flex-1 flex flex-col max-w-lg ${isChatPage ? 'h-full' : ''}`}>
            {children}
          </div>
        </main>
        {shouldShowNav && <BottomNavigation />}
      </div>
    </NudgeProvider>
  );
};

export default Layout;
