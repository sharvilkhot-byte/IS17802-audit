import React from 'react';

interface AttachmentGraphProps {
    anxietyScore: number; // Range 6-30
    avoidanceScore: number; // Range 6-30
}

const AttachmentGraph: React.FC<AttachmentGraphProps> = ({ anxietyScore, avoidanceScore }) => {
    // Normalize scores to 0-100 for the graph
    // Min 6, Max 30. Range = 24.
    const x = ((avoidanceScore - 6) / 24) * 100;
    const y = ((anxietyScore - 6) / 24) * 100;

    // Safety clamp (0-100)
    const clamp = (val: number) => Math.max(0, Math.min(100, val));
    const plotX = clamp(x);
    // Invert Y because CSS bottom=0 is 0, top=100. Actually for simple absolute positioning from top/left:
    // Left = Avoidance (0=Low, 100=High) -> Correct.
    // Top = Anxiety (0=Low, 100=High) -> Wait, usually Y axis goes up.
    // Let's align with the previous Logic: 
    // Top-Left: High Anxiety, Low Avoidance (Anxious)
    // Top-Right: High Anxiety, High Avoidance (Fearful)
    // Bottom-Left: Low Anxiety, Low Avoidance (Secure)
    // Bottom-Right: Low Anxiety, High Avoidance (Avoidant)

    // So "High Anxiety" is smaller Y value (closer to top).
    // If Anxiety Score is 30 (High), y calc is 100. We want Top=0. So plotY should be 100 - y.
    const plotY = 100 - clamp(y);

    return (
        <div className="w-full aspect-square max-w-sm mx-auto relative rounded-full overflow-hidden shadow-button-inner bg-white isolates">
            {/* --- Organic Gradient Background (The Nebula) --- */}

            {/* Top-Left: Anxious (Warm/Red) */}
            <div className="absolute top-0 left-0 w-[70%] h-[70%] bg-radial-at-tl from-orange-200/40 via-orange-100/10 to-transparent blur-xl mix-blend-multiply"></div>

            {/* Top-Right: Fearful (Stormy/Purple-Red) */}
            <div className="absolute top-0 right-0 w-[70%] h-[70%] bg-radial-at-tr from-rose-300/30 via-rose-200/10 to-transparent blur-xl mix-blend-multiply"></div>

            {/* Bottom-Left: Secure (Green/Teal) */}
            <div className="absolute bottom-0 left-0 w-[70%] h-[70%] bg-radial-at-bl from-emerald-200/40 via-teal-100/10 to-transparent blur-xl mix-blend-multiply"></div>

            {/* Bottom-Right: Avoidant (Cool/Blue) */}
            <div className="absolute bottom-0 right-0 w-[70%] h-[70%] bg-radial-at-br from-blue-200/40 via-sky-100/10 to-transparent blur-xl mix-blend-multiply"></div>

            {/* --- Minimalist Grid Overlay --- */}
            <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-30 pointer-events-none">
                {/* Soft Center Lines (Cross) */}
                <line x1="50" y1="10" x2="50" y2="90" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />
                <line x1="10" y1="50" x2="90" y2="50" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="2,2" />

                {/* Outer Circle Ring */}
                <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
            </svg>

            {/* --- Labels (Softly Floating) --- */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-medium text-rose-400 tracking-widest uppercase opacity-80">Need for Reassurance</div>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[10px] sm:text-xs font-medium text-emerald-500 tracking-widest uppercase opacity-80">Emotional Stability</div>

            <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] sm:text-xs font-medium text-slate-400 tracking-widest uppercase opacity-80 origin-center">Comfort with Closeness</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-[10px] sm:text-xs font-medium text-forest tracking-widest uppercase opacity-80 origin-center">Need for Autonomy</div>

            {/* --- Quadrant Identifiers (Subtle) --- */}
            <div className="absolute top-[25%] left-[25%] -translate-x-1/2 -translate-y-1/2 text-orange-600/20 font-bold text-sm tracking-widest">GUARD</div>
            <div className="absolute top-[25%] right-[25%] translate-x-1/2 -translate-y-1/2 text-rose-600/20 font-bold text-sm tracking-widest">SENTINEL</div>
            <div className="absolute bottom-[25%] left-[25%] -translate-x-1/2 translate-y-1/2 text-emerald-600/20 font-bold text-sm tracking-widest">ANCHOR</div>
            <div className="absolute bottom-[25%] right-[25%] translate-x-1/2 translate-y-1/2 text-forest/20 font-bold text-sm tracking-widest">SOLOIST</div>

            {/* --- The "You" Marker (Breathing Organism) --- */}
            <div
                className="absolute w-6 h-6 -ml-3 -mt-3 flex items-center justify-center transition-all duration-1000 ease-out"
                style={{ left: `${plotX}%`, top: `${plotY}%` }}
            >
                {/* Outer Ripple (The Breath) */}
                <div className="absolute w-full h-full bg-forest/30 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite]"></div>

                {/* Middle Glow */}
                <div className="absolute w-4 h-4 bg-forest/50 rounded-full blur-[2px]"></div>

                {/* Core (Solid) */}
                <div className="relative w-2.5 h-2.5 bg-white rounded-full shadow-[0_0_10px_rgba(59,130,246,0.6)]"></div>
            </div>

            {/* Label for Marker */}
            <div
                className="absolute -ml-6 -mt-8 flex flex-col items-center transition-all duration-1000 ease-out z-10"
                style={{ left: `${plotX}%`, top: `${plotY}%` }}
            >
                <div className="px-2 py-0.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-forest/20">
                    <span className="text-[10px] font-bold text-forest tracking-wide">YOU</span>
                </div>
            </div>

        </div>
    );
};

export default AttachmentGraph;
