/**
 * DEV ONLY — Card Previews
 * Routes: /preview-insight  /preview-action
 * Delete this file and the routes in App.jsx when done reviewing.
 */

import { useState } from 'react'
import { Check } from 'lucide-react'

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`
const sp = '#4A6741'

const THEME_COLORS = {
  avoidance:     { bg: 'rgba(107,152,135,0.15)', text: '#3D7A65', dot: '#5BA08A', bar: 'rgba(107,152,135,0.35)' },
  anxiety:       { bg: 'rgba(192,108,84,0.12)',  text: '#A05030', dot: '#C06C54', bar: 'rgba(192,108,84,0.3)' },
  attachment:    { bg: 'rgba(120,100,170,0.12)', text: '#5A4090', dot: '#8B6EC5', bar: 'rgba(120,100,170,0.3)' },
  communication: { bg: 'rgba(90,140,180,0.12)',  text: '#2A6080', dot: '#4A90C0', bar: 'rgba(90,140,180,0.3)' },
  self_worth:    { bg: 'rgba(180,140,70,0.12)',  text: '#805A20', dot: '#C09040', bar: 'rgba(180,140,70,0.3)' },
  boundaries:    { bg: 'rgba(143,151,121,0.15)', text: '#4A5A30', dot: '#8F9779', bar: 'rgba(143,151,121,0.35)' },
  patterns:      { bg: 'rgba(160,90,90,0.12)',   text: '#803030', dot: '#B05050', bar: 'rgba(160,90,90,0.3)' },
  healing:       { bg: 'rgba(90,150,100,0.12)',  text: '#2A6040', dot: '#4A9060', bar: 'rgba(90,150,100,0.3)' },
}
function tc(theme) {
  return THEME_COLORS[theme] || { bg: 'rgba(192,108,84,0.1)', text: sp, dot: sp, bar: 'rgba(192,108,84,0.25)' }
}

const TIER_LABELS = { 1: 'Awareness', 2: 'Interruption', 3: 'Replacement' }

// ── Dummy data ──────────────────────────────────────────────────────────────

const INSIGHT_UNREAD = {
  id: 'tab_001',
  theme: 'attachment',
  title: "You don’t push people away. You test them.",
  body: "Fearful-avoidant attachment doesn’t look like indifference — it looks like inviting someone close and then creating distance to see if they stay. The closeness feels dangerous, so you manufacture a reason to find out early whether they’ll leave. The tragedy is that sometimes the test itself causes the outcome you feared.",
  exit: "Noticing the test is already the beginning of not needing to run it.",
  read_time_seconds: 75,
  priority: 2,
  read: false,
}

const INSIGHT_READ = {
  id: 'tab_002',
  theme: 'self_worth',
  title: "Earning rest is not how rest works.",
  body: "Placeholder body.",
  exit: null,
  read_time_seconds: 45,
  priority: 1,
  read: true,
}

const INSIGHT_ANXIETY = {
  id: 'tab_003',
  theme: 'anxiety',
  title: "The spiral is not about what it’s about.",
  body: "When you’re looping at 2am, the content of the spiral almost never matters. The spiral is a nervous system event dressed up as a thought problem. Solving it by thinking harder is like trying to stop a wave by pushing it. The body is the entry point — not the mind.",
  exit: "You’re not bad at thinking. Your system is scared.",
  read_time_seconds: 90,
  priority: 1,
  read: false,
}

const DUMMY_ACTION = {
  tier: 2,
  category: 'communication',
  text: "Before your next difficult conversation, write down the one thing you most need the other person to understand.",
  brief_why: "When we’re anxious before hard talks, we fill the silence with defensiveness. Writing first separates the feeling from the message — and gives you something to actually say.",
  completion_acknowledgment: "This works because externalising the need removes it from the pressure of the moment. You’ve already done the thinking — now you just have to show up.",
}

// ══════════════════════════════════════════════════════════════════════════════
//  INSIGHT PREVIEW
// ══════════════════════════════════════════════════════════════════════════════

export function InsightPreview() {
  const [open, setOpen] = useState(null) // tab id

  const tabs = [INSIGHT_UNREAD, INSIGHT_ANXIETY, INSIGHT_READ]
  const openTab = tabs.find(t => t.id === open)

  return (
    <div className="min-h-screen py-8 px-5 animate-fade-in" style={{ background: '#F8F1E7' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

      <div className="relative z-10 space-y-6">

        {/* Header */}
        <div>
          <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '4px' }}>
            Dev Preview
          </p>
          <h1 className="font-serif" style={{ fontSize: '1.5rem', color: '#2C332B', fontWeight: 500 }}>
            Insight Cards
          </h1>
        </div>

        {/* Detail view — shown when a card is tapped */}
        {openTab ? (
          <InsightDetailCard tab={openTab} onClose={() => setOpen(null)} />
        ) : (
          <>
            {/* Batch progress bar */}
            <div className="p-4 border"
              style={{ borderRadius: '24px 20px 28px 22px', background: 'rgba(255,249,240,0.6)', borderColor: 'rgba(192,108,84,0.08)' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8D6E63', textTransform: 'uppercase' }}>
                  This batch
                </span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: sp }}>1/3 read</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(143,151,121,0.2)' }}>
                <div className="h-full rounded-full" style={{ width: '33%', background: sp }} />
              </div>
            </div>

            {/* Card list */}
            <div className="space-y-3">
              {tabs.map(tab => (
                <InsightListCard key={tab.id} tab={tab} onOpen={() => setOpen(tab.id)} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════════════════
//  ACTION PREVIEW  — mirrors ActionLab.jsx exactly
// ══════════════════════════════════════════════════════════════════════════════

const DUMMY_HISTORY = [
  {
    served_at: '2026-04-16T10:00:00Z',
    action_text: "Write one sentence about what you’re actually afraid of right now.",
    completed_at: null,
    skipped_at: '2026-04-16T18:00:00Z',
    effectiveness_rating: null,
  },
  {
    served_at: '2026-04-17T10:00:00Z',
    action_text: "Notice one moment today where you held back something true. Don’t change it — just notice it.",
    completed_at: '2026-04-17T20:00:00Z',
    skipped_at: null,
    effectiveness_rating: 'somewhat',
  },
  {
    served_at: '2026-04-18T10:00:00Z',
    action_text: "Before you respond to the next message that irritates you, wait 10 minutes. Just wait.",
    completed_at: '2026-04-18T15:00:00Z',
    skipped_at: null,
    effectiveness_rating: 'helped',
  },
]

const FEEDBACK_RATINGS = [
  { rating: 'helped',     label: 'It helped',     sub: 'Something actually shifted.' },
  { rating: 'somewhat',   label: 'Somewhat',       sub: "Not sure yet — still processing." },
  { rating: 'not_really', label: 'Not this time',  sub: "It didn’t land. That’s useful too." },
]

const TIER_CONTEXT = {
  1: "This is a noticing practice. You’re not changing anything yet — just watching.",
  2: "This is a pause practice. You’re creating a gap before the old pattern runs.",
  3: "This is a replacement practice. You’re rehearsing the new thing in real life.",
}

export function ActionPreview() {
  const [screen, setScreen] = useState('action') // action | feedback | rated
  const [cardExpanded, setCardExpanded] = useState(false)
  const [markedHard, setMarkedHard] = useState(false)
  const [showJourney, setShowJourney] = useState(false)
  const [expandedKey, setExpandedKey] = useState(null)
  const [selectedRating, setSelectedRating] = useState(null)

  function handleMarkHard() {
    setMarkedHard(true)
    setTimeout(() => setMarkedHard(false), 2500)
  }

  // ── Feedback screen ───────────────────────────────────────────────────────
  if (screen === 'feedback') {
    return (
      <div className="relative min-h-screen animate-fade-in" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

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
          <div className="px-5 py-4"
            style={{ background: 'rgba(255,249,240,0.7)', borderRadius: '20px 4px 20px 4px', border: '1px solid rgba(192,108,84,0.1)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#A89488', textTransform: 'uppercase', marginBottom: '6px' }}>
              What you did
            </p>
            <p className="font-serif leading-snug" style={{ fontSize: '1rem', color: '#2C332B' }}>
              {DUMMY_ACTION.text}
            </p>
          </div>

          {/* Insight reveal */}
          <div className="relative overflow-hidden px-5 py-5"
            style={{ background: 'white', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.18)' }}>
            <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full pointer-events-none"
              style={{ background: `${sp}08`, filter: 'blur(20px)' }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '10px' }}>
              Why it works
            </p>
            <p className="font-serif italic leading-relaxed relative z-10" style={{ fontSize: '1rem', color: '#5D4037', lineHeight: 1.65 }}>
              "{DUMMY_ACTION.completion_acknowledgment}"
            </p>
          </div>

          {/* Rating question */}
          <div className="space-y-3">
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.1em', color: '#8C9688', textTransform: 'uppercase' }}>
              How did it land?
            </p>
            <div className="space-y-2">
              {FEEDBACK_RATINGS.map(({ rating, label, sub }) => (
                <button
                  key={rating}
                  onClick={() => { setSelectedRating(rating); setScreen('rated') }}
                  className="w-full text-left px-5 py-4 transition-all active:scale-[0.98]"
                  style={{ background: 'white', borderRadius: '16px 4px 16px 4px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 2px 8px -2px rgba(143,169,181,0.12)' }}>
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

  // ── After rating ──────────────────────────────────────────────────────────
  if (screen === 'rated') {
    return (
      <div className="relative min-h-screen flex items-center justify-center animate-fade-in px-6" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />
        <div className="relative z-10 space-y-4 w-full">
          <div className="px-5 py-4 text-center"
            style={{ background: 'rgba(78,122,58,0.06)', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(78,122,58,0.15)' }}>
            <p className="font-serif" style={{ fontSize: '1.1rem', color: '#2C332B' }}>
              Rated: <span style={{ color: '#4E7A3A', fontStyle: 'italic' }}>{selectedRating}</span>
            </p>
            <p style={{ fontSize: '12px', color: '#A89488', marginTop: '4px' }}>Would advance to ‘done’ screen in real app.</p>
          </div>
          <button onClick={() => { setScreen('action'); setSelectedRating(null) }} className="btn-ghost w-full">
            ← Back to action
          </button>
        </div>
      </div>
    )
  }

  // ── Active action screen ───────────────────────────────────────────────────
  return (
    <div className="relative min-h-screen animate-fade-in" style={{ background: '#F8F1E7' }}>
      <div className="fixed inset-0 pointer-events-none z-0"
        style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

      {/* Header */}
      <header className="relative z-10 pt-10 px-6 pb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#C06C54' }} />
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.14em', color: '#8C9688', textTransform: 'uppercase' }}>
              Day 3 · Trellis
            </p>
          </div>
          <h1 className="font-serif" style={{ fontSize: '1.5rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.02em' }}>
            Today’s practice
          </h1>
        </div>
        <button
          onClick={() => setShowJourney(v => !v)}
          className="flex items-center gap-1 transition-all"
          style={{
            fontSize: '11px', fontWeight: 600,
            color: showJourney ? sp : '#8C9688',
            padding: '6px 12px', borderRadius: '20px',
            border: `1px solid ${showJourney ? sp + '35' : 'rgba(143,151,121,0.2)'}`,
            background: showJourney ? `${sp}0D` : 'transparent',
          }}>
          Journey
          <svg style={{ width: '11px', height: '11px', transition: 'transform 0.2s', transform: showJourney ? 'rotate(180deg)' : 'rotate(0)' }}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </header>

      {/* Journey drawer — expandable items */}
      {showJourney && (
        <div className="relative z-10 px-6 mb-5 space-y-2 animate-fade-in">
          {DUMMY_HISTORY.map((h, i) => {
            const done = !!h.completed_at
            const key = h.served_at
            const isExpanded = expandedKey === key
            const date = new Date(h.served_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

            return (
              <div key={key}
                className="overflow-hidden transition-all"
                style={{
                  background: 'rgba(255,255,255,0.55)',
                  borderRadius: '16px 4px 16px 4px',
                  border: `1px solid ${isExpanded ? 'rgba(143,151,121,0.25)' : 'rgba(143,151,121,0.12)'}`,
                  opacity: isExpanded ? 1 : 0.72,
                }}>

                {/* Collapsed row */}
                <button
                  onClick={() => setExpandedKey(isExpanded ? null : key)}
                  className="w-full flex items-center gap-3 px-4 py-3 text-left">
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
                    {h.action_text.substring(0, 48)}{h.action_text.length > 48 ? '…' : ''}
                  </p>
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span style={{ fontSize: '10px', color: '#A89488', fontWeight: 600 }}>Day {i + 1}</span>
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
                      <p className="font-serif leading-relaxed" style={{ fontSize: '1rem', color: '#2C332B', lineHeight: 1.55 }}>
                        {h.action_text}
                      </p>
                      <div className="flex items-center flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full font-bold"
                          style={{
                            fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase',
                            background: done ? 'rgba(78,122,58,0.1)' : 'rgba(200,184,168,0.2)',
                            color: done ? '#4E7A3A' : '#A89488',
                          }}>
                          {done ? 'Completed' : 'Skipped'}
                        </span>
                        {date && <span style={{ fontSize: '11px', color: '#A89488', fontWeight: 500 }}>{date}</span>}
                        {h.effectiveness_rating && (
                          <>
                            <span style={{ fontSize: '11px', color: '#C8B8A8' }}>·</span>
                            <span style={{ fontSize: '11px', color: '#8C9688', fontWeight: 500 }}>
                              {h.effectiveness_rating === 'helped' ? 'Helped' : h.effectiveness_rating === 'somewhat' ? 'Somewhat' : 'Not really'}
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

      {/* Main action card */}
      <main className="relative z-10 px-6 pb-32">
        <div className="relative overflow-hidden transition-all duration-300"
          style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 8px 30px -8px rgba(143,169,181,0.25)', border: '1px solid rgba(143,151,121,0.2)' }}>
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: `${sp}0A`, filter: 'blur(32px)' }} />

          <div className="p-6 space-y-5">
            {/* Tier + category — always visible */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full font-bold border"
                style={{ fontSize: '10px', letterSpacing: '0.06em', textTransform: 'uppercase', background: 'rgba(192,108,84,0.1)', color: '#C06C54', borderColor: 'rgba(192,108,84,0.2)' }}>
                {TIER_LABELS[DUMMY_ACTION.tier]}
              </span>
              <span style={{ fontSize: '10px', fontWeight: 500, color: '#A89488' }}>
                {DUMMY_ACTION.category.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Action text — always visible */}
            <h2 className="font-serif" style={{ fontSize: '1.5rem', color: '#2C332B', lineHeight: 1.35, letterSpacing: '-0.01em' }}>
              {DUMMY_ACTION.text}
            </h2>

            {!cardExpanded ? (
              /* Collapsed: single expand CTA */
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
              /* Expanded: context + completion CTA */
              <div className="space-y-5 animate-fade-in">
                <p className="text-sm leading-relaxed pl-3 border-l-2"
                  style={{ color: '#8C9688', borderColor: `${sp}40`, lineHeight: 1.65 }}>
                  {DUMMY_ACTION.brief_why}
                </p>

                <p style={{ fontSize: '11px', color: '#B8A89A', lineHeight: 1.5 }}>
                  {TIER_CONTEXT[DUMMY_ACTION.tier]}
                </p>

                <button
                  onClick={() => setScreen('feedback')}
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

        {/* Secondary actions — only after expanding */}
        {cardExpanded && (
          <div className="flex gap-3 mt-4 animate-fade-in">
            <button onClick={handleMarkHard}
              className={`btn-secondary flex-1 text-sm ${markedHard ? 'opacity-60' : ''}`}>
              {markedHard ? 'Noted' : 'This is hard'}
            </button>
            <button className="btn-ghost flex-1 text-sm">Not today</button>
          </div>
        )}
      </main>
    </div>
  )
}

// ── Shared sub-components ─────────────────────────────────────────────────────

function InsightListCard({ tab, onOpen }) {
  const color = tc(tab.theme)
  return (
    <button
      onClick={onOpen}
      className="w-full text-left overflow-hidden transition-all duration-200 active:scale-[0.99]"
      style={{
        borderRadius: '24px 20px 28px 22px',
        background: tab.read ? 'rgba(255,249,240,0.45)' : 'white',
        boxShadow: tab.read ? 'none' : '0 4px 20px -4px rgba(143,169,181,0.2), 0 1px 4px rgba(44,55,40,0.05)',
        border: `1px solid ${tab.read ? 'rgba(192,108,84,0.07)' : 'rgba(143,151,121,0.18)'}`,
        opacity: tab.read ? 0.5 : 1,
      }}
    >
      {!tab.read && tab.theme && (
        <div className="px-4 pt-3.5 pb-2.5 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${color.bar}` }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: color.text, textTransform: 'uppercase' }}>
            {tab.theme.replace(/_/g, ' ')}
          </span>
          {tab.priority === 2 && (
            <span className="ml-auto px-2 py-0.5 rounded-full text-white font-bold"
              style={{ fontSize: '9px', background: color.dot, letterSpacing: '0.06em' }}>
              KEY
            </span>
          )}
        </div>
      )}
      <div className="px-4 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-serif leading-snug"
              style={{ fontSize: tab.read ? '14px' : '16px', fontWeight: tab.read ? 400 : 500, color: '#2C332B', letterSpacing: '-0.01em' }}>
              {tab.title}
            </p>
            {!tab.read && tab.body && (
              <p className="t-caption mt-2 line-clamp-2 leading-relaxed">{tab.body}</p>
            )}
            <div className="flex items-center gap-2 mt-2.5">
              <p className="t-caption">
                {tab.read_time_seconds < 60 ? `${tab.read_time_seconds}s read` : `${Math.round(tab.read_time_seconds / 60)} min read`}
              </p>
              {!tab.read && (
                <span className="t-caption font-semibold" style={{ color: color.text }}>· Read →</span>
              )}
            </div>
          </div>
          {tab.read ? (
            <Check size={15} strokeWidth={2} className="text-text-muted flex-shrink-0 mt-0.5" />
          ) : (
            <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: color.bg }}>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={color.dot} strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </div>
          )}
        </div>
      </div>
    </button>
  )
}

function InsightDetailCard({ tab, onClose }) {
  const color = tc(tab.theme)
  return (
    <div className="space-y-4">
      <button onClick={onClose}
        className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
        style={{ color: '#8C9688' }}>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        <span className="text-sm font-medium">Back</span>
      </button>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: color.dot }} />
          <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: color.text, textTransform: 'uppercase' }}>
            {tab.theme?.replace(/_/g, ' ')}
          </span>
          {tab.priority === 2 && (
            <span className="px-2 py-0.5 rounded-full text-white font-bold"
              style={{ fontSize: '9px', background: color.dot, letterSpacing: '0.06em' }}>
              KEY
            </span>
          )}
          <span className="ml-auto flex items-center gap-1" style={{ fontSize: '11px', fontWeight: 600, color: '#8C9688' }}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {tab.read_time_seconds < 60 ? `${tab.read_time_seconds}s` : `${Math.round(tab.read_time_seconds / 60)} min`}
          </span>
        </div>
        <h2 className="font-serif leading-snug"
          style={{ fontSize: '1.625rem', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.25, color: '#2C332B' }}>
          {tab.title}
        </h2>
      </div>

      <div className="relative overflow-hidden"
        style={{ background: 'white', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)', padding: '1.5rem' }}>
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
          style={{ background: color.bg, filter: 'blur(24px)', opacity: 0.6 }} />
        <p className="relative z-10 text-base leading-relaxed" style={{ color: '#5D4037', lineHeight: 1.75 }}>
          {tab.body}
        </p>
      </div>

      {tab.exit && (
        <div className="p-5"
          style={{ borderRadius: '24px 20px 28px 22px', background: color.bg, border: `1px solid ${color.bar}` }}>
          <div className="w-3 h-0.5 mb-3 rounded-full" style={{ background: color.dot }} />
          <p className="font-serif italic leading-relaxed" style={{ color: '#2C332B', fontSize: '15px', lineHeight: 1.65 }}>
            "{tab.exit}"
          </p>
        </div>
      )}

      <button className="btn-primary w-full flex items-center justify-center gap-2">
        Sit with this in Emora
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}

function HistoryCard({ text, dayNumber, date, done }) {
  return (
    <div style={{ opacity: 0.65 }}>
      <div className="flex justify-between items-baseline mb-1.5">
        <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: sp, textTransform: 'uppercase' }}>
          Day {dayNumber} · Bloomed
        </span>
        <span style={{ fontSize: '10px', color: '#8C9688', fontWeight: 500 }}>{date}</span>
      </div>
      <div className="p-4 flex items-center gap-3"
        style={{ background: 'rgba(255,255,255,0.6)', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(143,151,121,0.2)' }}>
        <div className="h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: done ? `${sp}14` : 'rgba(200,184,168,0.2)', border: `1px solid ${done ? sp + '25' : 'rgba(200,184,168,0.3)'}` }}>
          {done ? (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke={sp} strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="#C8B8A8" strokeWidth={1.75}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </div>
        <p className="font-serif leading-tight text-text-primary" style={{ fontSize: '1rem' }}>
          {text.substring(0, 60)}{text.length > 60 ? '…' : ''}
        </p>
      </div>
    </div>
  )
}
