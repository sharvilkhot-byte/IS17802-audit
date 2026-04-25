/**
 * MILESTONE MODAL
 * Full-screen moment for behavioral milestone events.
 * Shows exactly once per milestone. Honest, earned, no gamification.
 *
 * milestone_type values: first_pattern_recognition, first_pattern_interrupt,
 *                        style_signal_shift, secure_leaning_unlock
 */

import { useApp } from '../context/AppContext'
import { primaryBtn } from '../utils/styleColors'

const MILESTONE_COPY = {
  first_pattern_recognition: {
    preamble: 'Something worth knowing.',
    cta: 'I see it now',
  },
  first_pattern_interrupt: {
    preamble: 'This is what the work looks like.',
    cta: 'Good.',
  },
  style_signal_shift: {
    preamble: 'Something shifted.',
    cta: 'Noted.',
  },
  secure_leaning_unlock: {
    preamble: null,
    cta: "I see it",
  },
}

export default function MilestoneModal({ milestone, onDismiss }) {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  if (!milestone) return null

  const copy = MILESTONE_COPY[milestone.milestone_type] || MILESTONE_COPY.first_pattern_recognition
  const message = milestone.surface_data?.message || ''

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center px-8 max-w-lg mx-auto">
      <div className="w-full space-y-10 animate-spring-in">

        {/* Content */}
        <div className="space-y-5 text-center">
          {copy.preamble && (
            <p className="label" style={{ color: sp }}>{copy.preamble}</p>
          )}
          <p className="text-text-primary text-2xl font-light leading-relaxed">
            {message}
          </p>
        </div>

        {/* CTA */}
        <div className="pt-2">
          <button
            onClick={onDismiss}
            className="btn-primary w-full"
            style={primaryBtn(styleColor)}
          >
            {copy.cta}
          </button>
        </div>

      </div>
    </div>
  )
}
