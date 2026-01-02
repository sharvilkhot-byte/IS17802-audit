import React from 'react';
import { AlertCircle, Pause, Shield, CloudOff, AlertOctagon } from 'lucide-react';
import Card from './Card';
import Button from './Button';

export type EdgeCaseType =
    | 'shutdown'
    | 'no_talk'
    | 'avoidance_guilt'
    | 'skepticism'
    | 'dependency'
    | 'rescue_after'
    | 'plateau'
    | 'anger'
    | 'unseen'
    | 'leaving';

interface EdgeCaseCardProps {
    type: EdgeCaseType;
    onPrimary: () => void;
    onSecondary?: () => void;
}

const CONTENT: Record<EdgeCaseType, {
    icon: React.ElementType,
    color: string,
    title: string,
    body: string,
    primaryLabel: string,
    secondaryLabel?: string
}> = {
    shutdown: {
        icon: CloudOff,
        color: "text-slate-400",
        title: "Feeling nothing can be a feeling too.",
        body: "Sometimes the system goes quiet to protect you. You don’t need to push or explain anything right now.",
        primaryLabel: "Stay quietly for a moment",
        secondaryLabel: "Close this — that’s okay too"
    },
    no_talk: {
        icon: Pause,
        color: "text-orange-400",
        title: "That’s completely okay.",
        body: "You don’t have to talk, reflect, or progress here. I can stay silent, or you can leave.",
        primaryLabel: "Stay without talking",
        secondaryLabel: "Exit for now"
    },
    avoidance_guilt: {
        icon: Shield,
        color: "text-emerald-500",
        title: "You didn’t fall behind.",
        body: "Stepping away is often part of regulation, not avoidance. Nothing needs to be caught up.",
        primaryLabel: "Start where I am today",
        secondaryLabel: "Just look around quietly"
    },
    skepticism: {
        icon: AlertCircle,
        color: "text-amber-500",
        title: "It’s reasonable to be unsure.",
        body: "You don’t have to trust me. Use this only if it feels helpful — or not at all.",
        primaryLabel: "Observe without engaging",
        secondaryLabel: "Leave this space"
    },
    dependency: {
        icon: AlertOctagon,
        color: "text-rose-400",
        title: "Let’s slow this down a little.",
        body: "Support works best when it doesn’t replace your own inner signals. We can pause, or use this more lightly.",
        primaryLabel: "Take a short break",
        secondaryLabel: "Continue gently"
    },
    rescue_after: {
        icon: Shield,
        color: "text-emerald-600",
        title: "That was too much. I’m here now.",
        body: "We don’t need to make sense of anything. Let’s help your body settle first.",
        primaryLabel: "Start grounding"
    },
    plateau: {
        icon: Pause,
        color: "text-slate-500",
        title: "This feeling matters.",
        body: "Plateaus often mean something needs to change — not that you’re stuck. We can look at it, or pause entirely.",
        primaryLabel: "Explore what’s not working",
        secondaryLabel: "Pause for now"
    },
    anger: {
        icon: AlertCircle,
        color: "text-rose-500",
        title: "You can be annoyed here.",
        body: "You don’t need to like this. I won’t argue with how it feels.",
        primaryLabel: "Say what’s frustrating",
        secondaryLabel: "Close this"
    },
    unseen: {
        icon: AlertCircle,
        color: "text-indigo-400",
        title: "I might be missing something.",
        body: "If this isn’t landing, that’s important information. You can correct me — or choose not to continue.",
        primaryLabel: "Clarify what I missed",
        secondaryLabel: "Stop here"
    },
    leaving: {
        icon: LogOutIcon, // Need to define or import LogOutIcon if not in lucide 'LogOut'
        color: "text-slate-400",
        title: "You’re allowed to leave.",
        body: "If this isn’t right for you right now, that’s okay. Nothing is lost.",
        primaryLabel: "Exit calmly"
    }
};

// Helper for icon since we used LogOutIcon in one place above but it might not be standard
function LogOutIcon(props: any) {
    return <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
}

const EdgeCaseCard: React.FC<EdgeCaseCardProps> = ({ type, onPrimary, onSecondary }) => {
    const content = CONTENT[type];
    const Icon = content.icon;

    return (
        <Card className="border-l-4 border-l-slate-200 p-6">
            <div className="flex items-start gap-4">
                <div className={`mt-1 ${content.color}`}>
                    <Icon size={24} />
                </div>
                <div className="flex-1">
                    <h3 className="text-lg font-serif text-textPrimary mb-2">{content.title}</h3>
                    <p className="text-textSecondary mb-6 leading-relaxed">
                        {content.body}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={onPrimary} className="bg-slate-900 text-white hover:bg-slate-800 !py-2 !px-4 text-sm">
                            {content.primaryLabel}
                        </Button>
                        {content.secondaryLabel && onSecondary && (
                            <Button onClick={onSecondary} variant="secondary" className="!py-2 !px-4 text-sm border-slate-200">
                                {content.secondaryLabel}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default EdgeCaseCard;
