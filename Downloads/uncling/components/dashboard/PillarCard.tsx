import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface PillarCardProps {
    title: string;
    subtitle: string;
    icon: LucideIcon;
    color: 'rose' | 'lavender' | 'sage';
    onClick: () => void;
    delay?: number;
}

const colorClasses = {
    rose: 'bg-gradient-to-br from-brand-rose/20 to-brand-rose/5 border-brand-rose/30 hover:border-brand-rose/50',
    lavender: 'bg-gradient-to-br from-brand-lavender/20 to-brand-lavender/5 border-brand-lavender/30 hover:border-brand-lavender/50',
    sage: 'bg-gradient-to-br from-forest/20 to-forest/5 border-forest/30 hover:border-forest/50'
};

const iconColorClasses = {
    rose: 'text-brand-rose',
    lavender: 'text-brand-lavender',
    sage: 'text-forest'
};

const PillarCard: React.FC<PillarCardProps> = ({
    title,
    subtitle,
    icon: Icon,
    color,
    onClick,
    delay = 0
}) => {
    return (
        <motion.button
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`
                w-full p-6 rounded-3xl border-2 
                ${colorClasses[color]}
                backdrop-blur-sm
                transition-all duration-300
                shadow-lg hover:shadow-xl
                text-left
                group
            `}
        >
            <div className="flex items-start gap-4">
                <div className={`
                    w-14 h-14 rounded-2xl 
                    ${color === 'rose' ? 'bg-brand-rose/10' : color === 'lavender' ? 'bg-brand-lavender/10' : 'bg-forest/10'}
                    flex items-center justify-center
                    group-hover:scale-110 transition-transform duration-300
                `}>
                    <Icon size={28} className={iconColorClasses[color]} strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <h3 className="text-xl font-heading font-bold text-brand-deep mb-1">
                        {title}
                    </h3>
                    <p className="text-sm text-brand-deep/60 leading-relaxed">
                        {subtitle}
                    </p>
                </div>
                <div className="text-brand-deep/30 group-hover:text-brand-deep/60 transition-colors">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 18l6-6-6-6" />
                    </svg>
                </div>
            </div>
        </motion.button>
    );
};

export default PillarCard;
