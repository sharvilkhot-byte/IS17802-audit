/**
 * Illustrations — custom SVG artwork for key moments in the app.
 * All illustrations use the design system color palette inline.
 * Keep them minimal, organic, and on-theme (attachment, growth, calm).
 */

// ── Emotion Face System ───────────────────────────────────────────────────────
// Custom illustrated mood faces — consistent across all platforms,
// warm earthy palette, minimal line-art style matching the visual guide.
// Five states: stable, calm, anxious, difficult, crisis

const FACE_STYLES = {
  stable:    { bg: '#C8DFBA', ring: '#8DBD72', eyes: '#3A6B2A', mouth: 'M 34 50 Q 40 57 46 50', cheeks: true,  cheekColor: '#B5D9A0' },
  calm:      { bg: '#D9CFC4', ring: '#B0A090', eyes: '#5D4037', mouth: 'M 35 50 Q 40 54 45 50', cheeks: false, cheekColor: null },
  anxious:   { bg: '#F0D5C0', ring: '#D4956A', eyes: '#7A3B1A', mouth: 'M 34 52 Q 40 47 46 52', cheeks: false, cheekColor: null, brow: true },
  difficult: { bg: '#DFCEC6', ring: '#C4A090', eyes: '#5D4037', mouth: 'M 34 54 Q 40 49 46 54', cheeks: false, cheekColor: null },
  crisis:    { bg: '#E8C5C0', ring: '#D48080', eyes: '#7A2020', mouth: 'M 33 55 Q 40 48 47 55', cheeks: false, cheekColor: null, brow: true, browColor: '#C04040' },
}

export function EmotionFace({ state = 'calm', size = 40, className = '' }) {
  const s = FACE_STYLES[state] || FACE_STYLES.calm
  const scale = size / 80

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Face circle */}
      <circle cx="40" cy="40" r="36" fill={s.bg} />
      <circle cx="40" cy="40" r="36" stroke={s.ring} strokeWidth="1.5" opacity="0.5" />

      {/* Eyebrows — only for anxious/crisis */}
      {s.brow && (
        <>
          <path d="M 27 29 Q 31 26 35 28" stroke={s.browColor || s.eyes} strokeWidth="2.2" strokeLinecap="round" />
          <path d="M 45 28 Q 49 26 53 29" stroke={s.browColor || s.eyes} strokeWidth="2.2" strokeLinecap="round" />
        </>
      )}

      {/* Eyes */}
      <circle cx="29" cy="35" r="3.5" fill={s.eyes} />
      <circle cx="51" cy="35" r="3.5" fill={s.eyes} />
      {/* Eye shine */}
      <circle cx="30.5" cy="33.5" r="1.2" fill="white" opacity="0.7" />
      <circle cx="52.5" cy="33.5" r="1.2" fill="white" opacity="0.7" />

      {/* Cheeks — only for stable/happy */}
      {s.cheeks && (
        <>
          <ellipse cx="22" cy="46" rx="7" ry="4.5" fill={s.cheekColor} opacity="0.6" />
          <ellipse cx="58" cy="46" rx="7" ry="4.5" fill={s.cheekColor} opacity="0.6" />
        </>
      )}

      {/* Mouth */}
      <path d={s.mouth} stroke={s.eyes} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  )
}

// Convenience map for emotional state → face state
export function stateToFace(emotionalState) {
  const map = {
    stable:    'stable',
    activated: 'anxious',
    difficult: 'difficult',
    crisis:    'crisis',
  }
  return map[emotionalState] || 'calm'
}

// ── Insight Tabs empty state ─────────────────────────────────────────────────
// A dormant seed with a single curling tendril — "not yet, but already stirring"
export function InsightsEmptyIllustration({ className = 'w-40 h-40' }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Soft background circle */}
      <circle cx="80" cy="80" r="64" fill="#EDF5E6" />

      {/* Soil line */}
      <path d="M44 104 Q80 100 116 104" stroke="#C8B9A8" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M52 108 Q80 105 108 108" stroke="#C8B9A8" strokeWidth="1" strokeLinecap="round" opacity="0.5" />

      {/* Seed — large, teardrop oval nestled in soil */}
      <ellipse cx="80" cy="102" rx="16" ry="11" fill="#A89478" opacity="0.85" />
      <ellipse cx="80" cy="101" rx="14" ry="9" fill="#C4AA88" opacity="0.6" />
      {/* Seed crease */}
      <path d="M80 93 Q80 96 80 111" stroke="#8B7055" strokeWidth="1" opacity="0.3" strokeLinecap="round" />

      {/* Tendril — a single hopeful curl rising from the seed */}
      <path d="M80 93 Q80 80 72 72 Q64 64 72 56 Q78 50 84 56"
        stroke="#8DBD72" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.75" />

      {/* Tiny unfurling tip — just beginning */}
      <path d="M84 56 C87 52 92 54 90 58 C88 61 84 59 84 56 Z"
        fill="#8DBD72" opacity="0.65" />
    </svg>
  )
}

// ── Action Lab empty / idle state ─────────────────────────────────────────────
// A single botanical leaf — "one small action is enough to begin"
export function ActionEmptyIllustration({ className = 'w-40 h-40' }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Background */}
      <circle cx="80" cy="80" r="64" fill="#EDF5E6" />

      {/* Stem — grounding the leaf */}
      <path d="M80 118 Q80 100 76 84"
        stroke="#8DBD72" strokeWidth="2" strokeLinecap="round" />

      {/* Main leaf — single, large, turned slightly */}
      <path d="M76 84 C56 68 44 80 50 96 C56 110 76 104 76 84 Z"
        fill="#4A6741" opacity="0.82" />

      {/* Midrib */}
      <path d="M76 84 L54 98"
        stroke="#628047" strokeWidth="1" strokeLinecap="round" opacity="0.45" />

      {/* Side veins — organic, subtle */}
      <path d="M70 88 L58 84" stroke="#628047" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M66 94 L54 92" stroke="#628047" strokeWidth="0.8" strokeLinecap="round" opacity="0.3" />
      <path d="M63 100 L53 101" stroke="#628047" strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />

      {/* Small secondary leaf — variation, not symmetry */}
      <path d="M78 92 C88 76 100 80 98 92 C96 102 78 102 78 92 Z"
        fill="#8DBD72" opacity="0.55" />
      <path d="M78 92 L96 90" stroke="#628047" strokeWidth="0.8" strokeLinecap="round" opacity="0.25" />
    </svg>
  )
}

// ── Landing / Onboarding hero ─────────────────────────────────────────────────
// Two overlapping circles with a connecting thread — attachment / pattern work
export function ConnectionIllustration({ className = 'w-48 h-32' }) {
  return (
    <svg className={className} viewBox="0 0 192 128" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Left circle — person / self */}
      <circle cx="64" cy="64" r="40" fill="#EDF5E6" stroke="#A8C490" strokeWidth="1.5" />
      {/* Right circle — other / relationship */}
      <circle cx="128" cy="64" r="40" fill="#EEEEF8" stroke="#6B6FB4" strokeOpacity="0.5" strokeWidth="1.5" />
      {/* Overlap region */}
      <path
        d="M96 32.5 C104 42 108 52 108 64 C108 76 104 86 96 95.5 C88 86 84 76 84 64 C84 52 88 42 96 32.5Z"
        fill="#F6F4F1" opacity="0.9"
      />

      {/* Self dot */}
      <circle cx="52" cy="58" r="5" fill="#4A6741" />
      {/* Thread from self */}
      <path d="M52 58 Q72 52 96 58" stroke="#4A6741" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" />

      {/* Other dot */}
      <circle cx="140" cy="58" r="5" fill="#6B6FB4" opacity="0.7" />
      {/* Thread from other */}
      <path d="M140 58 Q120 52 96 58" stroke="#6B6FB4" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="3 3" opacity="0.7" />

      {/* Center meeting point */}
      <circle cx="96" cy="58" r="3.5" fill="#2C332B" />
    </svg>
  )
}

// ── Rescue Mode — calm ripples ─────────────────────────────────────────────────
// Concentric ripples radiating from center — calm, breathe, expand
// Uses currentColor so parent can tint with style color
export function CalmRippleIllustration({ className = 'w-40 h-40' }) {
  return (
    <svg className={className} viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="80" cy="80" r="12" fill="currentColor" opacity="0.85" />
      <circle cx="80" cy="80" r="26" stroke="currentColor" strokeWidth="1.5" opacity="0.45" />
      <circle cx="80" cy="80" r="42" stroke="currentColor" strokeWidth="1.2" opacity="0.25" />
      <circle cx="80" cy="80" r="58" stroke="currentColor" strokeWidth="1" opacity="0.14" />
      <circle cx="80" cy="80" r="72" stroke="currentColor" strokeWidth="0.8" opacity="0.07" />
    </svg>
  )
}

// ── Pattern Report — mirror / reflection ─────────────────────────────────────
// A simple mirror shape — self-reflection
export function ReflectionIllustration({ className = 'w-32 h-40' }) {
  return (
    <svg className={className} viewBox="0 0 128 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Mirror frame */}
      <path
        d="M24 56 C24 30 40 16 64 16 C88 16 104 30 104 56 L104 108 C104 116 97 122 88 122 L40 122 C31 122 24 116 24 108 Z"
        fill="#FAFAF8" stroke="#E6E0D8" strokeWidth="2"
      />
      {/* Mirror surface highlight */}
      <path
        d="M36 58 C36 38 48 26 64 26 C80 26 92 38 92 58 L92 108 C92 111.3 89.3 114 86 114 L42 114 C38.7 114 36 111.3 36 108 Z"
        fill="#F0EDE9"
      />
      {/* Subtle reflection lines */}
      <path d="M50 55 Q64 50 78 55" stroke="#D0C8BC" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M46 68 Q64 62 82 68" stroke="#D0C8BC" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M46 81 Q64 76 82 81" stroke="#E6E0D8" strokeWidth="1.2" strokeLinecap="round" />
      {/* Accent dot — the "self" being observed */}
      <circle cx="64" cy="95" r="5" fill="#4A6741" opacity="0.7" />
      {/* Handle */}
      <rect x="58" y="122" width="12" height="22" rx="6" fill="#D0C8BC" />
    </svg>
  )
}
