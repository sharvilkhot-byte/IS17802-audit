import { useState, useEffect, useRef, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { emoraAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import { CRISIS_RESOURCES } from '../constants/crisis'

function sessionCacheKey(userId) {
  return `emora_session_cache_${userId || 'anon'}`
}

function cacheMessages(messages, userId) {
  try { localStorage.setItem(sessionCacheKey(userId), JSON.stringify(messages)) } catch {}
}

function getCachedMessages(userId) {
  try { return JSON.parse(localStorage.getItem(sessionCacheKey(userId)) || 'null') } catch { return null }
}

function clearCachedMessages(userId) {
  try { localStorage.removeItem(sessionCacheKey(userId)) } catch {}
}

// Fire session-end reliably on page hide (mobile tab switch, home button, etc.)
// keepalive ensures the request survives even if the page is being unloaded
function fireSessionEnd() {
  const token = localStorage.getItem('unclinq_token')
  if (!token) return
  const base = import.meta.env.VITE_API_URL || '/api'
  try {
    fetch(`${base}/emora/session-end`, {
      method: 'POST',
      keepalive: true,
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
  } catch {}
}

// E-06: Conversation starters — incomplete sentences that lower activation energy
// Personalized by attachment style and detected patterns; fallback to universal set.

const STARTERS_BY_STYLE = {
  anxious: [
    "I've been waiting to hear back and it's messing with me.",
    "I can't tell if I'm overreacting or if this is real.",
    "I need reassurance and I hate that I need it.",
    "I sent something and now I'm spiraling about it.",
    "I'm reading into something and I can't stop.",
    "Someone was inconsistent with me and I'm not okay.",
  ],
  dismissive_avoidant: [
    "I notice I'm avoiding something.",
    "Someone got close and I don't know what to do with that.",
    "I pulled back again. I'm trying to understand why.",
    "I feel crowded and I don't want to feel crowded.",
    "Something about this closeness makes me want to leave.",
    "I keep choosing distance without fully meaning to.",
  ],
  fearful_avoidant: [
    "I wanted connection and then panicked when I got it.",
    "I pushed someone away and I'm not sure I wanted to.",
    "Something in me goes cold and I can't explain it.",
    "I went back and forth on something and I don't know which way I actually feel.",
    "I want this but I'm also terrified of it.",
    "I self-sabotaged something and I want to understand it.",
  ],
  secure_leaning: [
    "I had a moment I want to process.",
    "I'm trying to figure out if what I'm feeling is proportionate.",
    "Something came up in a relationship I want to think through.",
    "I handled something well and I want to understand why.",
  ],
}

const STARTERS_UNIVERSAL = [
  "Something happened today.",
  "I've been thinking about...",
  "I did something I want to understand.",
  "I'm in my head about someone.",
  "I notice I keep...",
  "Something felt off this week.",
  "I want to talk about something I haven't said out loud.",
  "I reacted in a way I don't fully understand.",
]

const CHECKIN_MOODS = [
  { value: 'worse',     label: 'Worse',     bg: 'rgba(220,57,57,0.08)',   border: 'rgba(220,57,57,0.3)',    color: '#DC3939' },
  { value: 'unsettled', label: 'Unsettled', bg: 'rgba(192,108,84,0.1)',   border: 'rgba(192,108,84,0.3)',   color: '#C06C54' },
  { value: 'same',      label: 'Same',      bg: 'rgba(143,151,121,0.1)',  border: 'rgba(143,151,121,0.3)',  color: '#8C9688' },
  { value: 'lighter',   label: 'Lighter',   bg: 'rgba(143,151,121,0.15)', border: 'rgba(143,151,121,0.4)', color: '#5A7A50' },
  { value: 'grounded',  label: 'Grounded',  bg: 'rgba(78,122,58,0.1)',    border: 'rgba(78,122,58,0.3)',    color: '#4E7A3A' },
]

const FIRST_MESSAGES = {
  anxious:             "I'm here. There's no wrong thing to say.",
  dismissive_avoidant: "I'm here. You don't have to have it figured out.",
  fearful_avoidant:    "I'm here. Start anywhere.",
  secure_leaning:      "I'm here. What's on your mind?",
}

const RESCUE_BRIDGE_MESSAGE = "You came back. That took something. What's sitting with you now?"

function getAttunementLine(style) {
  const lines = {
    anxious: "There's no wrong thing to say.",
    dismissive_avoidant: "You don't have to have it figured out.",
    fearful_avoidant: "Start anywhere.",
    secure_leaning: "What's on your mind?",
  }
  return lines[style] || "Start wherever you are."
}

function getStartersForSession(openCount = 0, profile = null) {
  const style = profile?.primary_style
  const pool = style && STARTERS_BY_STYLE[style]
    ? [...STARTERS_BY_STYLE[style], ...STARTERS_UNIVERSAL]
    : STARTERS_UNIVERSAL

  const offset = (openCount * 3) % pool.length
  // Wrap around if slice overshoots
  const sliced = pool.slice(offset, offset + 3)
  if (sliced.length < 3) {
    return [...sliced, ...pool.slice(0, 3 - sliced.length)]
  }
  return sliced
}

export default function Emora() {
  const location = useLocation()
  const navigate = useNavigate()
  const { profile, styleColor, user } = useApp()
  const userId = user?.id
  const sp = styleColor?.primary ?? '#4A6741'

  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [crisis, setCrisis] = useState(false)
  const [rescueOffer, setRescueOffer] = useState(false)   // E-06: proactive rescue offer
  const [showAttunement, setShowAttunement] = useState(false)
  const [showPastSessions, setShowPastSessions] = useState(false)
  const [pastSessions, setPastSessions] = useState(null) // null = not loaded yet
  const [pastSessionsLoading, setPastSessionsLoading] = useState(false)
  const [checkIn, setCheckIn]         = useState(false)
  const [checkInMood, setCheckInMood] = useState(null)
  const [checkInNote, setCheckInNote] = useState('')
  const sessionStartRef = useRef(Date.now())
  // Prevents double session-end when finishSession fires then component unmounts
  const sessionEndedRef = useRef(false)
  const [sessionOpenCount] = useState(() =>
    parseInt(localStorage.getItem('emora_open_count') || '0')
  )
  const messagesEndRef = useRef(null)
  const messagesContainerRef = useRef(null)
  const textareaRef = useRef(null)
  const userJustSentRef = useRef(false)

  const starters = getStartersForSession(sessionOpenCount, profile)

  // Load existing session on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    // Track open count for rotating starters
    const count = parseInt(localStorage.getItem('emora_open_count') || '0')
    localStorage.setItem('emora_open_count', String(count + 1))

    emoraAPI.currentSession()
      .then(res => {
        if (res.data.messages?.length > 0) {
          setMessages(res.data.messages)
          setCrisis(res.data.crisis_flagged)
          cacheMessages(res.data.messages, userId)
        } else {
          // #9: Fall back to localStorage cache if server session is empty (e.g. Redis miss)
          const cached = getCachedMessages(userId)
          if (cached?.length > 1) {
            setMessages(cached)
          } else {
            const fromRescue = location.state?.fromRescue
            const firstMsg = fromRescue
              ? RESCUE_BRIDGE_MESSAGE
              : (FIRST_MESSAGES[profile?.primary_style] || "I'm here. What's going on?")
            setMessages([{ role: 'assistant', content: firstMsg }])
            setShowAttunement(true)
            setTimeout(() => setShowAttunement(false), 1600)
          }
        }
      })
      .catch(() => {
        // #9: On network error, restore from localStorage cache
        const cached = getCachedMessages(userId)
        if (cached?.length > 1) {
          setMessages(cached)
        } else {
          const firstMsg = FIRST_MESSAGES[profile?.primary_style] || "I'm here. What's going on?"
          setMessages([{ role: 'assistant', content: firstMsg }])
          setShowAttunement(true)
          setTimeout(() => setShowAttunement(false), 1600)
        }
      })
      .finally(() => {
        setSessionLoaded(true)
        if (location.state?.preDraft) {
          setInput(location.state.preDraft)
          window.history.replaceState({}, '')
        }
      })

    // #3: Fire session-end when user switches apps or closes tab on mobile
    // visibilitychange is the only event that reliably fires on iOS Safari
    function handleVisibilityChange() {
      if (document.visibilityState === 'hidden') {
        sessionEndedRef.current = true
        fireSessionEnd()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Guard against double-fire: skip if finishSession or visibilitychange already ended the session
      if (!sessionEndedRef.current) {
        emoraAPI.endSession().catch(() => {})
      }
      clearCachedMessages(userId)
    }
  }, [])

  // Context is built server-side by the context-engine on every message.
  // No frontend context-building needed — the backend reads profile, recent sessions,
  // pattern report, and user_context directly from the DB.

  useEffect(() => {
    const el = messagesContainerRef.current
    if (!el) return
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    // Always scroll if user just sent a message, otherwise only if near bottom (< 120px)
    if (userJustSentRef.current || distanceFromBottom < 120) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    userJustSentRef.current = false
  }, [messages])

  async function sendMessage(e) {
    e?.preventDefault()
    const text = input.trim()
    if (!text || loading || crisis) return

    setInput('')
    userJustSentRef.current = true
    const newMessages = [...messages, { role: 'user', content: text }]
    setMessages(newMessages)
    cacheMessages(newMessages, userId)
    setRescueOffer(false)
    setLoading(true)

    try {
      const res = await emoraAPI.sendMessage(text)
      const withReply = [...newMessages, { role: 'assistant', content: res.data.message }]
      setMessages(withReply)
      cacheMessages(withReply, userId)
      if (res.data.crisis) setCrisis(true)
      // E-06: Backend signals when activation streak warrants rescue offer
      if (res.data.rescue_offer) setRescueOffer(true)
    } catch (err) {
      const errMsg = err.response?.data?.error || "I lost the connection for a second. I'm still here — try sending that again."
      setMessages(prev => [...prev, { role: 'assistant', content: errMsg }])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function endAndGoHome() {
    // Only show check-in if the user actually had a real conversation
    if (messages.filter(m => m.role === 'user').length >= 2) {
      setCheckIn(true)
    } else {
      finishSession(true)
    }
  }

  async function finishSession(skip = false) {
    const userMessages = messages.filter(m => m.role === 'user').length
    const payload = {
      duration_seconds: Math.floor((Date.now() - sessionStartRef.current) / 1000),
      message_count:    userMessages,
      ...(skip ? {} : {
        mood_end:        checkInMood  || undefined,
        reflection_note: checkInNote.trim() || undefined,
      }),
    }
    setCheckIn(false)
    setCheckInMood(null)
    setCheckInNote('')
    sessionEndedRef.current = true
    await emoraAPI.endSession(payload).catch(() => {})
    clearCachedMessages(userId)
    sessionStorage.setItem('unclinq_just_watered', '1')
    navigate('/home')
  }

  function startNewSession() {
    emoraAPI.endSession({ duration_seconds: Math.floor((Date.now() - sessionStartRef.current) / 1000), message_count: messages.filter(m => m.role === 'user').length }).catch(() => {})
    sessionStartRef.current = Date.now()
    clearCachedMessages(userId)
    setCrisis(false)
    setRescueOffer(false)
    setInput('')
    setMessages([{ role: 'assistant', content: FIRST_MESSAGES[profile?.primary_style] || "I'm here. What's going on?" }])
    setShowPastSessions(false)
  }

  async function loadPastSessions() {
    if (pastSessionsLoading) return
    setPastSessionsLoading(true)
    try {
      const res = await emoraAPI.sessionHistory()
      setPastSessions(res.data.sessions || [])
    } catch {
      setPastSessions([])
    } finally {
      setPastSessionsLoading(false)
    }
  }

  function togglePastSessions() {
    if (!showPastSessions && pastSessions === null) {
      loadPastSessions()
    }
    setShowPastSessions(prev => !prev)
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  if (!sessionLoaded) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
        <div className="w-6 h-6 rounded-full border-2 animate-spin" style={{ borderColor: `${sp}50`, borderTopColor: sp }} />
        <p className="text-text-muted text-sm">Picking up where you left off…</p>
      </div>
    )
  }

  if (showAttunement) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-4rem)] animate-fade-in" style={{ minHeight: 'calc(100svh - 4rem)' }}>
        <p className="text-text-secondary font-light text-lg text-center px-8">
          {getAttunementLine(profile?.primary_style)}
        </p>
      </div>
    )
  }

  // ── Post-session check-in overlay ─────────────────────────────────────────
  if (checkIn) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade-in"
        style={{ background: 'rgba(44,51,43,0.5)', backdropFilter: 'blur(6px)' }}>
        <div className="px-5 pt-6 pb-10 space-y-5"
          style={{ background: '#F8F1E7', borderRadius: '24px 20px 0 0', borderTop: '1px solid rgba(143,151,121,0.18)' }}>

          <div>
            <p className="font-sans font-bold uppercase tracking-widest mb-1"
              style={{ fontSize: '10px', color: '#8C9688' }}>Before you go</p>
            <p className="font-serif" style={{ fontSize: '1.25rem', color: '#2C332B', fontWeight: 500 }}>
              How are you leaving this?
            </p>
          </div>

          <div className="flex gap-2">
            {CHECKIN_MOODS.map(m => (
              <button key={m.value} onClick={() => setCheckInMood(m.value)}
                className="flex-1 py-3 font-sans font-semibold transition-all"
                style={{
                  borderRadius: '16px 4px 16px 4px',
                  fontSize: '11px',
                  background: checkInMood === m.value ? m.bg  : 'rgba(143,151,121,0.07)',
                  border:     `1px solid ${checkInMood === m.value ? m.border : 'transparent'}`,
                  color:      checkInMood === m.value ? m.color : '#8D6E63',
                }}>
                {m.label}
              </button>
            ))}
          </div>

          <div>
            <textarea
              className="input-field w-full resize-none"
              placeholder="Anything you noticed about yourself? (optional)"
              value={checkInNote}
              onChange={e => setCheckInNote(e.target.value.slice(0, 500))}
              rows={2}
            />
            {checkInNote.length > 0 && (
              <p className="text-text-muted text-right mt-1" style={{ fontSize: '10px' }}>
                {checkInNote.length}/500
              </p>
            )}
          </div>

          {/* Context nudge — shown once if user has never added context */}
          {(() => {
            const serverCtx = (profile?.user_context && typeof profile.user_context === 'object') ? profile.user_context : null
            const stored = (() => { try { return JSON.parse(localStorage.getItem('unclinq_user_context') || 'null') } catch { return null } })()
            const ctx = serverCtx || stored
            const isEmpty = !ctx || (!ctx.people?.length && !ctx.situation?.trim())
            if (!isEmpty || localStorage.getItem('unclinq_context_tip_seen')) return null
            return (
              <button
                onClick={() => { localStorage.setItem('unclinq_context_tip_seen', '1'); navigate('/settings') }}
                className="w-full text-left px-4 py-3 border border-surface-border rounded-2xl animate-fade-in"
                style={{ background: 'rgba(143,151,121,0.06)' }}
              >
                <p className="font-sans text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: '#8C9688' }}>Make it more personal</p>
                <p className="font-sans text-sm" style={{ color: '#7A6259' }}>
                  Want Emora to know who you were talking about? <span style={{ color: sp }}>Add context in Settings →</span>
                </p>
              </button>
            )
          })()}

          <div className="flex gap-3 items-center">
            <button onClick={() => finishSession(false)} className="btn-primary flex-1">
              Done
            </button>
            <button onClick={() => finishSession(true)}
              className="font-sans text-sm transition-colors"
              style={{ color: '#A89488' }}>
              Skip
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col" style={{ height: 'calc(100dvh - 80px - env(safe-area-inset-bottom))', maxHeight: '100dvh' }}>
      {/* Header */}
      <div
        className="flex-shrink-0 px-5 py-3.5 border-b border-surface-border flex items-center justify-between"
        style={{ background: 'rgba(246,244,241,0.94)', backdropFilter: 'blur(20px) saturate(1.4)', WebkitBackdropFilter: 'blur(20px) saturate(1.4)' }}
      >
        <div className="flex items-center gap-3">
          {/* Avatar — abstract orb */}
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 relative"
               style={{ background: `linear-gradient(135deg, ${sp}1A 0%, ${sp}08 100%)`, border: `1px solid ${sp}33` }}>
            <div className="relative w-4 h-4 flex items-center justify-center">
              <div className="absolute w-4 h-4 rounded-full emora-orb-ring" style={{ background: sp }} />
              <div className="absolute w-2.5 h-2.5 rounded-full" style={{ background: sp, opacity: 0.32 }} />
              <div className="absolute w-1.5 h-1.5 rounded-full" style={{ background: sp, opacity: 0.72 }} />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-state-stable border-2 border-white" />
          </div>
          <div>
            <p className="text-text-primary font-semibold text-sm leading-tight">Emora</p>
            <p className="text-text-muted leading-none" style={{ fontSize: '11px' }}>
              {messages.length <= 1 ? 'No agenda. Just here.' : 'Listening.'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {/* Past sessions */}
          <button
            onClick={togglePastSessions}
            className={`text-text-muted hover:text-text-secondary transition-colors p-1.5 rounded-lg ${showPastSessions ? 'bg-surface-elevated text-text-secondary' : ''}`}
            aria-label="Past sessions"
            title="Past sessions"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
          {/* New session */}
          <button
            onClick={startNewSession}
            className="text-text-muted hover:text-text-secondary transition-colors p-1.5 rounded-lg"
            aria-label="New session"
            title="Start new session"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          {/* End session — only shown if conversation has started */}
          {messages.length > 1 && (
            <button
              onClick={endAndGoHome}
              className="text-text-muted hover:text-text-secondary transition-colors text-xs px-2 py-1.5 rounded-lg"
            >
              Done for now
            </button>
          )}
        </div>
      </div>

      {/* Past sessions panel */}
      {showPastSessions && (
        <div className="flex-shrink-0 border-b border-surface-border bg-surface-card overflow-y-auto max-h-56">
          <div className="px-4 py-3">
            <p className="label mb-3">Past sessions</p>
            {pastSessionsLoading && (
              <div className="flex flex-col items-center gap-2 py-4">
                <div className="w-4 h-4 rounded-full border-2 animate-spin" style={{ borderColor: `${sp}40`, borderTopColor: sp }} />
                <p className="text-text-muted text-xs">Looking back...</p>
              </div>
            )}
            {!pastSessionsLoading && pastSessions?.length === 0 && (
              <p className="text-text-muted text-xs py-2">No past sessions yet.</p>
            )}
            {!pastSessionsLoading && pastSessions?.map(s => (
              <div key={s.id} className="py-2.5 border-b border-surface-border last:border-0">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-text-secondary text-xs leading-relaxed flex-1">
                    {s.key_insight || 'No insight recorded'}
                  </p>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-lg ${
                      s.emotional_state_end === 'stable' ? 'bg-state-stable/10 text-state-stable' :
                      s.emotional_state_end === 'crisis' ? 'bg-state-crisis/10 text-state-crisis' :
                      'bg-state-activated/10 text-state-activated'
                    }`}>
                      {s.emotional_state_end || s.emotional_state_start || 'stable'}
                    </span>
                    {s.mood_end && (
                      <span className="text-[10px] text-text-muted capitalize">{s.mood_end}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-text-muted text-[10px]">
                    {new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                  {s.duration_seconds > 0 && (
                    <p className="text-text-muted text-[10px]">
                      · {Math.round(s.duration_seconds / 60)}min
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-surface animate-fade-in" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end msg-user' : 'justify-start msg-emora'}`}
          >
            {msg.role === 'assistant' && (
              <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5 mt-0.5" style={{ background: `${sp}14`, border: `1px solid ${sp}30` }}>
                <div className="relative w-2.5 h-2.5 flex items-center justify-center">
                  <div className="absolute w-2.5 h-2.5 rounded-full emora-orb-ring" style={{ background: sp }} />
                  <div className="absolute w-1.5 h-1.5 rounded-full" style={{ background: sp, opacity: 0.4 }} />
                  <div className="absolute w-1 h-1 rounded-full" style={{ background: sp, opacity: 0.8 }} />
                </div>
              </div>
            )}
            <div className={msg.role === 'user' ? 'user-bubble' : 'emora-bubble'}>
              <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center mr-2.5" style={{ background: `${sp}14`, border: `1px solid ${sp}30` }}>
              <div className="relative w-2.5 h-2.5 flex items-center justify-center">
                <div className="absolute w-2.5 h-2.5 rounded-full emora-orb-ring" style={{ background: sp }} />
                <div className="absolute w-1.5 h-1.5 rounded-full" style={{ background: sp, opacity: 0.4 }} />
                <div className="absolute w-1 h-1 rounded-full" style={{ background: sp, opacity: 0.8 }} />
              </div>
            </div>
            <div className="emora-bubble !py-3.5">
              <div className="flex gap-1.5 items-center h-4">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </div>
        )}

        {crisis && (
          <div className="border border-state-crisis/25 bg-state-crisis/[0.06] p-4 animate-slide-up" style={{ borderRadius: '24px 20px 28px 22px' }}>
            <p className="text-state-crisis text-xs font-medium uppercase tracking-wide mb-3">
              If you need support right now
            </p>
            <div className="space-y-2.5">
              {CRISIS_RESOURCES.map(r => (
                <div key={r.name} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{r.name}</p>
                    <p className="text-text-muted text-xs">{r.region}</p>
                  </div>
                  <a href={r.href} className="text-sm font-medium flex-shrink-0" style={{ color: sp }}>
                    {r.detail}
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4 border-t border-surface-border bg-surface-card">
        {crisis ? (
          <div className="flex flex-col items-center gap-2.5 py-2">
            <p className="text-text-muted text-sm text-center">
              Session paused. Come back when you're ready.
            </p>
            <button
              onClick={() => navigate('/home')}
              className="btn-ghost"
            >
              ← Back to home
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {/* E-06: Proactive Rescue Mode offer — shown after activation streak detected */}
            {rescueOffer && (
              <div className="flex items-center justify-between text-xs border border-surface-border px-3.5 py-2.5 gap-2" style={{ borderRadius: '16px 4px 16px 4px' }}>
                <span className="text-text-muted">Take a breath first if you need it</span>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <button
                    onClick={() => { emoraAPI.endSession().catch(() => {}); navigate('/rescue') }}
                    className="hover:underline"
                    style={{ color: sp }}
                  >
                    ⏸ Rescue Mode
                  </button>
                  {/* Dismiss: user wants to keep talking, not regulate */}
                  <button
                    onClick={() => setRescueOffer(false)}
                    className="text-text-muted hover:text-text-secondary leading-none"
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}

            <form onSubmit={sendMessage} className="flex gap-3 items-end">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  rows={1}
                  className="input-field w-full resize-none leading-relaxed"
                  placeholder="What's going on?"
                  value={input}
                  onChange={e => {
                    setInput(e.target.value)
                    // Fix: iOS Safari reads scrollHeight incorrectly on the same frame
                    // as setting height='auto'. Defer to next frame for accurate measurement.
                    const el = e.target
                    el.style.height = 'auto'
                    requestAnimationFrame(() => {
                      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
                    })
                  }}
                  onKeyDown={handleKeyDown}
                  style={{ minHeight: '44px' }}
                />
                {/* Character count — shown when typing longer messages */}
                {input.length > 80 && (
                  <p className="absolute bottom-2 right-3 text-text-muted pointer-events-none"
                    style={{ fontSize: '10px', fontWeight: 600 }}>
                    {input.length}
                  </p>
                )}

                {/* Conversation starters — only when input is empty on first exchange */}
                {!input && messages.length <= 1 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {starters.map((starter, i) => (
                      <button
                        key={starter}
                        type="button"
                        onClick={() => {
                          setInput(starter)
                          textareaRef.current?.focus()
                        }}
                        className={`text-xs text-text-muted border border-surface-border px-3 py-1.5
                          hover:border-terra/35 hover:text-text-secondary hover:bg-surface-elevated
                          transition-all duration-200 animate-slide-up stagger-${i + 1}`}
                        style={{ borderRadius: '16px 4px 16px 4px' }}
                      >
                        {starter}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="w-10 h-10 rounded-full text-surface flex items-center justify-center flex-shrink-0 disabled:opacity-40 transition-all active:scale-95"
                style={{ background: sp }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
