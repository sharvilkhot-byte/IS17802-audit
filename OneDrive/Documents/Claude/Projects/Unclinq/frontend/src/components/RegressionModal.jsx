/**
 * REGRESSION MODAL
 *
 * Shown once when a pattern the user had been improving resurfaces.
 * This is not a failure screen. It's a normalizing acknowledgment.
 *
 * Design principles:
 * - No shame language. No "setback." No "you went backward."
 * - Frame regression as normal: "Patterns don't disappear. They fade and return."
 * - Reference the arc: "You've interrupted this before."
 * - Short. One clear message. One CTA.
 * - Shown once per pattern regression (won't repeat for 30 days).
 */

import { useApp } from '../context/AppContext'
import { primaryBtn } from '../utils/styleColors'

export default function RegressionModal({ milestone, onDismiss }) {
  const { styleColor } = useApp()
  if (!milestone) return null

  const { surface_data } = milestone
  const patternName = surface_data?.pattern
    ? surface_data.pattern.replace(/_/g, ' ')
    : null

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center px-4 pb-8 animate-fade-in">
      <div className="w-full max-w-lg bg-surface border border-surface-border p-8 space-y-7 shadow-2xl" style={{ borderRadius: '24px 20px 28px 22px' }}>

        {/* No preamble headline — the message speaks for itself */}
        <div className="space-y-4">
          {patternName && (
            <p className="text-text-muted text-xs uppercase tracking-widest">
              {patternName} · resurfaced
            </p>
          )}

          <p className="text-text-primary text-lg leading-relaxed font-light">
            {surface_data?.message ||
              "A pattern you'd been improving showed up again. That's not failure — it's what patterns do."}
          </p>
        </div>

        {/* Normalizing context */}
        <div className="border-t border-surface-border pt-5 space-y-3">
          <p className="text-text-secondary text-sm leading-relaxed">
            Patterns don't disappear cleanly. They fade, and sometimes they surge back — especially under stress, change, or unfamiliar situations.
          </p>
          <p className="text-text-secondary text-sm leading-relaxed">
            You've interrupted this before. That capacity doesn't go away because the pattern returned.
          </p>
        </div>

        {/* Single CTA — no skip, no "maybe later" */}
        <button
          onClick={onDismiss}
          className="btn-primary w-full"
          style={primaryBtn(styleColor)}
        >
          I understand
        </button>

      </div>
    </div>
  )
}
