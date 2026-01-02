
import React from 'react';

interface ChatIntentionPickerProps {
    onSelectIntention: (starterMessage: string, aiGreeting: string) => void;
    isLoading: boolean;
}

const MagnifyingGlassIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>;
const BrainIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v1.2a1 1 0 0 0 1 1h.3a1 1 0 0 1 .9.7l.2 1.1a1 1 0 0 0 .8.8h1.2a2.5 2.5 0 0 1 2.5 2.5v1.3a1 1 0 0 1-1 1h-.3a1 1 0 0 0-.9.7l-.2 1.1a1 1 0 0 0-.8-.8H7.5A2.5 2.5 0 0 1 5 12.5v-1.3a1 1 0 0 0-1-1h-.3a1 1 0 0 1-.9-.7l-.2-1.1a1 1 0 0 0-.8-.8H.5A2.5 2.5 0 0 1 3 4.5v-1.3A1 1 0 0 1 4 2h.3a1 1 0 0 0 .9-.7l.2-1.1a1 1 0 0 1 .8-.8h1.2A2.5 2.5 0 0 1 9.5 2z"></path></svg>;
const FeatherIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"></path><line x1="16" y1="8" x2="2" y2="22"></line><line x1="17.5" y1="15" x2="9" y2="15"></line></svg>;

const intentions = [
    {
        icon: <MagnifyingGlassIcon />,
        title: "Unpack a situation",
        description: "Analyze something that happened.",
        starterMessage: "Something is on my mind.",
        aiGreeting: "You can describe what happened."
    },
    {
        icon: <BrainIcon />,
        title: "Understand a feeling",
        description: "Process a difficult emotion.",
        starterMessage: "I'm noticing a difficult feeling.",
        aiGreeting: "You can name the feeling if you like."
    },
    {
        icon: <FeatherIcon />,
        title: "Inner notes",
        description: "Write freely without a prompt.",
        starterMessage: "I'd just like to write.",
        aiGreeting: "The space is yours."
    }
];


const ChatIntentionPicker: React.FC<ChatIntentionPickerProps> = ({ onSelectIntention, isLoading }) => {
    if (isLoading) {
        return (
            <div className="h-full flex flex-col items-center justify-center text-center">
                {/* Breathing Loader */}
                <div className="relative w-16 h-16 mb-4 flex items-center justify-center">
                    <div className="absolute inset-0 bg-forest/20 rounded-full animate-breathe"></div>
                    <div className="w-8 h-8 bg-forest/40 rounded-full animate-pulse"></div>
                </div>
                <p className="text-sm text-textSecondary animate-pulse">One moment</p>
            </div>
        );
    }

    return (
        <div className="h-full flex flex-col items-center justify-center text-center p-4">
            <img src="https://i.ibb.co/wZh3tzCj/uncling.png" alt="Uncling Logo" className="h-14 sm:h-16 w-auto opacity-40 mb-3" />
            <h2 className="text-lg font-light text-textPrimary mb-1">What's your intention?</h2>
            <p className="text-xs text-textSecondary mb-6 tracking-wide">Select a focus for this session.</p>

            <div className="w-full max-w-md grid grid-cols-1 gap-3">
                {intentions.map((intention) => (
                    <button
                        key={intention.title}
                        onClick={() => onSelectIntention(intention.starterMessage, intention.aiGreeting)}
                        className="text-left p-4 bg-white/50 border border-moss/10 rounded-2xl shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 flex items-center gap-4 group"
                    >
                        <div className="text-forest bg-forest/5 p-3 rounded-xl group-hover:scale-110 transition-transform duration-500 ease-out flex-shrink-0">
                            {intention.icon}
                        </div>
                        <div className="min-w-0">
                            <h3 className="text-sm font-medium text-textPrimary truncate">{intention.title}</h3>
                            <p className="text-xs text-textSecondary truncate opacity-80">{intention.description}</p>
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default ChatIntentionPicker;
