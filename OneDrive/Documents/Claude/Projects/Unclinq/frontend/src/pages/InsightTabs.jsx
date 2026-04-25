import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { insightTabsAPI } from '../services/api'
import { Check } from 'lucide-react'
import { InsightsEmptyIllustration } from '../components/Illustrations'
import { useApp } from '../context/AppContext'

const GRAIN_BG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.04'/%3E%3C/svg%3E")`

export default function InsightTabs() {
  const [tabs, setTabs] = useState([])
  const [meta, setMeta] = useState(null)
  const [locked, setLocked] = useState(false)
  const [lockMessage, setLockMessage] = useState('')
  const [selectedTab, setSelectedTab] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(false)
  const [activeTheme, setActiveTheme] = useState('all')
  const openedAt = useRef(null)
  const navigate = useNavigate()
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'

  // Theme → color mapping (defined early so tab detail view can access it)
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
  function themeColor(theme) {
    return THEME_COLORS[theme] || { bg: 'rgba(192,108,84,0.1)', text: sp, dot: sp, bar: 'rgba(192,108,84,0.25)' }
  }

  // Pattern Archive (Phase 3 only)
  const [archive, setArchive] = useState(null)
  const [showArchive, setShowArchive] = useState(false)

  function fetchTabs() {
    setLoadError(false)
    setLoading(true)
    insightTabsAPI.getAll()
      .then(res => {
        if (res.data.locked) {
          setLocked(true)
          setLockMessage(res.data.message)
        } else {
          setTabs(res.data.tabs || [])
          setMeta(res.data.meta || null)
        }
      })
      .catch(() => setLoadError(true))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchTabs()

    // Attempt to fetch Pattern Archive — silently ignored if not Phase 3
    insightTabsAPI.getPatternArchive()
      .then(res => {
        if (!res.data.locked) setArchive(res.data)
      })
      .catch(() => {})
  }, [])

  function openTab(tab) {
    setSelectedTab(tab)
    openedAt.current = Date.now()
  }

  function closeTab() {
    if (selectedTab && openedAt.current) {
      const dwellSeconds = Math.floor((Date.now() - openedAt.current) / 1000)
      insightTabsAPI.markRead(selectedTab.id, dwellSeconds).catch(() => {})
      // Update local read state
      setTabs(prev => prev.map(t => t.id === selectedTab.id ? { ...t, read: true } : t))
    }
    setSelectedTab(null)
    openedAt.current = null
  }

  // Navigate between tabs in detail view — marks current as read before moving
  function navigateTab(newTab) {
    if (selectedTab && openedAt.current) {
      const dwellSeconds = Math.floor((Date.now() - openedAt.current) / 1000)
      insightTabsAPI.markRead(selectedTab.id, dwellSeconds).catch(() => {})
      setTabs(prev => prev.map(t => t.id === selectedTab.id ? { ...t, read: true } : t))
    }
    setSelectedTab(newTab)
    openedAt.current = Date.now()
  }

  // E-02: Open Emora with pre-drafted message anchored to this tab
  function exploreWithEmora(tab) {
    closeTab()
    const preDraft = `I just read something that landed. "${tab.title}" I want to sit with that.`
    navigate('/emora', { state: { preDraft, tabTheme: tab.theme } })
  }

  const BATCH_SIZE = 5

  // Compute which batch is currently active (hooks must be called unconditionally)
  const batchIndex = (() => {
    for (let i = 0; i < Math.ceil(tabs.length / BATCH_SIZE); i++) {
      const batch = tabs.slice(i * BATCH_SIZE, (i + 1) * BATCH_SIZE)
      if (batch.some(t => !t.read)) return i
    }
    return Math.max(0, Math.ceil(tabs.length / BATCH_SIZE) - 1)
  })()

  // Reset theme filter when the batch advances — must be above all conditional returns
  useEffect(() => {
    setActiveTheme('all')
  }, [batchIndex])

  // Compute current batch before any early returns so selectedTab detail view can use it
  const currentBatch = tabs.slice(batchIndex * BATCH_SIZE, (batchIndex + 1) * BATCH_SIZE)
  const selectedBatchIndex = selectedTab ? currentBatch.findIndex(t => t.id === selectedTab.id) : -1

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-3">
        <div className="w-5 h-5 rounded-full border-2 animate-spin" style={{ borderColor: `${sp}4D`, borderTopColor: sp }} />
        <p className="text-text-muted text-sm">Getting your tabs...</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-4 px-8 text-center animate-fade-in">
        <p className="text-text-secondary text-sm">Couldn't load right now. Nothing is lost — try again.</p>
        <button onClick={fetchTabs} className="btn-ghost text-sm">Try again</button>
      </div>
    )
  }

  if (locked) {
    const isCrisisLock = lockMessage.toLowerCase().includes('rescue')
    return (
      <div className="px-5 py-10 flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <div className="w-full space-y-4">
          {/* Lock card */}
          <div className="relative overflow-hidden"
            style={{ background: 'white', borderRadius: '24px 20px 28px 22px', boxShadow: '0 8px 30px -8px rgba(143,169,181,0.2)', border: '1px solid rgba(143,151,121,0.15)', padding: '2rem 1.5rem' }}>
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: `${sp}07`, filter: 'blur(32px)' }} />

            <div className="relative z-10 space-y-4">
              <InsightsEmptyIllustration className="w-28 h-28" />
              <div>
                <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Insight Tabs
                </p>
                <p className="font-serif" style={{ fontSize: '1.25rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.01em', lineHeight: 1.3 }}>
                  {isCrisisLock ? 'A clearer head first.' : 'Not yet.'}
                </p>
                <p className="text-text-secondary text-sm leading-relaxed mt-2">{lockMessage}</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(isCrisisLock ? '/rescue' : '/emora')}
            className="w-full text-left p-5 transition-all active:scale-[0.98]"
            style={{ background: 'rgba(255,249,240,0.8)', borderRadius: '16px 4px 16px 4px', border: '1px solid rgba(192,108,84,0.12)' }}>
            <p style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.12em', color: '#8C9688', textTransform: 'uppercase', marginBottom: '4px' }}>
              {isCrisisLock ? 'Regulate' : 'Emora'}
            </p>
            <p className="font-serif" style={{ fontSize: '1.1rem', color: '#2C332B', fontWeight: 500 }}>
              {isCrisisLock ? 'Open Rescue Mode' : 'Talk to Emora →'}
            </p>
          </button>
        </div>
      </div>
    )
  }

  // Pattern Archive detail view (Phase 3+)
  if (showArchive && archive) {
    const earliest = archive.earliest || { sessions: [] }
    const latest = archive.latest || { sessions: [] }
    const rawDelta = archive.delta || {}
    const delta = {
      quieted:    Array.isArray(rawDelta.quieted)    ? rawDelta.quieted    : [],
      persisting: Array.isArray(rawDelta.persisting) ? rawDelta.persisting : [],
      improved:   Array.isArray(rawDelta.improved)   ? rawDelta.improved   : [],
    }
    const narrative = archive.narrative || null

    return (
      <div className="px-5 py-6 animate-slide-up">
        <button
          onClick={() => setShowArchive(false)}
          className="flex items-center gap-2 text-text-muted hover:text-text-secondary mb-8 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
          <span className="text-sm">Back</span>
        </button>

        <div className="space-y-8">
          <div>
            <p className="label mb-2">Pattern Archive</p>
            <h2 className="t-h1">
              Where you started. Where you are.
            </h2>
          </div>

          <div className="w-8 h-px bg-surface-border" />

          {/* Narrative letter — shown when ready, spinner while generating */}
          {narrative ? (
            <div className="space-y-4">
              {narrative.split('\n\n').filter(Boolean).map((para, i) => (
                <p key={i} className="t-body">
                  {para}
                </p>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3 py-2">
              <div className="w-4 h-4 rounded-full border-2 animate-spin flex-shrink-0" style={{ borderColor: `${sp}4D`, borderTopColor: sp }} />
              <p className="text-text-muted text-sm">Preparing your personal reflection…</p>
            </div>
          )}

          <div className="w-8 h-px bg-surface-border" />

          {/* Then vs. Now — raw session quotes as supporting context */}
          <div className="space-y-6">
            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <p className="label">Then</p>
                {earliest.sessions[0]?.date && (
                  <p className="text-text-muted text-xs">
                    {new Date(earliest.sessions[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              {earliest.sessions.slice(0, 2).map((s, i) => s.key_insight && (
                <p key={i} className="t-body-sm italic">
                  "{s.key_insight}"
                </p>
              ))}
              {(delta.quieted.length + delta.persisting.length) > 0 && (
                <p className="t-caption mt-2">
                  Patterns active: {delta.quieted.concat(delta.persisting).map(p => p.replace(/_/g, ' ')).join(', ')}
                </p>
              )}
            </div>

            <div className="card space-y-3">
              <div className="flex items-center justify-between">
                <p className="label">Now</p>
                {latest.sessions[0]?.date && (
                  <p className="text-text-muted text-xs">
                    {new Date(latest.sessions[0].date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </p>
                )}
              </div>
              {latest.sessions.slice(0, 2).map((s, i) => s.key_insight && (
                <p key={i} className="t-body-sm italic">
                  "{s.key_insight}"
                </p>
              ))}
              {delta.persisting.length > 0 && (
                <p className="t-caption mt-2">
                  Still active: {delta.persisting.map(p => p.replace(/_/g, ' ')).join(', ')}
                </p>
              )}
              {delta.persisting.length === 0 && (
                <p className="t-caption mt-2">None of the original patterns are still showing up this way.</p>
              )}
            </div>
          </div>

          {/* What quieted */}
          {delta.quieted.length > 0 && (
            <div className="border-l-2 border-terra pl-5 space-y-1">
              <p className="label">What's quieter</p>
              <p className="text-text-primary text-sm leading-relaxed">
                {delta.quieted.map(p => p.replace(/_/g, ' ')).join(', ')}
              </p>
              <p className="t-caption mt-1">
                These patterns are no longer showing up in your sessions the way they used to.
              </p>
            </div>
          )}

          {/* What improved */}
          {delta.improved.length > 0 && (
            <div className="border-l-2 border-terra/50 pl-5 space-y-1">
              <p className="label">What's actively improving</p>
              <p className="text-text-primary text-sm leading-relaxed">
                {delta.improved.map(p => p.replace(/_/g, ' ')).join(', ')}
              </p>
              <p className="t-caption mt-1">
                These are showing up differently — still present, but with less force.
              </p>
            </div>
          )}

          {/* What persists */}
          {delta.persisting.length > 0 && (
            <div className="space-y-1">
              <p className="label">What's still running</p>
              <p className="text-text-secondary text-sm leading-relaxed">
                {delta.persisting.map(p => p.replace(/_/g, ' ')).join(', ')}
              </p>
              <p className="t-caption mt-1">
                Stubborn patterns are stubborn because they worked once. That's not a verdict — it's the next thing to work on.
              </p>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Tab detail view
  if (selectedTab) {
    const tc = themeColor(selectedTab.theme)
    return (
      <div className="animate-slide-up min-h-dvh pb-10" style={{ background: '#F8F1E7' }}>
        <div className="fixed inset-0 pointer-events-none z-0"
          style={{ backgroundImage: GRAIN_BG, mixBlendMode: 'multiply' }} />

        <div className="relative z-10 px-5 pt-6 space-y-4">

          {/* Back + prev/next nav */}
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={closeTab}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-70"
              style={{ color: '#8C9688' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            {currentBatch.length > 1 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => selectedBatchIndex > 0 && navigateTab(currentBatch[selectedBatchIndex - 1])}
                  disabled={selectedBatchIndex <= 0}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-25"
                  style={{ background: 'rgba(143,151,121,0.12)' }}
                  aria-label="Previous tab"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#8C9688' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                  </svg>
                </button>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#8C9688' }}>
                  {selectedBatchIndex + 1}/{currentBatch.length}
                </span>
                <button
                  onClick={() => selectedBatchIndex < currentBatch.length - 1 && navigateTab(currentBatch[selectedBatchIndex + 1])}
                  disabled={selectedBatchIndex >= currentBatch.length - 1}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-all disabled:opacity-25"
                  style={{ background: 'rgba(143,151,121,0.12)' }}
                  aria-label="Next tab"
                >
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5} style={{ color: '#8C9688' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {/* Header — theme pill + title */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tc.dot }} />
              <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: tc.text, textTransform: 'uppercase' }}>
                {selectedTab.theme?.replace(/_/g, ' ')}
              </span>
              {selectedTab.priority === 2 && (
                <span className="px-2 py-0.5 rounded-full text-white font-bold"
                  style={{ fontSize: '9px', background: tc.dot, letterSpacing: '0.06em' }}>
                  KEY
                </span>
              )}
              <span className="ml-auto flex items-center gap-1" style={{ fontSize: '11px', fontWeight: 600, color: '#8C9688' }}>
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {selectedTab.read_time_seconds < 60
                  ? `${selectedTab.read_time_seconds}s`
                  : `${Math.round(selectedTab.read_time_seconds / 60)} min`}
              </span>
            </div>

            <h2 className="font-serif leading-snug"
              style={{ fontSize: '1.625rem', fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.25, color: '#2C332B' }}>
              {selectedTab.title}
            </h2>
          </div>

          {/* Body card — white stone */}
          <div className="relative overflow-hidden"
            style={{ background: 'white', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)', padding: '1.5rem' }}>
            <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
              style={{ background: tc.bg, filter: 'blur(24px)', opacity: 0.6 }} />
            <p className="relative z-10 text-base leading-relaxed" style={{ color: '#5D4037', lineHeight: 1.75 }}>
              {selectedTab.body}
            </p>
          </div>

          {/* Exit quote — accent stone card */}
          {selectedTab.exit && (
            <div className="p-5"
              style={{ borderRadius: '24px 20px 28px 22px', background: tc.bg, border: `1px solid ${tc.bar}` }}>
              <div className="w-3 h-0.5 mb-3 rounded-full" style={{ background: tc.dot }} />
              <p className="font-serif italic leading-relaxed" style={{ color: '#2C332B', fontSize: '15px', lineHeight: 1.65 }}>
                "{selectedTab.exit}"
              </p>
            </div>
          )}

          {/* Emora CTA */}
          <button
            onClick={() => exploreWithEmora(selectedTab)}
            className="btn-primary w-full flex items-center justify-center gap-2">
            Sit with this in Emora
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>

        </div>
      </div>
    )
  }

  const batchRead = currentBatch.filter(t => t.read).length
  const batchComplete = currentBatch.length > 0 && batchRead === currentBatch.length
  const hasNextBatch = (batchIndex + 1) * BATCH_SIZE < tabs.length

  // Theme filter applies within the current batch only
  const themes = currentBatch.length > 0
    ? ['all', ...Array.from(new Set(currentBatch.map(t => t.theme).filter(Boolean)))]
    : []

  const visibleTabs = activeTheme === 'all'
    ? currentBatch
    : currentBatch.filter(t => t.theme === activeTheme)

  // Tab list
  return (
    <div className="py-4 animate-fade-in">
      {/* Header */}
      <div className="px-5 mb-5">
        <p className="font-serif text-text-primary leading-snug mb-1" style={{ fontSize: '1.35rem', fontWeight: 600, letterSpacing: '-0.018em' }}>
          A different frame.
        </p>
        <p className="t-body">For things you've been living.</p>
        {/* Batch progress */}
        {currentBatch.length > 0 && (
          <div className="mt-4 p-4 border"
            style={{ borderRadius: '24px 20px 28px 22px', background: 'rgba(255,249,240,0.6)', borderColor: 'rgba(192,108,84,0.08)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-sans font-bold uppercase tracking-widest" style={{ fontSize: '10px', color: '#8D6E63' }}>
                This batch
              </span>
              <span style={{ fontSize: '11px', fontWeight: 700, color: sp }}>
                {batchRead}/{currentBatch.length} read
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-border overflow-hidden">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(batchRead / currentBatch.length) * 100}%`, background: sp }} />
            </div>
          </div>
        )}
      </div>

      {/* Pattern Archive card — Phase 3 only */}
      {archive && (
        <div className="px-5 mb-3">
          <button
            onClick={() => setShowArchive(true)}
            className="w-full text-left p-5 border transition-all duration-200 active:scale-[0.99]"
            style={{
              borderRadius: '24px 20px 28px 22px',
              borderColor: `${sp}33`,
              background: `${sp}08`,
              boxShadow: '0 1px 3px rgba(44,55,40,0.05), 0 2px 8px rgba(44,55,40,0.03)',
            }}
          >
            <p className="label mb-2">Pattern Archive</p>
            <p className="t-h3">Where you started. Where you are.</p>
            <p className="t-caption mt-1.5">A read-only view of your earliest patterns vs. now.</p>
          </button>
        </div>
      )}

      {tabs.length === 0 ? (
        <div className="text-center py-10 flex flex-col items-center px-5">
          <InsightsEmptyIllustration className="w-40 h-40 mb-5" />
          <p className="t-h3 mb-2">Not yet.</p>
          <p className="t-body max-w-[220px] mx-auto">
            These are matched to your patterns. Emora needs to know you first.
          </p>
        </div>
      ) : (
        <>
          {/* Horizontal theme filter pills — only if multiple themes in current batch */}
          {themes.length > 2 && (
            <div className="h-scroll scrollbar-hide px-5 mb-4">
              {themes.map(theme => (
                <button
                  key={theme}
                  onClick={() => setActiveTheme(theme)}
                  className="flex-shrink-0 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all duration-200 whitespace-nowrap"
                  style={{
                    borderColor: activeTheme === theme ? sp : 'rgba(192,108,84,0.12)',
                    background:  activeTheme === theme ? `${sp}16` : 'rgba(255,249,240,0.8)',
                    color:       activeTheme === theme ? sp : '#9E8E83',
                    letterSpacing: '0.03em',
                  }}
                >
                  {theme === 'all' ? 'All' : theme.replace(/_/g, ' ')}
                </button>
              ))}
              <div style={{ width: '20px', flexShrink: 0 }} />
            </div>
          )}

          <div className="px-5 space-y-3">
            {visibleTabs.map(tab => {
              const tc = themeColor(tab.theme)
              return (
                <button
                  key={tab.id}
                  onClick={() => openTab(tab)}
                  className="w-full text-left overflow-hidden transition-all duration-200 active:scale-[0.99]"
                  style={{
                    borderRadius: '24px 20px 28px 22px',
                    background: tab.read ? 'rgba(255,249,240,0.45)' : 'white',
                    boxShadow: tab.read ? 'none' : '0 4px 20px -4px rgba(143,169,181,0.2), 0 1px 4px rgba(44,55,40,0.05)',
                    border: `1px solid ${tab.read ? 'rgba(192,108,84,0.07)' : 'rgba(143,151,121,0.18)'}`,
                    opacity: tab.read ? 0.75 : 1,
                  }}
                >
                  {/* Colored theme ribbon */}
                  {!tab.read && tab.theme && (
                    <div className="px-4 pt-3.5 pb-2.5 flex items-center gap-2"
                      style={{ borderBottom: `1px solid ${tc.bar}` }}>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: tc.dot }} />
                      <span style={{ fontSize: '10px', fontWeight: 700, letterSpacing: '0.1em', color: tc.text, textTransform: 'uppercase' }}>
                        {tab.theme.replace(/_/g, ' ')}
                      </span>
                      {tab.priority === 2 && (
                        <span className="ml-auto px-2 py-0.5 rounded-full text-white font-bold"
                          style={{ fontSize: '9px', background: tc.dot, letterSpacing: '0.06em' }}>
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
                          <p className="t-caption mt-2 line-clamp-2 leading-relaxed">
                            {tab.body}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2.5">
                          <p className="t-caption">
                            {tab.read_time_seconds < 60
                              ? `${tab.read_time_seconds}s read`
                              : `${Math.round(tab.read_time_seconds / 60)} min read`}
                          </p>
                          {!tab.read && (
                            <span className="t-caption font-semibold" style={{ color: tc.text }}>· Read →</span>
                          )}
                        </div>
                      </div>

                      {tab.read ? (
                        <Check size={15} strokeWidth={2} className="text-text-muted flex-shrink-0 mt-0.5" />
                      ) : (
                        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                          style={{ background: tc.bg }}>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke={tc.dot} strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Batch complete state */}
          {batchComplete && (
            <div className="px-5 mt-6 animate-fade-in">
              <div className="relative overflow-hidden p-5 space-y-3"
                style={{ background: 'white', borderRadius: '24px 20px 28px 22px', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.18)' }}>
                <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: `${sp}08`, filter: 'blur(24px)' }} />
                <p className="font-serif relative z-10" style={{ fontSize: '1.1rem', fontWeight: 500, color: '#2C332B', letterSpacing: '-0.01em' }}>
                  {hasNextBatch ? 'This batch is done.' : 'You’ve read everything.'}
                </p>
                <p className="text-sm leading-relaxed relative z-10" style={{ color: '#8C9688' }}>
                  {hasNextBatch
                    ? 'The next batch is ready above.'
                    : 'New tabs are generated from your sessions with Emora. The more you share, the more specific they get.'}
                </p>
                {!hasNextBatch && (
                  <button
                    onClick={() => navigate('/emora')}
                    className="btn-primary w-full flex items-center justify-center gap-2 relative z-10 mt-1">
                    Talk to Emora
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
