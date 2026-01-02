import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../services/supabase';
import { ChevronLeft, User, Bell, Database, LogOut, ChevronRight, Shield, Moon } from 'lucide-react';

const SettingsScreen: React.FC = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleSignOut = async () => {
        await signOut();
        navigate('/auth');
    };

    const handleClearData = async () => {
        if (window.confirm("Are you sure? This will clear local preferences. Your cloud data will remain.")) {
            localStorage.clear();
            alert("Local preferences cleared.");
        }
    };

    return (
        <Layout>
            <div className="max-w-2xl mx-auto pb-24 px-4 space-y-8 animate-fade-in">

                {/* Header */}
                <div className="pt-4 flex items-center gap-2 mb-2">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif text-textPrimary">Settings</h1>
                        <p className="text-textSecondary text-sm">Manage your account and preferences.</p>
                    </div>
                </div>

                {/* Profile Section */}
                <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                    <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-textPrimary">{user?.preferred_name || 'User'}</p>
                                <p className="text-xs text-textSecondary">{user?.email}</p>
                            </div>
                        </div>
                        <span className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{user?.attachment_style || 'Unknown'}</span>
                    </div>

                    <button onClick={() => navigate('/onboarding')} className="w-full p-4 text-left hover:bg-slate-50 transition-colors flex items-center justify-between group">
                        <span className="text-sm text-textSecondary group-hover:text-textPrimary transition-colors">Retake Assessment</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500" />
                    </button>
                </section>

                {/* Preferences */}
                <section className="space-y-4">
                    <h3 className="text-sm uppercase tracking-wider text-textSecondary font-semibold pl-1">Preferences</h3>

                    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">

                        <div className="p-4 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <Bell size={18} className="text-slate-400" />
                                <span className="text-sm font-medium text-textPrimary">Daily Reminders</span>
                            </div>
                            <button
                                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                                className={`w-11 h-6 rounded-full transition-colors relative ${notificationsEnabled ? 'bg-forest' : 'bg-slate-200'}`}
                            >
                                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${notificationsEnabled ? 'left-[22px]' : 'left-0.5'}`} />
                            </button>
                        </div>

                        <div className="p-4 flex items-center justify-between border-b border-slate-50">
                            <div className="flex items-center gap-3">
                                <Moon size={18} className="text-slate-400" />
                                <span className="text-sm font-medium text-textPrimary">Dark Mode Support</span>
                            </div>
                            <span className="text-xs text-slate-400">System Default</span>
                        </div>

                        <div className="p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Shield size={18} className="text-slate-400" />
                                <span className="text-sm font-medium text-textPrimary">Data Privacy</span>
                            </div>
                            <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Encrypted</span>
                        </div>
                    </div>
                </section>

                {/* Actions */}
                <section className="space-y-3">
                    <button
                        onClick={handleClearData}
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between hover:bg-slate-50 transition-colors text-slate-600"
                    >
                        <div className="flex items-center gap-3">
                            <Database size={18} />
                            <span className="text-sm font-medium">Clear Local Cache</span>
                        </div>
                    </button>

                    <button
                        onClick={handleSignOut}
                        className="w-full bg-slate-100 border border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors text-slate-600 font-medium"
                    >
                        <LogOut size={18} />
                        <span>Sign Out</span>
                    </button>
                </section>

                <div className="text-center pt-8 pb-4">
                    <p className="text-xs text-slate-300">Uncling v1.0.0 (Beta)</p>
                </div>

            </div>
        </Layout>
    );
};

export default SettingsScreen;
