import React from 'react';

// Strict State Definitions per Rulebook
export type CharacterState = 'Absent' | 'Static' | 'Ambient' | 'Grounding';

interface UnclinqCharacterProps {
    state: CharacterState;
    className?: string;
    /** Override for specific screens (e.g. Chat needs Static + NO Glow) */
    glow?: 'none' | 'faint' | 'soft' | 'strong';
    /** Override for specific screens (e.g. Dashboard can be Static) */
    motion?: 'none' | 'micro' | 'pulse';
    onClick?: () => void;
    onMouseDown?: () => void;
    onMouseUp?: () => void;
    onMouseLeave?: () => void;
    onTouchStart?: () => void;
    onTouchEnd?: () => void;
}

/**
 * Unclinq Brand Character (v1.0 Spec)
 * 
 * GLOBAL RULE: Only presence + intensity changes.
 * 
 * 1. Interaction: Never responds, listens, or reacts.
 * 2. States: Absent, Static, Ambient, Grounding.
 * 3. Motion: Micro breathing (1-2%), Drift (2-3px).
 * 4. Forbidden: Typing, reactions, eye tracking.
 */
const UnclinqCharacter: React.FC<UnclinqCharacterProps> = ({
    state,
    className = '',
    glow,
    motion,
    onClick,
    onMouseDown,
    onMouseUp,
    onMouseLeave,
    onTouchStart,
    onTouchEnd
}) => {
    // Return early for Absent state
    if (state === 'Absent') return null;

    // Base Image Path
    const characterImage = '/assets/unclinq_character.jpg';

    // Determine effective Glow Intensity
    // Map State to Default Glow if not overridden
    const getEffectiveGlow = () => {
        if (glow) return glow;
        switch (state) {
            case 'Ambient': return 'faint'; // Splash/Onboarding default
            case 'Grounding': return 'strong'; // Rescue default
            case 'Static': return 'none'; // Chat default
            default: return 'none';
        }
    };

    // Determine effective Motion
    const getEffectiveMotion = () => {
        if (motion) return motion;
        switch (state) {
            case 'Ambient': return 'micro'; // Breathing + Drift
            case 'Grounding': return 'none'; // "Motion: NONE" per Spec 5
            case 'Static': return 'none';
            default: return 'none';
        }
    };

    const effectiveGlow = getEffectiveGlow();
    const effectiveMotion = getEffectiveMotion();

    // Animation Classes
    const getMotionClass = () => {
        switch (effectiveMotion) {
            case 'micro': return 'animate-character-ambient'; // Breathe + Drift
            case 'pulse': return 'animate-pulse'; // Simple pulse (if used)
            default: return ''; // Static
        }
    };

    // Glow Classes
    const getGlowClass = () => {
        switch (effectiveGlow) {
            case 'faint': return 'opacity-30'; // 30% steady
            case 'soft': return 'opacity-60'; // 60% steady
            case 'strong': return 'opacity-80 animate-pulse-slow'; // Strong pulse for Grounding
            case 'none':
            default: return 'opacity-0';
        }
    };

    return (
        <div
            className={`relative flex items-center justify-center select-none ${className}`}
            onClick={onClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseLeave}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
        >
            {/* Glow Layer */}
            <div
                className={`absolute inset-0 rounded-full bg-accent-warm/20 blur-xl transition-all duration-[2000ms] ${getGlowClass()}`}
            ></div>

            {/* Character Image container */}
            <div className={`relative z-10 w-full h-full transition-all duration-[2000ms] ease-in-out ${getMotionClass()}`}>
                <img
                    src={characterImage}
                    alt="Unclinq Character"
                    className="w-full h-full object-contain drop-shadow-sm rounded-full"
                    draggable={false}
                />
            </div>
        </div>
    );
};

export default UnclinqCharacter;
