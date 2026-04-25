/**
 * PLANT GROWTH MOMENT
 * Shown once when the plant advances to a new stage.
 * Not a reward. Not a celebration. A quiet acknowledgment that something shifted.
 * The same understatement that runs through the whole product.
 */

import PlantVisual from './PlantVisual'
import { useApp } from '../context/AppContext'

const STAGE_COPY = {
  sprout:  { name: 'Stirring.',      line: 'Something started moving.' },
  shoot:   { name: 'Taking root.',   line: "You've been showing up." },
  stem:    { name: 'Growing.',       line: 'The work is working.' },
  leaves:  { name: 'Opening up.',    line: "You're different than when you started." },
  rooted:  { name: 'Grounded.',      line: 'The pattern is starting to lose its grip.' },
  mature:  { name: 'Present.',       line: "You're not the same person who started this." },
}

export default function PlantGrowthMoment({ stage, onDismiss }) {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  if (!stage || !STAGE_COPY[stage]) return null

  const { name, line } = STAGE_COPY[stage]

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-8 max-w-lg mx-auto animate-fade-in"
      style={{ background: 'linear-gradient(160deg, #F8F4EE 0%, #F2EDE4 100%)' }}>

      {/* Ambient glow behind plant */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: sp, opacity: 0.07, filter: 'blur(60px)' }} />

      <div className="w-full space-y-10 animate-spring-in relative">

        {/* Plant — large, centered, vessel style */}
        <div className="flex justify-center">
          <div style={{ color: sp }}>
            <PlantVisual stage={stage} className="w-24 h-32" tinted />
          </div>
        </div>

        {/* Copy — Newsreader editorial */}
        <div className="text-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: sp }} />
            <p className="label" style={{ color: sp }}>Your plant</p>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: sp }} />
          </div>
          <p className="font-serif text-text-primary" style={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.025em' }}>{name}</p>
          <p className="text-text-secondary text-sm leading-relaxed font-sans">{line}</p>
        </div>

        {/* CTA */}
        <button
          onClick={onDismiss}
          className="btn-primary w-full"
          style={{ background: sp }}
        >
          Noted.
        </button>

      </div>
    </div>
  )
}
