import React, { useState } from 'react';
import * as ReactRouterDOM from 'react-router-dom';
import Layout from '../components/Layout';
import { ChevronLeft, X, ArrowRight, BarChart2, Zap, Activity, Heart, Clock } from 'lucide-react';
import { PROGRESS_CONTENT, ProgressStep, ProgressContent } from '../services/progressService';
import Button from '../components/Button';

// --- Visualization Components (Mock/Simple) ---

const EmotionalPatternViz = () => (
    <div className="h-48 w-full bg-indigo-50/50 rounded-xl relative overflow-hidden flex items-end px-4 pb-4 gap-2">
        {/* Simple sine wave-like bars */}
        {[20, 40, 60, 50, 80, 40, 30, 50, 70, 40].map((h, i) => (
            <div key={i} className="flex-1 bg-indigo-200 rounded-t-sm transition-all duration-500 hover:bg-indigo-300" style={{ height: `${h}%` }} />
        ))}
        <div className="absolute top-2 right-2 text-[10px] text-indigo-400 font-mono">30 DAYS</div>
    </div>
);

const TriggerMapViz = () => (
    <div className="h-48 w-full bg-slate-50 rounded-xl relative flex items-center justify-center">
        <div className="absolute w-32 h-32 border border-slate-200 rounded-full animate-pulse-slow opacity-50" />
        <div className="absolute w-20 h-20 border border-slate-300 rounded-full" />
        {/* Mock Triggers */}
        <div className="absolute top-10 left-12 px-2 py-1 bg-red-50 text-red-400 text-xs rounded-full">Conflict</div>
        <div className="absolute bottom-12 right-10 px-2 py-1 bg-orange-50 text-orange-400 text-xs rounded-full">Silence</div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-slate-400 rounded-full" />
    </div>
);

const RecoveryViz = () => (
    <div className="h-32 w-full bg-emerald-50/30 rounded-xl flex items-center justify-between px-6">
        <div className="text-center">
            <div className="text-sm text-slate-400 mb-1">Before</div>
            <div className="text-2xl font-light text-slate-600">45m</div>
        </div>
        <ArrowRight className="text-emerald-400" size={20} />
        <div className="text-center">
            <div className="text-sm text-emerald-600 mb-1 font-medium">Now</div>
            <div className="text-3xl font-light text-emerald-600">15m</div>
        </div>
    </div>
);

const RelationalViz = () => (
    <div className="grid grid-cols-2 gap-3 w-full">
        <div className="h-24 bg-rose-50 rounded-lg flex items-center justify-center text-xs text-rose-400 p-2 text-center">Need for space</div>
        <div className="h-24 bg-blue-50 rounded-lg flex items-center justify-center text-xs text-blue-400 p-2 text-center">Seeking closeness</div>
        <div className="col-span-2 h-16 bg-slate-50 rounded-lg border border-dashed border-slate-200 flex items-center justify-center text-xs text-slate-400">Stable Connection</div>
    </div>
);


const JourneyScreen: React.FC = () => {
    const navigate = ReactRouterDOM.useNavigate();
    const [step, setStep] = useState<ProgressStep>('entry');
    const content = PROGRESS_CONTENT[step];

    // Simple Linear Flow mapping (could be improved with a linked list or array index)
    const stepOrder: ProgressStep[] = [
        'entry',
        'emotional_pattern_graph',
        'trigger_map',
        'recovery_speed_insight',
        'regulation_method_effectiveness',
        'relational_themes',
        'pattern_spotlight',
        'small_insight',
        'biology_card',
        'coping_strategy',
        'weekly_overview',
        'trigger_intensity_timeline',
        'recovery_timeline',
        'technique_effectiveness_chart',
        'relational_theme_shifts',
        'deep_dive_optional',
        'encouragement',
        // Skipping edge cases 'plateau'/'overwhelm' in standard flow, accessible via logic if implemented
        'exit'
    ];

    const handleNext = () => {
        const currentIndex = stepOrder.indexOf(step as ProgressStep);
        if (currentIndex < stepOrder.length - 1) {
            setStep(stepOrder[currentIndex + 1]);
        } else {
            // Default loop or safety
            setStep('entry');
        }
    };

    const handleBack = () => {
        const currentIndex = stepOrder.indexOf(step as ProgressStep);
        if (currentIndex > 0) {
            setStep(stepOrder[currentIndex - 1]);
        } else {
            navigate('/dashboard');
        }
    };

    const handleExit = () => navigate('/dashboard');

    const renderVisualization = (stepName: ProgressStep) => {
        switch (stepName) {
            case 'emotional_pattern_graph':
            case 'weekly_overview':
                return <EmotionalPatternViz />;
            case 'trigger_map':
            case 'trigger_intensity_timeline':
                return <TriggerMapViz />;
            case 'recovery_speed_insight':
            case 'recovery_timeline':
                return <RecoveryViz />;
            case 'relational_themes':
            case 'relational_theme_shifts':
                return <RelationalViz />;
            case 'regulation_method_effectiveness':
            case 'technique_effectiveness_chart':
                return (
                    <div className="w-full space-y-2">
                        {['Safe Space', 'Chat Reflection', 'Pause'].map((m, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="w-24 text-xs text-slate-500 text-right">{m}</div>
                                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-400 rounded-full" style={{ width: `${80 - (i * 15)}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                );
            default:
                return null;
        }
    };

    const isEntryOrExit = step === 'entry' || step === 'exit';

    return (
        <Layout showBottomNav={false} showHeader={false}>
            <div className="min-h-screen bg-slate-50 flex flex-col relative pb-10">

                {/* Custom Header */}
                <div className="px-6 py-4 flex items-center justify-between z-10">
                    {!isEntryOrExit ? (
                        <button onClick={handleBack} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
                            <ChevronLeft className="text-slate-400" />
                        </button>
                    ) : <div />}

                    <button onClick={handleExit} className="p-2 -mr-2 rounded-full hover:bg-black/5 transition-colors">
                        <X className="text-slate-400" />
                    </button>
                </div>

                {/* Progress Indicator (Subtle) */}
                {!isEntryOrExit && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-slate-100">
                        <div
                            className="h-full bg-indigo-500 transition-all duration-500"
                            style={{ width: `${((stepOrder.indexOf(step as ProgressStep)) / (stepOrder.length - 1)) * 100}%` }}
                        />
                    </div>
                )}

                {/* Main Content */}
                <div className="flex-1 flex flex-col justify-center items-center px-6 max-w-md mx-auto w-full animate-fade-in space-y-8">

                    {/* Visual Slot */}
                    {renderVisualization(step) || (
                        // Placeholder Icon if no viz
                        !isEntryOrExit && (
                            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-400 mb-4">
                                {step.includes('pattern') ? <Activity /> : step.includes('biology') ? <Zap /> : <Heart />}
                            </div>
                        )
                    )}

                    {/* Text Content */}
                    <div className="text-center space-y-4">
                        <h1 className="text-2xl font-serif text-slate-800 leading-tight">
                            {content.headline}
                        </h1>
                        <div className="text-slate-600 leading-relaxed text-base">
                            {content.listItems ? (
                                <ul className="space-y-2 mt-4 text-left inline-block">
                                    {content.listItems.map((item, i) => (
                                        <li key={i} className="flex items-center gap-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>{content.body}</p>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="w-full space-y-3 pt-4">
                        <Button onClick={step === 'exit' ? handleExit : handleNext} className="w-full">
                            {content.primaryAction}
                        </Button>

                        <button
                            onClick={step === 'exit' ? () => { } : handleExit}
                            className={`w-full py-3 text-sm transition-colors ${step === 'exit' ? 'text-indigo-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`}
                        >
                            {content.secondaryAction}
                        </button>
                    </div>

                    {content.microCopy && (
                        <p className="text-xs text-slate-400 italic">
                            {content.microCopy}
                        </p>
                    )}

                </div>
            </div>
        </Layout>
    );
};

export default JourneyScreen;
