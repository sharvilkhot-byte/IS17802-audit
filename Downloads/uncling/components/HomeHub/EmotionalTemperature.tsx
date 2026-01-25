import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';

interface EmotionalTemperatureProps {
    minimized?: boolean;
}

const EmotionalTemperature: React.FC<EmotionalTemperatureProps> = ({ minimized = false }) => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [latestEmotion, setLatestEmotion] = useState<string | null>(null);

    useEffect(() => {
        if (!user) return;

        // Fetch latest emotion check-in from today
        const fetchLatest = async () => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const { data } = await supabase
                .from('emotion_check_ins')
                .select('emotion')
                .eq('user_id', user.id)
                .gte('created_at', today.toISOString())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();

            if (data) {
                setLatestEmotion(data.emotion);
            }
        };

        fetchLatest();
    }, [user]);

    if (minimized) return null;

    return (
        <div
            onClick={() => navigate('/feelings')}
            className="w-full mb-6 animate-fade-in-down cursor-pointer group"
        >
            <div className={`
                bg-white/40 backdrop-blur-md border border-white/40 
                rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] 
                hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:bg-white/60 
                transition-all duration-300 relative overflow-hidden
            `}>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-indigo-100/50 to-rose-100/50 rounded-full blur-2xl -mr-10 -mt-10" />

                <div className="flex items-center justify-between relative z-10">
                    <div>
                        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                            Current Pulse
                        </p>
                        <h3 className="text-xl font-serif text-slate-800">
                            {latestEmotion ? (
                                <span className="flex items-center gap-2">
                                    Your weather is <span className="text-brand-deep border-b-2 border-brand-lavender/50">{latestEmotion}</span>
                                </span>
                            ) : (
                                "How's your internal weather?"
                            )}
                        </h3>
                    </div>
                </div>

                {!latestEmotion && (
                    <div className="mt-3 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                        <span className="px-3 py-1 bg-white/50 rounded-full text-xs text-slate-600 border border-white/20 whitespace-nowrap">Stormy?</span>
                        <span className="px-3 py-1 bg-white/50 rounded-full text-xs text-slate-600 border border-white/20 whitespace-nowrap">Foggy?</span>
                        <span className="px-3 py-1 bg-white/50 rounded-full text-xs text-slate-600 border border-white/20 whitespace-nowrap">Sunny?</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmotionalTemperature;
