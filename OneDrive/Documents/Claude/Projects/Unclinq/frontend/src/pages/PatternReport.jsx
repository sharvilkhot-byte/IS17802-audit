import { useState, useRef } from 'react'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { patternReportAPI } from '../services/api'
import { useApp } from '../context/AppContext'
import { EmotionFace, stateToFace } from '../components/Illustrations'

// Semantic state colors — no red anywhere
const SC = {
  stable:    { bg: 'rgba(67,160,71,0.10)',  border: 'rgba(67,160,71,0.25)',  text: '#2E7D32', dot: '#43A047', label: 'Stable' },
  activated: { bg: 'rgba(213,140,0,0.10)',  border: 'rgba(213,140,0,0.25)',  text: '#92400E', dot: '#D97706', label: 'Activated' },
  difficult: { bg: 'rgba(141,110,99,0.12)', border: 'rgba(141,110,99,0.28)', text: '#6D4C41', dot: '#8D6E63', label: 'Difficult' },
}

const DUMMY_REPORT = {
  period_start: '2026-03-31T00:00:00Z',
  period_end:   '2026-04-15T00:00:00Z',
  generated_at: new Date().toISOString(),
  closing_question: null,
  session_count: 8,
  key_insight: 'You keep reaching, then pulling back — not because you don\'t care, but because caring feels dangerous.',
  emotional_arc: [
    { label: 'Apr 1',  state: 'activated' },
    { label: 'Apr 3',  state: 'activated' },
    { label: 'Apr 7',  state: 'difficult' },
    { label: 'Apr 10', state: 'activated' },
    { label: 'Apr 13', state: 'stable'    },
    { label: 'Apr 15', state: 'stable'    },
  ],
  patterns: [
    { label: 'Need suppression',      status: 'active',    note: 'Absorbing your own asks before they can reach anyone' },
    { label: 'Anticipatory shutdown', status: 'improving', note: 'Starting to catch it before it completes' },
    { label: 'Hyper-independence',    status: 'active',    note: 'Solving alone what could be shared' },
    { label: 'Emotional rationing',   status: 'improving', note: 'Less editing happening in real time' },
  ],
  triggers: [
    { label: 'Silence or no reply',        stable: 3, activated: 4, difficult: 1 },
    { label: 'Plans changing last minute', stable: 5, activated: 2, difficult: 0 },
    { label: 'Feeling like a burden',      stable: 2, activated: 3, difficult: 2 },
    { label: 'Mixed signals',              stable: 4, activated: 2, difficult: 1 },
    { label: 'Being needed unexpectedly',  stable: 6, activated: 1, difficult: 0 },
  ],
  content: `WHAT I NOTICED
Over the last two weeks, you've been returning to the same place — the moment right before you reach out. You get close, draft something, then pull back. It happened in three different conversations: with your sister about the visit, with a friend about feeling left out, and with yourself about whether you're asking for too much. The hesitation isn't random. It has a shape: you weigh the ask, decide it might be too heavy, and quietly absorb it instead.

WHAT SHIFTED
There's been movement. In earlier sessions, you described that pull-back as "being considerate." This week you named it differently — "disappearing before they can say no." That's not a small shift. It means part of you is starting to see the cost of what looked like patience.

WHAT'S STILL RUNNING
The belief that your needs are a burden to people who matter to you is still active. It shows up most in high-stakes relationships — the ones where rejection would actually hurt. Safer people get more of you. The ones you most want to be seen by get the edited version.

ONE QUESTION
What would you need to believe about the other person to let them actually hold something for you?`,
}

// ─── Card builders ─────────────────────────────────────────────────────────

function buildCards(report, sections, sp) {
  const arc      = report.emotional_arc || []
  const patterns = report.patterns      || []
  const triggers = report.triggers      || []

  const textSections  = sections.filter(s => !s.isQuestion)
  const questionCard  = sections.find(s => s.isQuestion)

  const cards = [
    { type: 'score' },
    { type: 'cover' },
    arc.length > 0      && { type: 'arc' },
    ...textSections.map(s => ({ type: 'section', section: s })),
    patterns.length > 0 && { type: 'patterns' },
    triggers.length > 0 && { type: 'triggers' },
    questionCard        && { type: 'question', section: questionCard },
    { type: 'footer' },
  ].filter(Boolean)

  return cards
}

// ─── Individual card renderers ──────────────────────────────────────────────

// ─── Score calculation ──────────────────────────────────────────────────────
function calcPatternScore(report) {
  const arc = report.emotional_arc || []
  const sessions = report.session_count ?? 0
  if (arc.length === 0) return Math.min(30 + sessions * 4, 80)
  const stableCount = arc.filter(s => s.state === 'stable').length
  const difficultCount = arc.filter(s => s.state === 'difficult' || s.state === 'crisis').length
  const base = Math.round((stableCount / arc.length) * 60) + Math.min(sessions * 3, 30)
  return Math.max(18, Math.min(base + (difficultCount > 0 ? -5 : 8), 97))
}

function ScoreCard({ report }) {
  const score = calcPatternScore(report)
  const isGrowing = score >= 55
  const label = score >= 70 ? 'Stable' : score >= 45 ? 'Growing' : 'Building'
  const bg = score >= 70 ? '#6B8F5E' : score >= 45 ? '#7A8B6F' : '#8D7A6B'

  // Topographic line pattern (SVG)
  const topoPattern = `url("data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='rgba(255,255,255,0.08)' stroke-width='1.5'%3E%3Cellipse cx='200' cy='200' rx='60' ry='40'/%3E%3Cellipse cx='200' cy='200' rx='100' ry='70'/%3E%3Cellipse cx='200' cy='200' rx='145' ry='105'/%3E%3Cellipse cx='200' cy='200' rx='190' ry='140'/%3E%3Cellipse cx='200' cy='200' rx='240' ry='180'/%3E%3Cellipse cx='200' cy='200' rx='295' ry='225'/%3E%3C/g%3E%3C/svg%3E")`

  return (
    <div className="flex flex-col justify-center min-h-[60vh] overflow-hidden relative" style={{ borderRadius: '24px 20px 28px 22px', background: bg }}>
      {/* Topographic pattern overlay */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: topoPattern, backgroundSize: '340px 340px', backgroundPosition: 'center' }} />

      <div className="relative z-10 flex flex-col items-center justify-center text-center py-12 px-6 gap-4">
        {/* Status badge */}
        <div className="px-4 py-1.5 rounded-full border"
          style={{ borderColor: 'rgba(255,255,255,0.3)', background: 'rgba(255,255,255,0.12)' }}>
          <span style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.9)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {label}
          </span>
        </div>

        {/* Big score number */}
        <p style={{ fontSize: '96px', fontWeight: 800, color: '#FFFFFF', lineHeight: 1, letterSpacing: '-0.04em', fontFamily: '"Newsreader", Georgia, serif' }}>
          {score}
        </p>

        {/* Message */}
        <p style={{ fontSize: '1.1rem', color: 'rgba(255,255,255,0.9)', lineHeight: 1.4, fontFamily: '"Satoshi", system-ui, sans-serif', maxWidth: '240px' }}>
          {isGrowing
            ? 'Your pattern work\nis showing up.'
            : 'You\'re building something\nreal here.'}
        </p>

        {/* Session count pill */}
        <div className="mt-4 px-5 py-2.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.18)' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#FFFFFF' }}>
            {report.session_count ?? 0} sessions completed
          </span>
        </div>
      </div>
    </div>
  )
}

function CoverCard({ report, sp }) {
  const start = report.period_start ? new Date(report.period_start) : null
  const end   = new Date(report.period_end)
  const dateRange = start
    ? `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-col justify-center min-h-[58vh] gap-8">
      <div>
        <p className="label mb-3">Pattern Report</p>
        <p className="text-text-muted text-sm">{dateRange}</p>
      </div>

      {/* Big stat */}
      {report.session_count != null && (
        <div>
          <p className="font-semibold leading-none" style={{ fontSize: '72px', color: sp, letterSpacing: '-0.04em' }}>
            {report.session_count}
          </p>
          <p className="text-text-secondary text-base mt-2">
            sessions across {report.period_start
              ? Math.round((new Date(report.period_end) - new Date(report.period_start)) / 86400000)
              : 15} days
          </p>
        </div>
      )}

      {/* Key insight pull quote */}
      {report.key_insight && (
        <div className="border-l-2 pl-4" style={{ borderColor: `${sp}50` }}>
          <p className="text-text-primary italic leading-relaxed text-[15px]">
            "{report.key_insight}"
          </p>
        </div>
      )}

    </div>
  )
}

function ArcCard({ arc }) {
  return (
    <div className="flex flex-col justify-center min-h-[58vh] gap-6">
      <div>
        <p className="label mb-1">Emotional arc</p>
        <p className="text-text-muted text-sm">How these sessions moved</p>
      </div>

      <div className="relative py-4">
        {/* Connecting line */}
        <div className="absolute top-[calc(1.75rem+16px)] left-0 right-0 h-px bg-surface-border" style={{ zIndex: 0 }} />

        <div className="flex justify-between relative" style={{ zIndex: 1 }}>
          {arc.map((pt, i) => {
            const c = SC[pt.state] ?? SC.stable
            return (
              <div key={i} className="flex flex-col items-center gap-2">
                <EmotionFace state={stateToFace(pt.state)} size={32} />
                <p className="text-text-muted text-[10px] font-medium">{pt.label}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: c.text }}>{c.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 pt-2">
        {Object.entries(SC).map(([key, c]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
            <p className="text-text-muted text-xs">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionCard({ section, sp }) {
  return (
    <div className="flex flex-col justify-center min-h-[58vh] gap-5">
      <p className="label">{section.title}</p>
      <div className="border-l-2 pl-4" style={{ borderColor: section.isQuestion ? `${sp}50` : '#E6E0D8' }}>
        <p className={`leading-relaxed ${section.isQuestion ? 'italic text-text-primary text-[17px] font-light' : 'text-text-secondary text-[15px]'}`}>
          {section.content}
        </p>
      </div>
    </div>
  )
}

function PatternsCard({ patterns }) {
  return (
    <div className="flex flex-col justify-center min-h-[58vh] gap-5">
      <div>
        <p className="label mb-1">Patterns</p>
        <p className="text-text-muted text-sm">Running in the background</p>
      </div>

      <div className="space-y-3">
        {patterns.map((p, i) => {
          const isActive    = p.status === 'active'
          const isImproving = p.status === 'improving'
          return (
            <div key={i} className="p-4" style={{ borderRadius: '24px 20px 28px 22px', background: 'rgba(255,249,240,0.6)', border: '1px solid rgba(192,108,84,0.08)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-text-primary text-sm font-medium leading-snug">{p.label}</p>
                <span
                  className="text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0"
                  style={
                    isActive
                      ? { background: 'rgba(213,140,0,0.12)', color: '#92400E' }
                      : isImproving
                        ? { background: 'rgba(67,160,71,0.10)', color: '#2E7D32' }
                        : { background: '#F0EDE8', color: '#9E8E83' }
                  }
                >
                  {isActive ? 'Still active' : isImproving ? 'Improving' : p.status}
                </span>
              </div>
              {p.note && (
                <p className="text-text-muted text-xs leading-relaxed">{p.note}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function TriggersCard({ triggers }) {
  return (
    <div className="flex flex-col justify-center min-h-[58vh] gap-5">
      <div>
        <p className="label mb-1">Common triggers</p>
        <p className="text-text-muted text-sm">What tends to pull the thread</p>
      </div>

      <div className="space-y-4">
        {triggers.map((t, i) => {
          const total = (t.stable ?? 0) + (t.activated ?? 0) + (t.difficult ?? 0)
          const sp    = total ? Math.round(((t.stable    ?? 0) / total) * 100) : 0
          const ap    = total ? Math.round(((t.activated ?? 0) / total) * 100) : 0
          const dp    = 100 - sp - ap
          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-text-secondary text-sm">{t.label}</p>
                <p className="text-text-muted text-xs ml-3 flex-shrink-0">{total}×</p>
              </div>
              <div className="flex h-2 rounded-full overflow-hidden gap-px">
                {sp > 0 && <div style={{ width: `${sp}%`, background: SC.stable.dot }} />}
                {ap > 0 && <div style={{ width: `${ap}%`, background: SC.activated.dot }} />}
                {dp > 0 && <div style={{ width: `${dp}%`, background: SC.difficult.dot }} />}
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center gap-5 pt-1">
        {Object.entries(SC).map(([key, c]) => (
          <div key={key} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full" style={{ background: c.dot }} />
            <p className="text-text-muted text-xs">{c.label}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

function QuestionCard({ section, sp }) {
  return (
    <div
      className="flex flex-col justify-center min-h-[58vh] gap-6 p-6"
      style={{ borderRadius: '24px 20px 28px 22px', background: `${sp}09`, border: `1px solid ${sp}28` }}
    >
      <p className="label" style={{ color: sp }}>Sit with this</p>
      <p className="text-text-primary font-light italic leading-relaxed text-[22px]">
        {section.content}
      </p>
    </div>
  )
}

function FooterCard({ report, sp, navigate }) {
  return (
    <div className="flex flex-col justify-center min-h-[58vh] gap-7">
      <div>
        <p className="label mb-1">You're done.</p>
        <p className="text-text-muted text-sm">Your next report generates after more sessions with Emora.</p>
      </div>

      <div className="space-y-3">
        <button
          onClick={() => navigate('/emora', {
            state: { preDraft: report.closing_question
              ? `I've been sitting with something from my pattern report: "${report.closing_question}" `
              : 'I just read my pattern report. Something stood out: ' }
          })}
          className="btn-primary w-full"
          style={{ background: sp }}
        >
          Process with Emora
        </button>
      </div>

      <p className="text-text-muted text-xs">
        Generated {new Date(report.generated_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
      </p>
    </div>
  )
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function PatternReport() {
  const navigate = useNavigate()
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'

  const [report, setReport]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating]     = useState(false)
  const [generateError, setGenerateError] = useState('')
  const [noReport, setNoReport]         = useState(false)
  const [loadError, setLoadError]       = useState(false)
  const [cardIdx, setCardIdx]       = useState(0)
  const [history, setHistory]       = useState([])
  const [showHistory, setShowHistory]     = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)

  // Swipe support
  const touchX = useRef(null)

  useEffect(() => {
    patternReportAPI.getLatest()
      .then(res => {
        if (res.data.report) setReport(res.data.report)
        else setNoReport(true)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }, [])

  async function loadHistory() {
    setHistoryLoading(true)
    try {
      const res = await patternReportAPI.getAll()
      setHistory(res.data.reports || [])
      setShowHistory(true)
    } catch {}
    finally { setHistoryLoading(false) }
  }

  async function loadById(id) {
    setLoading(true)
    setShowHistory(false)
    try {
      const res = await patternReportAPI.getById(id)
      if (res.data.report) { setReport(res.data.report); setCardIdx(0) }
    } catch {}
    finally { setLoading(false) }
  }

  function loadReport() {
    setLoadError(false)
    setLoading(true)
    patternReportAPI.getLatest()
      .then(res => {
        if (res.data.report) { setReport(res.data.report); setNoReport(false) }
        else setNoReport(true)
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }

  async function handleGenerate() {
    setGenerating(true)
    setGenerateError('')
    try {
      await patternReportAPI.generate()
      const res = await patternReportAPI.getLatest()
      if (res.data.report) { setReport(res.data.report); setNoReport(false); setCardIdx(0) }
    } catch (err) {
      setGenerateError(err.response?.data?.error || 'Could not generate report. Try again.')
    } finally { setGenerating(false) }
  }

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${sp}4D`, borderTopColor: sp }} />
        <p className="text-text-muted text-sm">Loading your report...</p>
      </div>
    )
  }

  // ── Error ────────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div className="px-5 py-10 flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
        <p className="text-text-primary font-medium mb-2.5">Couldn't load right now.</p>
        <p className="text-text-secondary text-sm leading-relaxed max-w-[260px] mb-8">Nothing is lost — try again.</p>
        <button onClick={loadReport} className="btn-secondary text-sm">Try again</button>
      </div>
    )
  }

  // ── No report ────────────────────────────────────────────────────────────
  if (noReport) {
    return (
      <div className="px-5 py-10 flex flex-col items-center justify-center min-h-[70vh] text-center animate-fade-in">
        <div className="w-14 h-14 rounded-2xl bg-surface-elevated border border-surface-border mb-7 flex items-center justify-center">
          <svg className="w-6 h-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </div>
        <p className="text-text-primary font-medium mb-2.5">Not ready yet.</p>
        <p className="text-text-secondary text-sm leading-relaxed max-w-[260px] mb-8">
          After enough sessions, this becomes a mirror — not a summary, but a real picture of what's been running in you. Give it a few more conversations.
        </p>
        {process.env.NODE_ENV !== 'production' && (
          <div className="flex flex-col items-center gap-3">
            <button onClick={handleGenerate} disabled={generating} className="btn-secondary text-sm">
              {generating ? 'Generating...' : 'Generate test report'}
            </button>
            {generateError && (
              <p className="text-state-crisis text-sm text-center max-w-[240px]">{generateError}</p>
            )}
            <button
              onClick={() => { setReport(DUMMY_REPORT); setNoReport(false); setCardIdx(0) }}
              className="btn-ghost text-sm"
            >
              Preview with dummy content
            </button>
          </div>
        )}
      </div>
    )
  }

  if (!report) return null

  // ── Parse + build cards ───────────────────────────────────────────────────
  const { sections, parseError, raw } = parseReportSections(report.content)

  if (parseError && sections.length === 0) {
    return (
      <div className="px-5 py-6 animate-fade-in">
        <p className="label mb-6">{new Date(report.period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</p>
        <div className="card">
          <p className="text-text-secondary leading-relaxed text-sm whitespace-pre-wrap">{raw || report.content}</p>
        </div>
      </div>
    )
  }

  const cards  = buildCards(report, sections, sp)
  const total  = cards.length
  const card   = cards[Math.min(cardIdx, total - 1)] // guard against out-of-bounds index

  function prev() { if (cardIdx > 0) setCardIdx(i => i - 1) }
  function next() { if (cardIdx < total - 1) setCardIdx(i => i + 1) }

  function onTouchStart(e) { touchX.current = e.touches[0].clientX }
  function onTouchEnd(e) {
    if (touchX.current === null) return
    const delta = touchX.current - e.changedTouches[0].clientX
    if (delta > 48) next()
    else if (delta < -48) prev()
    touchX.current = null
  }

  // ── Wrapped reveal ────────────────────────────────────────────────────────
  return (
    <div
      className="flex flex-col px-5"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Progress segments */}
      <div className="flex gap-1 py-4 flex-shrink-0">
        {cards.map((_, i) => (
          <div
            key={i}
            onClick={() => setCardIdx(i)}
            className="flex-1 h-0.5 rounded-full cursor-pointer transition-all duration-300"
            style={{ background: i <= cardIdx ? sp : '#E6E0D8', opacity: i < cardIdx ? 0.35 : 1 }}
          />
        ))}
      </div>

      {/* Card body */}
      <div key={`${report.generated_at}-${cardIdx}`} className="animate-fade-in">
        {card && card.type === 'score'    && <ScoreCard    report={report} />}
        {card && card.type === 'cover'    && <CoverCard    report={report} sp={sp} />}
        {card && card.type === 'arc'      && <ArcCard      arc={report.emotional_arc} />}
        {card && card.type === 'section'  && !card.section.isQuestion && <SectionCard section={card.section} sp={sp} />}
        {card && card.type === 'patterns' && <PatternsCard patterns={report.patterns} />}
        {card && card.type === 'triggers' && <TriggersCard triggers={report.triggers} />}
        {card && card.type === 'question' && <QuestionCard section={card.section} sp={sp} />}
        {card && card.type === 'footer'   && <FooterCard   report={report} sp={sp} navigate={navigate} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between py-6 flex-shrink-0">
        <button
          onClick={prev}
          disabled={cardIdx === 0}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{ background: cardIdx === 0 ? 'transparent' : 'rgba(255,249,240,0.8)', opacity: cardIdx === 0 ? 0 : 1 }}
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>

        <p className="text-text-muted text-xs">{cardIdx + 1} / {total}</p>

        <button
          onClick={next}
          disabled={cardIdx === total - 1}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all"
          style={{
            background: cardIdx === total - 1 ? 'transparent' : `${sp}18`,
            opacity: cardIdx === total - 1 ? 0 : 1,
          }}
        >
          <svg className="w-4 h-4" style={{ color: sp }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
          </svg>
        </button>
      </div>

      {/* Past reports — only on footer card */}
      {card.type === 'footer' && (
        <div className="pb-4">
          {!showHistory ? (
            <div className="text-center">
              <button onClick={loadHistory} disabled={historyLoading} className="btn-ghost text-sm">
                {historyLoading ? 'Loading...' : 'Past reports →'}
              </button>
            </div>
          ) : (
            <div>
              <p className="label mb-4">Past reports</p>
              <div className="space-y-0">
                {history.map(r => (
                  <button
                    key={r.id}
                    onClick={() => loadById(r.id)}
                    className="w-full text-left py-3.5 border-b border-surface-border last:border-0 flex items-center justify-between gap-3 hover:opacity-70 transition-opacity"
                  >
                    <div>
                      <p className="text-text-secondary text-sm">
                        {new Date(r.period_end).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                      </p>
                      {r.closing_question && (
                        <p className="text-text-muted text-xs mt-0.5 line-clamp-1 italic">"{r.closing_question}"</p>
                      )}
                    </div>
                    <svg className="w-4 h-4 text-text-muted flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function parseReportSections(content) {
  if (!content) return { sections: [], parseError: true }

  const HEADERS = [
    { canonical: 'WHAT I NOTICED',      variants: ['WHAT I NOTICED', 'WHAT WE NOTICED', 'WHAT EMORA NOTICED'] },
    { canonical: 'WHAT SHIFTED',         variants: ['WHAT SHIFTED', 'WHAT HAS SHIFTED', "WHAT'S SHIFTED"] },
    { canonical: "WHAT'S STILL RUNNING", variants: ["WHAT'S STILL RUNNING", 'WHAT IS STILL RUNNING', 'STILL RUNNING', "WHAT'S STILL ACTIVE"] },
    { canonical: 'ONE QUESTION',         variants: ['ONE QUESTION', 'A QUESTION', 'THE QUESTION'] },
  ]

  const upper = content.toUpperCase()

  const found = HEADERS.map(h => {
    for (const v of h.variants) {
      const idx = upper.indexOf(v.toUpperCase())
      if (idx !== -1) return { canonical: h.canonical, start: idx, len: v.length }
    }
    return null
  }).filter(Boolean).sort((a, b) => a.start - b.start)

  if (found.length === 0) return { sections: [], parseError: true, raw: content }

  const sections = found.map((h, i) => {
    const contentStart = h.start + h.len
    const end = found[i + 1]?.start ?? content.length
    return {
      title: h.canonical,
      content: content.slice(contentStart, end).trim(),
      isQuestion: h.canonical === 'ONE QUESTION',
    }
  }).filter(s => s.content.length > 0)

  return { sections, parseError: sections.length < 2 }
}
