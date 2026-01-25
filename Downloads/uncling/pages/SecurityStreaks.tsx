import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { InternalState } from '../types';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ArrowLeft, Calendar, Flame, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CheckIn {
    created_at: string;
    state: InternalState;
}

const SecurityStreaks: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [checkIns, setCheckIns] = useState<CheckIn[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestStreak, setLongestStreak] = useState(0);

    useEffect(() => {
        fetchCheckIns();
    }, [user]);

    const fetchCheckIns = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('daily_check_ins')
                .select('created_at, state')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCheckIns(data || []);
            calculateStreaks(data || []);
        } catch (error) {
            console.error('Error fetching check-ins:', error);
        } finally {
            setLoading(false);
        }
    };

    const calculateStreaks = (data: CheckIn[]) => {
        if (data.length === 0) {
            setCurrentStreak(0);
            setLongestStreak(0);
            return;
        }

        // Get unique dates
        const dates = data.map(c => new Date(c.created_at).toDateString());
        const uniqueDates = [...new Set(dates)];

        // Calculate current streak
        let current = 0;
        const today = new Date().toDateString();
        const yesterday = new Date(Date.now() - 86400000).toDateString();

        if (uniqueDates.includes(today) || uniqueDates.includes(yesterday)) {
            current = 1;
            let checkDate = uniqueDates.includes(today)
                ? new Date()
                : new Date(Date.now() - 86400000);

            for (let i = 1; i < uniqueDates.length; i++) {
                checkDate.setDate(checkDate.getDate() - 1);
                if (uniqueDates.includes(checkDate.toDateString())) {
                    current++;
                } else {
                    break;
                }
            }
        }

        // Calculate longest streak
        let longest = 0;
        let tempStreak = 1;
        for (let i = 0; i < uniqueDates.length - 1; i++) {
            const date1 = new Date(uniqueDates[i]);
            const date2 = new Date(uniqueDates[i + 1]);
            const diffDays = Math.floor((date1.getTime() - date2.getTime()) / 86400000);

            if (diffDays === 1) {
                tempStreak++;
            } else {
                longest = Math.max(longest, tempStreak);
                tempStreak = 1;
            }
        }
        longest = Math.max(longest, tempStreak);

        setCurrentStreak(current);
        setLongestStreak(longest);
    };

    const getCalendarDays = () => {
        const days = [];
        const today = new Date();

        // Get last 35 days (5 weeks)
        for (let i = 34; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            days.push(date);
        }

        return days;
    };

    const hasCheckInOnDate = (date: Date) => {
        const dateString = date.toDateString();
        return checkIns.some(c => new Date(c.created_at).toDateString() === dateString);
    };

    const getCheckInState = (date: Date): InternalState | null => {
        const dateString = date.toDateString();
        const checkIn = checkIns.find(c => new Date(c.created_at).toDateString() === dateString);
        return checkIn?.state || null;
    };

    const getStateColor = (state: InternalState | null) => {
        if (!state) return 'bg-slate-100';
        switch (state) {
            case 'Secure': return 'bg-forest';
            case 'Anxious': return 'bg-amber-400';
            case 'Avoidant': return 'bg-slate-400';
            default: return 'bg-slate-100';
        }
    };

    const calendarDays = getCalendarDays();
    const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-forest/5 to-slate-50 pb-24">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <button
                        onClick={() => navigate('/tracker')}
                        className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                        Security Streaks
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Track your days of awareness
                    </p>
                </div>

                {/* Stats */}
                <div className="px-6 mb-6">
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-br from-forest/10 to-forest/5 rounded-2xl p-5 border border-forest/20"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Flame size={20} className="text-forest" />
                                <span className="text-sm font-semibold text-forest">Current Streak</span>
                            </div>
                            <div className="text-3xl font-bold text-brand-deep">
                                {currentStreak}
                            </div>
                            <div className="text-xs text-brand-deep/60 mt-1">
                                {currentStreak === 1 ? 'day' : 'days'}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <TrendingUp size={20} className="text-brand-deep/60" />
                                <span className="text-sm font-semibold text-brand-deep/60">Longest Streak</span>
                            </div>
                            <div className="text-3xl font-bold text-brand-deep">
                                {longestStreak}
                            </div>
                            <div className="text-xs text-brand-deep/60 mt-1">
                                {longestStreak === 1 ? 'day' : 'days'}
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Calendar */}
                <div className="px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-slate-200"
                    >
                        <div className="flex items-center gap-2 mb-4">
                            <Calendar size={20} className="text-brand-deep" />
                            <h3 className="font-heading font-bold text-brand-deep">
                                Last 5 Weeks
                            </h3>
                        </div>

                        {/* Week day labels */}
                        <div className="grid grid-cols-7 gap-2 mb-2">
                            {weekDays.map((day, i) => (
                                <div key={i} className="text-center text-xs font-semibold text-brand-deep/50">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-2">
                            {calendarDays.map((date, index) => {
                                const hasCheckIn = hasCheckInOnDate(date);
                                const state = getCheckInState(date);
                                const isToday = date.toDateString() === new Date().toDateString();

                                return (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.01 }}
                                        className={`
                                            aspect-square rounded-lg flex items-center justify-center
                                            ${hasCheckIn ? getStateColor(state) : 'bg-slate-100'}
                                            ${isToday ? 'ring-2 ring-brand-deep ring-offset-2' : ''}
                                            transition-all
                                        `}
                                        title={`${date.toLocaleDateString()} ${state ? `- ${state}` : ''}`}
                                    >
                                        {hasCheckIn && (
                                            <div className="w-2 h-2 bg-white rounded-full" />
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        {/* Legend */}
                        <div className="mt-6 pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-center gap-6 text-xs">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-forest" />
                                    <span className="text-brand-deep/60">Secure</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-amber-400" />
                                    <span className="text-brand-deep/60">Anxious</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded bg-slate-400" />
                                    <span className="text-brand-deep/60">Avoidant</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Encouragement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-6 bg-forest/5 rounded-2xl p-6 border border-forest/20"
                    >
                        <p className="text-center text-brand-deep/80 leading-relaxed">
                            {currentStreak === 0 && "Start your awareness journey today. Every check-in counts."}
                            {currentStreak === 1 && "Great start! Building awareness is a practice."}
                            {currentStreak >= 2 && currentStreak < 7 && "You're building momentum. Keep noticing."}
                            {currentStreak >= 7 && currentStreak < 14 && "One week of awareness! This is real progress."}
                            {currentStreak >= 14 && "Incredible consistency. You're rewiring your nervous system."}
                        </p>
                    </motion.div>

                    {/* Action Button */}
                    <div className="mt-6">
                        <Button
                            onClick={() => navigate('/parts-checkin')}
                            className="w-full"
                        >
                            Check In Now
                        </Button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default SecurityStreaks;
