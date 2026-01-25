import React, { useState } from 'react';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import { InternalState } from '../../types';
import { Sparkles, Shield, AlertCircle } from 'lucide-react';

const WhoIsDrivingWidget: React.FC<{ onCheckIn?: () => void }> = ({ onCheckIn }) => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [selectedState, setSelectedState] = useState<InternalState | null>(null);

    const handleCheckIn = async (state: InternalState) => {
        if (!user) return;
        setLoading(true);
        try {
            const { error } = await supabase
                .from('daily_check_ins')
                .insert({
                    user_id: user.id,
                    state: state
                });

            if (error) throw error;
            setSelectedState(state);
            if (onCheckIn) onCheckIn();
        } catch (error) {
            console.error('Error logging check-in:', error);
        } finally {
            setLoading(false);
        }
    };

    if (selectedState) {
        return (
            <div className="w-full max-w-md mx-auto mb-6 animate-fade-in-down">
                <div className="bg-white/60 backdrop-blur-md border border-slate-100 rounded-2xl p-6 shadow-sm text-center">
                    <div className="mb-4 inline-flex items-center justify-center w-12 h-12 rounded-full bg-forest/10 text-forest">
                        <Sparkles size={24} />
                    </div>
                    <h3 className="text-xl font-serif text-brand-deep mb-2">
                        {selectedState === 'Secure' ? 'You are grounded.' : 'It makes sense.'}
                    </h3>
                    <p className="text-textSecondary leading-relaxed">
                        {selectedState === 'Anxious' && "Your nervous system is trying to connect. You are safe."}
                        {selectedState === 'Avoidant' && "Your nervous system needs space. You are allowed to pause."}
                        {selectedState === 'Secure' && "Leading from your Self. Well done."}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto mb-8">
            <h2 className="text-center text-textSecondary text-sm font-medium uppercase tracking-widest mb-4">What's growing in your garden today?</h2>

            <div className="grid grid-cols-3 gap-3">
                <button
                    onClick={() => handleCheckIn('Anxious')}
                    disabled={loading}
                    className="flex flex-col items-center p-4 rounded-xl bg-white/40 border border-slate-200 hover:bg-white/80 hover:border-amber-200 hover:shadow-md transition-all duration-300 group"
                >
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <AlertCircle size={16} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Anxious Part</span>
                </button>

                <button
                    onClick={() => handleCheckIn('Secure')}
                    disabled={loading}
                    className="flex flex-col items-center p-4 rounded-xl bg-gradient-to-br from-forest/5 to-teal-50/50 border border-forest/20 hover:border-forest/40 hover:shadow-md transition-all duration-300 group transform scale-105"
                >
                    <div className="w-10 h-10 rounded-full bg-forest text-white flex items-center justify-center mb-2 shadow-sm group-hover:scale-110 transition-transform">
                        <Sparkles size={20} />
                    </div>
                    <span className="text-xs font-bold text-forest">Secure Self</span>
                </button>

                <button
                    onClick={() => handleCheckIn('Avoidant')}
                    disabled={loading}
                    className="flex flex-col items-center p-4 rounded-xl bg-white/40 border border-slate-200 hover:bg-white/80 hover:border-slate-400 hover:shadow-md transition-all duration-300 group"
                >
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                        <Shield size={16} />
                    </div>
                    <span className="text-xs font-medium text-slate-600">Avoidant Part</span>
                </button>
            </div>
        </div>
    );
};

export default WhoIsDrivingWidget;
