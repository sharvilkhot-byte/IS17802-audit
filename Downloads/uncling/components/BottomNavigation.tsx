
import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';

// Simple SVG Icons
const HomeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>;
const PauseIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>;
const ChartIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"></path><path d="m18.7 8-5.1 5.2-2.8-2.7L7 14.3"></path></svg>;

const BottomNavigation: React.FC = () => {
    const location = ReactRouterDOM.useLocation();

    // Updated Emotional Labels
    // Updated Emotional Labels per Micro-Copy v1.0
    // Space (Home), Notes (Chat), Pause (Rescue), Reflect (Progress)
    const navItems = [
        { path: '/dashboard', label: 'Space', icon: <HomeIcon /> },
        { path: '/chat', label: 'Notes', icon: <EditIcon />, isPrimary: true },
        { path: '/rescue', label: 'Pause', icon: <PauseIcon /> },
        { path: '/progress', label: 'Reflect', icon: <ChartIcon /> },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-safe-bottom">
            {/* Glassmorphic Container - Floating style */}
            <div className="max-w-md mx-auto px-4 pb-4 pointer-events-auto">
                <div className="bg-white/90 backdrop-blur-md rounded-[2rem] shadow-[0_8px_32px_rgba(0,0,0,0.08)] border border-white/50 flex justify-between items-end h-18 px-6 py-3 relative">
                    {navItems.map((item) => {
                        const isActive = item.path === '/dashboard'
                            ? location.pathname === '/dashboard'
                            : location.pathname.startsWith(item.path);

                        return (
                            <ReactRouterDOM.Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center relative group active:scale-95 transition-transform duration-200
                                    ${item.isPrimary ? '-mt-12' : ''}
                                `}
                            >
                                <div className={`
                                    flex items-center justify-center rounded-2xl transition-all duration-500 ease-out
                                    ${item.isPrimary
                                        ? 'bg-forest text-white shadow-xl shadow-forest/30 w-14 h-14 ring-8 ring-background/50 hover:-translate-y-1'
                                        : 'w-10 h-10 hover:bg-gray-50'
                                    }
                                    ${!item.isPrimary && isActive ? 'text-forest bg-forest/5' : !item.isPrimary ? 'text-gray-400' : ''}
                                `}>
                                    {React.cloneElement(item.icon, {
                                        width: item.isPrimary ? 24 : 22,
                                        height: item.isPrimary ? 24 : 22,
                                        strokeWidth: isActive || item.isPrimary ? 2.5 : 2
                                    })}
                                </div>

                                {!item.isPrimary && (
                                    <span className={`text-[10px] font-medium mt-1 leading-none transition-opacity duration-300 ${isActive ? 'text-textPrimary opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}>
                                        {item.label}
                                    </span>
                                )}
                            </ReactRouterDOM.Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BottomNavigation;
