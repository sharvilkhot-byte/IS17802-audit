import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, Navigate } from 'react-router-dom'
import { onboardingAPI, authAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import OnboardingClose from '../components/OnboardingClose'
import PlantVisual from '../components/PlantVisual'
import { STYLE_LABELS, getStyleColor, applyCssVars } from '../utils/styleColors'

// QUIZ-FIRST FLOW: Quiz → Email+Password at the end
// User never hits a registration wall. They answer personal questions first,
// get emotionally invested, then create an account to save their results.
//
// Two paths through the quiz:
//   'aware'   — knows about attachment theory, gets current pattern-language questions
//   'unaware' — no prior exposure, gets experience-first questions, lands in 'discovery' phase
const STEPS = ['entry', 'struggle', 'familiarity', 'situation', 'duration', 'assessment', 'awareness', 'secure_vision', 'color', 'what_you_get', 'intention', 'account']

// Derive the dominant style signal from scenario answers (used to suggest a color)
function computePreliminaryStyle(scenarios) {
  if (!scenarios?.length) return null
  const counts = {}
  for (const s of scenarios) {
    if (s.style_signal) counts[s.style_signal] = (counts[s.style_signal] || 0) + 1
  }
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null
}

const SCENARIOS = [
  {
    id: 'no_reply',
    question: "They haven't replied in 3 hours. What happens in you?",
    options: [
      { label: "I assume something is wrong with me or the relationship", style: 'anxious' },
      { label: "I barely notice — I'm busy with my own things", style: 'dismissive_avoidant' },
      { label: "I feel a spike of worry, then pull back and pretend I don't care", style: 'fearful_avoidant' },
      { label: "I notice mild curiosity but feel generally fine", style: 'secure_leaning' },
    ]
  },
  {
    id: 'getting_close',
    question: "When someone starts getting really close to you, what usually happens?",
    options: [
      { label: "I want more — closeness makes me feel secure", style: 'anxious' },
      { label: "I start feeling crowded or find things that bother me about them", style: 'dismissive_avoidant' },
      { label: "I go toward them and then suddenly need space — confusing even to me", style: 'fearful_avoidant' },
      { label: "I welcome it and can usually stay comfortable", style: 'secure_leaning' },
    ]
  },
  {
    id: 'conflict',
    question: "After a fight or tense moment, what do you typically do?",
    options: [
      { label: "I reach out, apologize, or try to resolve it immediately", style: 'anxious' },
      { label: "I need significant time and space before I can engage", style: 'dismissive_avoidant' },
      { label: "I go back and forth — sometimes I reach out, sometimes I disappear", style: 'fearful_avoidant' },
      { label: "I can usually talk it through relatively soon after", style: 'secure_leaning' },
    ]
  },
  {
    id: 'things_going_well',
    question: "When a relationship is actually going well — no drama, they're consistent, you feel cared for — what tends to happen?",
    options: [
      { label: "I relax into it but stay alert — still watching for signs it might change", style: 'anxious' },
      { label: "I feel fine but notice I start getting restless or picking things apart", style: 'dismissive_avoidant' },
      { label: "I feel good briefly, then find something to worry about or pull back from", style: 'fearful_avoidant' },
      { label: "I'm able to stay present and enjoy it without too much noise", style: 'secure_leaning' },
    ]
  },
  {
    id: 'receiving_love',
    question: "When someone genuinely loves you — consistently shows up, tells you they care — how does that feel on the inside?",
    options: [
      { label: "Wonderful, but I need to keep checking that it's real and won't be taken away", style: 'anxious' },
      { label: "Uncomfortable — I don't know what to do with it and often minimize it", style: 'dismissive_avoidant' },
      { label: "Suspicious — part of me wants it desperately, part of me doesn't trust it", style: 'fearful_avoidant' },
      { label: "Generally good — I can receive it without it destabilizing me", style: 'secure_leaning' },
    ]
  }
]

// Experience-based options for unaware users — maps to same styles without pattern language
const EXPERIENCE_OPTIONS = [
  { label: "I worry a lot about whether people actually want me around", style: 'anxious' },
  { label: "I get close to someone and then start needing distance from them", style: 'dismissive_avoidant' },
  { label: "I go back and forth — wanting closeness but feeling scared of it at the same time", style: 'fearful_avoidant' },
  { label: "My relationships feel exhausting or anxious a lot of the time, but I can't explain why", style: 'anxious' },
]

// Synthetic pattern descriptions for unaware users — gives the context engine something
// concrete to work with when primary_pattern was never shown during onboarding.
const EXPERIENCE_TO_PATTERN = {
  "I worry a lot about whether people actually want me around":
    "I worry a lot about whether people actually want me around — I seek reassurance and read into small signals.",
  "I get close to someone and then start needing distance from them":
    "I get close to people and then pull back or feel smothered — connection triggers the urge to create space.",
  "I go back and forth — wanting closeness but feeling scared of it at the same time":
    "I go back and forth between wanting closeness and pulling away — I want connection but feel afraid of it.",
  "My relationships feel exhausting or anxious a lot of the time, but I can't explain why":
    "My relationships tend to feel exhausting or anxiety-provoking, even when nothing specific has gone wrong.",
}

// Personalizes the "how shows up" question header based on current_situation
const SITUATION_FRAMING = {
  in_relationship:  'In your current relationship',
  dating:           'While dating or talking to someone',
  unrequited:       'In this one-sided situation',
  post_breakup:     'Even after it ended',
  single_healing:   'Even when you\u2019re not in something',
}

const VISION_ITEMS = [
  "You send the message. You don\u2019t check your phone 40 times waiting for a reply.",
  "Someone pulls away. You feel it \u2014 and you don\u2019t spiral.",
  "You need something. You say it directly, without bracing for rejection.",
  "Closeness doesn\u2019t trigger the urge to run, or the fear that it\u2019s about to be taken away.",
  "You can be alone for a night without it meaning something is wrong.",
]

const STORAGE_KEY = 'onboarding_progress'

// Mini app preview shown inside each color swatch —
// renders plant + button + chat bubble in the exact palette color
// so users see a real UI snapshot, not just a dot.
function MiniPreview({ color }) {
  return (
    <div style={{
      background: '#F3ECE2',
      borderRadius: '10px',
      padding: '10px 8px 8px',
      marginBottom: '10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '6px',
      overflow: 'hidden',
      width: '100%',
    }}>
      {/* Plant tinted with this palette color */}
      <div style={{ color, lineHeight: 0 }}>
        <PlantVisual stage="sprout" tinted className="w-10 h-14" />
      </div>
      {/* Primary button */}
      <div style={{
        width: '100%',
        background: color,
        borderRadius: '8px 2px 8px 2px',
        padding: '5px 0',
        textAlign: 'center',
        fontSize: '8px',
        fontWeight: 800,
        color: 'white',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Water it.
      </div>
      {/* Chat bubble — conversational color accent */}
      <div style={{
        alignSelf: 'flex-end',
        background: `${color}1A`,
        borderRadius: '8px 8px 2px 8px',
        padding: '4px 8px',
        fontSize: '7px',
        color,
        border: `1px solid ${color}28`,
        maxWidth: '90%',
        lineHeight: 1.4,
        fontWeight: 500,
      }}>
        How are you feeling?
      </div>
    </div>
  )
}

export default function Onboarding() {
  const { login, updateProfile, isAuthenticated, profile } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved).step ?? 0
    } catch {}
    return 0
  })
  const [data, setData] = useState(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY)
      if (saved) return JSON.parse(saved).data ?? {}
    } catch {}
    return {
      entry_text: '',
      struggle_level: null,
      attachment_familiarity: '',  // 'aware' | 'unaware'
      current_situation: '',
      how_shows_up: '',
      primary_pattern: '',
      pattern_duration: '',
      scenarios: [],
      awareness_level: null,
      color_preference: '',
      intention: ''
    }
  })

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ step, data }))
    } catch {}
  }, [step, data])

  // Resend cooldown countdown
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Live-preview: update CSS vars when user picks a color swatch
  useEffect(() => {
    if (data.color_preference) {
      applyCssVars(getStyleColor(data.color_preference))
    }
  }, [data.color_preference])

  const [scenarioStep, setScenarioStep] = useState(0)
  const [situationStep, setSituationStep] = useState(0)
  const [visionStep, setVisionStep] = useState(0)
  const [account, setAccount] = useState({ name: '', email: '' })
  const [otpStep, setOtpStep] = useState(false) // true = showing OTP input for account
  const [otpCode, setOtpCode] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  const otpInputsRef = useRef([])
  const [showClose, setShowClose] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [primaryStyle, setPrimaryStyle] = useState(null)
  const [emoraReflection, setEmoraReflection] = useState('')

  // Already onboarded — don't let them retake the quiz and overwrite their profile
  if (isAuthenticated && profile?.onboarding_completed) {
    return <Navigate to="/home" replace />
  }

  const currentStep = STEPS[step]
  const isUnaware = data.attachment_familiarity === 'unaware'

  function next() { setError(''); setStep(s => s + 1) }
  function set(field, value) { setData(d => ({ ...d, [field]: value })) }
  function setAcc(field, value) { setAccount(a => ({ ...a, [field]: value })) }

  function handleScenarioAnswer(scenarioId, option) {
    setData(d => ({
      ...d,
      scenarios: [
        ...d.scenarios.filter(s => s.id !== scenarioId),
        { id: scenarioId, answer: option.label, style_signal: option.style }
      ]
    }))
  }

  function handleFamiliaritySelect(value) {
    set('attachment_familiarity', value)
    // Brief pause so selection visually registers, then auto-advance
    setTimeout(() => setStep(s => s + 1), 320)
  }

  // Step 1 of account creation: send OTP
  async function handleFinish() {
    if (!account.email.trim()) return setError('Email is required')
    if (!data.intention.trim()) return setError('Please share your intention')
    setLoading(true)
    setError('')
    try {
      await authAPI.sendOtp(account.email.trim(), 'register')
      setOtpStep(true)
      setResendCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  // Step 2 of account creation: verify OTP then complete onboarding
  async function handleVerifyOtpFinish() {
    if (otpCode.length < 6) return
    setLoading(true)
    setError('')
    try {
      const regRes = await authAPI.verifyOtp(account.email.trim(), otpCode, 'register', account.name.trim() || undefined)
      login(regRes.data.token, regRes.data.user)

      const submissionData = { ...data }
      if (isUnaware && !submissionData.primary_pattern && submissionData.how_shows_up) {
        submissionData.primary_pattern = EXPERIENCE_TO_PATTERN[submissionData.how_shows_up] || submissionData.how_shows_up
      }

      const onboardRes = await onboardingAPI.complete(submissionData)
      updateProfile({ onboarding_completed: true, primary_style: onboardRes.data.primary_style, color_preference: submissionData.color_preference || null })
      setPrimaryStyle(onboardRes.data.primary_style ?? null)
      setEmoraReflection(onboardRes.data.emora_reflection || '')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
      setShowClose(true)
    } catch (err) {
      if (err.response?.status === 409) {
        setError('An account with this email already exists. Try logging in.')
      } else {
        setError(err.response?.data?.error || 'Invalid code. Try again.')
      }
      setOtpCode('')
      setLoading(false)
    }
  }

  // Called when user is already logged in and finishes the quiz —
  // skip account creation, just persist the quiz data
  async function handleFinishAuthenticated() {
    if (!data.intention.trim()) return setError('Please share your intention')
    setLoading(true)
    setError('')
    try {
      const submissionData = { ...data }
      if (isUnaware && !submissionData.primary_pattern && submissionData.how_shows_up) {
        submissionData.primary_pattern = EXPERIENCE_TO_PATTERN[submissionData.how_shows_up] || submissionData.how_shows_up
      }
      const onboardRes = await onboardingAPI.complete(submissionData)
      updateProfile({ onboarding_completed: true, primary_style: onboardRes.data.primary_style, color_preference: submissionData.color_preference || null })
      setPrimaryStyle(onboardRes.data.primary_style ?? null)
      setEmoraReflection(onboardRes.data.emora_reflection || '')
      try { sessionStorage.removeItem(STORAGE_KEY) } catch {}
      setShowClose(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (showClose) {
    return <OnboardingClose primaryStyle={primaryStyle} emoraReflection={emoraReflection} onReady={() => navigate('/home')} />
  }

  function selStyle(selected) {
    return selected
      ? { background: 'var(--sp)', borderColor: 'var(--sp)', color: '#FFFFFF', boxShadow: '0 4px 16px var(--sp-glow)' }
      : { background: 'rgba(255,255,255,0.8)', borderColor: 'rgba(143,151,121,0.3)', color: '#5D4037' }
  }
  function selClass(selected) {
    return selected
      ? 'border-transparent'
      : 'hover:-translate-y-0.5 hover:bg-[rgba(192,108,84,0.06)] hover:border-[rgba(192,108,84,0.3)]'
  }

  // Plant stage advances with step groups — visual metaphor of growth through the quiz
  const onboardingPlantStage =
    step <= 1 ? 'seed' :
    step <= 3 ? 'sprout' :
    step <= 5 ? 'shoot' :
    step <= 7 ? 'stem' :
    step <= 9 ? 'leaves' :
    'rooted'

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: '#F8F1E7' }}>

      {/* ── Greenhouse header ─────────────────────────────────────────────── */}
      <header className="relative z-10 flex items-center justify-between p-6 pb-2">
        <button
          onClick={() => {
            if (currentStep === 'secure_vision' && visionStep > 0) {
              setVisionStep(s => s - 1)
            } else if (currentStep === 'assessment' && scenarioStep > 0) {
              setScenarioStep(s => s - 1)
            } else if (currentStep === 'situation' && situationStep > 0) {
              setSituationStep(s => s - 1)
            } else {
              if (currentStep === 'assessment') setScenarioStep(0)
              if (currentStep === 'secure_vision') setVisionStep(0)
              if (currentStep === 'situation') setSituationStep(0)
              if (step > 0) setStep(s => s - 1)
            }
          }}
          className="flex items-center justify-center p-2 rounded-full transition-colors"
          style={{
            color: '#8C9688',
            background: (step > 0 || (currentStep === 'assessment' && scenarioStep > 0) || (currentStep === 'situation' && situationStep > 0) || (currentStep === 'secure_vision' && visionStep > 0)) ? 'rgba(143,151,121,0.12)' : 'transparent'
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
        </button>
        <div className="flex flex-col items-center">
          <h1 className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 500, letterSpacing: '-0.01em', color: '#2C332B' }}>
            The Greenhouse
          </h1>
          <span className="label mt-1">
            {currentStep === 'entry' && 'What brought you here'}
            {currentStep === 'struggle' && 'How you\'re feeling'}
            {currentStep === 'familiarity' && 'Your background'}
            {currentStep === 'situation' && 'Your situation'}
            {currentStep === 'duration' && 'How long'}
            {currentStep === 'assessment' && `Scenario ${scenarioStep + 1} of ${SCENARIOS.length}`}
            {currentStep === 'awareness' && 'Self-awareness'}
            {currentStep === 'secure_vision' && 'What this looks like'}
            {currentStep === 'color' && 'Your color'}
            {currentStep === 'what_you_get' && 'What happens next'}
            {currentStep === 'intention' && 'Your intention'}
            {currentStep === 'account' && 'Create account'}
          </span>
        </div>
        {/* Right side — step counter badge */}
        {currentStep === 'assessment' ? (
          <div className="flex items-center justify-center px-3 py-1.5 rounded-full"
            style={{ background: 'var(--sp-light)' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--sp)', letterSpacing: '0.05em' }}>
              {scenarioStep + 1} OF {SCENARIOS.length}
            </span>
          </div>
        ) : (
          <div className="w-10 h-10" />
        )}
      </header>

      {/* ── Progress bar — tracks virtual steps including sub-steps ─────── */}
      {(() => {
        const stepSizes = {
          entry: 1, struggle: 1, familiarity: 1,
          situation: isUnaware ? 2 : 3,
          duration: 1,
          assessment: SCENARIOS.length,
          awareness: 1,
          secure_vision: VISION_ITEMS.length + 1,
          color: 1, what_you_get: 1, intention: 1, account: 1,
        }
        const total = Object.values(stepSizes).reduce((a, b) => a + b, 0)
        let done = 0
        for (let i = 0; i < step; i++) done += stepSizes[STEPS[i]]
        if (currentStep === 'assessment') done += scenarioStep
        else if (currentStep === 'secure_vision') done += visionStep
        else if (currentStep === 'situation') done += situationStep
        done += 1
        const pct = Math.min((done / total) * 100, 100)
        return (
          <div className="px-6 py-2 flex items-center gap-3 mb-2">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: 'rgba(169,175,158,0.8)', flexShrink: 0 }}>
              <path d="M6.5 10h-2v7h2v-7zm6 0h-2v7h2v-7zm8.5 9H2v2h19v-2zm-2.5-9h-2v7h2v-7zM11.5 1L2 6v2h19V6l-9.5-5z"/>
            </svg>
            <div className="h-1.5 flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(143,151,121,0.2)' }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${pct}%`, background: 'var(--sp)' }} />
            </div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8C9688' }}>{done}/{total}</span>
          </div>
        )
      })()}

      {/* ── Opaque card wrapper ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-4 w-full max-w-lg mx-auto">
        <div className="relative overflow-hidden"
          style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 8px 30px -8px rgba(143,169,181,0.2)', border: '1px solid rgba(143,151,121,0.18)', padding: '2rem' }}>
          {/* Ambient blobs */}
          <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'rgba(230,230,250,0.5)', filter: 'blur(48px)', mixBlendMode: 'multiply' }} />
          <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'rgba(143,188,143,0.2)', filter: 'blur(48px)', mixBlendMode: 'multiply' }} />
          {/* Growing plant — advances with step groups */}
          <div className="absolute bottom-0 right-2 pointer-events-none transition-all duration-700"
            style={{ color: 'var(--sp)', opacity: 0.28 }}>
            <PlantVisual stage={onboardingPlantStage} tinted className="w-14 h-20" />
          </div>

          <div className="relative z-10 animate-slide-up" key={step}>

        {/* ── Step 1: Entry ────────────────────────────────────────────────── */}
        {currentStep === 'entry' && (
          <div className="space-y-8">
            <div>
              <h2 className="t-h1 mb-3">What's going on?</h2>
              <p className="t-body">Tell us what brought you here. No right answer.</p>
            </div>
            <textarea
              className="input-field min-h-32 resize-none"
              placeholder="Write whatever comes up..."
              value={data.entry_text}
              onChange={e => set('entry_text', e.target.value)}
            />
            <button className="btn-primary w-full" onClick={next}>Continue →</button>
          </div>
        )}

        {/* ── Step 2: Struggle level ────────────────────────────────────────── */}
        {currentStep === 'struggle' && (
          <div className="space-y-8">
            <div>
              <h2 className="t-h1 mb-3">How much is this affecting you right now?</h2>
              <p className="t-body">Be honest — there's no wrong answer here.</p>
            </div>
            <div className="space-y-3">
              {[
                { value: 3, label: 'A lot', sub: "It's on my mind most days" },
                { value: 2, label: 'Somewhat', sub: "It comes up, but I'm managing" },
                { value: 1, label: 'Just curious', sub: "I want to understand myself better" },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => { set('struggle_level', opt.value); setTimeout(() => next(), 320) }}
                  className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.struggle_level === opt.value)}`}
                  style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.struggle_level === opt.value) }}
                >
                  <p className="t-h3">{opt.label}</p>
                  <p className="t-caption mt-1">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 2: Familiarity (routing question) ───────────────────────── */}
        {currentStep === 'familiarity' && (
          <div className="space-y-8">
            <div>
              <h2 className="t-h1 mb-3">Quick question.</h2>
              <p className="t-body">
                Have you heard of attachment styles before? Things like being anxious or avoidant in relationships?
              </p>
            </div>
            <div className="space-y-3">
              {[
                {
                  value: 'aware',
                  label: "Yes — I know about attachment styles",
                  sub: "I've read about it or talked to a therapist"
                },
                {
                  value: 'unaware',
                  label: "Not really — I just know something isn't working",
                  sub: "I haven't looked into this before"
                }
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => handleFamiliaritySelect(opt.value)}
                  className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.attachment_familiarity === opt.value)}`}
                  style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.attachment_familiarity === opt.value) }}
                >
                  <p className="t-h3">{opt.label}</p>
                  <p className="t-caption mt-1">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Step 3: Situation — one question per screen ───────────────────── */}
        {currentStep === 'situation' && (
          <div className="animate-slide-up" key={`sit-${situationStep}`}>

          {/* Sub-step 0: Location */}
          {situationStep === 0 && (
            <div className="space-y-8">
              <div>
                <h2 className="t-h1 mb-3">Where are you right now?</h2>
                <p className="t-body">Pick the closest one.</p>
              </div>
              <div className="space-y-3">
                {[
                  { value: 'in_relationship', label: 'In a relationship' },
                  { value: 'dating', label: 'Dating or talking to someone' },
                  { value: 'unrequited', label: 'One-sided or unrequited feelings' },
                  { value: 'post_breakup', label: 'After a breakup or ended situationship' },
                  { value: 'single_healing', label: 'Single, working on myself' },
                ].map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => {
                      set('current_situation', opt.value)
                      setTimeout(() => setSituationStep(1), 320)
                    }}
                    className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.current_situation === opt.value)}`}
                    style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.current_situation === opt.value) }}
                  >
                    <p className="t-h3">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-step 1: How the pattern shows up (aware) / Experience (unaware) */}
          {situationStep === 1 && isUnaware && (
            <div className="space-y-8">
              <div>
                {data.current_situation && SITUATION_FRAMING[data.current_situation] ? (
                  <>
                    <p className="t-caption font-semibold mb-2" style={{ color: 'var(--sp)' }}>
                      {SITUATION_FRAMING[data.current_situation]}
                    </p>
                    <h2 className="t-h1 mb-3">what tends to happen for you?</h2>
                  </>
                ) : (
                  <h2 className="t-h1 mb-3">What tends to happen for you in relationships?</h2>
                )}
                <p className="t-body">Pick what feels most true, even if it's not a perfect fit.</p>
              </div>
              <div className="space-y-3">
                {EXPERIENCE_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      set('how_shows_up', opt.label)
                      setTimeout(() => next(), 320)
                    }}
                    className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.how_shows_up === opt.label)}`}
                    style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.how_shows_up === opt.label) }}
                  >
                    <p className="t-h3">{opt.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {situationStep === 1 && !isUnaware && (
            <div className="space-y-8">
              <div>
                {data.current_situation && SITUATION_FRAMING[data.current_situation] ? (
                  <>
                    <p className="t-caption font-semibold mb-2" style={{ color: 'var(--sp)' }}>
                      {SITUATION_FRAMING[data.current_situation]}
                    </p>
                    <h2 className="t-h1 mb-3">how do you usually show up?</h2>
                  </>
                ) : (
                  <h2 className="t-h1 mb-3">How do you usually show up in relationships?</h2>
                )}
                <p className="t-body">Pick the closest one — it doesn't have to be exact.</p>
              </div>
              <div className="space-y-3">
                {[
                  "I need constant reassurance that they still care",
                  "I get consumed by someone who doesn\u2019t fully choose me",
                  "I pull away when things start getting close",
                  "I go back and forth between both \u2014 it changes",
                  "I overthink everything but seem fine on the outside",
                ].map(opt => (
                  <button
                    key={opt}
                    onClick={() => {
                      set('how_shows_up', opt)
                      setTimeout(() => setSituationStep(2), 320)
                    }}
                    className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.how_shows_up === opt)}`}
                    style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.how_shows_up === opt) }}
                  >
                    <p className="t-h3">{opt}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sub-step 2 (aware only): Pattern textarea */}
          {situationStep === 2 && !isUnaware && (
            <div className="space-y-8">
              <div>
                {data.current_situation && SITUATION_FRAMING[data.current_situation] ? (
                  <>
                    <p className="t-caption font-semibold mb-2" style={{ color: 'var(--sp)' }}>
                      {SITUATION_FRAMING[data.current_situation]}
                    </p>
                    <h2 className="t-h1 mb-3">what do you most want to change?</h2>
                  </>
                ) : (
                  <h2 className="t-h1 mb-3">What do you most want to change?</h2>
                )}
                <p className="t-body">A sentence or two is enough. Your own words.</p>
              </div>
              <div className="relative">
                <textarea
                  className="input-field resize-none"
                  rows={4}
                  placeholder="e.g. I keep going after people who aren't really available..."
                  value={data.primary_pattern}
                  onChange={e => set('primary_pattern', e.target.value)}
                  autoFocus
                />
              </div>
              <button
                className="btn-primary w-full"
                onClick={next}
                disabled={!data.primary_pattern.trim()}
              >
                That's it →
              </button>
            </div>
          )}

          </div>
        )}

        {/* ── Step 4: Duration ──────────────────────────────────────────────── */}
        {currentStep === 'duration' && (
          <div className="space-y-8">
            <div>
              <h2 className="t-h1 mb-3">
                {isUnaware ? 'How long has this been going on?' : 'How long has this been your pattern?'}
              </h2>
              <p className="t-body">
                Be honest — this helps set realistic expectations.
              </p>
            </div>
            <div className="space-y-3">
              {[
                { value: 'recent', label: "A few months — it's relatively new" },
                { value: '1-2_years', label: '1–2 years' },
                { value: '3-5_years', label: '3–5 years' },
                { value: 'most_of_life', label: 'Most of my adult life' },
                { value: 'always', label: 'As far back as I can remember' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => set('pattern_duration', opt.value)}
                  className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.pattern_duration === opt.value)}`}
                  style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.pattern_duration === opt.value) }}
                >
                  <p className="t-h3">{opt.label}</p>
                </button>
              ))}
            </div>
            {data.pattern_duration && (
              <p className="t-body-sm animate-fade-in">
                {data.pattern_duration === 'recent'
                  ? "Good news: shorter patterns are easier to interrupt. You caught this early."
                  : data.pattern_duration === 'always'
                  ? "Deep patterns take real time. Unclinq is built for this — not a quick fix, a real one."
                  : "These patterns are strong but not permanent. That's exactly what we're here for."}
              </p>
            )}
            <button
              className="btn-primary w-full"
              onClick={next}
              disabled={!data.pattern_duration}
            >
              Got it →
            </button>
          </div>
        )}

        {/* ── Step 5: Assessment — one scenario at a time ───────────────────── */}
        {currentStep === 'assessment' && (() => {
          const scenario = SCENARIOS[scenarioStep]
          const answered = data.scenarios.find(s => s.id === scenario.id)
          return (
            <div className="space-y-6">
              {/* Progress dots */}
              <div className="flex items-center gap-1.5">
                {SCENARIOS.map((_, i) => (
                  <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
                    style={{
                      background: i < scenarioStep
                        ? 'var(--sp)'
                        : i === scenarioStep
                          ? 'var(--sp-glow)'
                          : 'rgba(143,151,121,0.25)'
                    }} />
                ))}
              </div>

              {/* Question */}
              <div>
                <p className="label mb-3">No right answer — pick the most honest one</p>
                <h2 className="t-h1 mb-3">{scenario.question}</h2>
              </div>

              {/* Options */}
              <div className="space-y-3">
                {scenario.options.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => {
                      handleScenarioAnswer(scenario.id, opt)
                      setTimeout(() => {
                        if (scenarioStep < SCENARIOS.length - 1) {
                          setScenarioStep(s => s + 1)
                        } else {
                          next()
                        }
                      }, 350)
                    }}
                    className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(answered?.answer === opt.label)}`}
                    style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(answered?.answer === opt.label) }}
                  >
                    <p className="t-h3">{opt.label}</p>
                  </button>
                ))}
              </div>

              {/* Manual next — shown only on last scenario when already answered */}
              {scenarioStep === SCENARIOS.length - 1 && answered && (
                <button className="btn-primary w-full" onClick={next}>
                  Those were honest →
                </button>
              )}
            </div>
          )
        })()}

        {/* ── Step 6: Metacognition ─────────────────────────────────────────── */}
        {currentStep === 'awareness' && (
          <div className="space-y-8">
            <div>
              <h2 className="t-h1 mb-3">One more question.</h2>
              <p className="t-body">
                After you react in a relationship, how quickly do you usually realize what happened?
              </p>
            </div>
            <div className="space-y-3">
              {[
                { level: 1, label: "Usually not at all — I only see it much later, if ever" },
                { level: 2, label: "Hours or days later, usually after reflection" },
                { level: 3, label: "Sometimes in the moment, sometimes later" },
                { level: 4, label: "Pretty quickly — often in real time or right after" },
              ].map(opt => (
                <button
                  key={opt.level}
                  onClick={() => set('awareness_level', opt.level)}
                  className={`w-full text-left px-5 py-4 border transition-all duration-200 ${selClass(data.awareness_level === opt.level)}`}
                  style={{ borderRadius: '16px 4px 16px 4px', ...selStyle(data.awareness_level === opt.level) }}
                >
                  <p className="t-h3">{opt.label}</p>
                </button>
              ))}
            </div>
            <button
              className="btn-primary w-full"
              onClick={next}
              disabled={data.awareness_level === null}
            >
              That's where I am →
            </button>
          </div>
        )}

        {/* ── Step 7: Secure Vision — Wrapped-style one-at-a-time reveal ────── */}
        {currentStep === 'secure_vision' && (
          visionStep < VISION_ITEMS.length ? (
            /* ── Vision slides 0–4 ── */
            <div className="flex flex-col gap-10 animate-slide-up" key={`v${visionStep}`}>

              {/* 5-segment progress bar */}
              <div className="flex gap-1.5">
                {VISION_ITEMS.map((_, i) => (
                  <div key={i} className="flex-1 rounded-full transition-all duration-500"
                    style={{ height: '3px', background: i <= visionStep ? 'var(--sp)' : 'var(--sp-border)' }} />
                ))}
              </div>

              {/* Vision statement */}
              <div className="py-6">
                <p className="label mb-5">What this looks like</p>
                <h2 className="t-h1">{VISION_ITEMS[visionStep]}</h2>
              </div>

              {/* CTA */}
              <button
                className="btn-primary w-full"
                onClick={() => setVisionStep(v => v + 1)}>
                {visionStep === VISION_ITEMS.length - 1 ? 'One more thing \u2192' : 'Next \u2192'}
              </button>
            </div>
          ) : (
            /* ── Closing slide — commit moment ── */
            <div className="space-y-8 animate-slide-up" key="v-close">
              <div>
                <h2 className="t-h1 mb-3">What you're working toward.</h2>
                <p className="t-body">
                  Not a label. A way of actually being different in relationships.
                </p>
              </div>

              <div className="px-5 py-4 border border-surface-border bg-surface-elevated" style={{ borderRadius: '24px 20px 28px 22px' }}>
                <p className="t-body-sm">
                  This isn't about becoming a different person. It's about your nervous system not taking over. That's learnable — not just from reading about it, but from doing the work. That's what this is.
                </p>
              </div>

              <button className="btn-primary w-full" onClick={next}>
                This is what I want →
              </button>
            </div>
          )
        )}

        {/* ── Step 8: Color preference ──────────────────────────────────────── */}
        {currentStep === 'color' && (() => {
          const suggestedStyle = computePreliminaryStyle(data.scenarios)

          return (
            <div className="space-y-6">
              <div>
                <h2 className="t-h1 mb-3">Pick your color.</h2>
                <p className="t-body">
                  This is how the app will look for you.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(STYLE_LABELS).map(([key, { name, desc, color }]) => {
                  const selected = data.color_preference === key
                  const isSuggested = key === suggestedStyle && !data.color_preference
                  return (
                    <button
                      key={key}
                      onClick={() => set('color_preference', key)}
                      className="relative flex flex-col items-start p-3 border transition-all duration-200"
                      style={{
                        borderRadius: '16px 4px 16px 4px',
                        background: selected ? `${color}12` : 'rgba(255,255,255,0.8)',
                        borderColor: selected ? color : isSuggested ? `${color}55` : 'rgba(143,151,121,0.3)',
                        boxShadow: selected ? `0 6px 20px ${color}28` : 'none',
                        transform: selected ? 'scale(1.02)' : 'scale(1)',
                      }}
                    >
                      {/* Mini app preview */}
                      <MiniPreview color={color} />

                      {/* Name row */}
                      <div className="flex items-center gap-1.5 w-full">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ background: color }} />
                        <p className="font-semibold text-xs flex-1 text-left" style={{ color: selected ? color : '#2C332B' }}>
                          {name}
                        </p>
                        {isSuggested && (
                          <span className="rounded-full px-1.5 py-0.5 flex-shrink-0"
                            style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', background: `${color}20`, color }}>
                            ✦
                          </span>
                        )}
                        {selected && (
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="6" cy="6" r="6" fill={color} opacity="0.15" />
                            <path d="M3 6l2 2 4-4" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <p className="text-xs mt-1 leading-snug text-left" style={{ color: '#8C9688' }}>{desc}</p>
                    </button>
                  )
                })}
              </div>
              {suggestedStyle && !data.color_preference && (
                <p className="text-center text-xs" style={{ color: '#8C9688' }}>
                  ✦ suggested based on your responses
                </p>
              )}
              <button
                className="btn-primary w-full"
                onClick={next}
                disabled={!data.color_preference}
              >
                This feels like me →
              </button>
            </div>
          )
        })()}

        {/* ── Step 9: What you'll get ───────────────────────────────────────── */}
        {currentStep === 'what_you_get' && (
          <div className="space-y-7">
            <div>
              <h2 className="t-h1 mb-3">Here's what you get.</h2>
              <p className="t-body">
                Not a quiz result. A real system for changing how you show up.
              </p>
            </div>

            <div className="space-y-3">

              {/* Emora */}
              <div className="flex gap-4 p-4 border rounded-2xl" style={{ borderColor: 'rgba(143,151,121,0.2)', background: 'rgba(255,255,255,0.7)' }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--sp-light)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sp)" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                  </svg>
                </div>
                <div>
                  <p className="t-h3 mb-1">Emora, your AI companion</p>
                  <p className="t-caption leading-relaxed">Short daily sessions that work on your specific pattern — not generic advice. Emora remembers what you've shared and follows the thread.</p>
                </div>
              </div>

              {/* Pattern Report */}
              <div className="flex gap-4 p-4 border rounded-2xl" style={{ borderColor: 'rgba(143,151,121,0.2)', background: 'rgba(255,255,255,0.7)' }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--sp-light)' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sp)" strokeWidth="1.75" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/>
                    <line x1="16" y1="17" x2="8" y2="17"/>
                    <polyline points="10 9 9 9 8 9"/>
                  </svg>
                </div>
                <div>
                  <p className="t-h3 mb-1">Pattern Report after 5 sessions</p>
                  <p className="t-caption leading-relaxed">Your patterns, mapped. What triggers them, how they show up, what's underneath. Not a diagnosis — a mirror you can actually use.</p>
                </div>
              </div>

              {/* Progress / plant */}
              <div className="flex gap-4 p-4 border rounded-2xl" style={{ borderColor: 'rgba(143,151,121,0.2)', background: 'rgba(255,255,255,0.7)' }}>
                <div className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--sp-light)', color: 'var(--sp)' }}>
                  <PlantVisual stage="stem" tinted className="w-6 h-8" />
                </div>
                <div>
                  <p className="t-h3 mb-1">Slow, real change</p>
                  <p className="t-caption leading-relaxed">The plant on your home screen grows as you do. Small at first. It doesn't lie — it only grows when the work is actually happening.</p>
                </div>
              </div>

            </div>

            {/* Honest caveat */}
            <p className="t-caption text-center leading-relaxed">
              This isn't a quick fix. Most people notice a shift in 3–4 weeks of consistent sessions.
            </p>

            <button className="btn-primary w-full" onClick={next}>
              I want this →
            </button>
          </div>
        )}

        {/* ── Step 10: Intention ────────────────────────────────────────────── */}
        {currentStep === 'intention' && (
          <div className="space-y-8">
            <div>
              <h2 className="t-h1 mb-3">Last question.</h2>
              <p className="t-body">
                Think about your relationships right now. What do you wish felt different?
              </p>
            </div>
            <div className="relative">
              <textarea
                className="input-field min-h-32 resize-none"
                placeholder="Write whatever comes up. Honest is fine."
                value={data.intention}
                onChange={e => set('intention', e.target.value)}
                maxLength={300}
              />
              {data.intention.length > 0 && (
                <p className="absolute bottom-3 right-4 text-text-muted" style={{ fontSize: '10px', fontWeight: 600 }}>
                  {data.intention.length}/300
                </p>
              )}
            </div>
            {error && (
              <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl">
                {error}
              </div>
            )}
            <button
              className="btn-primary w-full"
              onClick={isAuthenticated ? handleFinishAuthenticated : next}
              disabled={!data.intention.trim() || loading}
            >
              {loading ? 'Setting up your profile...' : 'Save this →'}
            </button>
          </div>
        )}

        {/* ── Step 11: Account (FINAL — quiz-first, new users only) ────────── */}
        {currentStep === 'account' && (
          <div className="space-y-8">
            {isAuthenticated ? (
              // Already logged in — shouldn't reach here, but handle gracefully
              <div className="space-y-6">
                <div>
                  <h2 className="t-h1 mb-3">Almost done.</h2>
                  <p className="t-body">Your account is already set up. Just save your quiz results.</p>
                </div>
                {error && (
                  <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl">
                    {error}
                  </div>
                )}
                <button
                  className="btn-primary w-full"
                  onClick={handleFinishAuthenticated}
                  disabled={loading}
                >
                  {loading ? 'Setting up your profile...' : 'Meet Emora →'}
                </button>
              </div>
            ) : otpStep ? (
            /* OTP verification step */
            <div className="space-y-8">
              <div>
                <button
                  onClick={() => { setOtpStep(false); setOtpCode(''); setError('') }}
                  className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-60"
                  style={{ color: '#9B9B97' }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                  </svg>
                  Back
                </button>
                <h2 className="t-h1 mb-3">Check your email.</h2>
                <p className="t-body">
                  We sent a code to <span style={{ color: 'var(--sp)' }}>{account.email}</span>
                </p>
              </div>

              {/* OTP boxes */}
              <div className="flex gap-3 justify-center">
                {[0,1,2,3,4,5].map(i => (
                  <input
                    key={i}
                    ref={el => otpInputsRef.current[i] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    disabled={loading}
                    value={otpCode[i] || ''}
                    onFocus={e => e.target.select()}
                    onPaste={e => {
                      e.preventDefault()
                      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
                      setOtpCode(pasted)
                      otpInputsRef.current[Math.min(pasted.length, 5)]?.focus()
                    }}
                    onChange={e => {
                      const char = e.target.value.replace(/\D/g, '').slice(-1)
                      if (!char) return
                      const next = otpCode.slice(0, i) + char + otpCode.slice(i + 1)
                      const trimmed = next.slice(0, 6)
                      setOtpCode(trimmed)
                      if (i < 5) otpInputsRef.current[i + 1]?.focus()
                      if (trimmed.length === 6) handleVerifyOtpFinish()
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Backspace') {
                        e.preventDefault()
                        setOtpCode(otpCode.slice(0, i) + otpCode.slice(i + 1))
                        if (i > 0) otpInputsRef.current[i - 1]?.focus()
                      }
                    }}
                    className="w-12 h-14 text-center text-xl font-semibold rounded-2xl outline-none transition-all"
                    style={{
                      background: 'rgba(255,255,255,0.06)',
                      border: otpCode[i] ? '1.5px solid var(--sp)' : '1.5px solid rgba(0,0,0,0.12)',
                      color: 'var(--text-primary, #1A1A18)',
                      opacity: loading ? 0.5 : 1,
                    }}
                  />
                ))}
              </div>

              {error && (
                <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl text-center">
                  {error}
                </div>
              )}

              <button
                className="btn-primary w-full"
                onClick={handleVerifyOtpFinish}
                disabled={loading || otpCode.length < 6}
              >
                {loading ? 'Setting up your profile...' : 'Verify & meet Emora →'}
              </button>

              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="t-caption" style={{ color: '#9B9B97' }}>Resend in {resendCooldown}s</p>
                ) : (
                  <button
                    onClick={() => { handleFinish(); setOtpCode('') }}
                    className="t-caption transition-opacity hover:opacity-70"
                    style={{ color: 'var(--sp)' }}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
            ) : (
            /* Email entry step */
            <div className="space-y-8">
              <div>
                <h2 className="t-h1 mb-3">Almost done.</h2>
                <p className="t-body">
                  Create an account to save your answers and meet Emora. Everything stays private.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block t-caption mb-2 font-semibold">Name (optional)</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="What should Emora call you?"
                    value={account.name}
                    onChange={e => setAcc('name', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block t-caption mb-2 font-semibold">Email</label>
                  <input
                    type="email"
                    required
                    className="input-field"
                    placeholder="you@example.com"
                    value={account.email}
                    onChange={e => { setAcc('email', e.target.value); setError('') }}
                    autoComplete="email"
                  />
                </div>
              </div>

              {error && (
                <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl">
                  {error}
                </div>
              )}

              <button
                className="btn-primary w-full"
                onClick={handleFinish}
                disabled={loading || !account.email.trim()}
              >
                {loading ? 'Sending code...' : 'Send verification code'}
              </button>

              <p className="t-caption text-center leading-relaxed">
                Already have an account?{' '}
                <Link to="/login" style={{ color: 'var(--sp)' }} className="hover:underline">Sign in</Link>
                {' '}to restore your progress.
              </p>
            </div>
            )}
          </div>
        )}

          </div>{/* closes relative z-10 / key={step} */}
        </div>{/* closes opaque card */}

        {/* Trellis framing */}
        <div className="mt-5 text-center" style={{ color: '#8C9688', fontSize: '0.8rem', letterSpacing: '0.01em' }}>
          Unclinq is the trellis. You're the plant.
        </div>
      </div>{/* closes flex-1 opaque wrapper */}

      {/* Bottom gradient fade */}
      <div className="fixed bottom-0 left-0 right-0 h-28 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(143,188,143,0.25), transparent)', zIndex: 0 }} />
    </div>
  )
}
