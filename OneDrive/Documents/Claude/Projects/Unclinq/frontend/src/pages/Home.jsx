import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { patternReportAPI, week1API, notificationsAPI } from '../services/api'
import ReentryScreen from '../components/ReentryScreen'
import MicroReport from '../components/MicroReport'
import InAppNotification from '../components/InAppNotification'
import PhaseEntryMoment from '../components/PhaseEntryMoment'
import WeeklyPulse from '../components/WeeklyPulse'
import MilestoneModal from '../components/MilestoneModal'
import RegressionModal from '../components/RegressionModal'
import MaintenanceModeCard from '../components/MaintenanceModeCard'
import PlantGrowthMoment from '../components/PlantGrowthMoment'
import PlantVisual from '../components/PlantVisual'
import { CRISIS_RESOURCES } from '../constants/crisis'
import { EmotionFace, stateToFace } from '../components/Illustrations'
import FeatureTour from '../components/FeatureTour'

// Paper grain texture — inline SVG data URI
const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getGreeting(name) {
  const hour = new Date().getHours()
  const first = name ? name.split(' ')[0] : null
  const time = hour < 5 ? 'Still up' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : hour < 21 ? 'Good evening' : 'Evening'
  return first ? `${time}, ${first}.` : `${time}.`
}

function getContextLine(sessionCount, isActivated, duration) {
  if (isActivated) return null // let the activated CTA speak
  if (sessionCount === 0) {
    const isFirstVisit = !localStorage.getItem('unclinq_home_visited')
    if (isFirstVisit) {
      localStorage.setItem('unclinq_home_visited', '1')
      return "The seed is in the soil. Now it needs water."
    }
    return "Something is already moving."
  }
  if (sessionCount === 1) return "One session in. The root is forming."
  if (sessionCount < 5) return "You're building something real here."
  if (duration) return `${duration} of tending to this.`
  return null
}

// Maps backend plant_stage values to PlantVisual component stages
const PLANT_STAGE_MAP = {
  seed:        'seed',
  sprout:      'sprout',
  plant:       'stem',
  bloom:       'leaves',
  maintenance: 'mature',
}

function formatDuration(firstSessionAt) {
  if (!firstSessionAt) return null
  const days = Math.floor((Date.now() - new Date(firstSessionAt).getTime()) / 86400000)
  if (days < 2) return null
  if (days < 7) return `${days} days`
  if (days < 30) return `${Math.floor(days / 7)}w`
  return `${Math.floor(days / 30)}mo`
}

function formatPattern(p) { return p.replace(/_/g, ' ') }

const STYLE_LABELS = {
  anxious:             'Anxious',
  dismissive_avoidant: 'Dismissive-Avoidant',
  fearful_avoidant:    'Fearful-Avoidant',
  secure_leaning:      'Secure-Leaning',
}

const SITUATION_LABELS = {
  in_relationship: 'In a relationship',
  dating:          'Dating',
  unrequited:      'Unrequited feelings',
  post_breakup:    'Post-breakup',
  single_healing:  'Single & healing',
}

const STYLE_QUOTES = {
  anxious: [
    "Needing reassurance is human. Learning to find it within yourself is the work.",
    "Your worth isn't contingent on someone else's response time.",
    "The anxiety you feel is information, not a verdict.",
  ],
  dismissive_avoidant: [
    "Letting someone in doesn't mean losing yourself.",
    "Distance keeps you safe. Closeness is where you grow.",
    "Asking for support isn't weakness — it's a skill you're building.",
  ],
  fearful_avoidant: [
    "Wanting closeness and fearing it at the same time — both can be true.",
    "The push and pull you feel isn't broken. It's a pattern you're learning to change.",
    "Safety in connection is something you can build, even now.",
  ],
  secure_leaning: [
    "Staying grounded while others spiral — that's real emotional work.",
    "Security isn't the absence of anxiety. It's trusting yourself through it.",
    "You've built something real here. Keep tending to it.",
  ],
}

const DEFAULT_QUOTES = [
  "Understanding your patterns is the first step to changing them.",
  "Every session is a data point. You're building a map of yourself.",
  "Showing up, even when it's uncomfortable, is the work.",
]

const REPORT_SESSION_TARGET = 5

// ─── Main ────────────────────────────────────────────────────────────────────

export default function Home() {
  const { profile, refreshProfile, styleColor } = useApp()
  const navigate = useNavigate()
  const sp = styleColor?.primary ?? '#4A6741'

  const [report,               setReport]               = useState(null)
  const [reentryData,          setReentryData]          = useState(null)
  const [showReentry,          setShowReentry]          = useState(false)
  const [showSafetyScreen,     setShowSafetyScreen]     = useState(false)
  const [microReport,          setMicroReport]          = useState(null)
  const [microReportDismissed, setMicroReportDismissed] = useState(false)
  const [plantStage,           setPlantStage]           = useState('seed')
  const [notifications,        setNotifications]        = useState([])
  const [phaseEntry,           setPhaseEntry]           = useState(null)
  const [phaseEntryStyle,      setPhaseEntryStyle]      = useState(null)
  const [lastInsight,          setLastInsight]          = useState(null)
  const [weeklyPulse,          setWeeklyPulse]          = useState(null)
  const [pendingMilestone,     setPendingMilestone]     = useState(null)
  const [regressionMilestone,  setRegressionMilestone]  = useState(null)
  const [plantGrowthStage,     setPlantGrowthStage]     = useState(null)
  const [showContextTip,       setShowContextTip]       = useState(false)
  const [showTour,             setShowTour]             = useState(false)

  // Show the feature tour once on first Home visit after onboarding
  useEffect(() => {
    if (!localStorage.getItem('unclinq_tour_seen')) {
      localStorage.setItem('unclinq_tour_seen', '1')
      // Small delay so the home screen renders before the sheet slides up
      const t = setTimeout(() => setShowTour(true), 600)
      return () => clearTimeout(t)
    }
  }, [])

  // Show the context tip once when user has no context set
  useEffect(() => {
    if (!profile) return
    if (localStorage.getItem('unclinq_context_tip_seen')) return
    const serverCtx = (profile.user_context && typeof profile.user_context === 'object') ? profile.user_context : null
    const stored = (() => { try { return JSON.parse(localStorage.getItem('unclinq_user_context') || 'null') } catch { return null } })()
    const ctx = serverCtx || stored
    const isEmpty = !ctx || (!ctx.people?.length && !ctx.situation?.trim())
    // Only show after at least one Emora session — premature before any conversation
    if (isEmpty && (profile?.session_count ?? 0) >= 1) setShowContextTip(true)
  }, [profile])

  function dismissContextTip() {
    localStorage.setItem('unclinq_context_tip_seen', '1')
    setShowContextTip(false)
  }

  useEffect(() => {
    refreshProfile()
    patternReportAPI.getLatest().then(res => setReport(res.data.report)).catch(() => {})
    notificationsAPI.getAll().then(res => setNotifications(res.data.notifications || [])).catch(() => {})

    week1API.reentry().then(res => {
      const d = res.data
      const newStage = d.plant_stage || 'seed'
      const prevStage = localStorage.getItem('unclinq_plant_stage')
      if (prevStage && prevStage !== newStage) {
        setPlantGrowthStage(newStage)
      }
      localStorage.setItem('unclinq_plant_stage', newStage)
      setPlantStage(newStage)
      if (d.last_session_insight) setLastInsight(d.last_session_insight)
      if (d.show_safety_screen)    { setShowSafetyScreen(true); return }
      if (d.pending_phase_entry)   { setPhaseEntry(d.pending_phase_entry); setPhaseEntryStyle(d.primary_style || null); return }
      if (d.weekly_pulse)          { setWeeklyPulse(d.weekly_pulse); return }
      if (d.show_reentry && d.reentry?.days_away > 0) { setReentryData(d.reentry); setShowReentry(true); return }
      if (d.micro_report)          { setMicroReport(d.micro_report) }
    }).catch(() => {})

    week1API.getPendingMilestone().then(res => {
      const ms = res.data.milestone
      if (!ms) return
      if (ms.milestone_type?.startsWith('regression_')) setRegressionMilestone(ms)
      else setPendingMilestone(ms)
    }).catch(() => {})
  }, [])

  // Dismiss handlers
  function handlePhaseEntryDismiss()  { week1API.dismissPhaseEntry().catch(() => {}); setPhaseEntry(null); setPhaseEntryStyle(null) }
  function handleWeeklyPulseDismiss() { setWeeklyPulse(null) }
  function handleMilestoneDismiss()   { if (pendingMilestone?.id) week1API.dismissMilestone(pendingMilestone.id).catch(() => {}); setPendingMilestone(null) }
  function handleRegressionDismiss()  { if (regressionMilestone?.id) week1API.dismissMilestone(regressionMilestone.id).catch(() => {}); setRegressionMilestone(null) }

  // ── Safety screen ──────────────────────────────────────────────────────────
  if (showSafetyScreen) {
    return (
      <div className="min-h-screen bg-surface flex flex-col px-6 py-12 max-w-lg mx-auto animate-fade-in pb-28">
        <div className="space-y-8">
          <div>
            <p className="label text-state-crisis mb-3">Before you continue</p>
            <h2 className="text-text-primary text-2xl font-light leading-snug">
              If this is an emergency,<br />please call for help first.
            </h2>
          </div>
          <div className="card border-state-crisis/15 space-y-0">
            <div className="pb-4">
              <p className="text-text-primary font-medium text-sm">Emergency</p>
              <p className="text-text-secondary text-sm mt-0.5">112 (India) · 911 (US) · 999 (UK)</p>
            </div>
            <div className="divider" />
            <div className="pt-4 space-y-4">
              <p className="label">Immediate support</p>
              {CRISIS_RESOURCES.map(r => (
                <div key={r.name} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{r.name}</p>
                    <p className="text-text-muted text-xs mt-0.5">{r.region}</p>
                  </div>
                  <a href={r.href} className="text-sm font-medium text-right flex-shrink-0" style={{ color: sp }}>{r.detail}</a>
                </div>
              ))}
            </div>
            <div className="divider mt-4" />
            <p className="text-text-muted text-sm leading-relaxed pt-4">
              Emora is an AI — it can help you understand patterns when you're stable. It can't replace a real person in a real moment.
            </p>
          </div>
          <button onClick={() => setShowSafetyScreen(false)} className="btn-primary w-full">
            I'm safe — take me to the app
          </button>
        </div>
      </div>
    )
  }

  const isActivated = ['activated', 'crisis'].includes(profile?.current_emotional_state)
  const sessionCount = profile?.session_count ?? 0
  const phaseLabel   = profile?.current_phase || profile?.action_stage
  const duration     = formatDuration(profile?.first_session_at)
  const isMaintenance = profile?.current_phase === 'maintenance' || profile?.maintenance_mode

  // Personalized quote
  const styleQuotes = STYLE_QUOTES[profile?.primary_style] || DEFAULT_QUOTES
  const quote = styleQuotes[sessionCount % styleQuotes.length]

  // Report progress
  const reportProgressPct = Math.min(100, Math.round((sessionCount / REPORT_SESSION_TARGET) * 100))
  const sessionsRemaining = Math.max(0, REPORT_SESSION_TARGET - sessionCount)

  // Plant stage label for hero subtitle
  const stageLabelMap = {
    seed:        'Stirring.',
    sprout:      'Taking root.',
    plant:       'The work is working.',
    bloom:       'Opening up.',
    maintenance: 'Grounded.',
  }
  const plantLabel = stageLabelMap[plantStage] || 'Taking root.'

  // Resolved PlantVisual stage (maps backend values to component stages)
  const resolvedPlantStage = PLANT_STAGE_MAP[plantStage] ?? 'seed'

  // Watered micro-moment — set by Emora on nav-away
  const wasJustWatered = sessionStorage.getItem('unclinq_just_watered') === '1'
  useEffect(() => {
    if (wasJustWatered) sessionStorage.removeItem('unclinq_just_watered')
  }, [])


  return (
    <>
      {/* ── Overlays ──────────────────────────────────────────────────────── */}
      {showReentry && reentryData && (
        <ReentryScreen reentryData={reentryData} onDismiss={() => setShowReentry(false)} />
      )}
      {phaseEntry && (
        <PhaseEntryMoment phase={phaseEntry} primaryStyle={phaseEntryStyle} onDismiss={handlePhaseEntryDismiss} />
      )}
      {weeklyPulse && (
        <WeeklyPulse pulseData={weeklyPulse} onDismiss={handleWeeklyPulseDismiss} />
      )}
      {!phaseEntry && !weeklyPulse && pendingMilestone && (
        <MilestoneModal milestone={pendingMilestone} onDismiss={handleMilestoneDismiss} />
      )}
      {!phaseEntry && !weeklyPulse && !pendingMilestone && regressionMilestone && (
        <RegressionModal milestone={regressionMilestone} onDismiss={handleRegressionDismiss} />
      )}
      {!phaseEntry && !weeklyPulse && !pendingMilestone && !regressionMilestone && plantGrowthStage && (
        <PlantGrowthMoment stage={plantGrowthStage} onDismiss={() => setPlantGrowthStage(null)} />
      )}

      {/* ── Feature tour ──────────────────────────────────────────────────── */}
      {showTour && <FeatureTour onDone={() => setShowTour(false)} />}

      {/* ── Maintenance mode ──────────────────────────────────────────────── */}
      {isMaintenance ? (
        <div className="px-5 py-6">
          <MaintenanceModeCard profile={profile} />
        </div>
      ) : (
        <div className="relative w-full flex flex-col font-serif"
          style={{ background: '#F8F1E7', minHeight: '100dvh' }}>

          {/* Paper texture */}
          <div className="fixed inset-0 pointer-events-none z-50"
            style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />


          {/* ── Main scroll area ──────────────────────────────────────────── */}
          <main className="flex-1 flex flex-col overflow-y-auto pb-32">

            {/* ── Notifications / micro-report / context tip (above hero, inline) ─────────── */}
            {(notifications.filter(n => !n._dismissed).length > 0 || (microReport && !microReportDismissed) || showContextTip) && (
              <div className="px-6 pt-6 space-y-3 relative z-30">
                {notifications.filter(n => !n._dismissed).slice(0, 1).map(n => (
                  <InAppNotification key={n.id} notification={n}
                    onDismiss={id => setNotifications(prev => prev.map(x => x.id === id ? { ...x, _dismissed: true } : x))} />
                ))}
                {microReport && !microReportDismissed && (
                  <MicroReport report={microReport} onDismiss={() => setMicroReportDismissed(true)} />
                )}
                {showContextTip && (
                  <div
                    onClick={() => { dismissContextTip(); navigate('/settings') }}
                    className="flex items-center justify-between gap-3 px-4 py-3.5 border bg-surface-card cursor-pointer transition-all animate-fade-in"
                    style={{ borderRadius: '24px 20px 28px 22px', borderColor: `${sp}26` }}
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && (dismissContextTip(), navigate('/settings'))}
                  >
                    <p className="text-text-secondary text-sm leading-relaxed flex-1">
                      Help Emora know who's in your life — conversations get more personal.
                    </p>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="text-xs font-semibold" style={{ color: sp }}>Add context →</span>
                      <button
                        onClick={e => { e.stopPropagation(); dismissContextTip() }}
                        className="text-text-muted hover:text-text-secondary text-lg leading-none"
                        aria-label="Dismiss"
                      >×</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Hero section ──────────────────────────────────────────────── */}
            <section className="relative flex flex-col items-center justify-center pt-16 px-6 overflow-hidden"
              style={{ minHeight: '45vh' }}>
              {/* Hero radial gradient */}
              <div className="absolute inset-0 pointer-events-none"
                style={{ background: 'radial-gradient(circle at center, rgba(224,141,116,0.15) 0%, rgba(248,241,231,0) 70%)', zIndex: -1 }} />
              {/* Organic blobs */}
              <div className="absolute top-20 left-10 w-32 h-32 pointer-events-none"
                style={{ background: 'rgba(143,151,121,0.05)', borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%', filter: 'blur(24px)', zIndex: -1 }} />
              <div className="absolute bottom-10 right-10 w-48 h-48 pointer-events-none"
                style={{ background: 'rgba(192,108,84,0.05)', borderRadius: '60% 40% 70% 30% / 40% 50% 60% 50%', filter: 'blur(32px)', zIndex: -1 }} />

              {/* Greeting */}
              <div className="text-center mb-8 relative z-20">
                <h1 className="font-serif tracking-tight mb-1"
                  style={{ fontSize: '2.25rem', fontWeight: 500, color: '#5D4037' }}>
                  {getGreeting(profile?.name)}
                </h1>
                <p className="text-sm font-sans font-medium flex items-center justify-center gap-2"
                  style={{ color: '#8D6E63' }}>
                  <span className="w-1 h-1 rounded-full" style={{ background: '#8F9779' }} />
                  {plantLabel}
                  <span className="w-1 h-1 rounded-full" style={{ background: '#8F9779' }} />
                </p>
              </div>

              {/* Plant visual */}
              <div
                className="relative flex justify-center items-end transition-transform duration-700"
                style={{
                  color: sp,
                  filter: `drop-shadow(0 10px 24px ${styleColor?.glow ?? 'rgba(192,108,84,0.25)'})`,
                  ...(wasJustWatered ? { animation: 'water-drop 1.5s ease-out' } : {}),
                }}
              >
                <PlantVisual
                  stage={resolvedPlantStage}
                  tinted
                  className="w-44 h-60"
                />
              </div>
            </section>

            {/* ── Action card — overlaps hero ────────────────────────────────── */}
            <section className="px-6 relative z-30" style={{ marginTop: '-1rem' }}>
              {isActivated ? (
                /* Rescue-focused card */
                <Link to="/rescue" className="block p-6 border overflow-hidden relative transition-all active:scale-[0.98]"
                  style={{ borderRadius: '24px 20px 28px 22px', background: 'linear-gradient(145deg, #3E3632 0%, #2C2420 100%)', borderColor: 'rgba(255,107,107,0.2)', boxShadow: '0 4px 12px -2px rgba(93,64,55,0.2)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none"
                    style={{ background: 'rgba(255,107,107,0.08)' }} />
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase font-sans"
                      style={{ background: 'rgba(255,107,107,0.15)', color: '#FF6B6B' }}>
                      {profile?.current_emotional_state === 'crisis' ? 'Crisis Support' : 'Rescue Mode'}
                    </span>
                    <Wind size={20} style={{ color: '#FF6B6B' }} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-serif leading-tight mb-2" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#FFF9F0' }}>
                    Let's ground<br />you first.
                  </h3>
                  <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,249,240,0.7)', maxWidth: '85%' }}>
                    You seem activated. Rescue Mode will help regulate before anything else.
                  </p>
                  <div className="w-full font-sans font-bold text-sm py-4 flex items-center justify-center gap-2"
                    style={{ borderRadius: '16px 4px 16px 4px', background: 'rgba(255,107,107,0.2)', color: '#FF6B6B' }}>
                    Open Rescue Mode
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </div>
                </Link>
              ) : (
                /* Normal action card */
                <div className="p-6 border overflow-hidden relative"
                  style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
                  <div className="absolute top-0 right-0 w-32 h-32 rounded-bl-full pointer-events-none"
                    style={{ background: 'rgba(192,108,84,0.05)' }} />
                  <div className="flex items-start justify-between mb-4">
                    <span className="px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase font-sans"
                      style={{ background: 'rgba(255,127,80,0.12)', color: '#FF7F50' }}>
                      Current Practice
                    </span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" style={{ color: sp, opacity: 0.8 }}>
                      <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20C19 20 22 3 22 3c-1 2-8 2-9 2Z"/>
                    </svg>
                  </div>
                  <h3 className="font-serif leading-tight mb-2" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#5D4037' }}>
                    {sessionCount > 0 ? 'The plant is still here.' : 'You\'ve started something.'}
                  </h3>
                  <p className="font-sans text-sm leading-relaxed mb-6" style={{ color: '#8D6E63', maxWidth: '85%' }}>
                    {sessionCount > 0
                      ? getContextLine(sessionCount, false, duration) ?? 'Every session is water.'
                      : profile?.onboarding_completed
                        ? 'Emora is ready. Your first real conversation starts here.'
                        : 'A brief conversation to understand where you\'re starting from.'}
                  </p>
                  <Link to="/emora"
                    className="w-full font-sans font-bold text-sm py-4 flex items-center justify-center gap-2 transition-colors active:scale-95"
                    style={{ borderRadius: '16px 4px 16px 4px', background: sp, color: 'white', boxShadow: `0 4px 16px ${styleColor?.glow ?? 'rgba(192,108,84,0.3)'}`, display: 'flex' }}>
                    {sessionCount > 0 ? 'Water it — open Emora' : 'Start with Emora'}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                </div>
              )}
            </section>

            {/* ── Cards: arc · quote · progress/report ──────────────────────── */}
            <section className="px-6 mt-5 pb-10 space-y-3">

              {/* Emotional arc */}
              {report?.emotional_arc && report.emotional_arc.length > 0 && (
                <div className="px-5 py-4 border flex items-center gap-4"
                  style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
                  {report.emotional_arc.map((entry, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <EmotionFace state={stateToFace(entry.state)} size={26} />
                      <span className="font-sans" style={{ fontSize: '9px', color: '#C0A898', fontWeight: 500 }}>
                        {entry.label.replace(/[A-Za-z]+ /, '')}
                      </span>
                    </div>
                  ))}
                  <button onClick={() => navigate('/report')}
                    className="ml-auto font-sans font-semibold flex-shrink-0"
                    style={{ fontSize: '11px', color: sp }}>
                    Report →
                  </button>
                </div>
              )}

              {/* Quote */}
              <div className="px-5 py-4 border"
                style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
                <p className="font-serif italic leading-relaxed"
                  style={{ fontSize: '14px', color: '#7A6259', fontWeight: 400 }}>
                  "{quote}"
                </p>
              </div>

              {/* Last session insight — shown quietly as a reminder of what surfaced */}
              {lastInsight?.key_insight && !report && (
                <div className="px-5 py-4 border"
                  style={{ borderRadius: '24px 20px 28px 22px', background: 'rgba(255,249,240,0.6)', border: '1px solid rgba(192,108,84,0.08)' }}>
                  <p className="font-sans font-bold uppercase tracking-widest mb-2"
                    style={{ fontSize: '10px', color: '#A89488' }}>
                    From your last session
                  </p>
                  <p className="font-serif italic leading-relaxed"
                    style={{ fontSize: '13px', color: '#7A6259', fontWeight: 400 }}>
                    "{lastInsight.key_insight}"
                  </p>
                </div>
              )}

              {/* Progress to first report */}
              {!report && (
                <div className="px-5 py-4 border"
                  style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-sans font-bold uppercase tracking-widest"
                      style={{ fontSize: '10px', color: '#A89488' }}>Pattern Report</p>
                    <span className="font-sans font-semibold" style={{ fontSize: '11px', color: sp }}>
                      {sessionCount} / {REPORT_SESSION_TARGET}
                    </span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden"
                    style={{ background: 'rgba(143,151,121,0.2)' }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${reportProgressPct}%`, background: sp }} />
                  </div>
                  {sessionsRemaining > 0 && (
                    <p className="font-sans mt-2.5" style={{ fontSize: '11px', color: '#A89488' }}>
                      {sessionsRemaining} more session{sessionsRemaining !== 1 ? 's' : ''} to unlock
                    </p>
                  )}
                </div>
              )}

              {/* Pattern Report once available */}
              {report && (
                <div className="px-5 py-4 border cursor-pointer active:scale-[0.99] transition-transform"
                  onClick={() => navigate('/report')}
                  style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
                  <div className="flex items-center justify-between mb-2.5">
                    <p className="font-sans font-bold uppercase tracking-widest"
                      style={{ fontSize: '10px', color: '#A89488' }}>Pattern Report</p>
                    <p className="font-sans" style={{ fontSize: '10px', color: '#C0A898' }}>
                      {new Date(report.generated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  {(report.key_insight || report.closing_question) && (
                    <p className="font-serif italic leading-relaxed mb-2.5"
                      style={{ fontSize: '13px', color: '#7A6259' }}>
                      "{report.key_insight || report.closing_question}"
                    </p>
                  )}
                  <p className="font-sans font-semibold" style={{ fontSize: '11px', color: sp }}>
                    View report →
                  </p>
                </div>
              )}

            </section>

          </main>
        </div>
      )}
    </>
  )
}
