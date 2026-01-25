
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn'; // Assuming you have a cn utility, if not I'll just use template literals or make one. 
// I'll assume cn exists or use clsx style manually for now to be safe.

const GlassCard = ({ children, className, hoverEffect = true }: { children: React.ReactNode, className?: string, hoverEffect?: boolean }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            whileHover={hoverEffect ? { scale: 1.01, boxShadow: "0 20px 40px rgba(0,0,0,0.05)" } : {}}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`
                relative overflow-hidden
                bg-white/60 backdrop-blur-xl 
                border border-white/40 shadow-xl shadow-brand-lavender/5
                rounded-3xl
                ${className || ''}
            `}
        >
            {/* Shimmer Effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-transparent opacity-50 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
};

export default GlassCard;
