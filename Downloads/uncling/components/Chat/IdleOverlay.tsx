import React, { useEffect, useState } from 'react';

interface IdleOverlayProps {
    onStart: () => void;
    title?: string;
    subtitle?: string;
    primaryLabel?: string;
}

const IdleOverlay: React.FC<IdleOverlayProps> = ({ onStart, title, subtitle, primaryLabel }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Fade in effect
        setTimeout(() => setVisible(true), 100);
    }, []);

    return (
        <div className={`absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-blue-50/50 to-white/80 backdrop-blur-[2px] transition-opacity duration-1000 ${visible ? 'opacity-100' : 'opacity-0'}`}>

            {/* Breathing Animation Circle */}
            <div className="relative w-32 h-32 mb-12 flex items-center justify-center">
                <div className="absolute inset-0 bg-tense rounded-full opacity-30 animate-ping-slow"></div>
                <div className="absolute inset-4 bg-calm rounded-full opacity-50 animate-pulse-slow"></div>
                <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center text-forest/50">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M12 3a9 9 0 0 0-9 9 9 9 0 0 0 9 9 9 9 0 0 0 9-9 9 9 0 0 0-9-9z" />
                        <path d="M12 8v8" />
                        <path d="M8 12h8" />
                    </svg>
                </div>
            </div>

            <div className="text-center max-w-xs space-y-4">
                <h2 className="text-xl font-light text-textPrimary animate-fade-in-up leading-tight">
                    {title || "Take your time."}
                </h2>
                <p className="text-textSecondary font-light animate-fade-in-up delay-100">
                    {subtitle || "I’m here whenever you’re ready."}
                </p>
            </div>

            <button
                onClick={onStart}
                className="mt-16 px-8 py-3 bg-white border border-slate-100 rounded-full shadow-sm hover:shadow-md transition-all text-textSecondary hover:text-forest text-sm font-medium animate-fade-in-up delay-200"
            >
                {primaryLabel || "Tap to reflect"}
            </button>
        </div>
    );
};

export default IdleOverlay;
