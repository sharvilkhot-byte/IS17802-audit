import React from 'react';

export function EmotionalSurface({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="relative rounded-[32px] px-6 py-8
                 shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
            style={{
                background:
                    "linear-gradient(180deg, #FFFFFF 0%, #F9FBFA 100%)",
            }}
        >
            {children}
        </div>
    );
}
