import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Button from '../components/Button';
import { ArrowLeft, FileText, Copy, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface Script {
    id: string;
    category: 'boundary' | 'reconnection' | 'apology' | 'space';
    title: string;
    description: string;
    template: string;
}

const SCRIPTS: Script[] = [
    {
        id: '1',
        category: 'space',
        title: 'Need Space',
        description: 'When you need time alone to regulate',
        template: "Hey, I'm feeling a bit overwhelmed right now and need some time to myself to process. This isn't about you—I just need to recharge. Can we reconnect [timeframe]? I appreciate your understanding."
    },
    {
        id: '2',
        category: 'reconnection',
        title: 'Reconnection After Distance',
        description: "When you're ready to reconnect after pulling away",
        template: "I know I've been distant lately, and I wanted to reach out. I was dealing with some things internally and needed space to work through them. I value our connection and would love to reconnect. Are you open to [specific activity]?"
    },
    {
        id: '3',
        category: 'apology',
        title: 'Repair After Conflict',
        description: 'When you want to apologize and repair',
        template: "I've been thinking about our conversation, and I realize I [specific behavior]. That wasn't fair to you, and I'm sorry. What I should have done was [alternative behavior]. Can we talk about how to move forward?"
    },
    {
        id: '4',
        category: 'boundary',
        title: 'Setting a Boundary',
        description: 'When you need to communicate a limit',
        template: "I care about you and our relationship, and I need to share something that's been on my mind. When [specific situation], I feel [emotion]. Going forward, I need [specific boundary]. Can we work together on this?"
    },
    {
        id: '5',
        category: 'reconnection',
        title: 'Check-In After Silence',
        description: "When there's been radio silence",
        template: "Hi, I noticed we haven't talked in a while and wanted to check in. I hope you're doing okay. I've been thinking about you and would love to catch up when you have time. No pressure—just wanted you to know I'm here."
    },
    {
        id: '6',
        category: 'apology',
        title: 'Acknowledge Impact',
        description: 'When your actions hurt someone',
        template: "I want to acknowledge that my [action/words] hurt you, and I'm truly sorry. Even though that wasn't my intention, I understand the impact it had. You deserved better from me. How can I make this right?"
    },
    {
        id: '7',
        category: 'boundary',
        title: 'Declining an Invitation',
        description: 'When you need to say no',
        template: "Thank you so much for thinking of me! I really appreciate the invitation. Right now, I need to prioritize [reason], so I won't be able to make it. I hope you have a great time, and let's plan something soon!"
    },
    {
        id: '8',
        category: 'space',
        title: 'Pause a Conversation',
        description: 'When a discussion is escalating',
        template: "I can feel myself getting activated right now, and I don't want to say something I'll regret. Can we pause this conversation and come back to it when we're both calmer? I care about resolving this thoughtfully."
    }
];

const CATEGORIES = [
    { id: 'all', label: 'All Scripts', color: 'slate' },
    { id: 'space', label: 'Need Space', color: 'blue' },
    { id: 'reconnection', label: 'Reconnection', color: 'green' },
    { id: 'apology', label: 'Apology', color: 'amber' },
    { id: 'boundary', label: 'Boundary', color: 'purple' }
];

const RepairScripts: React.FC = () => {
    const navigate = useNavigate();
    const [selectedCategory, setSelectedCategory] = useState<string>('all');
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const filteredScripts = selectedCategory === 'all'
        ? SCRIPTS
        : SCRIPTS.filter(s => s.category === selectedCategory);

    const handleCopy = (script: Script) => {
        navigator.clipboard.writeText(script.template);
        setCopiedId(script.id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getCategoryColor = (category: string) => {
        const colors = {
            space: 'bg-blue-50 text-blue-700 border-blue-200',
            reconnection: 'bg-green-50 text-green-700 border-green-200',
            apology: 'bg-amber-50 text-amber-700 border-amber-200',
            boundary: 'bg-purple-50 text-purple-700 border-purple-200'
        };
        return colors[category as keyof typeof colors] || 'bg-slate-50 text-slate-700 border-slate-200';
    };

    return (
        <Layout>
            <div className="min-h-screen bg-gradient-to-b from-brand-lavender/5 to-slate-50 pb-24">
                {/* Header */}
                <div className="px-6 pt-6 pb-4">
                    <button
                        onClick={() => navigate('/coach')}
                        className="flex items-center gap-2 text-brand-deep/60 hover:text-brand-deep transition-colors mb-4"
                    >
                        <ArrowLeft size={20} />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <h1 className="text-3xl font-serif font-bold text-brand-deep mb-2">
                        Repair Scripts
                    </h1>
                    <p className="text-brand-deep/60 leading-relaxed">
                        Templates for difficult conversations
                    </p>
                </div>

                {/* Category Filter */}
                <div className="px-6 mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`
                                    px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all
                                    ${selectedCategory === cat.id
                                        ? 'bg-brand-lavender text-white shadow-md'
                                        : 'bg-white/60 text-brand-deep/60 hover:bg-white border border-slate-200'
                                    }
                                `}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Scripts List */}
                <div className="px-6 space-y-4">
                    {filteredScripts.map((script, index) => (
                        <motion.div
                            key={script.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.05 }}
                            className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-slate-200/50 hover:border-brand-lavender/30 transition-all"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`
                                            px-2 py-0.5 rounded-full text-xs font-semibold border
                                            ${getCategoryColor(script.category)}
                                        `}>
                                            {script.category.charAt(0).toUpperCase() + script.category.slice(1)}
                                        </span>
                                    </div>
                                    <h3 className="font-heading font-bold text-brand-deep mb-1">
                                        {script.title}
                                    </h3>
                                    <p className="text-sm text-brand-deep/60 mb-3">
                                        {script.description}
                                    </p>
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        <p className="text-sm text-brand-deep leading-relaxed">
                                            {script.template}
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    onClick={() => handleCopy(script)}
                                    variant="secondary"
                                    className="flex-1 flex items-center justify-center gap-2"
                                >
                                    {copiedId === script.id ? (
                                        <>
                                            <Check size={16} />
                                            Copied!
                                        </>
                                    ) : (
                                        <>
                                            <Copy size={16} />
                                            Copy to Clipboard
                                        </>
                                    )}
                                </Button>
                                <Button
                                    onClick={() => navigate('/chat', { state: { initialMessage: script.template } })}
                                    className="flex-1"
                                >
                                    Customize in Chat
                                </Button>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredScripts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20">
                        <div className="w-20 h-20 bg-brand-lavender/10 rounded-full flex items-center justify-center mb-6">
                            <FileText size={40} className="text-brand-lavender" />
                        </div>
                        <p className="text-brand-deep/60 text-center">
                            No scripts in this category
                        </p>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default RepairScripts;
