import React from 'react';

export function AppBackground({ children }: { children: React.ReactNode }) {
    return (
        <div
            className="relative min-h-screen px-5 pt-10 overflow-hidden"
            style={{
                background:
                    "radial-gradient(circle at top, #EDF3EF 0%, #FAFBF9 45%)",
            }}
        >
            {children}
        </div>
    );
}
