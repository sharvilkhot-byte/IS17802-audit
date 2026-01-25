import React, { useEffect, useState } from 'react';
import { get15DayStats } from '../../services/analytics';
import { useAuth } from '../../hooks/useAuth';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Shield, Sparkles, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const BackIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-deep/70 hover:text-brand-deep transition-colors"><path d="M15 18l-6-6 6-6" /></svg>;

const ReportView: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        get15DayStats(user.id).then(data => {
            setStats(data);
            setLoading(false);
        });
    }, [user]);

    if (loading) return <div className="p-8 text-center text-slate-400"> Analyzing patterns...</div>;

    const data = [
        { name: 'It makes sense (Anx/Av)', value: stats.patterns.Anxious + stats.patterns.Avoidant, color: '#94a3b8' }, // Slate-400
        { name: 'Self-Led (Secure)', value: stats.patterns.Secure, color: '#059669' }, // Emerald-600
    ];

    const awarenessRate = Math.round((stats.totalCheckIns / 15) * 100);

    return (
        <div className="flex flex-col items-center p-6 pb-20 max-w-md mx-auto animate-fade-in relative z-10 w-full min-h-screen bg-white md:bg-transparent">
            {/* Header with Back Button */}
            <div className="w-full flex items-center justify-between mb-4 mt-4">
                <button onClick={() => navigate('/dashboard')} className="p-2 rounded-full hover:bg-slate-100 transition-colors">
                    <BackIcon />
                </button>
                <div className="text-center flex-1">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">15-Day Shift Report</p>
                    <h1 className="text-2xl font-serif text-brand-deep">Earned Security</h1>
                </div>
                <div className="w-10"></div>
            </div>

            {/* 1. Garden Growth */}
            <div className="w-full bg-white/70 backdrop-blur-md rounded-3xl p-6 shadow-sm border border-slate-100 mb-6">
                <h3 className="text-lg font-medium text-slate-700 mb-4 flex items-center gap-2">
                    <span className="text-xl">🌱</span> Your Garden's Growth
                </h3>
                <p className="text-xs text-slate-500 mb-3">What grew in your inner landscape</p>

                <div className="h-48 w-full relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                stroke="none"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Center Label */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="text-2xl font-bold text-slate-800">{stats.totalCheckIns}</span>
                            <span className="block text-[10px] text-slate-400 uppercase tracking-wide">Check-ins</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-600"></div>
                        <span className="text-xs text-slate-600">Self-Led</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-slate-400"></div>
                        <span className="text-xs text-slate-600">Protectors</span>
                    </div>
                </div>
            </div>

            {/* 2. Truth Bank */}
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mb-3">
                        <Shield size={20} />
                    </div>
                    <span className="text-3xl font-serif text-slate-800 mb-1">{stats.truthBankBalance}</span>
                    <span className="text-xs text-slate-400 font-medium">Truths Planted</span>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-3">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-3xl font-serif text-slate-800 mb-1">{stats.streakDays}</span>
                    <span className="text-xs text-slate-400 font-medium">Days Tending</span>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center text-rose-600 mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                    </div>
                    <span className="text-3xl font-serif text-slate-800 mb-1">{stats.rescueCount}</span>
                    <span className="text-xs text-slate-400 font-medium">SOS Rescues</span>
                </div>

                <div className="bg-white/70 backdrop-blur-md rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col items-center text-center">
                    <div className="w-10 h-10 bg-sky-100 rounded-full flex items-center justify-center text-sky-600 mb-3">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    </div>
                    <span className="text-3xl font-serif text-slate-800 mb-1">{stats.chatSessionCount}</span>
                    <span className="text-xs text-slate-400 font-medium">Chat Sessions</span>
                </div>
            </div>

            {/* 3. Narrative Insight */}
            <div className="w-full bg-forest/5 rounded-2xl p-6 border border-forest/10">
                <p className="text-brand-deep text-sm leading-relaxed text-center italic">
                    "You are building the muscle of noticing. Every time you named a protector, you created a pause. That pause is where security grows."
                </p>
            </div>

            <div className="mt-8 text-center">
                <button className="text-sm text-slate-400 underline hover:text-slate-600">Export PDF (Coming Soon)</button>
            </div>
        </div>
    );
};

export default ReportView;
