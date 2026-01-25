import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Sparkles } from 'lucide-react';

interface DailyWisdomProps {
    type: 'anxious' | 'avoidant' | 'secure';
    theme?: 'light' | 'dark';
}

const WISDOM_CONTENT = {
    anxious: {
        title: "The Pause",
        text: "Urgency is a symptom of anxiety, not love. Real connection can survive a 20-minute pause."
    },
    avoidant: {
        title: "The Bridge",
        text: "Independence is safe, but isolation is lonely. One small text is a bridge, not a shackle."
    },
    secure: {
        title: "The Balance",
        text: "You are the anchor. Your consistency teaches others that safety is real."
    }
};

const DailyWisdom: React.FC<DailyWisdomProps> = ({ type, theme = 'dark' }) => {
    const content = WISDOM_CONTENT[type] || WISDOM_CONTENT.secure;
    const isDark = theme === 'dark';

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative overflow-hidden rounded-2xl p-6 group cursor-pointer transition-colors border shadow-sm
                ${isDark
                    ? 'bg-[#EAE4DC]/5 border-[#EAE4DC]/10 hover:bg-[#EAE4DC]/10'
                    : 'bg-white/40 border-white/40 backdrop-blur-md hover:bg-white/60'
                }`}
        >
            <div className={`absolute top-0 right-0 p-4 transition-opacity opacity-10 group-hover:opacity-20`}>
                <Sparkles size={48} className={isDark ? 'text-[#EAE4DC]' : 'text-brand-deep'} />
            </div>

            <div className={`flex items-center gap-2 mb-3 uppercase tracking-widest text-xs font-bold ${isDark ? 'text-[#EAE4DC]/60' : 'text-brand-deep/50'}`}>
                <BookOpen size={14} />
                <span>Daily Wisdom</span>
            </div>

            <h3 className={`text-xl font-serif mb-2 transition-colors ${isDark ? 'text-[#EAE4DC] group-hover:text-emerald-200' : 'text-brand-deep group-hover:text-brand-primary'}`}>
                {content.title}
            </h3>

            <p className={`text-sm leading-relaxed max-w-md ${isDark ? 'text-[#EAE4DC]/70' : 'text-brand-deep/70'}`}>
                "{content.text}"
            </p>
        </motion.div>
    );
};

export default DailyWisdom;
