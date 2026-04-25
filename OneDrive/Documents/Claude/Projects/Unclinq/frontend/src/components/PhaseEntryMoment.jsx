/**
 * PHASE ENTRY MOMENT
 *
 * Shown exactly once when a user enters a new action stage (interruption or replacement).
 * This is a full-screen takeover — same weight and tone as OnboardingClose.
 *
 * Design principles:
 * - No roadmap. No "Phase 2 of 3." No forward mention of what's next.
 * - No gamification language ("you've unlocked", "congratulations", "achievement").
 * - Honest acknowledgment of real work done, in style-specific language.
 * - Style-aware copy — an anxious user and an avoidant user are in different places.
 * - The plant visual advances silently in the corner — organic, not a reward badge.
 *
 * Why we do NOT show a progress bar toward the next phase:
 * Research on behavior change apps shows that visible progress toward a future goal
 * creates gaming behavior and anxiety — users start trying to trigger the upgrade
 * rather than genuinely engaging. The moment should feel earned, not achieved.
 */

import PlantVisual from './PlantVisual'
import { useApp } from '../context/AppContext'
import { primaryBtn } from '../utils/styleColors'

// ─── Copy ────────────────────────────────────────────────────────────────────

const PHASE_COPY = {
  interruption: {
    headline: 'Something has shifted.',
    phase_label: 'Catching the pattern in real time.',
    styles: {
      anxious:
        "You've been noticing the pull — to reach out, to check, to make sure everything is okay. That noticing is not small.",
      dismissive_avoidant:
        "You've been noticing the moments you pull away. Something in you is starting to watch instead of just react.",
      fearful_avoidant:
        "You've been watching the push and pull. Staying with that discomfort takes more than most people realize.",
      secure_leaning:
        "You've been sitting with what you've learned. That kind of patience is the real work.",
    },
    closing:
      "The next part isn't easier. You'll start catching the pattern as it happens — not always, not cleanly. But you'll catch it.",
    plant_stage: 'sprout',
  },
  replacement: {
    headline: "You've been interrupting the pattern.",
    phase_label: 'Building what you do instead.',
    styles: {
      anxious:
        "The urge to seek reassurance is still there. But you're not always following it. That gap — between the urge and the action — is where something new is being built.",
      dismissive_avoidant:
        "The pull to withdraw is still there. But you're starting to choose differently. That gap is not nothing.",
      fearful_avoidant:
        "The oscillation is still there. But you're finding moments of steadiness inside it. That steadiness is the work.",
      secure_leaning:
        "You've built something real. The question now is whether you can trust it when it's tested.",
    },
    closing:
      "Replacement doesn't mean the old pattern disappears. It means you have something to choose instead. Look back at where you started — that distance is real.",
    longitudinal_note: true,
    plant_stage: 'mature',
  },
  consolidation: {
    headline: "You've been choosing differently, consistently.",
    phase_label: 'Testing whether the change holds under pressure.',
    styles: {
      anxious:
        "The reassurance-seeking is still there, but you're not always led by it. The question now is: what happens when you're really activated — not just aware?",
      dismissive_avoidant:
        "You've been staying present in moments that used to make you disappear. The next part is proving it holds under real pressure.",
      fearful_avoidant:
        "The oscillation has quieted — not disappeared. The next phase is learning what you do when it surges again under real stress.",
      secure_leaning:
        "You've earned some steadiness. The work now is finding out how deep it goes when it's actually tested.",
    },
    closing:
      "This phase isn't about building new things. It's about finding out which of what you've built is solid. That's done through pressure, not practice.",
    plant_stage: 'rooted',
  },
  maintenance: {
    headline: "You built something that holds.",
    phase_label: 'Checking in when something stirs, not every week.',
    styles: {
      anxious:
        "The urgency that used to run everything — it's quieter now. Not gone. But no longer in charge. That took a long time.",
      dismissive_avoidant:
        "You've been letting people in more than you used to. Not perfectly. But more. That's a different life than the one you started with.",
      fearful_avoidant:
        "The push-pull has lost some of its power. You still feel it. You're just not always caught inside it anymore.",
      secure_leaning:
        "You did the work. Not because it was easy — because it was necessary. What you have now, you earned.",
    },
    closing:
      "This isn't the end of something. It's the beginning of what it looks like to know yourself well enough to choose differently when it counts.",
    longitudinal_note: true,
    maintenance_note: true,
    plant_stage: 'mature',
  },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function PhaseEntryMoment({ phase, primaryStyle, onDismiss }) {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  const copy = PHASE_COPY[phase]
  if (!copy) return null

  // Fall back gracefully if style isn't recognized
  const styleNote =
    copy.styles[primaryStyle] ||
    copy.styles['anxious'] // sensible fallback

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center px-8 animate-fade-in max-w-lg mx-auto">
      <div className="w-full space-y-10">

        {/* Plant — advances silently, no label, no fanfare */}
        <div className="flex justify-center">
          <PlantVisual stage={copy.plant_stage} className="w-12 h-16" />
        </div>

        {/* Copy block */}
        <div className="space-y-6 text-center">
          {copy.phase_label && (
            <p className="text-xs uppercase tracking-widest" style={{ color: sp }}>
              {copy.phase_label}
            </p>
          )}
          <p className="text-text-primary text-2xl font-light leading-relaxed">
            {copy.headline}
          </p>

          <div className="w-8 h-px bg-surface-border mx-auto" />

          <p className="text-text-secondary leading-relaxed">
            {styleNote}
          </p>

          <p className="text-text-secondary leading-relaxed">
            {copy.closing}
          </p>

          {/* Longitudinal note — replacement and maintenance phases */}
          {copy.longitudinal_note && !copy.maintenance_note && (
            <p className="text-text-muted text-sm leading-relaxed italic border-t border-surface-border pt-4 mt-2">
              Your earliest sessions are still in the archive. They'll look different now.
            </p>
          )}

          {/* Maintenance note — only for maintenance phase */}
          {copy.maintenance_note && (
            <p className="text-text-muted text-sm leading-relaxed italic border-t border-surface-border pt-4 mt-2">
              Emora is still here. Monthly check-ins are enough now. Use it when something stirs.
            </p>
          )}
        </div>

        {/* Single action — no skip option, this moment should be seen */}
        <div className="pt-4">
          <button
            onClick={onDismiss}
            className="btn-primary w-full"
            style={primaryBtn(styleColor)}
          >
            Continue
          </button>
        </div>

      </div>
    </div>
  )
}
