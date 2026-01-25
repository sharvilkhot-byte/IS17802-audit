import React from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import { Home, Sparkles, ShieldAlert, BookOpen, BarChart2 } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

const BottomNavigation: React.FC = () => {
    const location = ReactRouterDOM.useLocation();

    // Navigation Structure
    // Home | Coach | [RESCUE FAB] | Reflect | Growth
    const navItems = [
        { path: '/dashboard', label: 'Home', icon: Home },
        { path: '/coach', label: 'Coach', icon: Sparkles }, // Combined Chat/Scripts
        { path: '/rescue', label: 'Rescue', icon: ShieldAlert, isFab: true },
        { path: '/regulate', label: 'Reflect', icon: BookOpen }, // Hub for Journal/Compass
        { path: '/tracker', label: 'Growth', icon: BarChart2 }, // Hub for Streaks/Report
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
            {/* Gradient Fade for Content Underneath */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/80 to-transparent -z-10" />

            <div className="max-w-md mx-auto px-6 pb-6 pointer-events-auto">
                <div className="bg-white/90 backdrop-blur-xl rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 flex justify-between items-center h-20 px-2 relative">

                    {navItems.map((item) => {
                        // FAB Rendering (Center Rescue Button)
                        if (item.isFab) {
                            return (
                                <ReactRouterDOM.Link
                                    key={item.path}
                                    to={item.path}
                                    className="relative -top-8 group"
                                >
                                    <div className="w-16 h-16 rounded-full bg-rose-500 text-white shadow-lg shadow-rose-200 flex items-center justify-center transform transition-all duration-300 group-hover:scale-105 group-active:scale-95 ring-4 ring-white">
                                        <item.icon size={28} strokeWidth={2.5} />
                                    </div>
                                    <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                        SOS
                                    </span>
                                </ReactRouterDOM.Link>
                            );
                        }

                        // Standard Tab Rendering
                        const isActive = location.pathname === item.path || (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
                        const Icon = item.icon;

                        return (
                            <ReactRouterDOM.Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex flex-col items-center justify-center flex-1 h-full relative group",
                                    isActive ? "text-brand-deep" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <div className={cn(
                                    "flex flex-col items-center transition-all duration-300",
                                    isActive ? "-translate-y-1" : ""
                                )}>
                                    <Icon
                                        size={24}
                                        strokeWidth={isActive ? 2.5 : 2}
                                        className={cn("transition-all duration-300", isActive && "scale-110")}
                                    />
                                    <span className={cn(
                                        "text-[10px] font-bold mt-1 tracking-wide transition-all duration-300",
                                        isActive ? "opacity-100" : "opacity-0 -translate-y-2"
                                    )}>
                                        {item.label}
                                    </span>
                                </div>

                                {/* Active Indicator Dot */}
                                {isActive && (
                                    <div className="absolute bottom-2 w-1 h-1 bg-brand-deep rounded-full animate-fade-in" />
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
