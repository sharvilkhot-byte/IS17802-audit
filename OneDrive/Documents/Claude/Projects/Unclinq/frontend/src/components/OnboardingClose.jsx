/**
 * ONBOARDING CLOSE
 * Shown after completing onboarding, before the user ever opens Emora.
 *
 * When primaryStyle is known, the first half is a personalized mirror of
 * what the quiz found — the "aha moment reveal" before they enter the app.
 * The second half is the original honest contract. Both halves matter.
 */

import PlantVisual from './PlantVisual'
import { STYLE_COLORS } from '../utils/styleColors'

const STYLE_CONTENT = {
  anxious: {
    label: 'Anxious attachment',
    dot: STYLE_COLORS.anxious.primary,
    mirror:
      'Your nervous system learned that love needs constant monitoring. Silence reads as danger, inconsistency reads as rejection — even when it isn\u2019t.',
    focus:
      'Emora will work on building your tolerance for uncertainty. Not suppressing the signal \u2014 understanding where it comes from.',
  },
  dismissive_avoidant: {
    label: 'Dismissive-avoidant attachment',
    dot: STYLE_COLORS.dismissive_avoidant.primary,
    mirror:
      'Your nervous system learned that needing people wasn\u2019t safe. Independence became armor. Closeness still quietly triggers the urge to retreat.',
    focus:
      'Emora will work on reconnecting you with what you actually need. The self-sufficiency isn\u2019t wrong \u2014 the disconnection underneath it is.',
  },
  fearful_avoidant: {
    label: 'Fearful-avoidant attachment',
    dot: STYLE_COLORS.fearful_avoidant.primary,
    mirror:
      'Your system wants closeness and fears it at the same time. That\u2019s not confusion \u2014 it\u2019s two contradictory truths, both learned, both real, running simultaneously.',
    focus:
      'Emora will work on naming the contradiction. You don\u2019t have to choose sides. You have to stop being at war with yourself.',
  },
  secure_leaning: {
    label: 'Secure-leaning',
    dot: STYLE_COLORS.secure_leaning.primary,
    mirror:
      'Your patterns are relatively stable. But something still brought you here \u2014 and that something is worth understanding.',
    focus:
      'Emora will help you find the specific places where the pattern still costs you.',
  },
}

export default function OnboardingClose({ primaryStyle, emoraReflection, onReady }) {
  const styleContent = STYLE_CONTENT[primaryStyle] ?? null

  return (
    <div className="min-h-screen bg-surface flex flex-col items-center justify-center px-8 max-w-lg mx-auto animate-fade-in">
      <div className="w-full space-y-8">

        {/* Seed visual */}
        <div className="flex justify-center">
          <PlantVisual stage="seed" className="w-14 h-20" />
        </div>

        {/* Personalized reveal — shown when backend returned a style */}
        {styleContent && (
          <div className="space-y-5 animate-fade-in">
            {/* Style label */}
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: styleContent.dot }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#8C9688', textTransform: 'uppercase' }}>
                {styleContent.label}
              </span>
            </div>

            {/* Mirror — what the quiz found */}
            <p className="font-serif leading-relaxed" style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2C332B', lineHeight: 1.5, letterSpacing: '-0.01em' }}>
              {styleContent.mirror}
            </p>

            {/* What Emora will focus on */}
            <p className="text-sm leading-relaxed pl-3 border-l-2" style={{ color: '#8C9688', borderColor: `${styleContent.dot}50`, lineHeight: 1.65 }}>
              {styleContent.focus}
            </p>

            <div className="w-8 h-px bg-surface-border" />
          </div>
        )}

        {/* Emora's first reflection — shown when backend generated one */}
        {emoraReflection && (
          <div className="animate-fade-in">
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '10px' }}>
              Emora
            </p>
            <div className="px-5 py-4 rounded-2xl" style={{
              background: styleContent ? `${styleContent.dot}0D` : 'rgba(143,151,121,0.08)',
              border: `1px solid ${styleContent ? `${styleContent.dot}28` : 'rgba(143,151,121,0.2)'}`,
            }}>
              <p className="font-serif leading-relaxed" style={{ fontSize: '1rem', color: '#2C332B', lineHeight: 1.6, fontStyle: 'italic' }}>
                "{emoraReflection}"
              </p>
            </div>
          </div>
        )}

        {/* The honest contract — always shown */}
        <div className="space-y-5 text-center">
          <p className="text-text-primary text-xl font-light leading-relaxed">
            This isn't the kind of app that gets easier the more you use it.
          </p>
          <p className="text-terra text-xl font-medium leading-relaxed">
            It gets more honest.
          </p>
          <p className="text-text-secondary leading-relaxed">
            You're not here to feel better quickly. You're here to understand
            something about yourself that keeps costing you.
          </p>
          <p className="text-text-secondary leading-relaxed">
            That takes time. Emora is patient. So are we.
          </p>
        </div>

        {/* Trellis line */}
        <p className="text-center" style={{ fontSize: '0.8rem', color: '#8C9688', letterSpacing: '0.01em' }}>
          Unclinq is the trellis. You're the plant.
        </p>

        {/* CTA */}
        <div className="pt-2">
          <button onClick={onReady} className="btn-primary w-full">
            I'm ready to grow.
          </button>
        </div>

      </div>
    </div>
  )
}
