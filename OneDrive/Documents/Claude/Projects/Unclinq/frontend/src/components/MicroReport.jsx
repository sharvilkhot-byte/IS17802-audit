/**
 * MICRO REPORT
 * The Day 7 in-app card. Warmer and shorter than the 15-day pattern report.
 * It proves the app was watching — in the "I noticed what you came here with" way.
 * Not an achievement. A quiet acknowledgment.
 */

import { useApp } from '../context/AppContext'

export default function MicroReport({ report, onDismiss }) {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  if (!report) return null

  return (
    <div className="card space-y-4 animate-fade-in" style={{ borderColor: `${sp}4D`, background: `${sp}0D` }}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="label">Your first week</p>
        <button
          onClick={onDismiss}
          className="text-text-muted hover:text-text-secondary transition-colors text-lg leading-none px-1"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>

      {/* Report content */}
      <div className="text-text-secondary text-sm leading-relaxed whitespace-pre-wrap">
        {report.content}
      </div>

      {/* Subtle note */}
      <p className="text-text-muted text-xs italic border-t border-surface-border pt-3">
        The full 15-day report arrives after two weeks.
      </p>

    </div>
  )
}
