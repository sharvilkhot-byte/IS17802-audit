
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GlassCard from '../ui/GlassCard';
import Button from '../Button';
import { useNavigate } from 'react-router-dom';

const RescueCave: React.FC = () => {
    const navigate = useNavigate();
    const [isActive, setIsActive] = useState(false);

    const handleEmergency = () => {
        setIsActive(true);
        // In a real app, this would trigger immediate "Rescue Mode" logic
        // For now, we route to a dedicated rescue page or show an overlay
        setTimeout(() => {
            navigate('/rescue');
        }, 800);
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center p-6">
            <AnimatePresence>
                {!isActive ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="flex flex-col items-center text-center space-y-8"
                    >
                        <div className="w-1 bg-white/20 h-20 rounded-full mb-4" /> {/* Hanging Thread */}

                        <h2 className="text-3xl font-serif text-white/80">The Cave</h2>
                        <p className="text-white/50 max-w-xs">
                            It's quiet here. If the storm outside is too loud, you can rest.
                        </p>

                        <button
                            onClick={handleEmergency}
                            className="group relative w-32 h-32 rounded-full flex items-center justify-center bg-slate-800 border border-slate-700 shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-transform active:scale-95"
                        >
                            <div className="absolute inset-0 rounded-full bg-indigo-500/0 group-hover:bg-indigo-500/10 transition-colors duration-500" />
                            <div className="w-24 h-24 rounded-full border border-indigo-400/30 flex items-center justify-center">
                                <div className="w-16 h-16 rounded-full bg-indigo-500/20 blur-md group-hover:bg-indigo-500/40 transition-colors duration-500" />
                            </div>
                            <span className="absolute text-indigo-200/80 text-xs tracking-[0.2em] font-bold">BREATHE</span>
                        </button>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-white/60 text-xl font-serif"
                    >
                        Holding space...
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default RescueCave;
