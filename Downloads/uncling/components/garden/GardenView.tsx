import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useGarden } from '../../context/GardenContext';
import { useAuth } from '../../hooks/useAuth';
import Lumi from '../lumi/Lumi';
import AmbientBackground from '../ui/AmbientBackground';
import BreathingModal from './BreathingModal';
import SettingsModal from '../SettingsModal';
import Button from '../Button';
import PillarCard from '../dashboard/PillarCard';
import DailyWisdom from '../Education/DailyWisdom';
import { MessageCircle, Shield, Calendar, Droplets, Users } from 'lucide-react';

// Placeholder Plant Components (Visuals)
const MoonflowerPlant = () => (
    <div className="relative w-40 h-64 flex flex-col items-center justify-end">
        <motion.div
            animate={{ rotate: [0, 2, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-48 bg-emerald-600/80 rounded-full"
        />
        <div className="absolute top-10 w-16 h-16 bg-white/90 rounded-full blur-sm shadow-[0_0_30px_rgba(255,255,255,0.6)]" />
    </div>
);

const FortressCactus = () => (
    <div className="relative w-40 h-56 flex flex-col items-center justify-end">
        <div className="w-24 h-40 bg-emerald-800 rounded-t-full relative overflow-hidden border-2 border-emerald-900">
            <div className="absolute top-4 left-4 w-2 h-2 bg-pink-400 rounded-full blur-[1px]" />
            <div className="absolute top-12 right-6 w-2 h-2 bg-pink-400 rounded-full blur-[1px]" />
        </div>
    </div>
);

const OakTree = () => (
    <div className="relative w-64 h-80 flex flex-col items-center justify-end">
        <div className="w-8 h-48 bg-amber-800 rounded-full" />
        <div className="absolute top-0 w-48 h-40 bg-emerald-700/90 rounded-full blur-sm" />
        <div className="absolute top-10 -left-10 w-32 h-32 bg-emerald-600/90 rounded-full blur-sm" />
        <div className="absolute top-10 -right-10 w-32 h-32 bg-emerald-600/90 rounded-full blur-sm" />
    </div>
);

const GardenView: React.FC = () => {
    const navigate = useNavigate();
    const { weather, profile, waterPlant, plantHealth } = useGarden();
    const { user, signOut } = useAuth();
    const [isBreathing, setIsBreathing] = useState(false);
    const [showSettings, setShowSettings] = useState(false);

    const handleWaterClick = () => {
        setIsBreathing(true);
    };

    const handleBreathingComplete = () => {
        waterPlant();
        setIsBreathing(false);
    };

    const renderMainPlant = () => {
        switch (profile.gardenArchetype) {
            case 'moonflower': return <MoonflowerPlant />;
            case 'fortress': return <FortressCactus />;
            case 'oak': return <OakTree />;
            default: return <MoonflowerPlant />; // Default fallback
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        const name = user?.preferred_name || 'Traveler';
        if (hour < 12) return `Good morning, ${name}`;
        if (hour < 18) return `Good afternoon, ${name}`;
        return `Good evening, ${name}`;
    };

    return (
        <div className="relative w-full min-h-screen pb-24 overflow-hidden bg-slate-50">
            {/* Dynamic Sky */}
            <AmbientBackground weather={weather} />

            <BreathingModal
                isOpen={isBreathing}
                onComplete={handleBreathingComplete}
                onCancel={() => setIsBreathing(false)}
            />

            {showSettings && (
                <SettingsModal title="Account" onClose={() => setShowSettings(false)}>
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-brand-deep font-bold text-xl shadow-sm">
                                {user?.preferred_name?.[0] || 'U'}
                            </div>
                            <div>
                                <p className="font-heading font-bold text-brand-deep">{user?.preferred_name || 'Traveler'}</p>
                                <p className="text-sm text-brand-deep/50">{user?.email}</p>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Button
                                onClick={async () => {
                                    await signOut();
                                    navigate('/auth');
                                }}
                                variant="secondary"
                                className="w-full justify-center text-red-400 hover:text-red-500 hover:bg-red-50 border-red-100"
                            >
                                Sign Out
                            </Button>
                        </div>

                        <div className="text-center">
                            <p className="text-xs text-brand-deep/30">Uncling v1.0</p>
                        </div>
                    </div>
                </SettingsModal>
            )}

            {/* Header / Top Bar */}
            <div className="relative z-20 px-6 pt-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-serif text-brand-deep">{getGreeting()}</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-brand-deep/60 text-sm">
                            It's a {weather} day in your garden.
                        </span>
                        <div className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-deep/5 text-brand-deep/60 text-xs font-medium">
                            <Calendar size={12} />
                            <span>Day 12</span>
                        </div>
                    </div>
                </div>
                {/* Profile Avatar / Settings Modal Trigger */}
                <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center text-brand-deep/70 hover:bg-white/60 transition-colors">
                    <span className="font-heading font-bold">{user?.preferred_name?.[0] || 'U'}</span>
                </button>
            </div>

            {/* Hero Section: The Garden */}
            <div className="relative w-full h-[45vh] flex flex-col items-center justify-end pb-8">

                {/* Lumi */}
                <div className="absolute top-[20%] flex flex-col items-center gap-4 z-10 transition-transform hover:scale-105 duration-500">
                    <div onClick={() => navigate('/chat')} className="cursor-pointer">
                        <Lumi mood={weather === 'stormy' ? 'concerned' : 'happy'} size="md" />
                    </div>
                    {/* Interaction Prompt */}
                    {plantHealth < 100 && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <Button
                                onClick={handleWaterClick}
                                className="bg-white/50 backdrop-blur-md text-brand-deep shadow-sm hover:bg-white/80 py-2 px-4 text-sm flex items-center gap-2"
                            >
                                <Droplets size={14} className="text-blue-400" />
                                Water Garden
                            </Button>
                        </motion.div>
                    )}
                </div>

                {/* The Plant */}
                <div className="transform scale-125 origin-bottom z-0">
                    {renderMainPlant()}
                </div>

                {/* Soil Gradient */}
                <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-[#EAE4DC] via-[#EAE4DC]/80 to-transparent blur-xl" />
            </div>


            {/* Content Grid (The Hub) */}
            <div className="relative z-10 px-6 -mt-4 space-y-4">

                {/* 3 Pillar Cards */}
                <PillarCard
                    title="Regulate & Reflect"
                    subtitle="Calm your nervous system"
                    icon={Shield}
                    color="rose"
                    onClick={() => navigate('/regulate')}
                    delay={0.1}
                />
                <PillarCard
                    title="Secure Base Coach"
                    subtitle="Reframe and reconnect"
                    icon={MessageCircle}
                    color="lavender"
                    onClick={() => navigate('/coach')}
                    delay={0.2}
                />
                <PillarCard
                    title="Internal Family"
                    subtitle="Know your patterns"
                    icon={Users}
                    color="sage"
                    onClick={() => navigate('/tracker')}
                    delay={0.3}
                />


                {/* Recent Insight (Micro-Feed) */}
                <div className="w-full">
                    <DailyWisdom
                        type={profile.primaryStyle === 'unknown' ? 'secure' : profile.primaryStyle as any}
                        theme="light"
                    />
                </div>

            </div>

            {/* Bottom spacer for mobile nav */}
            <div className="h-24" />
        </div>
    );
};

export default GardenView;
