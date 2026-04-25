/**
 * UNCLINQ — STYLE COLOR PALETTES
 *
 * Four palettes, one per attachment style + a brand default (terracotta).
 * Color rationale:
 *
 *   secure_leaning      Forest Green  #4A6741 — grounded, growth, stable
 *   anxious             Dusty Rose    #A0647A — warm, emotionally alive, yearning
 *   dismissive_avoidant Slate Teal    #4A7A8C — cool, measured, self-contained
 *   fearful_avoidant    Dusty Violet  #7A5A90 — complex, layered, contradictory
 *
 * Each palette exposes the full set of derived values so CSS variables and
 * inline styles never need to re-derive them.
 */

export const STYLE_COLORS = {
  secure_leaning: {
    primary:    '#4A6741',
    hover:      '#3A5232',
    light:      '#EDF3EB',
    border:     'rgba(74,103,65,0.18)',
    glow:       'rgba(74,103,65,0.30)',
    glowHover:  'rgba(74,103,65,0.38)',
  },
  anxious: {
    primary:    '#A0647A',
    hover:      '#8A506A',
    light:      '#FDF0F3',
    border:     'rgba(160,100,122,0.18)',
    glow:       'rgba(160,100,122,0.30)',
    glowHover:  'rgba(160,100,122,0.38)',
  },
  dismissive_avoidant: {
    primary:    '#4A7A8C',
    hover:      '#3A6478',
    light:      '#EEF4F7',
    border:     'rgba(74,122,140,0.18)',
    glow:       'rgba(74,122,140,0.30)',
    glowHover:  'rgba(74,122,140,0.38)',
  },
  fearful_avoidant: {
    primary:    '#7A5A90',
    hover:      '#664A7A',
    light:      '#F3EEF8',
    border:     'rgba(122,90,144,0.18)',
    glow:       'rgba(122,90,144,0.30)',
    glowHover:  'rgba(122,90,144,0.38)',
  },
}

// Brand default — terracotta. Used before a style is identified.
export const DEFAULT_COLOR = {
  primary:    '#C06C54',
  hover:      '#A65B45',
  light:      '#FFF0E8',
  border:     'rgba(192,108,84,0.18)',
  glow:       'rgba(192,108,84,0.30)',
  glowHover:  'rgba(192,108,84,0.35)',
}

/**
 * Resolves the color palette for a given style key.
 * Pass profile.color_preference first, fall back to profile.primary_style.
 */
export function getStyleColor(styleKey) {
  return STYLE_COLORS[styleKey] ?? DEFAULT_COLOR
}

/**
 * Applies the palette as CSS custom properties on :root.
 * Call this whenever the user's style or color preference changes.
 */
export function applyCssVars(palette) {
  const sc = palette ?? DEFAULT_COLOR
  const root = document.documentElement
  root.style.setProperty('--sp',           sc.primary)
  root.style.setProperty('--sp-hover',     sc.hover)
  root.style.setProperty('--sp-light',     sc.light)
  root.style.setProperty('--sp-border',    sc.border)
  root.style.setProperty('--sp-glow',      sc.glow)
  root.style.setProperty('--sp-glow-hov',  sc.glowHover)
}

// Returns inline style props for btn-primary to tint it with the style color
export function primaryBtn(styleColor) {
  const sc = styleColor ?? DEFAULT_COLOR
  return {
    background: sc.primary,
    boxShadow: `0 1px 3px ${sc.border}, 0 4px 12px ${sc.glow}`,
  }
}

// Human-readable labels for each style key
export const STYLE_LABELS = {
  secure_leaning:      { name: 'Forest',  desc: 'Grounded. Growth. Steady.',        color: '#4A6741' },
  anxious:             { name: 'Rose',    desc: 'Warm. Present. Emotionally alive.', color: '#A0647A' },
  dismissive_avoidant: { name: 'Slate',   desc: 'Measured. Clear. Contained.',       color: '#4A7A8C' },
  fearful_avoidant:    { name: 'Violet',  desc: 'Layered. Complex. In-between.',     color: '#7A5A90' },
}
