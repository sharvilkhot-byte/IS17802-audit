
import React from 'react';
import GlassCard from '../ui/GlassCard';
import { motion } from 'framer-motion';

const LibraryView: React.FC = () => {
    // Placeholder data
    const chapters = [
        { id: 1, title: 'The Soil', status: 'completed', desc: 'Understanding your foundations' },
        { id: 2, title: 'The Sprout', status: 'active', desc: 'Identifying your needs' },
        { id: 3, title: 'The Storm', status: 'locked', desc: 'Navigating conflict' },
        { id: 4, title: 'The Harvest', status: 'locked', desc: 'Integration' }
    ];

    return (
        <div className="w-full max-w-md p-6 h-[80vh] flex flex-col justify-center">
            <h2 className="text-3xl font-serif text-brand-deep mb-8 ml-4">The Library</h2>

            <div className="space-y-4">
                {chapters.map((chapter, index) => (
                    <motion.div
                        key={chapter.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <GlassCard className={`p-6 flex items-center justify-between group cursor-pointer transition-colors ${chapter.status === 'locked' ? 'opacity-50 grayscale' : 'hover:bg-white/60'
                            }`}>
                            <div>
                                <p className="text-xs uppercase tracking-widest text-brand-deep/50 mb-1">
                                    Chapter 0{chapter.id}
                                </p>
                                <h3 className="text-lg font-serif text-brand-deep">
                                    {chapter.title}
                                </h3>
                                <p className="text-sm text-brand-deep/60">
                                    {chapter.desc}
                                </p>
                            </div>

                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${chapter.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                                    (chapter.status === 'active' ? 'bg-brand-lavender text-white' : 'bg-slate-200 text-slate-400')
                                }`}>
                                {chapter.status === 'completed' ? '✓' : (chapter.status === 'active' ? '→' : '🔒')}
                            </div>
                        </GlassCard>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default LibraryView;
