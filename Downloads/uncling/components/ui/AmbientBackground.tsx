import React from 'react';
import { motion } from 'framer-motion';
import { GardenWeather } from '../../context/GardenContext';

interface Props {
    weather?: GardenWeather;
}

const AmbientBackground: React.FC<Props> = ({ weather = 'sunny' }) => {
    // Defines color palettes based on "Weather" (Mood)
    const palettes = {
        sunny: ['bg-brand-lavender/30', 'bg-brand-sky/20', 'bg-brand-cream'], // Calm/Happy
        cloudy: ['bg-slate-300/30', 'bg-brand-lavender/20', 'bg-slate-50'],   // Neutral/Waiting
        rainy: ['bg-blue-300/30', 'bg-slate-400/20', 'bg-slate-100'],         // Sad/Release
        stormy: ['bg-brand-deep/20', 'bg-purple-900/10', 'bg-slate-200'],     // Triggered/High Tension
        foggy: ['bg-white/80', 'bg-brand-light/50', 'bg-white'],              // Confused/Dissociated
    };

    const activeColors = palettes[weather] || palettes['sunny'];

    return (
        <div className="fixed inset-0 w-full h-full -z-50 overflow-hidden bg-white transition-colors duration-2000">
            {/* Base Layer */}
            <div className={`absolute inset-0 ${activeColors[2]} transition-colors duration-2000`} />

            {/* Breathing Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    x: [0, 50, -50, 0],
                    y: [0, -30, 30, 0],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={`absolute top-[-10%] left-[-10%] w-[60vw] h-[60vw] rounded-full blur-[120px] ${activeColors[0]} transition-colors duration-2000`}
            />

            <motion.div
                animate={{
                    scale: [1.2, 1, 1.2],
                    x: [0, -30, 30, 0],
                    y: [0, 50, -50, 0],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 2
                }}
                className={`absolute bottom-[-10%] right-[-10%] w-[70vw] h-[70vw] rounded-full blur-[120px] ${activeColors[1]} transition-colors duration-2000`}
            />

            {/* Storm Overlay (Only for Stormy) */}
            {weather === 'stormy' && (
                <div className="absolute inset-0 bg-brand-deep/5 mix-blend-overlay z-0" />
            )}

            {/* Grain Overlay for Texture */}
            <div className="absolute inset-0 opacity-[0.04] pointer-events-none mix-blend-overlay"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
            />
        </div>
    );
};

export default AmbientBackground;
