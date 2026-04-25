import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { rescueAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import { CalmRippleIllustration } from '../components/Illustrations'
import PlantVisual from '../components/PlantVisual'
import { getExercisesForState, DEFAULT_RESCUE_EXERCISES } from '../constants/rescueExercises'

// Persist writing exercise text to localStorage so it's not lost on navigation
const WRITING_STORAGE_KEY = 'rescue_writing_draft'

// Paper grain texture
const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`

const ENTRY_OPTIONS = [
  {
    value: 'urge',
    label: "I'm Spinning",
    sublabel: 'Too much. Everything feels urgent and overwhelming.',
  },
  {
    value: 'spiral',
    label: "I Can't Stop",
    sublabel: "Racing thoughts. I keep replaying and can't get out.",
  },
  {
    value: 'shutdown',
    label: "I'm Numb",
    sublabel: 'Distant, frozen, or empty. I feel nothing.',
  },
]

export default function RescueMode() {
  const navigate = useNavigate()
  const { styleColor, profile } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  const [phase, setPhase] = useState('entry') // entry | exercises | complete
  const [activationType, setActivationType] = useState(null)
  const [exercises, setExercises] = useState([])
  const [currentExerciseIdx, setCurrentExerciseIdx] = useState(0)
  const [exerciseUsed, setExerciseUsed] = useState(null)
  const [loading, setLoading] = useState(false)
  const [startError, setStartError] = useState('')
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [timerRunning, setTimerRunning] = useState(false)
  const [writingText, setWritingText] = useState(() => localStorage.getItem(WRITING_STORAGE_KEY) || '')
  const [breathPhase, setBreathPhase] = useState('ready') // ready | inhale | hold | exhale
  const [breathCycle, setBreathCycle] = useState(0)
  const breathTimerRef = useRef(null)
  const timerRef = useRef(null)

  async function startRescue(type) {
    setActivationType(type)
    setStartError('')
    setLoading(true)
    localStorage.removeItem(WRITING_STORAGE_KEY)
    setWritingText('')

    // Always use local attachment-style exercises — they're richer and style-specific.
    // Backend call is for session tracking only; exercises come from the local library.
    // getExercisesForState reorders the 3 exercises so the most effective technique for
    // the user's current activation state (urge/spiral/shutdown) leads.
    const styleKey = profile?.primary_style
    const localExercises = getExercisesForState(styleKey, type)

    try {
      await rescueAPI.start({
        entry_path: 'self',
        activation_type: type,
        attachment_style: styleKey || null,
      })
      setExercises(localExercises)
      setPhase('exercises')
    } catch (err) {
      // On network failure, still run local exercises so the user isn't left stranded
      setExercises(localExercises)
      setPhase('exercises')
      setStartError(err.response?.data?.error || '')
    } finally {
      setLoading(false)
    }
  }

  const currentExercise = exercises[currentExerciseIdx]

  function startTimer(seconds) {
    setTimerSeconds(seconds)
    setTimerRunning(true)
    timerRef.current = setInterval(() => {
      setTimerSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current)
          setTimerRunning(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current)
    }
  }, [])

  function startBreathCycle() {
    setBreathCycle(0)
    runBreathStep('inhale', 0)
  }

  function runBreathStep(phase, cycle) {
    setBreathPhase(phase)
    const durations = { inhale: 4000, hold: 4000, exhale: 6000 }
    breathTimerRef.current = setTimeout(() => {
      if (phase === 'inhale') {
        runBreathStep('hold', cycle)
      } else if (phase === 'hold') {
        runBreathStep('exhale', cycle)
      } else if (phase === 'exhale') {
        const nextCycle = cycle + 1
        setBreathCycle(nextCycle)
        if (nextCycle < 4) {
          runBreathStep('inhale', nextCycle)
        } else {
          setBreathPhase('done')
        }
      }
    }, durations[phase])
  }

  function nextExercise() {
    setExerciseUsed(currentExercise?.id)
    if (currentExerciseIdx < exercises.length - 1) {
      setCurrentExerciseIdx(i => i + 1)
      setTimerSeconds(0)
      setTimerRunning(false)
      setBreathPhase('ready')
      setBreathCycle(0)
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current)
    } else {
      setPhase('complete')
    }
  }

  async function endRescue(exitPath, destination) {
    localStorage.removeItem(WRITING_STORAGE_KEY) // Clear writing draft after session completes
    // Use the current exercise (what they ended on) as primary; fall back to exerciseUsed
    // (deepest they navigated to) or 'unknown' if nothing was tracked
    await rescueAPI.end({
      exercise_used: currentExercise?.id || exerciseUsed || 'unknown',
      exit_path: exitPath
    }).catch(() => {})

    if (exitPath === 'emora_bridge') {
      navigate('/emora', { state: { fromRescue: true } })
    } else {
      navigate(destination || '/home')
    }
  }

  // ─── Entry ────────────────────────────────────────────────────────────────
  if (phase === 'entry') {
    return (
      <div className="relative min-h-dvh flex flex-col px-6 pt-12 pb-8 animate-fade-in"
        style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        {/* Ambient glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'rgba(143,151,121,0.1)', filter: 'blur(60px)' }} />

        {/* Header */}
        <div className="relative z-10 flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#8F9779' }} />
            <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8C9688', textTransform: 'uppercase' }}>
              Rescue Mode
            </span>
          </div>
          <button onClick={() => navigate('/home')} className="p-2 transition-opacity hover:opacity-60"
            style={{ color: '#A89488' }}>
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Weathered plant — wilted but still standing */}
        <div className="flex flex-col items-center mb-6 relative z-10 gap-2">
          <div style={{ color: sp, filter: 'drop-shadow(0 8px 20px rgba(143,151,121,0.25))' }}>
            <PlantVisual stage="weathered" tinted className="w-28 h-40" />
          </div>
          <p className="font-sans text-xs text-center" style={{ color: '#8C9688', maxWidth: '180px', lineHeight: 1.5 }}>
            Hard days are part of it. The plant is still here.
          </p>
        </div>

        {/* Question */}
        <div className="relative z-10 mb-6 text-center">
          <h1 className="font-serif leading-tight mb-2"
            style={{ fontSize: '1.875rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.02em' }}>
            What's happening<br />right now?
          </h1>
          <p className="font-sans text-sm" style={{ color: '#8D6E63' }}>
            Pick the closest one — no rating needed.
          </p>
        </div>

        {/* Options */}
        <div className="relative z-10 space-y-3 flex-1">
          {ENTRY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => startRescue(opt.value)}
              disabled={loading}
              className="w-full text-left p-5 transition-all duration-200 active:scale-[0.98] disabled:opacity-40"
              style={{ background: 'white', border: '1px solid rgba(143,151,121,0.18)', borderRadius: '24px 20px 28px 22px', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="font-serif mb-1"
                    style={{ fontSize: '1.2rem', fontWeight: 500, color: '#2C332B' }}>
                    {opt.label}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed" style={{ color: '#8D6E63' }}>
                    {loading && activationType === opt.value ? 'Finding your path…' : opt.sublabel}
                  </p>
                </div>
                {loading && activationType === opt.value ? (
                  <div className="w-5 h-5 rounded-full border-2 animate-spin flex-shrink-0 mt-1"
                    style={{ borderColor: 'rgba(143,151,121,0.4)', borderTopColor: 'transparent' }} />
                ) : (
                  <svg className="w-4 h-4 flex-shrink-0 mt-1" fill="none" viewBox="0 0 24 24"
                    stroke="currentColor" strokeWidth={1.75} style={{ color: '#A89488' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>

        {startError && (
          <p className="relative z-10 font-sans text-sm text-center mt-4" style={{ color: sp }}>
            {startError}
          </p>
        )}

        <p className="relative z-10 font-sans text-xs text-center mt-6" style={{ color: '#A89488' }}>
          No judgment. Being here is the right move.
        </p>
      </div>
    )
  }

  // ─── Exercise ─────────────────────────────────────────────────────────────
  if (phase === 'exercises' && currentExercise) {
    const progress = ((currentExerciseIdx) / exercises.length) * 100

    return (
      <div className="relative min-h-dvh flex flex-col animate-fade-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <header className="relative z-10 pt-8 px-6 pb-5">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <span className="px-2.5 py-1 rounded-full font-bold uppercase"
                  style={{ fontSize: '10px', letterSpacing: '0.1em', background: styleColor?.light ?? 'rgba(192,108,84,0.1)', color: sp, border: `1px solid ${styleColor?.border ?? 'rgba(192,108,84,0.18)'}` }}>
                  {currentExercise.type}
                </span>
              </div>
              <h2 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                {currentExercise.title}
              </h2>
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8C9688', flexShrink: 0, marginTop: '6px' }}>
              {currentExerciseIdx + 1}/{exercises.length}
            </span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(143,151,121,0.2)' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, background: sp }} />
          </div>
        </header>

        {/* ── Exercise card ───────────────────────────────────────────────── */}
        <main className="relative z-10 flex-1 px-6">
          <div className="relative overflow-hidden"
            style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 8px 30px -8px rgba(143,169,181,0.2)', border: '1px solid rgba(143,151,121,0.15)', padding: '1.5rem 1.5rem 2rem' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: `${sp}07`, filter: 'blur(32px)' }} />

            <div className="relative z-10">
              {/* Breathing exercise — checked first so type='breath' always gets animation */}
              {currentExercise.type === 'breath' ? (
                <div className="space-y-5">
                  <p className="text-text-secondary leading-relaxed">{currentExercise.instruction}</p>
                  <div className="flex flex-col items-center py-4 gap-5">
                    {breathPhase === 'ready' ? (
                      <button
                        onClick={startBreathCycle}
                        className="w-28 h-28 rounded-full border-2 transition-all flex items-center justify-center"
                        style={{ borderColor: sp, background: `${sp}0A` }}
                      >
                        <span className="font-serif text-lg" style={{ color: sp }}>Begin</span>
                      </button>
                    ) : breathPhase === 'done' ? (
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-28 h-28 rounded-full flex items-center justify-center border-2"
                          style={{ borderColor: '#4E7A3A', background: 'rgba(78,122,58,0.08)' }}>
                          <span className="font-serif text-lg" style={{ color: '#4E7A3A' }}>Done.</span>
                        </div>
                        <p className="text-text-muted text-xs">Your nervous system heard that.</p>
                      </div>
                    ) : (
                      <div
                        className={`w-28 h-28 rounded-full border-2 flex items-center justify-center transition-all duration-1000 ${
                          breathPhase === 'inhale' ? 'scale-110' :
                          breathPhase === 'hold'   ? 'scale-110' :
                          'scale-90'
                        }`}
                        style={{
                          borderColor: sp,
                          background: breathPhase === 'inhale' ? `${sp}26` : breathPhase === 'hold' ? `${sp}1A` : `${sp}0D`
                        }}
                      >
                        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: `${sp}1A` }}>
                          <div className={`rounded-full transition-all duration-1000 ${
                            breathPhase === 'inhale' ? 'w-14 h-14' :
                            breathPhase === 'hold'   ? 'w-14 h-14' :
                            'w-8 h-8'
                          }`} style={{ background: `${sp}4D` }} />
                        </div>
                      </div>
                    )}
                    <div className="text-center">
                      <p className="font-serif text-lg" style={{ color: '#2C332B' }}>
                        {breathPhase === 'inhale' ? 'Inhale...' :
                         breathPhase === 'hold'   ? 'Hold...' :
                         breathPhase === 'exhale' ? 'Exhale...' : ''}
                      </p>
                      {breathPhase !== 'ready' && breathPhase !== 'done' && (
                        <p className="text-text-muted text-xs mt-1">Cycle {breathCycle + 1} of 4</p>
                      )}
                    </div>
                  </div>
                </div>
              ) : currentExercise.hasTimer && currentExercise.duration_seconds ? (
                <div className="space-y-5">
                  <p className="text-text-secondary leading-relaxed">{currentExercise.instruction}</p>
                  <div className="flex flex-col items-center py-6">
                    {timerRunning || timerSeconds > 0 ? (
                      <div className="relative">
                        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(143,151,121,0.2)" strokeWidth="4" />
                          <circle
                            cx="50" cy="50" r="45" fill="none"
                            stroke={sp} strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray="283"
                            strokeDashoffset={283 - (283 * timerSeconds / currentExercise.duration_seconds)}
                            style={{ transition: 'stroke-dashoffset 1s linear' }}
                          />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-serif text-3xl" style={{ color: '#2C332B', fontWeight: 400 }}>
                            {Math.floor(timerSeconds / 60)}:{String(timerSeconds % 60).padStart(2, '0')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => startTimer(currentExercise.duration_seconds)}
                        className="w-24 h-24 rounded-full border-2 transition-all flex items-center justify-center"
                        style={{ borderColor: sp, color: sp, background: `${sp}0A` }}
                      >
                        <svg className="w-9 h-9" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                /* Text / writing exercise */
                <div className="space-y-5">
                  <p className="text-text-secondary leading-relaxed text-base">
                    {currentExercise.instruction}
                  </p>
                  {currentExercise.type === 'writing' && (
                    <div className="space-y-2">
                      <textarea
                        className="input-field resize-none min-h-32 w-full"
                        placeholder="Don't edit it. Just write."
                        value={writingText}
                        onChange={e => {
                          setWritingText(e.target.value)
                          localStorage.setItem(WRITING_STORAGE_KEY, e.target.value)
                        }}
                      />
                      <div className="flex items-center justify-between">
                        <p className="text-text-muted text-xs">Saved locally — only you can see this.</p>
                        <p className="text-text-muted text-xs font-medium">{writingText.length}/300</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>

        {/* ── CTA ─────────────────────────────────────────────────────────── */}
        <div className="relative z-10 px-6 pt-5 pb-8">
          <button
            onClick={nextExercise}
            className="w-full font-sans font-bold text-sm py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            style={{ background: sp, color: 'white', borderRadius: '16px 4px 16px 4px', boxShadow: `0 4px 16px ${styleColor?.glow ?? 'rgba(192,108,84,0.3)'}` }}
          >
            {currentExerciseIdx < exercises.length - 1 ? 'Next exercise' : "I'm done"}
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    )
  }

  // ─── Complete ─────────────────────────────────────────────────────────────
  if (phase === 'complete') {
    return (
      <div className="relative min-h-dvh flex flex-col animate-spring-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        <div className="relative z-10 flex-1 flex flex-col justify-center px-6 py-12 gap-5">

          {/* Message card */}
          <div className="p-6 text-center"
            style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
            <div className="flex justify-center mb-5" style={{ color: sp }}>
              <CalmRippleIllustration className="w-24 h-24 opacity-75" />
            </div>
            <p className="font-serif" style={{ fontSize: '1.875rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.025em', lineHeight: 1.2 }}>
              You just stopped.
            </p>
            <p className="font-sans mt-2" style={{ fontSize: '14px', color: '#8D6E63' }}>
              That's the whole work.
            </p>
          </div>

          {/* CTAs */}
          <div className="space-y-3">
            <button
              onClick={() => endRescue('emora_bridge')}
              className="w-full font-sans font-bold text-sm py-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              style={{ background: sp, color: 'white', borderRadius: '16px 4px 16px 4px', boxShadow: `0 4px 16px ${styleColor?.glow ?? 'rgba(192,108,84,0.3)'}` }}
            >
              Talk about what just happened
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </button>

            <button
              onClick={() => endRescue('close')}
              className="w-full font-sans font-bold text-sm py-4 transition-all active:scale-[0.98]"
              style={{ background: 'white', color: '#5D4037', borderRadius: '16px 4px 16px 4px', border: '1px solid rgba(143,151,121,0.18)' }}
            >
              Good — back to the app
            </button>

            <button
              onClick={() => endRescue('close', '/insights')}
              className="w-full text-center font-sans pt-1 transition-colors"
              style={{ fontSize: '12px', color: '#A89488' }}
            >
              Understand what just happened →
            </button>
          </div>

        </div>
      </div>
    )
  }

  return null
}
