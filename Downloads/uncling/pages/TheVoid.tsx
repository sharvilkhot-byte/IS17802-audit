import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import Lumi from '../components/lumi/Lumi';
import { useGarden } from '../context/GardenContext';
import { useAuth } from '../hooks/useAuth';

const TheVoid: React.FC = () => {
    const navigate = useNavigate();
    const { setWeather } = useGarden();
    const { user } = useAuth();
    const [ignited, setIgnited] = useState(false);
    const [instruction, setInstruction] = useState("Rest your thumb to begin");
    const longPressTimer = useRef<NodeJS.Timeout | null>(null);

    const handlePressStart = () => {
        if (ignited) return;
        setInstruction("Breathe...");

        longPressTimer.current = setTimeout(() => {
            setIgnited(true);
            setWeather('sunny'); // Default starting weather

            // Intelligent Routing (Wait for animation)
            if (user?.attachment_style) {
                navigate('/dashboard');
            } else {
                // New users or guests go straight to Onboarding
                navigate('/onboarding');
            }

        }, 800);
    };

    const handlePressEnd = () => {
        if (ignited) return;
        if (longPressTimer.current) {
            clearTimeout(longPressTimer.current);
            setInstruction("Rest your thumb to begin");
        }
    };

    return (
        <div
            className="fixed inset-0 w-full h-full bg-slate-900 flex flex-col items-center justify-center overflow-hidden touch-none select-none"
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
        >
            {/* Background Ambience (Darkness) */}
            <div className="absolute inset-0 bg-black/80 z-0 transition-opacity duration-3000"
                style={{ opacity: ignited ? 0 : 1 }}
            />

            {/* Ignited State (Ambience fades in via Layout in next screen, but we show light here) */}
            {ignited && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 50, opacity: 1 }}
                    transition={{ duration: 2.5, ease: "easeIn" }}
                    className="absolute inset-0 bg-brand-cream z-0"
                />
            )}

            <div className="z-10 flex flex-col items-center space-y-12">
                <AnimatePresence>
                    {!ignited ? (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            exit={{ opacity: 0, scale: 2 }}
                            className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center"
                        >
                            <div className="w-20 h-20 rounded-full bg-white/5 animate-pulse" />
                        </motion.div>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1 }}
                        >
                            <Lumi mood="happy" size="lg" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <motion.p
                    key={instruction}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 0.7, y: 0 }}
                    className="text-white/60 font-heading font-light tracking-widest uppercase text-sm"
                >
                    {instruction}
                </motion.p>
            </div>
        </div>
    );
};

export default TheVoid;
