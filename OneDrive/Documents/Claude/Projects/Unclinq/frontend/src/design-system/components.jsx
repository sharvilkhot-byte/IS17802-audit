/**
 * UNCLINQ DESIGN SYSTEM — COMPONENTS
 *
 * Reusable primitive components built from the home screen design language.
 * These are building blocks — not feature components.
 *
 * Usage:
 *   import { Spinner, Card, ActionCard, MiniCard, Badge, SectionLabel, QuotePull, PageShell } from '../design-system/components'
 */

import { color, shadow, radius, type, preset, gradient, texture } from './tokens'

// ─── Spinner ─────────────────────────────────────────────────────────────────

/**
 * Loading indicator. Always terracotta — matches home screen.
 * @param {number} size - diameter in px (default 20)
 * @param {string} className - extra Tailwind classes
 */
export function Spinner({ size = 20, className = '' }) {
  return (
    <div
      className={`animate-spin rounded-full ${className}`}
      style={{
        width: size,
        height: size,
        border: '2px solid rgba(192,108,84,0.3)',
        borderTopColor: color.terra.DEFAULT,
        flexShrink: 0,
      }}
    />
  )
}

/**
 * Full-screen centered loading state.
 */
export function LoadingScreen({ message = 'Loading...' }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
      <Spinner size={20} />
      <p className="text-text-muted text-sm">{message}</p>
    </div>
  )
}

// ─── Page shell ──────────────────────────────────────────────────────────────

/**
 * Wraps a full page with parchment background + paper grain texture.
 * Used by Home, ActionLab, and any page that needs the home screen feel.
 */
export function PageShell({ children, className = '' }) {
  return (
    <div
      className={`relative min-h-screen flex flex-col ${className}`}
      style={{ background: color.surface.page }}
    >
      {/* Paper grain overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-50"
        style={texture.grainStyle}
      />
      {children}
    </div>
  )
}

// ─── Cards ───────────────────────────────────────────────────────────────────

/**
 * Standard card — cream gradient, warm border. Matches .card CSS class.
 * Use for settings sections, insight tab bodies, pattern report cards.
 */
export function Card({ children, className = '', style = {} }) {
  return (
    <div className={`card ${className}`} style={style}>
      {children}
    </div>
  )
}

/**
 * Interactive card — same as Card but with hover/press states.
 * Use for clickable list items, report cards.
 */
export function CardInteractive({ children, onClick, className = '', style = {} }) {
  return (
    <div
      className={`card-interactive ${className}`}
      onClick={onClick}
      style={style}
    >
      {children}
    </div>
  )
}

/**
 * Action card — the main hero card on the home screen.
 * Cream gradient, corner decoration, card header, CTA button slot.
 *
 * @param {string} tag - small uppercase label (e.g. "Current Practice")
 * @param {node} icon - right-side icon element
 * @param {string} title - serif heading
 * @param {string} body - body text
 * @param {node} cta - CTA button / link element
 */
export function ActionCard({ tag, icon, title, body, cta, children, className = '' }) {
  return (
    <div
      className={`rounded-2xl p-6 border overflow-hidden relative ${className}`}
      style={preset.actionCard}
    >
      {/* Corner tint */}
      <div style={preset.cardCorner} />

      {/* Header row */}
      {(tag || icon) && (
        <div className="flex items-start justify-between mb-4 relative z-10">
          {tag && (
            <span style={preset.cardTag}>{tag}</span>
          )}
          {icon && <div>{icon}</div>}
        </div>
      )}

      {/* Title */}
      {title && (
        <h3 className="font-serif leading-tight mb-2 relative z-10" style={preset.cardTitle}>
          {title}
        </h3>
      )}

      {/* Body */}
      {body && (
        <p
          className="font-sans text-sm leading-relaxed mb-6 relative z-10"
          style={{ color: color.text.secondary, maxWidth: '85%' }}
        >
          {body}
        </p>
      )}

      {/* CTA slot */}
      {cta && <div className="relative z-10">{cta}</div>}

      {children}
    </div>
  )
}

/**
 * Mini card — the 2-column stat cards on home screen.
 * Semi-transparent, smaller padding, rounded-xl.
 */
export function MiniCard({ children, className = '', style = {} }) {
  return (
    <div
      className={`rounded-xl p-4 flex flex-col gap-2 border ${className}`}
      style={{ ...preset.miniCard, ...style }}
    >
      {children}
    </div>
  )
}

/**
 * MiniCard header row — icon + label.
 */
export function MiniCardHeader({ icon, label }) {
  return (
    <div className="flex items-center gap-2">
      {icon}
      <span
        className="font-sans font-bold uppercase tracking-widest"
        style={{ fontSize: '10px', color: color.text.secondary }}
      >
        {label}
      </span>
    </div>
  )
}

// ─── Typography ──────────────────────────────────────────────────────────────

/**
 * Section label — 10px ALL CAPS, sage, tracking-widest.
 * Matches the "LAST ENTRY", "PATTERN REPORT" labels on home.
 */
export function SectionLabel({ children, className = '', style = {} }) {
  return (
    <span
      className={`font-sans font-bold uppercase tracking-widest ${className}`}
      style={{ fontSize: '10px', color: color.text.secondary, ...style }}
    >
      {children}
    </span>
  )
}

/**
 * Label — .label CSS class equivalent (11px, all-caps, sage).
 * Used for section headers in cards (Settings, InsightTabs).
 */
export function Label({ children, className = '', style = {} }) {
  return (
    <p className={`label ${className}`} style={style}>
      {children}
    </p>
  )
}

/**
 * Serif card title (1.5rem, weight 500).
 */
export function CardTitle({ children, className = '', style = {} }) {
  return (
    <h3
      className={`font-serif leading-tight ${className}`}
      style={{ ...preset.cardTitle, ...style }}
    >
      {children}
    </h3>
  )
}

/**
 * Hero greeting display (2.25rem, Newsreader, warm umber).
 */
export function HeroHeading({ children, className = '', style = {} }) {
  return (
    <h1
      className={`font-serif tracking-tight ${className}`}
      style={{ ...preset.greeting, ...style }}
    >
      {children}
    </h1>
  )
}

/**
 * Serif italic quote (used for insights, pattern report pull quotes).
 */
export function SerifQuote({ children, className = '', style = {} }) {
  return (
    <p
      className={`font-serif italic leading-relaxed ${className}`}
      style={{ fontSize: '0.875rem', color: color.text.primary, ...style }}
    >
      {children}
    </p>
  )
}

// ─── Quote pull ───────────────────────────────────────────────────────────────

/**
 * Left-bordered italic quote block — from insight tab detail + pattern report.
 * Always terracotta left border.
 */
export function QuotePull({ children, className = '', style = {} }) {
  return (
    <div
      className={`border-l-2 border-terra pl-4 ${className}`}
      style={style}
    >
      <p className="text-text-primary italic leading-relaxed">
        {children}
      </p>
    </div>
  )
}

// ─── Badge / Tag ──────────────────────────────────────────────────────────────

/**
 * Card header badge — small pill label (e.g. "Current Practice", "Awareness").
 * Default: orange-terra. Pass variant="rescue" for crisis red.
 */
export function Badge({ children, variant = 'default', className = '', style = {} }) {
  const variantStyles = {
    default: {
      background: 'rgba(255,127,80,0.12)',
      color: color.terra.soft,
    },
    rescue: {
      background: 'rgba(255,107,107,0.15)',
      color: color.rescue.red,
    },
    stable: {
      background: color.state.stableBg,
      color: color.state.stable,
    },
    active: {
      background: 'rgba(213,140,0,0.12)',
      color: '#92400E',
    },
    improving: {
      background: color.state.stableBg,
      color: color.state.stable,
    },
    muted: {
      background: '#F0EDE8',
      color: color.text.secondary,
    },
  }

  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase font-sans ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </span>
  )
}

/**
 * Inline tag chip — from .tag CSS class.
 * Used in ActionLab tier labels, InsightTabs theme labels.
 */
export function Tag({ children, className = '' }) {
  return (
    <span className={`tag ${className}`}>
      {children}
    </span>
  )
}

// ─── Divider ─────────────────────────────────────────────────────────────────

/**
 * Horizontal rule — .divider CSS class (1px warm border).
 */
export function Divider({ className = '' }) {
  return <div className={`divider ${className}`} />
}

// ─── Buttons ─────────────────────────────────────────────────────────────────

/**
 * Primary terracotta button. Full-width by default when used as block.
 * Matches .btn-primary CSS class.
 */
export function ButtonPrimary({ children, onClick, disabled = false, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-primary ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Secondary button — warm border, cream background.
 * Matches .btn-secondary CSS class.
 */
export function ButtonSecondary({ children, onClick, disabled = false, type = 'button', className = '' }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-secondary ${className}`}
    >
      {children}
    </button>
  )
}

/**
 * Ghost button — text only, no border.
 * Matches .btn-ghost CSS class.
 */
export function ButtonGhost({ children, onClick, className = '' }) {
  return (
    <button onClick={onClick} className={`btn-ghost ${className}`}>
      {children}
    </button>
  )
}

/**
 * Text link — terracotta color, no underline until hover.
 * Use for "See your report →", "Try again" etc.
 */
export function TextLink({ children, onClick, href, className = '' }) {
  const props = {
    className: `text-sm font-medium hover:underline transition-colors ${className}`,
    style: { color: color.terra.DEFAULT },
  }
  if (href) return <a href={href} {...props}>{children}</a>
  return <button onClick={onClick} {...props}>{children}</button>
}

/**
 * Inline CTA button — the full-width button inside an ActionCard.
 * Same visual as the "Begin Reflection" button on home.
 */
export function CTAButton({ children, onClick, to, className = '' }) {
  const style = {
    ...preset.ctaButton,
    textDecoration: 'none',
  }
  const Arrow = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M5 12h14M12 5l7 7-7 7"/>
    </svg>
  )

  if (to) {
    // If react-router Link is needed, consumers should wrap themselves
    return (
      <button onClick={onClick} className={`transition-all active:scale-95 ${className}`} style={style}>
        {children}
        <Arrow />
      </button>
    )
  }

  return (
    <button onClick={onClick} className={`transition-all active:scale-95 ${className}`} style={style}>
      {children}
      <Arrow />
    </button>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

/**
 * Text input. Matches .input-field CSS class.
 */
export function Input({ type = 'text', placeholder, value, onChange, className = '', ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`input-field ${className}`}
      {...props}
    />
  )
}

/**
 * Textarea. Same visual style as Input.
 */
export function Textarea({ placeholder, value, onChange, rows = 3, className = '', ...props }) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`input-field resize-none ${className}`}
      {...props}
    />
  )
}

// ─── Hero section decorations ─────────────────────────────────────────────────

/**
 * Hero radial glow — the warm apricot radial gradient behind the plant.
 */
export function HeroGlow() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ background: gradient.heroRadial, zIndex: -1 }}
    />
  )
}

/**
 * Organic ambient blob — floats in hero corners.
 * @param {'top-left'|'bottom-right'} position
 */
export function AmbientBlob({ position = 'top-left', color: blobColor = color.sage.faint }) {
  const posStyle = position === 'top-left'
    ? { top: '80px', left: '40px', width: '128px', height: '128px', filter: 'blur(24px)' }
    : { bottom: '40px', right: '40px', width: '192px', height: '192px', filter: 'blur(32px)' }

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        background: blobColor,
        borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%',
        zIndex: -1,
        ...posStyle,
      }}
    />
  )
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

/**
 * Thin progress bar (1px height). Used in InsightTabs batch progress.
 * @param {number} percent - 0–100
 */
export function ProgressBar({ percent, className = '' }) {
  return (
    <div className={`flex-1 h-1 rounded-full overflow-hidden ${className}`} style={{ background: color.border.surface }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${percent}%`, background: color.terra.DEFAULT }}
      />
    </div>
  )
}

// ─── Skeleton loader ──────────────────────────────────────────────────────────

/**
 * Shimmer skeleton block. Matches .skeleton CSS class.
 */
export function Skeleton({ className = '', style = {} }) {
  return <div className={`skeleton ${className}`} style={style} />
}

// ─── Empty state ──────────────────────────────────────────────────────────────

/**
 * Standard empty state — icon area, heading, body, optional CTA.
 */
export function EmptyState({ icon, heading, body, cta }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-8 gap-4 animate-fade-in">
      {icon && (
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
          style={{
            background: 'rgba(255,249,240,0.8)',
            border: `1px solid ${color.border.DEFAULT}`,
          }}
        >
          {icon}
        </div>
      )}
      {heading && <p className="t-h3 mb-1">{heading}</p>}
      {body && <p className="t-body max-w-[260px] mx-auto">{body}</p>}
      {cta && <div className="mt-4">{cta}</div>}
    </div>
  )
}

// ─── Pill filter ──────────────────────────────────────────────────────────────

/**
 * Horizontal scrolling pill filter strip (InsightTabs theme filter, Settings situation pills).
 * @param {Array<{value, label}>} options
 * @param {string} active - currently selected value
 * @param {function} onChange - (value) => void
 * @param {string} accentColor - optional override (default: terracotta)
 */
export function PillFilter({ options, active, onChange, accentColor = color.terra.DEFAULT }) {
  return (
    <div className="h-scroll scrollbar-hide">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className="flex-shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 whitespace-nowrap"
          style={{
            borderColor: active === opt.value ? accentColor : color.border.DEFAULT,
            background:  active === opt.value ? `${accentColor}16` : color.surface.mini,
            color:       active === opt.value ? accentColor : color.text.secondary,
            letterSpacing: '0.03em',
          }}
        >
          {opt.label}
        </button>
      ))}
      <div style={{ width: '20px', flexShrink: 0 }} />
    </div>
  )
}

// ─── Nav separator dot ────────────────────────────────────────────────────────

/**
 * Small dot separator — used in hero subtitle row (· Seed Stage ·).
 */
export function DotSeparator() {
  return (
    <span
      className="w-1 h-1 rounded-full"
      style={{ background: color.sage.DEFAULT }}
    />
  )
}
