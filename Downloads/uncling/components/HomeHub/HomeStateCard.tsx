import React from 'react';
import { MessageCircle, ShieldAlert, ArrowRight, Pause, Activity, Clock } from 'lucide-react';
import Card from '../Card';
import Button from '../Button';
import { HubState } from '../../services/hubStateService';

interface HomeStateContent {
    headline: string;
    body: string;
    primaryAction: string;
    secondaryAction: string;
    microCopy: string;
    primaryIcon: React.ElementType;
    secondaryIcon: React.ElementType;
}

export const STATE_CONTENT: Record<HubState, HomeStateContent> = {
    [HubState.Neutral]: {
        headline: "Today is a steady moment.",
        body: "You don’t need to fix anything. You can check in, reflect, or just observe.",
        primaryAction: "Start a Secure Self Chat",
        secondaryAction: "Rescue Now",
        microCopy: "You can take it slow today.",
        primaryIcon: MessageCircle,
        secondaryIcon: ShieldAlert
    },
    [HubState.Activated]: {
        headline: "Things feel a bit stirred today.",
        body: "Your system is signaling that something matters. You can explore it gently or focus on grounding first.",
        primaryAction: "Secure Self Chat",
        secondaryAction: "Rescue Now",
        microCopy: "Small steps matter more than answers.",
        primaryIcon: MessageCircle,
        secondaryIcon: ShieldAlert
    },
    [HubState.PostRescue]: {
        headline: "You’re a little steadier now.",
        body: "Let’s honor this calm before diving into reflection. You can pause, chat, or explore progress.",
        primaryAction: "Secure Self Chat",
        secondaryAction: "Check Progress",
        microCopy: "No rush — take your time.",
        primaryIcon: MessageCircle,
        secondaryIcon: Activity
    },
    [HubState.PostDeepChat]: {
        headline: "That was thoughtful work.",
        body: "You might feel a mix of clarity, relief, or fatigue. It’s okay to pause or continue reflecting gently.",
        primaryAction: "Pause / Exit",
        secondaryAction: "Quick Rescue",
        microCopy: "Take your next step only if it feels right.",
        primaryIcon: Pause,
        secondaryIcon: ShieldAlert
    },
    [HubState.Returning]: {
        headline: "Welcome back — nothing is overdue.",
        body: "Stepping away is natural. You can pick up where you left off or start fresh.",
        primaryAction: "Resume previous flow",
        secondaryAction: "Start new Secure Self Chat",
        microCopy: "There’s no right pace for return.",
        primaryIcon: Clock,
        secondaryIcon: MessageCircle
    },
    [HubState.Avoidant]: {
        headline: "You can engage — or not.",
        body: "This space is here if you need it, but there’s no pressure. Skipping is part of self-care too.",
        primaryAction: "Optional check-in",
        secondaryAction: "Exit for now",
        microCopy: "Returning later is always okay.",
        primaryIcon: MessageCircle,
        secondaryIcon: Pause
    },
    [HubState.Shutdown]: {
        headline: "Feeling quiet is okay.",
        body: "Sometimes the system needs rest. You can stay here without interaction or close the app safely.",
        primaryAction: "Pause quietly",
        secondaryAction: "Exit",
        microCopy: "Nothing needs to be done.",
        primaryIcon: Pause,
        secondaryIcon: Pause
    },
    [HubState.Skeptical]: {
        headline: "It’s okay to watch first.",
        body: "You don’t have to engage or trust me yet. Use this space only if it feels helpful.",
        primaryAction: "Observe / browse",
        secondaryAction: "Leave",
        microCopy: "You remain in control of every choice.",
        primaryIcon: Activity,
        secondaryIcon: Pause
    }
};

interface HomeStateCardProps {
    state: HubState;
    onPrimary: () => void;
    onSecondary: () => void;
}

const HomeStateCard: React.FC<HomeStateCardProps> = ({ state, onPrimary, onSecondary }) => {
    const content = STATE_CONTENT[state];
    const PrimaryIcon = content.primaryIcon;
    const SecondaryIcon = content.secondaryIcon;
    const isShutdown = state === HubState.Shutdown;

    return (
        <div className={`w-full max-w-md mx-auto space-y-8 animate-fade-in ${isShutdown ? 'opacity-90' : ''}`}>
            {/* Headline & Body */}
            <div className="text-center space-y-4">
                <h1 className="text-3xl font-serif text-slate-800 leading-tight">
                    {content.headline}
                </h1>
                <p className="text-lg text-slate-600 leading-relaxed max-w-sm mx-auto">
                    {content.body}
                </p>
            </div>

            {/* Actions */}
            <div className="space-y-3 pt-4">
                <Button
                    onClick={onPrimary}
                    className={`w-full flex items-center justify-between group ${isShutdown ? 'bg-slate-200 text-slate-600 hover:bg-slate-300' : ''}`}
                >
                    <span className="flex items-center gap-2">
                        <PrimaryIcon size={18} />
                        {content.primaryAction}
                    </span>
                    <ArrowRight size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                </Button>

                <button
                    onClick={onSecondary}
                    className="w-full p-4 bg-white/50 hover:bg-white border border-slate-100 rounded-xl text-slate-600 font-medium transition-all flex items-center justify-center gap-2"
                >
                    <SecondaryIcon size={16} className="text-slate-400" />
                    <span>{content.secondaryAction}</span>
                </button>
            </div>

            {/* Micro-copy */}
            <p className="text-center text-xs text-slate-400 font-medium italic">
                {content.microCopy}
            </p>
        </div>
    );
};

export default HomeStateCard;
