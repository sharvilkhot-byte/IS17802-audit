import React from 'react';
import { LucideIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

interface FeatureCardProps {
    title: string;
    description: string;
    icon: LucideIcon;
    to: string;
    delay?: number;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
    title,
    description,
    icon: Icon,
    to,
    delay = 0
}) => {
    const navigate = useNavigate();

    return (
        <motion.button
            onClick={() => navigate(to)}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="
                w-full p-5 rounded-2xl 
                bg-white/60 backdrop-blur-sm
                border border-slate-200/50
                hover:border-forest/30 hover:bg-white/80
                transition-all duration-300
                shadow-sm hover:shadow-md
                text-left
                group
            "
        >
            <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-forest/10 flex items-center justify-center group-hover:bg-forest/20 transition-colors">
                    <Icon size={20} className="text-forest" strokeWidth={2} />
                </div>
                <div className="flex-1">
                    <h4 className="font-heading font-bold text-brand-deep mb-0.5">
                        {title}
                    </h4>
                    <p className="text-xs text-brand-deep/60 leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </motion.button>
    );
};

export default FeatureCard;
