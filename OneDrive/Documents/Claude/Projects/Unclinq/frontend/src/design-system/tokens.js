/**
 * UNCLINQ DESIGN SYSTEM — TOKENS
 * Extracted from Home.jsx + index.css
 *
 * Single source of truth for every visual value used across the app.
 * Import from here instead of scattering hex codes throughout components.
 *
 * Usage:
 *   import { color, shadow, radius, type } from '../design-system/tokens'
 *   style={{ background: color.surface.page, boxShadow: shadow.card }}
 */

// ─── Color ───────────────────────────────────────────────────────────────────

export const color = {

  // Backgrounds — warm washi paper
  surface: {
    page:     '#F8F1E7',   // page background — warm apricot parchment
    card:     '#FDFBF7',   // card white — barely warm
    elevated: '#FDFAF5',   // input/elevated surface
    subtle:   '#F0EAD6',   // section separator / subtle tint
    cream:    '#FFF9F0',   // inner card gradient start
    cream2:   '#F5E9DA',   // inner card gradient end
    mini:     'rgba(255,249,240,0.6)',  // 2-col mini card bg
  },

  // Text hierarchy
  text: {
    primary:   '#5D4037',   // warm umber — main readable text (home headings)
    dark:      '#2C332B',   // forest charcoal — highest contrast headings
    secondary: '#8D6E63',   // muted warm brown — supporting copy
    muted:     '#8C9688',   // sage grey — labels, timestamps
    inverse:   '#FFF9F0',   // on dark cards
    inverseDim: 'rgba(255,249,240,0.7)',  // on dark cards, subdued
  },

  // Primary action — terracotta
  terra: {
    DEFAULT:  '#C06C54',   // primary CTA, links, accents
    hover:    '#A65B45',   // hover state
    light:    '#D48C70',   // light terracotta (scrollbar, accents)
    soft:     '#FF7F50',   // orange-terracotta (plant bloom, tags)
    faint:    'rgba(192,108,84,0.1)',   // border tint
    faintest: 'rgba(192,108,84,0.07)', // mini card border
    glow:     'rgba(192,108,84,0.3)',  // button shadow
    glowHover:'rgba(192,108,84,0.35)', // button shadow hovered
  },

  // Botanical greens
  sage: {
    DEFAULT: '#8F9779',   // stems, dots, decorative
    light:   '#A4AC86',   // lighter leaves
    dark:    '#6B7860',   // deep leaf veins
    faint:   'rgba(143,151,121,0.05)',  // hero blob
  },

  // Gold — milestones, growth level
  gold: {
    DEFAULT: '#D4AF37',
    light:   '#F0D49A',
  },

  // Crisis / rescue
  rescue: {
    bg:      '#1a2419',   // Rescue Mode dark shell
    bgDeep:  '#0f160e',   // rescue gradient bottom
    red:     '#FF6B6B',   // rescue icon / crisis text
    orange:  '#FF7F50',   // activated badge
    border:  'rgba(255,107,107,0.2)',
    glow:    'rgba(255,127,80,0.3)',
  },

  // Semantic states
  state: {
    stable:    '#4E7A3A',
    stableBg:  'rgba(78,122,58,0.08)',
    stableBorder: 'rgba(78,122,58,0.2)',
    activated: '#C06C54',   // same as terra
    crisis:    '#A02828',
    crisisBg:  'rgba(160,40,40,0.06)',
    crisisBorder: 'rgba(160,40,40,0.2)',
  },

  // Card borders
  border: {
    DEFAULT: 'rgba(197,123,87,0.14)',   // card border
    hover:   'rgba(197,123,87,0.28)',   // interactive hover
    strong:  '#D6C8B5',                 // btn-secondary border
    input:   'rgba(197,123,87,0.15)',   // input default
    divider: 'rgba(197,123,87,0.14)',   // .divider
    surface: '#E6E2D6',                 // surface-border token
  },

  // Dark card (action card — crisis mode, ActionLab "why this works")
  dark: {
    DEFAULT: '#3E3632',   // rescue FAB background
    deep:    '#2C332B',   // darkest dark
    card:    '#2C2420',   // dark card gradient end
    text:    '#F2F0E9',   // text on dark
  },

  // Pot / earth tones (plant illustration)
  earth: {
    pot:  '#8D6E63',
    soil: '#5D4037',
  },
}

// ─── Gradients ────────────────────────────────────────────────────────────────

export const gradient = {
  // Main action card
  card: `linear-gradient(145deg, ${color.surface.cream} 0%, ${color.surface.cream2} 100%)`,
  // Emora chat bubble
  emora: 'linear-gradient(145deg, #FFFBF5 0%, #FFF6EC 100%)',
  // Dark rescue card
  rescueCard: 'linear-gradient(145deg, #3E3632 0%, #2C2420 100%)',
  // ActionLab "why this works" dark card
  darkCard: `linear-gradient(145deg, ${color.dark.deep} 0%, ${color.dark.deep} 100%)`,
  // Hero radial glow
  heroRadial: 'radial-gradient(circle at center, rgba(224,141,116,0.15) 0%, rgba(248,241,231,0) 70%)',
  // Ambient top-right glow blob
  ambientTop: `radial-gradient(circle, rgba(192,108,84,0.055) 0%, transparent 70%)`,
}

// ─── Paper grain texture ──────────────────────────────────────────────────────

export const texture = {
  // Inline SVG grain — use as backgroundImage on a fixed overlay
  grain: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
  grainStyle: {
    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`,
    mixBlendMode: 'multiply',
  },
}

// ─── Shadows ──────────────────────────────────────────────────────────────────

export const shadow = {
  // Standard card
  card:      '0 1px 3px rgba(44,55,40,0.06), 0 4px 12px rgba(44,55,40,0.04)',
  // Main action card (larger)
  cardLg:    '0 4px 12px -2px rgba(93,64,55,0.1)',
  // Elevated card on hover
  cardHover: '0 4px 20px rgba(74,55,40,0.08), 0 8px 24px rgba(44,55,40,0.06)',
  // Primary button
  btn:       '0 4px 16px rgba(192,108,84,0.3), 0 1px 4px rgba(192,108,84,0.2)',
  btnHover:  '0 6px 20px rgba(192,108,84,0.35), 0 2px 6px rgba(192,108,84,0.25)',
  // Rescue FAB
  fab:       '0 8px 24px -4px rgba(255,127,80,0.3)',
  // Plant illustration
  plant:     'drop-shadow(0 10px 20px rgba(93,64,55,0.1))',
  // Glass card
  glass:     '0 8px 32px 0 rgba(192,108,84,0.12)',
  // Dark "why this works" card
  dark:      '0 8px 30px -8px rgba(143,169,181,0.25)',
  // Input focus ring (via box-shadow)
  inputFocus:'0 0 0 3px rgba(74,103,65,0.1), 0 1px 2px rgba(44,55,40,0.04)',
}

// ─── Border radius ────────────────────────────────────────────────────────────

export const radius = {
  // Standard rounded corners
  sm:   '8px',    // inline tags, pills
  md:   '12px',   // mini cards
  lg:   '16px',   // buttons, inputs
  xl:   '20px',   // standard cards (rounded-2xl = 16px, but action card uses 16px too)
  '2xl':'16px',   // action cards (rounded-2xl)
  '3xl':'24px',   // .card class (rounded-3xl)
  full: '9999px', // pills, FABs

  // Organic shapes (hand-drawn feel)
  organic: '255px 15px 225px 15px / 15px 225px 15px 255px',
  leaf:    '16px 4px 16px 4px',
  stone:   '24px 20px 28px 22px',
}

// ─── Typography ───────────────────────────────────────────────────────────────

export const type = {
  // Font families
  family: {
    serif: '"Newsreader", "Lora", Georgia, serif',
    sans:  '"Satoshi", "Nunito", system-ui, sans-serif',
  },

  // Scale — extracted from home screen headings
  scale: {
    // Hero greeting
    hero:    { fontSize: '2.25rem', fontWeight: 500, letterSpacing: '-0.02em', lineHeight: 1.2 },
    // Card headings
    h1:      { fontSize: '1.625rem', fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.2 },
    h2:      { fontSize: '1.25rem',  fontWeight: 700, letterSpacing: '-0.018em', lineHeight: 1.25 },
    h3:      { fontSize: '1.0625rem',fontWeight: 600, letterSpacing: '-0.01em',  lineHeight: 1.35 },
    // Card title (serif)
    cardTitle: { fontSize: '1.5rem', fontWeight: 500, letterSpacing: '-0.01em', lineHeight: 1.3 },
    // Body
    bodyLg:  { fontSize: '1rem',     fontWeight: 400, lineHeight: 1.65 },
    body:    { fontSize: '0.9375rem',fontWeight: 400, lineHeight: 1.6 },
    bodySm:  { fontSize: '0.875rem', fontWeight: 400, lineHeight: 1.55, letterSpacing: '0.005em' },
    // Small
    caption: { fontSize: '0.75rem',  fontWeight: 500, lineHeight: 1.4, letterSpacing: '0.01em' },
    // Section label — ALL CAPS small
    label:   { fontSize: '0.6875rem',fontWeight: 700, lineHeight: 1.2, letterSpacing: '0.1em', textTransform: 'uppercase' },
    // Mini card label (10px)
    microLabel: { fontSize: '10px',  fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' },
  },
}

// ─── Spacing ──────────────────────────────────────────────────────────────────

export const space = {
  // Page-level
  pagePx:   '24px',   // px-6 — horizontal page padding
  pagePxSm: '20px',   // px-5 — alternate
  // Section gaps
  sectionGap: '24px', // mt-6
  // Card internals
  cardPad:  '24px',   // p-6 — main action card
  cardPadMd:'20px',   // p-5 — pattern report card
  cardPadSm:'16px',   // p-4 — mini 2-col card
  // Bottom nav clearance
  navClear: '128px',  // pb-32
}

// ─── Animation ────────────────────────────────────────────────────────────────

export const motion = {
  // Durations
  duration: {
    fast:   '150ms',
    normal: '200ms',
    slow:   '300ms',
    breath: '4500ms',
  },
  // Easings
  ease: {
    standard: 'ease-out',
    spring:   'cubic-bezier(0.34, 1.4, 0.64, 1)',
    breath:   'cubic-bezier(0.37, 0, 0.63, 1)',
  },
  // Named presets (match tailwind animation names)
  preset: {
    fadeIn:   'animate-fade-in',
    slideUp:  'animate-slide-up',
    springIn: 'animate-spring-in',
    scaleIn:  'animate-scale-in',
  },
  // Active press scale
  press: {
    card:    'active:scale-[0.98]',
    button:  'active:scale-[0.97]',
    cardSm:  'active:scale-[0.99]',
  },
}

// ─── Component style presets ──────────────────────────────────────────────────
// Pre-composed style objects for common patterns.

export const preset = {

  // Page wrapper with parchment background
  page: {
    background: color.surface.page,
    minHeight: '100vh',
  },

  // Main action card (from home screen)
  actionCard: {
    background: gradient.card,
    borderRadius: radius['2xl'],
    border: `1px solid ${color.terra.faint}`,
    boxShadow: shadow.cardLg,
    padding: space.cardPad,
    overflow: 'hidden',
    position: 'relative',
  },

  // Mini 2-col card
  miniCard: {
    background: color.surface.mini,
    borderRadius: radius.md,
    border: `1px solid ${color.terra.faintest}`,
    padding: space.cardPadSm,
  },

  // Pattern report / clickable card
  reportCard: {
    background: color.surface.mini,
    borderRadius: radius['2xl'],
    border: `1px solid ${color.terra.faint}`,
    padding: space.cardPadMd,
    cursor: 'pointer',
  },

  // Hero section on home
  hero: {
    section: {
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: '64px',
      paddingInline: '24px',
      overflow: 'hidden',
      minHeight: '45vh',
    },
    radialGlow: {
      position: 'absolute',
      inset: 0,
      background: gradient.heroRadial,
      pointerEvents: 'none',
      zIndex: -1,
    },
  },

  // Card corner decoration (top-right quarter-circle tint)
  cardCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '128px',
    height: '128px',
    borderBottomLeftRadius: '100%',
    pointerEvents: 'none',
    background: 'rgba(192,108,84,0.05)',
  },

  // Section label (10px ALL CAPS)
  sectionLabel: {
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    color: color.text.secondary,
    fontFamily: type.family.sans,
  },

  // Hero greeting heading
  greeting: {
    fontFamily: type.family.serif,
    fontSize: '2.25rem',
    fontWeight: 500,
    color: color.text.primary,
    letterSpacing: '-0.02em',
    lineHeight: 1.2,
  },

  // Serif card title
  cardTitle: {
    fontFamily: type.family.serif,
    fontSize: '1.5rem',
    fontWeight: 500,
    color: color.text.primary,
    lineHeight: 1.3,
    letterSpacing: '-0.01em',
  },

  // Primary CTA button (inside action card — full width)
  ctaButton: {
    background: color.terra.DEFAULT,
    color: 'white',
    fontWeight: 700,
    fontSize: '0.875rem',
    paddingBlock: '16px',
    borderRadius: radius.lg,
    boxShadow: shadow.btn,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    fontFamily: type.family.sans,
  },

  // Tag / badge inside card header
  cardTag: {
    paddingInline: '12px',
    paddingBlock: '4px',
    borderRadius: radius.full,
    fontSize: '10px',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    fontFamily: type.family.sans,
    background: 'rgba(255,127,80,0.12)',
    color: color.terra.soft,
  },

  // Quote pull — left-border italic (pattern report, insight tabs)
  quotePull: {
    borderLeft: `2px solid ${color.terra.DEFAULT}`,
    paddingLeft: '16px',
  },

  // Glass nav bar
  navBar: {
    background: `rgba(248,241,231,0.9)`,
    backdropFilter: 'blur(24px) saturate(1.6)',
    WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
    borderTop: `1px solid ${color.terra.faintest}`,
  },

  // Spinner — terracotta
  spinner: (size = 20) => ({
    width: size,
    height: size,
    borderRadius: '50%',
    border: '2px solid rgba(192,108,84,0.3)',
    borderTopColor: color.terra.DEFAULT,
    animation: 'spin 0.75s linear infinite',
  }),
}
