import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { actionLabAPI } from '../services/api'
import { Clock, Info } from 'lucide-react'
import { ActionEmptyIllustration } from '../components/Illustrations'
import { useApp } from '../context/AppContext'

const TIER_LABELS = { 1: 'Awareness', 2: 'Interruption', 3: 'Replacement' }

// Paper grain texture
const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`

export default function ActionLab() {
  const navigate = useNavigate()
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  const [state, setState] = useState('loading') // loading | idle | action | deferred | done | feedback | error
  const [action, setAction] = useState(null)
  const [historyId, setHistoryId] = useState(null)
  const [deferMessage, setDeferMessage] = useState('')
  const [deferNextAt, setDeferNextAt] = useState(null) // ISO string or null
  const [ack, setAck] = useState('')
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [historyLoadError, setHistoryLoadError] = useState(false)
  const [markedHard, setMarkedHard] = useState(false)
  const [postRescue, setPostRescue] = useState(false)
  const [effectivenessRated, setEffectivenessRated] = useState(false)
  const [cardExpanded, setCardExpanded] = useState(false)
  const [expandedHistoryKey, setExpandedHistoryKey] = useState(null)

  // Tier stage descriptions — shown in expanded card as motivational context
  const TIER_CONTEXT = {
    1: "This is a noticing practice. You’re not changing anything yet — just watching.",
    2: "This is a pause practice. You’re creating a gap before the old pattern runs.",
    3: "This is a replacement practice. You’re rehearsing the new thing in real life.",
  }

  useEffect(() => {
    loadNext()
    // History loaded inside loadNext() once we know the user has an action — no eagerly wasted call
  }, [])

  async function loadNext() {
    setState('loading')
    setMarkedHard(false)
    setCardExpanded(false)
    try {
      const res = await actionLabAPI.getNext()
      if (res.data.defer) {
        setDeferMessage(res.data.message || '')
        // Accept any common shape the backend might send
        const nextAt =
          res.data.next_available_at ||
          (res.data.available_in_hours != null
            ? new Date(Date.now() + res.data.available_in_hours * 3600000).toISOString()
            : res.data.available_in_minutes != null
              ? new Date(Date.now() + res.data.available_in_minutes * 60000).toISOString()
              : null)
        setDeferNextAt(nextAt)
        setState('deferred')
      } else if (!res.data.action) {
        setState('idle')
      } else {
        setAction(res.data.action)
        setHistoryId(res.data.history_id)
        setPostRescue(!!res.data.post_rescue)
        setState('action')
        // Load history now that we know the user has an active action (for the Trellis timeline)
        loadHistory()
      }
    } catch {
      setState('error')
    }
  }

  async function handleComplete() {
    if (!historyId) return
    const acknowledgment = action?.completion_acknowledgment || action?.completion_ack || ''
    setAck(acknowledgment)
    setState('feedback')
    actionLabAPI.complete(historyId).catch(() => {})
  }

  async function handleEffectiveness(rating) {
    setEffectivenessRated(true)
    await actionLabAPI.effectiveness(historyId, rating).catch(() => {})
    setState('done')
  }

  async function handleSkip() {
    if (!historyId) return
    await actionLabAPI.skip(historyId).catch(() => {})
    loadNext()
  }

  async function handleMarkHard() {
    if (!historyId || markedHard) return
    await actionLabAPI.markHard(historyId).catch(() => {})
    setMarkedHard(true)
    setTimeout(() => setMarkedHard(false), 2500)
  }

  async function loadHistory() {
    setHistoryLoadError(false)
    try {
      const res = await actionLabAPI.history()
      setHistory(res.data.history || [])
    } catch {
      setHistoryLoadError(true)
    }
  }

  // ─── Loading ──────────────────────────────────────────────────────────────
  if (state === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${sp}4D`, borderTopColor: sp }} />
        <p className="text-text-muted text-sm">Finding the right one...</p>
      </div>
    )
  }

  // ─── Error ────────────────────────────────────────────────────────────────
  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 px-8 text-center animate-fade-in">
        <p className="text-text-secondary text-sm">Couldn't reach the server. Your action is waiting — try again when you're connected.</p>
        <button onClick={loadNext} className="btn-ghost text-sm">Try again</button>
      </div>
    )
  }

  // ─── Feedback ─────────────────────────────────────────────────────────────
  if (state === 'feedback') {
    const RATINGS = [
      { rating: 'helped',     label: 'It helped',     sub: 'Something actually shifted.' },
      { rating: 'somewhat',   label: 'Somewhat',       sub: "Not sure yet — still processing." },
      { rating: 'not_really', label: 'Not this time',  sub: "It didn't land. That's useful too." },
    ]
    return (
      <div className="relative min-h-dvh animate-spring-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        <div className="relative z-10 px-6 pt-12 pb-10 flex flex-col gap-6">

          {/* Completion moment */}
          <div className="flex flex-col items-center gap-3 pt-4 pb-2">
            <div className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(78,122,58,0.12)', border: '1px solid rgba(78,122,58,0.22)' }}>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="#4E7A3A" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <p className="font-serif text-center" style={{ fontSize: '1.35rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.02em' }}>
              You did the thing.
            </p>
          </div>

          {/* What they completed */}
          {action?.text && (
            <div className="px-5 py-4"
              style={{ background: 'rgba(255,249,240,0.7)', borderRadius: '20px 4px 20px 4px', border: '1px solid rgba(192,108,84,0.1)' }}>
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#A89488', textTransform: 'uppercase', marginBottom: '6px' }}>
                What you did
              </p>
              <p className="font-serif leading-snug" style={{ fontSize: '1rem', color: '#2C332B' }}>
                {action.text}
              </p>
            </div>
          )}

          {/* Insight reveal — shown only when there's an ack */}
          {ack && (
            <div className="relative overflow-hidden px-5 py-5"
              style={{ background: 'white', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.18)' }}>
              <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
                style={{ background: `${sp}08`, filter: 'blur(20px)' }} />
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '10px' }}>
                Why it works
              </p>
              <p className="font-serif italic leading-relaxed relative z-10" style={{ fontSize: '1rem', color: '#5D4037', lineHeight: 1.65 }}>
                "{ack}"
              </p>
            </div>
          )}

          {/* Feedback question */}
          <div className="space-y-3">
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#8C9688', textTransform: 'uppercase' }}>
              How did it land?
            </p>
            <div className="space-y-2">
              {RATINGS.map(({ rating, label, sub }) => (
                <button
                  key={rating}
                  onClick={() => handleEffectiveness(rating)}
                  className="w-full text-left px-5 py-4 transition-all active:scale-[0.98]"
                  style={{ background: 'white', borderRadius: '16px 4px 16px 4px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 2px 8px -2px rgba(143,169,181,0.12)' }}
                >
                  <p className="font-sans font-semibold text-sm" style={{ color: '#2C332B' }}>{label}</p>
                  <p style={{ fontSize: '12px', color: '#A89488', marginTop: '2px' }}>{sub}</p>
                </button>
              ))}
            </div>
          </div>

        </div>
      </div>
    )
  }

  // ─── Deferred ─────────────────────────────────────────────────────────────
  if (state === 'deferred') {
    const availableLabel = formatDeferTime(deferNextAt)
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center animate-fade-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        <div className="relative z-10 px-6 w-full space-y-5">
          {/* Dark card */}
          <div className="relative overflow-hidden"
            style={{ background: '#2C332B', borderRadius: '24px 20px 28px 22px', padding: '2rem 1.5rem' }}>
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'rgba(74,103,65,0.3)', filter: 'blur(40px)' }} />

            <div className="relative z-10 space-y-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: 'rgba(212,163,85,0.18)', border: '1px solid rgba(212,163,85,0.3)' }}>
                <Clock size={20} strokeWidth={1.5} style={{ color: '#D4A355' }} />
              </div>

              <p className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#FFF9F0', letterSpacing: '-0.02em', lineHeight: 1.25 }}>
                You've done enough today.
              </p>
              <p style={{ fontSize: '14px', color: 'rgba(255,249,240,0.6)', lineHeight: 1.6 }}>
                {deferMessage || "One action a day. That's the rule — not because it's easy, but because it sticks."}
              </p>
              {availableLabel && (
                <p style={{ fontSize: '11px', color: 'rgba(255,249,240,0.65)', fontWeight: 600 }}>
                  {availableLabel}
                </p>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="btn-ghost w-full"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  // ─── Done ─────────────────────────────────────────────────────────────────
  if (state === 'done') {
    return (
      <div className="relative min-h-[70vh] flex flex-col items-center justify-center animate-spring-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        <div className="relative z-10 px-6 w-full space-y-4">
          {ack && (
            <div className="relative overflow-hidden"
              style={{ background: '#2C332B', borderRadius: '24px 20px 28px 22px', padding: '1.5rem' }}>
              <p className="font-serif italic" style={{ fontSize: '1rem', color: 'rgba(255,249,240,0.85)', lineHeight: 1.6 }}>
                "{ack}"
              </p>
            </div>
          )}

          <button onClick={loadNext}
            className="w-full text-left p-5 transition-all active:scale-[0.98]"
            style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 4px 16px rgba(44,51,43,0.1)', border: '1px solid rgba(143,151,121,0.2)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: sp, textTransform: 'uppercase', marginBottom: '4px' }}>
              Trellis
            </p>
            <p className="font-serif" style={{ fontSize: '1.1rem', color: '#2C332B', fontWeight: 500 }}>
              See next action
            </p>
          </button>

          <button
            onClick={() => navigate('/emora', { state: { preDraft: `I just tried something. "${action?.text}" — ` } })}
            className="w-full text-left p-5 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,249,240,0.8)', borderRadius: '16px 4px 16px 4px', border: '1px solid rgba(192,108,84,0.12)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '4px' }}>
              Emora
            </p>
            <p className="font-serif" style={{ fontSize: '1.1rem', color: '#2C332B', fontWeight: 500 }}>
              Reflect on this with Emora
            </p>
          </button>

          <button
            onClick={() => navigate('/home')}
            className="btn-ghost w-full"
          >
            ← Back to home
          </button>
        </div>
      </div>
    )
  }

  // ─── Active Action ────────────────────────────────────────────────────────
  if (state === 'action' && action) {
    const completedItems = history.filter(h => h.completed_at || h.skipped_at)
    const dayNumber = completedItems.length + 1

    return (
      <div className="relative min-h-dvh animate-fade-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="relative z-10 pt-10 px-6 pb-5 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: sp }} />
              <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#8C9688', textTransform: 'uppercase' }}>
                Day {dayNumber} · Trellis
              </p>
            </div>
            <h1 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.02em' }}>
              Today's practice
            </h1>
          </div>

          {/* Journey toggle — only when there's history to show */}
          {completedItems.length > 0 && (
            <button
              onClick={() => setShowHistory(v => !v)}
              className="flex items-center gap-1 transition-all"
              style={{
                fontSize: '11px', fontWeight: 600,
                color: showHistory ? sp : '#8C9688',
                padding: '6px 12px',
                borderRadius: '20px',
                border: `1px solid ${showHistory ? sp + '35' : 'rgba(143,151,121,0.2)'}`,
                background: showHistory ? `${sp}0D` : 'transparent',
              }}>
              Journey
              <svg style={{ width: '11px', height: '11px', transition: 'transform 0.2s', transform: showHistory ? 'rotate(180deg)' : 'rotate(0)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
              </svg>
            </button>
          )}
        </header>

        {/* ── Post-rescue notice ── */}
        {postRescue && (
          <div className="mx-6 mb-4 flex items-start gap-3 px-4 py-3 rounded-2xl border relative z-10"
            style={{ background: 'rgba(192,108,84,0.05)', borderColor: 'rgba(192,108,84,0.15)' }}>
            <Info size={15} strokeWidth={1.5} style={{ color: sp, flexShrink: 0, marginTop: '1px' }} />
            <p className="text-text-secondary text-sm leading-relaxed">
              Intentionally gentle — you just came out of Rescue Mode.
            </p>
          </div>
        )}

        {/* ── Journey drawer (collapsible, expandable items) ── */}
        {showHistory && completedItems.length > 0 && (
          <div className="relative z-10 px-6 mb-5 space-y-2 animate-fade-in">
            {historyLoadError && (
              <p className="text-text-muted text-xs pl-1 pb-1">Couldn't load full history — may be incomplete.</p>
            )}
            {completedItems.slice(-5).map((h, i, arr) => {
              const dayIdx = completedItems.length - arr.length + i + 1
              const done = !!h.completed_at
              const key = h.served_at || i
              const isExpanded = expandedHistoryKey === key
              const date = h.served_at
                ? new Date(h.served_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                : null

              return (
                <div key={key}
                  className="overflow-hidden transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.55)',
                    borderRadius: '16px 4px 16px 4px',
                    border: `1px solid ${isExpanded ? 'rgba(143,151,121,0.25)' : 'rgba(143,151,121,0.12)'}`,
                    opacity: isExpanded ? 1 : 0.72,
                  }}>

                  {/* Row — always visible, tap to expand */}
                  <button
                    onClick={() => setExpandedHistoryKey(isExpanded ? null : key)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-left"
                  >
                    <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: done ? `${sp}14` : 'rgba(200,184,168,0.2)' }}>
                      {done ? (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke={sp} strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                        </svg>
                      ) : (
                        <svg width="11" height="11" fill="none" viewBox="0 0 24 24" stroke="#C8B8A8" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <p className="font-serif text-sm leading-tight text-text-primary flex-1 min-w-0 truncate">
                      {h.action_text?.substring(0, 48)}{h.action_text?.length > 48 ? '…' : ''}
                    </p>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span style={{ fontSize: '10px', color: '#A89488', fontWeight: 600 }}>Day {dayIdx}</span>
                      <svg style={{ width: '12px', height: '12px', color: '#A89488', transition: 'transform 0.2s', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)' }}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                      </svg>
                    </div>
                  </button>

                  {/* Expanded detail */}
                  {isExpanded && (
                    <div className="px-3 pb-3 animate-fade-in"
                      style={{ borderTop: '1px solid rgba(143,151,121,0.08)' }}>
                      <div className="mt-2 p-4 space-y-4"
                        style={{ background: 'rgba(255,249,240,0.7)', borderRadius: '12px 4px 12px 4px' }}>

                        {/* Full action text — no truncation */}
                        <p className="font-serif leading-relaxed" style={{ fontSize: '1rem', color: '#2C332B', lineHeight: 1.55 }}>
                          {h.action_text}
                        </p>

                        {/* Status + date + rating */}
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="px-2.5 py-1 rounded-full font-bold"
                            style={{
                              fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase',
                              background: done ? 'rgba(78,122,58,0.12)' : 'rgba(200,184,168,0.2)',
                              color: done ? '#4E7A3A' : '#A89488',
                            }}>
                            {done ? 'Completed' : 'Skipped'}
                          </span>
                          {date && (
                            <span style={{ fontSize: '11px', color: '#A89488', fontWeight: 500 }}>{date}</span>
                          )}
                          {h.effectiveness_rating && (
                            <>
                              <span style={{ fontSize: '11px', color: '#C8B8A8' }}>·</span>
                              <span style={{ fontSize: '11px', color: '#8C9688', fontWeight: 500 }}>
                                {h.effectiveness_rating === 'helped' ? 'Helped'
                                  : h.effectiveness_rating === 'somewhat' ? 'Somewhat'
                                  : 'Not really'}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Main action card ── */}
        <main className="relative z-10 px-6 pb-32">
          <div className="relative overflow-hidden transition-all duration-300"
            style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 8px 30px -8px rgba(143,169,181,0.25)', border: '1px solid rgba(143,151,121,0.2)' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: `${sp}0A`, filter: 'blur(32px)' }} />

            <div className="p-6 space-y-5">
              {/* Tier + category — always visible */}
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full font-bold border"
                  style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', background: styleColor?.light ?? 'rgba(192,108,84,0.1)', color: sp, borderColor: styleColor?.border ?? 'rgba(192,108,84,0.2)' }}>
                  {TIER_LABELS[action.tier]}
                </span>
                {action.category && (
                  <span style={{ fontSize: '10px', fontWeight: 500, color: '#A89488' }}>
                    {action.category.replace(/_/g, ' ')}
                  </span>
                )}
              </div>

              {/* Action text — always visible, the hero */}
              <h2 className="font-serif" style={{ fontSize: '1.5rem', color: '#2C332B', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
                {action.text}
              </h2>

              {!cardExpanded ? (
                /* ── Collapsed: single CTA to expand ── */
                <button
                  onClick={() => setCardExpanded(true)}
                  className="w-full font-sans font-semibold text-sm py-3.5 px-4 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{ background: `${sp}12`, color: sp, borderRadius: '16px 4px 16px 4px', border: `1px solid ${sp}30` }}>
                  Start taking action
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                  </svg>
                </button>
              ) : (
                /* ── Expanded: context + completion CTA ── */
                <div className="space-y-5 animate-fade-in">
                  {/* brief_why — inline, no toggle needed once expanded */}
                  {action.brief_why && (
                    <p className="text-sm leading-relaxed pl-3 border-l-2"
                      style={{ color: '#8C9688', borderColor: `${sp}40`, lineHeight: 1.65 }}>
                      {action.brief_why}
                    </p>
                  )}

                  {/* Tier stage context — only when it adds meaning */}
                  {TIER_CONTEXT[action.tier] && (
                    <p style={{ fontSize: '11px', color: '#B8A89A', lineHeight: 1.5 }}>
                      {TIER_CONTEXT[action.tier]}
                    </p>
                  )}

                  {/* Completion CTA */}
                  <button onClick={handleComplete}
                    className="btn-primary w-full flex items-center justify-center gap-2">
                    Water this thought
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="rgba(255,249,240,0.85)">
                      <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12c0-2.76 1.12-5.26 2.93-7.07L12 2Z"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Secondary actions — only visible once expanded */}
          {cardExpanded && (
            <div className="flex gap-3 mt-4 animate-fade-in">
              <button onClick={handleMarkHard} disabled={markedHard}
                className={`btn-secondary flex-1 text-sm ${markedHard ? 'opacity-60' : ''}`}>
                {markedHard ? 'Noted' : 'This is hard'}
              </button>
              <button onClick={handleSkip} className="btn-ghost flex-1 text-sm">Not today</button>
            </div>
          )}
        </main>

      </div>
    )
  }

  // ─── Idle ─────────────────────────────────────────────────────────────────
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center animate-fade-in" style={{ background: '#F8F1E7' }}>
      <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

      <div className="relative z-10 px-6 w-full space-y-5">
        {/* Idle card */}
        <div className="relative overflow-hidden text-center"
          style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 8px 30px -8px rgba(143,169,181,0.2)', border: '1px solid rgba(143,151,121,0.15)', padding: '2.5rem 1.5rem' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `${sp}07`, filter: 'blur(32px)' }} />

          <div className="relative z-10 space-y-4">
            <div className="flex justify-center mb-2">
              <ActionEmptyIllustration className="w-28 h-28" />
            </div>
            <p className="font-serif" style={{ fontSize: '1.35rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.02em' }}>
              Nothing yet.
            </p>
            <p className="text-text-secondary text-sm leading-relaxed max-w-[240px] mx-auto">
              Actions are matched to what you're working through. Emora needs to hear it first.
            </p>
          </div>
        </div>

        <button onClick={() => navigate('/emora')}
          className="w-full text-left p-5 transition-all active:scale-[0.98]"
          style={{ background: 'rgba(255,249,240,0.8)', borderRadius: '16px 4px 16px 4px', border: '1px solid rgba(192,108,84,0.12)' }}>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '4px' }}>
            Emora
          </p>
          <p className="font-serif" style={{ fontSize: '1.1rem', color: '#2C332B', fontWeight: 500 }}>
            Start a session
          </p>
        </button>

        <div className="flex gap-2 justify-center">
          <button onClick={loadNext} className="btn-ghost">Check again</button>
          <button onClick={() => navigate('/home')} className="btn-ghost">← Back to home</button>
        </div>
      </div>
    </div>
  )
}

// Converts a next_available_at ISO string into a human-readable label
function formatDeferTime(isoString) {
  if (!isoString) return null
  const now  = Date.now()
  const then = new Date(isoString).getTime()
  const diffMs = then - now
  if (diffMs <= 0) return null // already past — don't show

  const diffMins  = Math.ceil(diffMs / 60000)
  const diffHours = Math.ceil(diffMs / 3600000)

  if (diffMins < 60) return `Available in ${diffMins} minute${diffMins === 1 ? '' : 's'}`

  const thenDate  = new Date(then)
  const todayDate = new Date()
  const isToday   = thenDate.toDateString() === todayDate.toDateString()
  const tomorrow  = new Date(todayDate); tomorrow.setDate(todayDate.getDate() + 1)
  const isTomorrow = thenDate.toDateString() === tomorrow.toDateString()

  const timeStr = thenDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })

  if (isToday)    return `Available today at ${timeStr}`
  if (isTomorrow) return `Available tomorrow at ${timeStr}`
  return `Available in ${diffHours} hours`
}
