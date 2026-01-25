import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useGarden } from '../context/GardenContext';
import EmotionalTemperature from '../components/HomeHub/EmotionalTemperature';
import WhoIsDrivingWidget from '../components/HomeHub/WhoIsDrivingWidget';
import GardenView from '../components/garden/GardenView';
import { Sparkles, Wind, BookOpen, Compass } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DashboardScreen: React.FC = () => {
    const { user } = useAuth();
    const { weather } = useGarden();
    const navigate = useNavigate();

    const getTimeGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div className="flex flex-col gap-6 pb-32 animate-fade-in sm:max-w-md sm:mx-auto">
            {/* 1. Header Section */}
            <header className="px-2 pt-2">
                <p className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-1">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
                <div className="flex items-end justify-between">
                    <div>
                        <h1 className="text-3xl font-serif text-slate-800">
                            {getTimeGreeting()},
                        </h1>
                        <p className="text-xl text-slate-500 font-light">
                            {user?.email?.split('@')[0] || 'Friend'}
                        </p>
                    </div>
                    {/* Tiny Weather Icon based on Garden State */}
                    <div className="bg-white/50 p-2 rounded-2xl backdrop-blur-sm border border-white/40">
                        <span className="text-2xl" role="img" aria-label="weather">
                            {weather === 'sunny' ? '☀️' : weather === 'rainy' ? '🌧️' : '☁️'}
                        </span>
                    </div>
                </div>
            </header>

            {/* 2. Emotional Pulse (The "One Thing" to do) */}
            <section>
                <EmotionalTemperature />
            </section>

            {/* 3. Primary Action Grid */}
            <section className="grid grid-cols-2 gap-3">
                <button
                    onClick={() => navigate('/chat')}
                    className="bg-indigo-50/50 p-4 rounded-[2rem] border border-indigo-100/50 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-indigo-500 shadow-sm">
                        <Sparkles size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-indigo-900/60">Secure Chat</span>
                </button>

                <button
                    onClick={() => navigate('/rescue')}
                    className="bg-rose-50/50 p-4 rounded-[2rem] border border-rose-100/50 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-rose-500 shadow-sm">
                        <Wind size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-rose-900/60">Somatic SOS</span>
                </button>

                <button
                    onClick={() => navigate('/parts-checkin')}
                    className="bg-emerald-50/50 p-4 rounded-[2rem] border border-emerald-100/50 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-emerald-500 shadow-sm">
                        <Compass size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-emerald-900/60">Parts Check-in</span>
                </button>

                <button
                    onClick={() => navigate('/journal')}
                    className="bg-amber-50/50 p-4 rounded-[2rem] border border-amber-100/50 flex flex-col items-center justify-center gap-3 active:scale-95 transition-transform"
                >
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-amber-500 shadow-sm">
                        <BookOpen size={24} strokeWidth={1.5} />
                    </div>
                    <span className="text-sm font-medium text-amber-900/60">Journal</span>
                </button>
            </section>

            {/* 4. Who Is Driving? (Awareness Widget) */}
            <section>
                <div className="flex items-center justify-between px-2 mb-3">
                    <h2 className="text-lg font-serif text-slate-700">Internal Weather</h2>
                    <span className="text-xs text-slate-400">Tap to update</span>
                </div>
                <WhoIsDrivingWidget />
            </section>

            {/* 5. Garden Snapshot */}
            <section className="bg-white/30 rounded-[2.5rem] p-1 border border-white/40 overflow-hidden relative min-h-[200px]">
                <div className="absolute top-4 left-6 z-10">
                    <h2 className="text-lg font-serif text-slate-700">Your Garden</h2>
                    <p className="text-xs text-slate-500">Tended for {0} days</p>
                </div>
                {/* Scale down the garden view to fit as a widget */}
                <div className="transform scale-[0.8] origin-top -mt-10 -mb-20 pointer-events-none">
                    <GardenView />
                </div>
                {/* Overlay to make it clickable to go to full garden view */}
                <div
                    onClick={() => navigate('/garden')}
                    className="absolute inset-0 z-20 cursor-pointer"
                />
            </section>
        </div>
    );
};

export default DashboardScreen;
