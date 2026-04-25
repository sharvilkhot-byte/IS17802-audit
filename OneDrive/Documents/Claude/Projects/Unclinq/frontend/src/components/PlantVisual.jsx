/**
 * PLANT VISUAL — Botanical vessel edition
 * A clay pot grounds the plant; growth emerges from it.
 * Inspired by Eden's botanical illustration quality.
 *
 * Every stage uses currentColor so parent can tint with the attachment style.
 * tinted prop: when true, lets parent override the color via style prop.
 * Without tinted, defaults to text-text-muted/20 (subtle background presence).
 */

function Pot({ opacity = 1 }) {
  // A small clay-style vessel — base of all growth stages
  return (
    <g opacity={opacity}>
      {/* Pot body */}
      <path
        d="M21 57 L18 73 C18 77 23 80 30 80 C37 80 42 77 42 73 L39 57 Z"
        fill="currentColor" opacity="0.22"
      />
      {/* Pot rim */}
      <path
        d="M16 54 H44 C44 54 43 58 39 58 H21 C17 58 16 54 16 54 Z"
        fill="currentColor" opacity="0.32"
      />
      {/* Soil surface */}
      <ellipse cx="30" cy="57.5" rx="9" ry="2" fill="currentColor" opacity="0.18" />
      {/* Subtle pot highlight */}
      <path
        d="M22 62 Q20 68 21 72"
        stroke="currentColor" strokeWidth="1" opacity="0.12"
        strokeLinecap="round" fill="none"
      />
    </g>
  )
}

function getStageSVG(stage) {
  switch (stage) {

    case 'seed':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Seed in soil */}
          <ellipse cx="30" cy="56" rx="3.5" ry="2.5" fill="currentColor" opacity="0.45" />
          {/* Tiny crack — life beginning */}
          <path d="M30 53.5 L30 51" stroke="currentColor" strokeWidth="1" strokeLinecap="round" opacity="0.3" />
        </svg>
      )

    case 'sprout':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Stem */}
          <path d="M30 57 Q30 50 29 44" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          {/* First leaf — left, unfurling */}
          <path d="M29 48 C22 44 18 50 22 54 C25 56 29 52 29 48 Z"
            fill="currentColor" opacity="0.75" />
          <path d="M29 48 L23 52" stroke="currentColor" strokeWidth="0.7" opacity="0.35" strokeLinecap="round" />
        </svg>
      )

    case 'shoot':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Main stem */}
          <path d="M30 57 Q30 48 29 38" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          {/* Left leaf */}
          <path d="M29.5 50 C21 46 17 53 21 57 C24 59 29 54 29.5 50 Z"
            fill="currentColor" opacity="0.75" />
          <path d="M29.5 50 L22 55" stroke="currentColor" strokeWidth="0.7" opacity="0.3" strokeLinecap="round" />
          {/* Right leaf */}
          <path d="M29 43 C37 39 40 46 37 50 C34 52 29 47 29 43 Z"
            fill="currentColor" opacity="0.65" />
          <path d="M29 43 L36 48" stroke="currentColor" strokeWidth="0.7" opacity="0.3" strokeLinecap="round" />
        </svg>
      )

    case 'stem':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Main stem */}
          <path d="M30 57 Q30 45 28 30" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          {/* Side stem */}
          <path d="M29 48 Q36 44 38 37" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          {/* Left leaf low */}
          <path d="M29.5 52 C20 48 17 55 21 59 C24 61 29 56 29.5 52 Z"
            fill="currentColor" opacity="0.7" />
          {/* Left leaf high */}
          <path d="M28.5 39 C20 35 17 42 21 46 C24 48 28 43 28.5 39 Z"
            fill="currentColor" opacity="0.7" />
          {/* Right leaf */}
          <path d="M38 37 C44 30 46 38 42 42 C39 44 36 39 38 37 Z"
            fill="currentColor" opacity="0.6" />
          <path d="M28.5 39 L22 43" stroke="currentColor" strokeWidth="0.7" opacity="0.25" strokeLinecap="round" />
        </svg>
      )

    case 'leaves':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Main stem */}
          <path d="M30 57 Q29 42 27 24" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
          {/* Branch right */}
          <path d="M29 44 Q38 40 40 32" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
          {/* Left leaf bottom */}
          <path d="M29 53 C18 49 15 58 20 62 C24 64 29 58 29 53 Z"
            fill="currentColor" opacity="0.7" />
          {/* Left leaf mid */}
          <path d="M28 39 C18 35 15 44 20 48 C24 50 28 43 28 39 Z"
            fill="currentColor" opacity="0.72" />
          {/* Right leaf mid */}
          <path d="M40 32 C47 25 49 34 45 38 C42 40 38 35 40 32 Z"
            fill="currentColor" opacity="0.62" />
          {/* Top leaf */}
          <path d="M27 25 C21 19 18 27 22 31 C25 33 27 28 27 25 Z"
            fill="currentColor" opacity="0.55" />
          {/* Right branch top leaf */}
          <path d="M30 31 C36 25 40 32 37 36 C34 38 30 33 30 31 Z"
            fill="currentColor" opacity="0.55" />
          <path d="M28 39 L21 44" stroke="currentColor" strokeWidth="0.7" opacity="0.2" strokeLinecap="round" />
        </svg>
      )

    case 'rooted':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Roots peeking out of pot bottom */}
          <path d="M26 78 Q22 84 18 82" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" fill="none" />
          <path d="M34 78 Q38 84 42 82" stroke="currentColor" strokeWidth="1" opacity="0.3" strokeLinecap="round" fill="none" />
          {/* Main stem */}
          <path d="M30 57 Q28 40 26 20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          {/* Branch left */}
          <path d="M28 45 Q19 41 17 33" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
          {/* Branch right */}
          <path d="M28 36 Q38 31 41 22" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" opacity="0.85" />
          {/* Leaves - layered */}
          <path d="M29 52 C18 48 15 57 20 61 C24 63 29 57 29 52 Z" fill="currentColor" opacity="0.7" />
          <path d="M17 33 C9 28 7 37 12 41 C16 43 17 37 17 33 Z" fill="currentColor" opacity="0.65" />
          <path d="M41 22 C47 16 49 25 45 29 C42 31 39 26 41 22 Z" fill="currentColor" opacity="0.65" />
          <path d="M26 28 C18 23 15 32 20 36 C24 38 26 32 26 28 Z" fill="currentColor" opacity="0.6" />
          <path d="M27 21 C22 14 18 22 22 27 C25 29 27 24 27 21 Z" fill="currentColor" opacity="0.55" />
          <path d="M29 35 C36 29 40 37 36 41 C33 43 29 38 29 35 Z" fill="currentColor" opacity="0.6" />
          {/* Small bud at top */}
          <circle cx="26" cy="19" r="2.5" fill="currentColor" opacity="0.5" />
        </svg>
      )

    case 'weathered':
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Stem — bent under weight, drooping right */}
          <path d="M30 57 Q31 48 34 40 Q36 33 32 26" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.6" />
          {/* Left leaf — wilted, curling down */}
          <path d="M31 50 C22 48 19 54 23 58 C26 60 31 54 31 50 Z"
            fill="currentColor" opacity="0.35" />
          <path d="M31 50 L24 56" stroke="currentColor" strokeWidth="0.6" opacity="0.2" strokeLinecap="round" />
          {/* Right leaf — heavy, drooping */}
          <path d="M33 40 C41 40 43 47 39 50 C36 51 33 45 33 40 Z"
            fill="currentColor" opacity="0.3" />
          {/* Top — small wilted bud */}
          <path d="M32 26 C29 22 26 27 29 30 C31 31 32 28 32 26 Z"
            fill="currentColor" opacity="0.25" />
          {/* Rain drops — 3 tiny tear shapes */}
          <path d="M10 18 Q10 15 12 15 Q14 15 14 18 Q14 21 12 22 Q10 21 10 18 Z"
            fill="currentColor" opacity="0.22" />
          <path d="M18 10 Q18 7 20 7 Q22 7 22 10 Q22 13 20 14 Q18 13 18 10 Z"
            fill="currentColor" opacity="0.16" />
          <path d="M6 8 Q6 5.5 7.5 5.5 Q9 5.5 9 8 Q9 10.5 7.5 11.5 Q6 10.5 6 8 Z"
            fill="currentColor" opacity="0.12" />
        </svg>
      )

    case 'mature':
    default:
      return (
        <svg viewBox="0 0 60 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <Pot />
          {/* Roots */}
          <path d="M25 78 Q20 85 14 83" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" fill="none" />
          <path d="M30 79 Q30 87 28 88" stroke="currentColor" strokeWidth="1" opacity="0.25" strokeLinecap="round" fill="none" />
          <path d="M35 78 Q40 85 46 83" stroke="currentColor" strokeWidth="1.1" opacity="0.35" strokeLinecap="round" fill="none" />
          {/* Main stem — tall and assured */}
          <path d="M30 57 Q28 38 26 16" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" />
          {/* Secondary stems */}
          <path d="M29 48 Q19 43 16 33" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
          <path d="M28 38 Q38 32 42 22" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" opacity="0.85" />
          <path d="M27 28 Q18 23 17 14" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" opacity="0.75" />
          {/* Lush leaf spread */}
          <path d="M29 53 C17 48 14 58 19 62 C23 65 29 58 29 53 Z" fill="currentColor" opacity="0.72" />
          <path d="M16 33 C7 28 5 38 11 42 C15 44 16 37 16 33 Z" fill="currentColor" opacity="0.68" />
          <path d="M42 22 C49 15 51 25 46 29 C43 31 40 26 42 22 Z" fill="currentColor" opacity="0.68" />
          <path d="M27 37 C19 32 16 41 21 45 C25 47 27 41 27 37 Z" fill="currentColor" opacity="0.65" />
          <path d="M17 14 C10 8 8 18 13 22 C17 24 17 17 17 14 Z" fill="currentColor" opacity="0.58" />
          <path d="M30 26 C37 20 41 29 37 33 C34 35 30 29 30 26 Z" fill="currentColor" opacity="0.62" />
          <path d="M27 17 C22 10 18 19 22 23 C25 25 27 20 27 17 Z" fill="currentColor" opacity="0.55" />
          {/* Crown — small open flower */}
          <circle cx="26" cy="15" r="2" fill="currentColor" opacity="0.7" />
          <path d="M26 13 Q24 10 22 12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" fill="none" />
          <path d="M26 13 Q28 10 30 12" stroke="currentColor" strokeWidth="0.8" opacity="0.4" strokeLinecap="round" fill="none" />
          {/* Warm glow behind — very subtle */}
          <circle cx="30" cy="40" r="20" fill="currentColor" opacity="0.03" />
        </svg>
      )
  }
}

export default function PlantVisual({ stage = 'seed', className = '', tinted = false }) {
  return (
    <div
      className={`${tinted ? '' : 'text-text-muted/25'} select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {getStageSVG(stage)}
    </div>
  )
}
