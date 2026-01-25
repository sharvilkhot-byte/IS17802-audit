import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface DashboardCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    colorClass: string; // e.g., "bg-brand-lavender"
    onClick: () => void;
    className?: string;
    delay?: number;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
    title,
    description,
    icon: Icon,
    colorClass,
    onClick,
    className,
    delay = 0
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                "relative overflow-hidden rounded-3xl p-5 cursor-pointer group",
                "bg-white/40 backdrop-blur-md border border-white/30 shadow-sm hover:shadow-md transition-all",
                className
            )}
        >
            {/* Background Blob */}
            <div className={cn(
                "absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 group-hover:opacity-20 transition-opacity blur-2xl",
                colorClass
            )} />

            <div className="relative z-10 flex flex-col h-full justify-between">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-sm",
                    colorClass
                )}>
                    <Icon size={24} strokeWidth={2} />
                </div>

                <div>
                    <h3 className="text-lg font-serif font-semibold text-brand-deep mb-1 group-hover:text-brand-deep/80 transition-colors">
                        {title}
                    </h3>
                    <p className="text-sm text-brand-deep/60 leading-tight">
                        {description}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

export default DashboardCard;
