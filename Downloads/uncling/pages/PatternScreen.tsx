import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { ChevronLeft, Brain, ArrowRight, RefreshCw, Zap } from 'lucide-react';

interface EmotionalPatternMock {
    id: string;
    trigger: string;
    feeling: string;
    reaction: string;
    secureAlt: string;
    frequency: 'High' | 'Medium' | 'Low';
}

const PatternScreen: React.FC = () => {
    const navigate = useNavigate();

    // Mock Data representing "Detected Patterns" from geminiService context
    const patterns: EmotionalPatternMock[] = [
        {
            id: '1',
            trigger: 'Uncertainty / Silence',
            feeling: 'Anxiety ("They leave me")',
            reaction: 'Over-texting / Fixing',
            secureAlt: 'Pause. Check facts. Scent safety.',
            frequency: 'High'
        },
        {
            id: '2',
            trigger: 'Criticism at Work',
            feeling: 'Shame ("I am bad")',
            reaction: 'Shutdown / Avoidance',
            secureAlt: 'Separate role from self. Ask for clarification.',
            frequency: 'Medium'
        }
    ];

    return (
        <Layout>
            <div className="max-w-2xl mx-auto pb-24 px-4 space-y-8 animate-fade-in">

                {/* Header */}
                <div className="pt-4 flex items-center gap-2 mb-6">
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-2xl font-serif text-textPrimary">Insights</h1>
                        <p className="text-textSecondary text-sm">Understanding your internal map.</p>
                    </div>
                </div>

                {/* Introduction Card */}
                <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10 text-indigo-900">
                        <Brain size={100} />
                    </div>
                    <div className="relative z-10 max-w-sm">
                        <h2 className="text-lg font-medium text-indigo-900 mb-2">Pattern Recognition</h2>
                        <p className="text-indigo-800/70 text-sm leading-relaxed mb-4">
                            We don't fix feelings. We notice the loops we get stuck in. Once you see the loop, you can choose a different path.
                        </p>
                    </div>
                </div>

                {/* Patterns List */}
                <div className="space-y-6">
                    <h3 className="text-sm uppercase tracking-wider text-textSecondary font-semibold pl-1">Identified Loops</h3>

                    {patterns.map((pattern) => (
                        <div key={pattern.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 relative group hover:shadow-md transition-shadow">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-400 flex items-center justify-center">
                                        <Zap size={14} />
                                    </div>
                                    <span className="font-medium text-textPrimary">{pattern.trigger}</span>
                                </div>
                                <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-full">{pattern.frequency} Freq</span>
                            </div>

                            {/* The Loop Visualization */}
                            <div className="flex flex-col sm:flex-row items-center gap-4 text-sm relative">
                                {/* Step 1: Feeling */}
                                <div className="flex-1 bg-slate-50 p-3 rounded-xl w-full text-center border border-slate-100">
                                    <span className="text-xs text-slate-400 block mb-1">I feel...</span>
                                    <span className="text-textPrimary font-medium">{pattern.feeling}</span>
                                </div>

                                <ArrowRight className="text-slate-300 rotate-90 sm:rotate-0 flex-shrink-0" size={16} />

                                {/* Step 2: Old Reaction */}
                                <div className="flex-1 bg-slate-50 p-3 rounded-xl w-full text-center border border-slate-100 opacity-70">
                                    <span className="text-xs text-slate-400 block mb-1">I usually...</span>
                                    <span className="text-slate-600 italic">{pattern.reaction}</span>
                                </div>

                                <ArrowRight className="text-slate-300 rotate-90 sm:rotate-0 flex-shrink-0" size={16} />

                                {/* Step 3: New Choice */}
                                <div className="flex-1 bg-emerald-50 p-3 rounded-xl w-full text-center border border-emerald-100 ring-1 ring-emerald-100/50">
                                    <span className="text-xs text-emerald-600 block mb-1">I can practice...</span>
                                    <span className="text-emerald-800 font-medium">{pattern.secureAlt}</span>
                                </div>
                            </div>

                        </div>
                    ))}
                </div>

                {/* Empty State / Encouragement */}
                <div className="text-center py-8">
                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <RefreshCw size={20} />
                    </div>
                    <p className="text-slate-400 text-sm">More patterns will appear as we chat.</p>
                </div>

            </div>
        </Layout>
    );
};

export default PatternScreen;
