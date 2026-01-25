
import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { cn } from '../../utils/cn';

interface LumiProps {
    className?: string;
    mood?: 'happy' | 'calm' | 'concerned' | 'waiting' | 'excited';
    size?: 'sm' | 'md' | 'lg' | 'xl';
    onClick?: () => void;
}

const Lumi: React.FC<LumiProps> = ({
    className,
    mood = 'calm',
    size = 'md',
    onClick
}) => {
    const controls = useAnimation();

    // Size mappings
    const sizeClasses = {
        sm: 'w-8 h-8 blur-md',
        md: 'w-16 h-16 blur-xl',
        lg: 'w-32 h-32 blur-2xl',
        xl: 'w-64 h-64 blur-3xl'
    };

    // Color mappings based on mood
    const colorClasses = {
        happy: 'bg-brand-lavender mix-blend-screen', // Gold/Warm
        calm: 'bg-brand-sky mix-blend-screen',      // Blue/Calm
        concerned: 'bg-brand-rose mix-blend-screen',// Purple/Concern
        waiting: 'bg-white mix-blend-overlay',      // Neutral
        excited: 'bg-brand-coral mix-blend-screen'  // Energetic
    };

    // Animation variants
    const animations = {
        calm: {
            scale: [1, 1.1, 1],
            y: [0, -10, 0],
            opacity: [0.6, 0.8, 0.6],
            transition: { duration: 4, repeat: Infinity, ease: "easeInOut" }
        },
        happy: {
            scale: [1, 1.2, 0.9, 1],
            y: [0, -20, 5, 0],
            rotate: [0, 10, -10, 0],
            opacity: [0.7, 1, 0.7],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        },
        waiting: {
            scale: [1, 1.05, 1],
            opacity: [0.3, 0.5, 0.3],
            transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
        }
    };

    useEffect(() => {
        const animation = animations[mood === 'excited' ? 'happy' : (mood === 'concerned' ? 'calm' : mood)] || animations.calm;
        controls.start(animation as any);
    }, [mood, controls]);

    return (
        <div
            className={cn("relative flex items-center justify-center pointer-events-none select-none", className)}
            onClick={onClick}
        >
            {/* Core Light */}
            <motion.div
                animate={controls}
                className={cn(
                    "rounded-full absolute transform-gpu transition-colors duration-1000",
                    sizeClasses[size],
                    colorClasses[mood]
                )}
            />

            {/* Secondary Halo (Inner) */}
            <motion.div
                animate={{
                    scale: [0.8, 1, 0.8],
                    opacity: [0.5, 0.8, 0.5]
                }}
                transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                className={cn(
                    "rounded-full absolute transform-gpu bg-white/50 blur-lg",
                    size === 'xl' ? 'w-32 h-32' : (size === 'lg' ? 'w-16 h-16' : 'w-8 h-8')
                )}
            />

            {/* Sparkles (Optional, can be added for 'excited' mood) */}
            {mood === 'excited' && (
                <div className="absolute inset-0 flex items-center justify-center">
                    {/* Placeholder for particles */}
                </div>
            )}
        </div>
    );
};

export default Lumi;
