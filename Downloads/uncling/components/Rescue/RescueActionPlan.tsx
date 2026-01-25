import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Button from '../Button';
import RescueVoo from './RescueVoo';
import RescueOrientation from './RescueOrientation';
import { useAuth } from '../../hooks/useAuth';

interface RescueActionPlanProps {
    onExit: () => void;
    userStyle?: 'anxious' | 'avoidant' | 'secure' | 'fearful' | 'unknown';
}

type RescueTool = 'plan' | 'voo' | 'orientation';

const RescueActionPlan: React.FC<RescueActionPlanProps> = ({ onExit, userStyle }) => {
    const { user } = useAuth();
    // Default to 'plan' (Cognitive), but logic below can override
    const [activeTool, setActiveTool] = useState<RescueTool>('plan');
    const [recommendedTool, setRecommendedTool] = useState<RescueTool>('plan');

    // Auto-detect recommendation based on style
    useEffect(() => {
        if (userStyle === 'anxious') setRecommendedTool('voo'); // Down-regulation
        else if (userStyle === 'avoidant') setRecommendedTool('orientation'); // Anti-dissociation
        else setRecommendedTool('plan');
    }, [userStyle]);

    // Internal State for the Plan Tool
    const [impulse, setImpulse] = useState<'fix' | 'run' | null>(null);

    // Render Sub-Tools
    if (activeTool === 'voo') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1">
                    <RescueVoo onComplete={() => setActiveTool('plan')} />
                </div>
                <button onClick={() => setActiveTool('plan')} className="pb-8 text-sm text-slate-400">Skip to Plan</button>
            </div>
        );
    }

    if (activeTool === 'orientation') {
        return (
            <div className="h-full flex flex-col">
                <div className="flex-1">
                    <RescueOrientation onComplete={() => setActiveTool('plan')} />
                </div>
                <button onClick={() => setActiveTool('plan')} className="pb-8 text-sm text-slate-400">Skip to Plan</button>
            </div>
        );
    }

    // Main Menu / Plan View
    if (!impulse) {
        return (
            <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in max-w-sm mx-auto h-full">
                <h2 className="text-2xl font-serif text-slate-800 mb-6">What do you need right now?</h2>

                {/* Recommended Somatic Tool */}
                {recommendedTool !== 'plan' && (
                    <div className="w-full mb-6">
                        <p className="text-xs font-bold text-forest uppercase tracking-widest mb-2">Recommended for you</p>
                        <button
                            onClick={() => setActiveTool(recommendedTool)}
                            className="w-full p-6 rounded-2xl bg-forest/10 border-2 border-forest/30 hover:bg-forest/20 text-brand-deep transition-all text-left flex items-center justify-between group shadow-sm"
                        >
                            <div>
                                <span className="block font-bold text-lg mb-1">
                                    {recommendedTool === 'voo' ? 'The Voo Sound' : 'Look Around'}
                                </span>
                                <span className="text-sm opacity-70">
                                    {recommendedTool === 'voo' ? 'Calm your vagus nerve.' : 'Come back to the room.'}
                                </span>
                            </div>
                            <span className="text-2xl group-hover:scale-110 transition-transform">
                                {recommendedTool === 'voo' ? '🌬️' : '👀'}
                            </span>
                        </button>
                    </div>
                )}

                <div className="space-y-4 w-full">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-left">Cognitive Impulse</p>
                    <button
                        onClick={() => setImpulse('fix')}
                        className="w-full p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-lavender/50 text-slate-600 transition-all text-left"
                    >
                        <span className="font-semibold text-brand-deep">To Fix It</span> (Anxious)
                    </button>

                    <button
                        onClick={() => setImpulse('run')}
                        className="w-full p-4 rounded-xl bg-white border border-slate-200 hover:border-brand-coral/50 text-slate-600 transition-all text-left"
                    >
                        <span className="font-semibold text-brand-deep">To Run Away</span> (Avoidant)
                    </button>

                    {recommendedTool === 'plan' && (
                        <>
                            <div className="h-px bg-slate-100 my-2" />
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setActiveTool('voo')} className="p-3 bg-slate-50 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100">Try Voo Sound</button>
                                <button onClick={() => setActiveTool('orientation')} className="p-3 bg-slate-50 rounded-lg text-xs font-medium text-slate-500 hover:bg-slate-100">Try Orientation</button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center p-6 text-center animate-fade-in max-w-sm mx-auto">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100"
            >
                <div className="w-16 h-16 bg-brand-cream rounded-full flex items-center justify-center mx-auto mb-6 text-2xl">
                    {impulse === 'fix' ? '✋' : '🌱'}
                </div>

                <h2 className="text-2xl font-serif text-slate-800 mb-4">
                    {impulse === 'fix' ? 'The 20-Minute Rule' : 'The Micro-Step'}
                </h2>

                <p className="text-slate-600 mb-8 leading-relaxed">
                    {impulse === 'fix'
                        ? "Urgency is a symptom of anxiety, not reality. Write your text in Notes, but promise to wait 20 minutes before sending. The facts will still be there."
                        : "Silence is safe, but total disconnection confirms the fear. Send just one emoji or say 'I need time'. Keep the bridge open."}
                </p>

                <Button onClick={onExit} className="w-full bg-brand-deep text-white hover:bg-brand-deep/90">
                    I Commit to This
                </Button>
            </motion.div>
        </div>
    );
};

export default RescueActionPlan;
