
import React, { ReactNode } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import BottomNavigation from './BottomNavigation';



import { NudgeProvider } from './Nudge/NudgeProvider';

interface LayoutProps {
  children: ReactNode;
}

import AmbientBackground from './ui/AmbientBackground';

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = ReactRouterDOM.useLocation();

  // Define paths where the bottom navigation should NOT appear
  const hideNavPaths = [
    '/onboarding',
    '/onboarding/result',
    '/journey',
  ];

  const shouldShowNav = !hideNavPaths.includes(location.pathname);

  // Chat pages need to handle their own internal scrolling (for messages)
  // while keeping the input fixed. Other pages scroll the entire body.
  const isChatPage = location.pathname.startsWith('/chat');

  return (
    <NudgeProvider>
      <div className="flex flex-col lg:flex-row w-full h-screen supports-[height:100dvh]:h-[100dvh] text-brand-deep font-sans overflow-hidden relative">
        <AmbientBackground />

        {/* Navigation Sidebar (Desktop) */}
        <aside className="hidden lg:flex w-72 bg-white/50 backdrop-blur-md border-r border-white/20 flex-col h-full shrink-0 z-30">
          <div className="p-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-brand-lavender rounded-2xl flex items-center justify-center text-white shadow-lg shadow-brand-lavender/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-heart"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              </div>
              <h1 className="text-2xl font-bold text-brand-deep tracking-tight">Unclinq</h1>
            </div>

            <nav className="space-y-2">
              <NavLinks />
            </nav>
          </div>

          <div className="mt-auto p-8">
            <div className="bg-white/30 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-sm">
              <p className="text-sm font-bold text-brand-deep mb-1">Serenity Mode</p>
              <p className="text-xs text-brand-deep/60">v2.1 Living Interface</p>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={`relative flex-1 flex flex-col h-full transition-all duration-500 overflow-hidden`}>
          {/* Mobile Header */}
          <div className="lg:hidden p-4 bg-white/30 backdrop-blur-md border-b border-white/10 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-brand-lavender rounded-xl flex items-center justify-center text-white shadow-md">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" /></svg>
              </div>
              <h1 className="text-lg font-bold text-brand-deep">Unclinq</h1>
            </div>
            {/* Simple Mobile Menu Trigger (can expand later) */}
            <div className="w-8 h-8 rounded-full bg-white/40 flex items-center justify-center text-brand-deep">
              <span className="font-bold text-xs">A</span>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className={`flex-1 overflow-y-auto custom-scroll w-full relative ${isChatPage ? 'h-full' : ''}`}>
            <div className={`container mx-auto px-4 py-6 md:p-8 lg:p-12 w-full max-w-5xl ${isChatPage ? 'h-full p-0 md:p-0 lg:p-0 max-w-none' : ''}`}>
              {children}
            </div>
          </div>

          {shouldShowNav && (
            <div className="lg:hidden relative z-50">
              <BottomNavigation />
            </div>
          )}
        </main>
      </div>
    </NudgeProvider>
  );
};

// Helper for Nav Links (used in sidebar)
const NavLinks = () => {
  // This could effectively duplicate BottomNavigation logiic for sidebar
  // For now, simpler static links or reusing logic could work.
  // Given the constraints, we will rely on BottomNavigation for mobile and just show static visual for sidebar until we wire it fully.
  return (
    <>
      <a href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-brand-lavender text-white font-medium shadow-soft transition-all hover:scale-[1.02]">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
        Home
      </a>
      <a href="/chat" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-rose/20 text-brand-deep/80 font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /></svg>
        Secure Chat
      </a>
      <a href="/rescue" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-rose/20 text-brand-deep/80 font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" /></svg>
        Safe Space
      </a>
      <a href="/progress" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-brand-rose/20 text-brand-deep/80 font-medium transition-colors">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2" /></svg>
        Progress
      </a>
    </>
  )
}

export default Layout;
