/**
 * FEATURE TOUR
 * Sequential bottom-sheet tour shown once on first Home visit after onboarding.
 * Floats above the NavBar so nav items remain visible.
 * 5 steps covering the core features of the app.
 */

import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { Sparkles, BookOpen, Zap, Settings } from 'lucide-react'

const STEPS = [
  {
    icon: (sp) => (
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${sp}1A`, border: `1px solid ${sp}33` }}>
        <Sparkles size={24} strokeWidth={1.7} style={{ color: sp }} />
      </div>
    ),
    where: 'Centre of your nav bar',
    label: 'Emora',
    description: 'Your AI companion. Talk to her anytime — this is where the real work happens.',
  },
  {
    icon: () => (
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(143,151,121,0.12)', border: '1px solid rgba(143,151,121,0.25)' }}>
        <span style={{ fontSize: '26px', lineHeight: 1 }}>🌱</span>
      </div>
    ),
    where: 'Home screen',
    label: 'Your plant',
    description: 'Your progress, made visible. It grows the more you show up — even on the hard days.',
  },
  {
    icon: (sp) => (
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${sp}1A`, border: `1px solid ${sp}33` }}>
        <BookOpen size={24} strokeWidth={1.7} style={{ color: sp }} />
      </div>
    ),
    where: 'Nav bar → Insights',
    label: 'Insights',
    description: 'Your patterns, tracked over time. Unlocks after a few sessions of real work.',
  },
  {
    icon: (sp) => (
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${sp}1A`, border: `1px solid ${sp}33` }}>
        <Zap size={24} strokeWidth={1.7} style={{ color: sp }} />
      </div>
    ),
    where: 'Nav bar → Actions',
    label: 'Action Lab',
    description: 'Small practices tailored to your attachment style. Use them between sessions.',
  },
  {
    icon: (sp) => (
      <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ background: `${sp}1A`, border: `1px solid ${sp}33` }}>
        <Settings size={24} strokeWidth={1.7} style={{ color: sp }} />
      </div>
    ),
    where: 'Settings',
    label: 'Your context',
    description: "Help Emora know who's in your life — add people and what you're working through. Every conversation gets more personal.",
  },
]

export default function FeatureTour({ onDone }) {
  const [step, setStep] = useState(0)
  const [animKey, setAnimKey] = useState(0)
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'

  const current = STEPS[step]
  const isLast = step === STEPS.length - 1

  function advance() {
    if (isLast) {
      onDone()
    } else {
      setAnimKey(k => k + 1)
      setStep(s => s + 1)
    }
  }

  return (
    <>
      {/* Backdrop — tap to skip */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(44,51,43,0.4)', backdropFilter: 'blur(2px)', WebkitBackdropFilter: 'blur(2px)' }}
        onClick={onDone}
      />

      {/* Sheet — floats above NavBar */}
      <div
        className="fixed left-0 right-0 z-50 max-w-lg mx-auto animate-slide-up"
        style={{ bottom: 'calc(76px + env(safe-area-inset-bottom))', padding: '0 16px' }}
      >
        <div className="px-5 py-6 space-y-5"
          style={{
            background: '#F8F1E7',
            borderRadius: '24px 20px 20px 22px',
            border: '1px solid rgba(192,108,84,0.12)',
            boxShadow: '0 -8px 40px rgba(93,64,55,0.18)',
          }}
        >
          {/* Progress dots + skip */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === step ? '18px' : '6px',
                    height: '6px',
                    background: i === step ? sp : `${sp}35`,
                  }}
                />
              ))}
            </div>
            <button
              onClick={onDone}
              className="font-sans text-sm"
              style={{ color: '#A89488' }}
            >
              {isLast ? 'Done' : 'Skip'}
            </button>
          </div>

          {/* Step content */}
          <div key={animKey} className="flex items-start gap-4 animate-fade-in">
            {current.icon(sp)}
            <div className="flex-1 pt-1 min-w-0">
              <p className="font-sans font-bold uppercase tracking-widest mb-1"
                style={{ fontSize: '10px', color: '#A89488' }}>
                {current.where}
              </p>
              <p className="font-serif leading-snug mb-2"
                style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2C332B' }}>
                {current.label}
              </p>
              <p className="font-sans text-sm leading-relaxed"
                style={{ color: '#7A6259', lineHeight: 1.65 }}>
                {current.description}
              </p>
            </div>
          </div>

          {/* Next / Got it */}
          <button
            onClick={advance}
            className="w-full font-sans font-bold text-sm py-3.5 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{
              borderRadius: '16px 4px 16px 4px',
              background: sp,
              color: 'white',
              boxShadow: `0 4px 16px ${styleColor?.glow ?? 'rgba(192,108,84,0.28)'}`,
            }}
          >
            {isLast ? 'Got it' : 'Next'}
            {!isLast && (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}
