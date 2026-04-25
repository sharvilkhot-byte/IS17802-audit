import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { authAPI, emoraAPI } from '../services/api'
import { EmotionFace, stateToFace } from '../components/Illustrations'

const SITUATION_OPTIONS = [
  { value: 'in_relationship',  label: 'In a relationship' },
  { value: 'dating',           label: 'Dating or talking to someone' },
  { value: 'unrequited',       label: 'One-sided feelings' },
  { value: 'post_breakup',     label: 'Post-breakup' },
  { value: 'single_healing',   label: 'Single, working on myself' },
]

const ROLE_OPTIONS = [
  { value: 'partner',   label: 'Partner'   },
  { value: 'ex',        label: 'Ex'        },
  { value: 'friend',    label: 'Friend'    },
  { value: 'family',    label: 'Family'    },
  { value: 'colleague', label: 'Colleague' },
  { value: 'other',     label: 'Other'     },
]

function loadStoredContext() {
  try { return JSON.parse(localStorage.getItem('unclinq_user_context') || 'null') } catch { return null }
}

export default function Settings() {
  const { profile, updateProfile, logout, styleColor } = useApp()
  const navigate = useNavigate()
  const sp = styleColor?.primary ?? '#4A6741'

  const [name, setName] = useState(profile?.name || '')
  const [situation, setSituation] = useState(profile?.relationship_situation || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState('')

  // Reassessment
  const [reassessmentRequested, setReassessmentRequested] = useState(false)
  const [reassessmentLoading, setReassessmentLoading] = useState(false)

  // Data export
  const [exporting, setExporting] = useState(false)

  // Session history
  const [sessionHistory, setSessionHistory] = useState([])
  const [historyLoaded, setHistoryLoaded] = useState(false)
  const [historyLoading, setHistoryLoading] = useState(false)
  const [excludeError, setExcludeError] = useState('')

  // Your context — seeded from server profile (works across devices), falls back to localStorage
  const stored = loadStoredContext()
  const serverCtx = (profile?.user_context && typeof profile.user_context === 'object') ? profile.user_context : null
  const initialCtx = serverCtx || stored
  const [contextPeople,    setContextPeople]    = useState(initialCtx?.people   || [])
  const [contextSituation, setContextSituation] = useState(initialCtx?.situation || '')

  // Sync context fields if profile loads after initial render (e.g. async /me refresh)
  useEffect(() => {
    if (!profile?.user_context || typeof profile.user_context !== 'object') return
    const uc = profile.user_context
    if (Array.isArray(uc.people) && uc.people.length > 0) setContextPeople(uc.people)
    if (uc.situation) setContextSituation(uc.situation)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])
  const [contextSaving,   setContextSaving]   = useState(false)
  const [contextSaved,    setContextSaved]    = useState(false)

  // Delete account
  const [showDelete, setShowDelete] = useState(false)
  const [deletePassword, setDeletePassword] = useState('')
  const [deleting, setDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setSaveError('')
    setSaved(false)
    try {
      const updates = {}
      if (name.trim() !== (profile?.name || '')) updates.name = name.trim()
      if (situation !== profile?.relationship_situation) updates.relationship_situation = situation

      if (Object.keys(updates).length === 0) {
        setSaving(false)
        return
      }

      const res = await authAPI.updateSettings(updates)
      updateProfile(res.data.user)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err) {
      setSaveError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setSaving(false)
    }
  }

  async function handleRequestReassessment() {
    setReassessmentLoading(true)
    try {
      await authAPI.requestReassessment()
      setReassessmentRequested(true)
    } catch {}
    finally { setReassessmentLoading(false) }
  }

  async function handleExportData() {
    setExporting(true)
    try {
      const res = await authAPI.exportData()
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `unclinq-data-${new Date().toISOString().split('T')[0]}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch {}
    finally { setExporting(false) }
  }

  async function loadSessionHistory() {
    setHistoryLoading(true)
    try {
      const res = await emoraAPI.sessionHistory()
      setSessionHistory(res.data.sessions || [])
      setHistoryLoaded(true)
    } catch {}
    finally { setHistoryLoading(false) }
  }

  async function handleToggleExclude(sessionId, currentExcluded) {
    const next = !currentExcluded
    setExcludeError('')
    setSessionHistory(prev => prev.map(s => s.id === sessionId ? { ...s, excluded: next } : s))
    try {
      await emoraAPI.toggleExclude(sessionId, next)
    } catch {
      setSessionHistory(prev => prev.map(s => s.id === sessionId ? { ...s, excluded: currentExcluded } : s))
      setExcludeError("Couldn't update — check your connection.")
    }
  }

  async function handleDeleteAccount() {
    if (!deletePassword) {
      setDeleteError('Enter your password to confirm.')
      return
    }
    setDeleting(true)
    setDeleteError('')
    try {
      await authAPI.deleteAccount(deletePassword)
      logout()
      navigate('/')
    } catch (err) {
      setDeleteError(err.response?.data?.error || 'Could not delete account. Check your password.')
      setDeleting(false)
    }
  }

  async function saveContext() {
    setContextSaving(true)
    const payload = {
      people:    contextPeople.filter(p => p.name.trim()),
      situation: contextSituation.trim(),
    }
    // Always save locally so emoraContext picks it up immediately
    localStorage.setItem('unclinq_user_context', JSON.stringify(payload))
    // Attempt to persist to backend (backend may ignore unknown fields until supported)
    try { await authAPI.updateSettings({ user_context: payload }) } catch {}
    setContextSaving(false)
    setContextSaved(true)
    setTimeout(() => setContextSaved(false), 3000)
  }

  function addPerson()          { if (contextPeople.length < 3) setContextPeople(p => [...p, { name: '', role: 'partner' }]) }
  function removePerson(i)      { setContextPeople(p => p.filter((_, idx) => idx !== i)) }
  function updatePerson(i, k, v){ setContextPeople(p => p.map((x, idx) => idx === i ? { ...x, [k]: v } : x)) }

  return (
    <div className="px-5 py-6 animate-fade-in space-y-6 max-w-lg mx-auto">

      {/* Fixed toast — visible regardless of scroll position */}
      {contextSaved && (
        <div className="fixed bottom-24 left-0 right-0 flex justify-center z-50 pointer-events-none animate-slide-up">
          <div className="px-5 py-3 rounded-full shadow-lg flex items-center gap-2"
            style={{ background: '#2C332B', color: '#F8F1E7' }}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span className="font-sans text-sm font-medium">Context saved</span>
          </div>
        </div>
      )}

      {/* ── Profile header ────────────────────────────────────────────────── */}
      {profile && (
        <div className="p-5 border flex items-center gap-4"
          style={{ borderRadius: '24px 20px 28px 22px', background: 'white', border: '1px solid rgba(143,151,121,0.18)', boxShadow: '0 4px 20px -4px rgba(143,169,181,0.2)' }}>
          {/* Avatar circle */}
          <div className="w-14 h-14 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: `${sp}22`, border: `2px solid ${sp}33` }}>
            <span className="font-serif font-semibold" style={{ fontSize: '1.35rem', color: sp }}>
              {(profile.name || 'U')[0].toUpperCase()}
            </span>
          </div>
          <div className="min-w-0">
            <p className="font-serif text-text-primary font-medium leading-snug" style={{ fontSize: '1.125rem', letterSpacing: '-0.01em' }}>
              {profile.name || 'You'}
            </p>
            {profile.primary_style && (
              <p className="t-caption mt-0.5 capitalize" style={{ color: sp }}>
                {profile.primary_style.replace(/_/g, '-')} pattern
              </p>
            )}
            <p className="t-caption mt-0.5">
              {profile.session_count ?? 0} session{(profile.session_count ?? 0) !== 1 ? 's' : ''} completed
            </p>
          </div>
        </div>
      )}

      {/* ── Profile form ─────────────────────────────────────────────────── */}
      <form onSubmit={handleSave} className="space-y-5">
        <div className="card space-y-5">
          <p className="label">How Emora sees you</p>

          {/* Name */}
          <div>
            <label className="t-caption font-semibold block mb-2">What Emora calls you</label>
            <input
              type="text"
              className="input-field w-full"
              placeholder="Your first name"
              value={name}
              onChange={e => setName(e.target.value)}
              maxLength={100}
            />
          </div>

          {/* Relationship situation — horizontal scroll pills */}
          <div>
            <label className="t-caption font-semibold block mb-3">Where are you right now?</label>
            <div className="h-scroll scrollbar-hide -mx-5 px-5">
              {SITUATION_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setSituation(opt.value)}
                  className="flex-shrink-0 px-4 py-2.5 border text-sm font-medium transition-all duration-200 whitespace-nowrap"
                  style={{
                    borderRadius: '16px 4px 16px 4px',
                    borderColor: situation === opt.value ? sp : 'rgba(192,108,84,0.12)',
                    background:  situation === opt.value ? `${sp}14` : 'rgba(255,249,240,0.8)',
                    color:       situation === opt.value ? sp : '#6B5C4E',
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <div style={{ width: '20px', flexShrink: 0 }} />
            </div>
            <p className="t-caption mt-2.5">
              Changing this updates what Emora and Action Lab focus on.
            </p>
          </div>
        </div>

        {saveError && <p className="text-state-crisis text-sm">{saveError}</p>}
        {saved && <p className="text-state-stable text-sm">Saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full"
        >
          {saving ? 'Saving...' : 'Save'}
        </button>
      </form>

      {/* ── Your context ─────────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <div>
          <p className="label">Your context</p>
          <p className="t-caption mt-1">
            Help Emora know who's in your life and what you're working through. This is private and shapes every conversation.
          </p>
        </div>

        {/* Key people */}
        <div>
          <label className="t-caption font-semibold block mb-2">Key people in your life</label>
          <div className="space-y-2">
            {contextPeople.map((person, i) => (
              <div key={i} className="flex gap-2 items-center">
                <input
                  type="text"
                  className="input-field flex-1 min-w-0"
                  placeholder="Name"
                  value={person.name}
                  onChange={e => updatePerson(i, 'name', e.target.value)}
                  maxLength={30}
                />
                <select
                  className="input-field flex-shrink-0"
                  style={{ width: '110px' }}
                  value={person.role}
                  onChange={e => updatePerson(i, 'role', e.target.value)}
                >
                  {ROLE_OPTIONS.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => removePerson(i)}
                  className="flex-shrink-0 text-text-muted hover:text-state-crisis transition-colors"
                  aria-label="Remove"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
          {contextPeople.length < 3 && (
            <button
              type="button"
              onClick={addPerson}
              className="text-sm font-medium mt-2 transition-opacity hover:opacity-70"
              style={{ color: sp }}
            >
              + Add person
            </button>
          )}
        </div>

        {/* What they're working through */}
        <div>
          <label className="t-caption font-semibold block mb-2">What you're working through</label>
          <textarea
            className="input-field w-full resize-none"
            placeholder="e.g. Going through a breakup after 3 years. Trying to understand my patterns before I date again."
            value={contextSituation}
            onChange={e => setContextSituation(e.target.value.slice(0, 200))}
            rows={3}
          />
          <p className="t-caption text-right mt-1">{contextSituation.length}/200</p>
        </div>

        <button
          type="button"
          onClick={saveContext}
          disabled={contextSaving}
          className="btn-primary w-full"
        >
          {contextSaving ? 'Saving...' : 'Save context'}
        </button>
      </div>

      {/* ── Attachment style ─────────────────────────────────────────────── */}
      {profile?.primary_style && (
        <div
          className="card space-y-3"
          style={{ borderLeftWidth: '3px', borderLeftColor: sp, borderLeftStyle: 'solid' }}
        >
          <p className="label">Your pattern</p>
          <p className="t-h3 capitalize" style={{ color: sp }}>
            {profile.primary_style.replace(/_/g, '-')}
          </p>
          {profile.secondary_style && (
            <p className="t-caption">
              Secondary: {profile.secondary_style.replace(/_/g, '-')}
            </p>
          )}
          <p className="t-caption">
            Updates automatically as Emora learns your patterns. If this doesn't feel right, you can request a reassessment.
          </p>
          {reassessmentRequested ? (
            <p className="text-state-stable text-sm">Noted — Emora will revisit this in your next session.</p>
          ) : (
            <button
              onClick={handleRequestReassessment}
              disabled={reassessmentLoading}
              className="text-sm font-medium transition-opacity hover:opacity-70"
              style={{ color: sp }}
            >
              {reassessmentLoading ? 'Requesting...' : 'Request reassessment →'}
            </button>
          )}
        </div>
      )}

      {/* ── Session history ───────────────────────────────────────────────── */}
      <div className="card space-y-3">
        <p className="label">Your sessions</p>
        {!historyLoaded ? (
          <button
            onClick={loadSessionHistory}
            disabled={historyLoading}
            className="btn-ghost text-sm"
          >
            {historyLoading ? 'Loading...' : 'See your session history →'}
          </button>
        ) : sessionHistory.length === 0 ? (
          <p className="t-caption">No sessions yet. Your first one will show up here.</p>
        ) : (
          <>
            <p className="t-caption">Swipe to see all. Tap "exclude" to remove from pattern analysis.</p>
            {/* Horizontal session cards */}
            <div className="h-scroll scrollbar-hide -mx-5 px-5">
              {sessionHistory.map((s, i) => (
                <div
                  key={s.id ?? i}
                  className="flex-shrink-0 border p-3.5 space-y-2"
                  style={{
                    borderRadius: '24px 20px 28px 22px',
                    width: '160px',
                    background: s.excluded ? 'rgba(248,241,231,0.5)' : 'rgba(255,249,240,0.8)',
                    borderColor: 'rgba(192,108,84,0.12)',
                    opacity: s.excluded ? 0.55 : 1,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <p className="text-text-secondary text-sm font-medium">
                      {new Date(s.session_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className="text-text-muted" style={{ fontSize: '10px' }}>
                      #{sessionHistory.length - i}
                    </p>
                  </div>
                  {s.emotional_state_end && (
                    <div className="flex items-center gap-1.5">
                      <EmotionFace state={stateToFace(s.emotional_state_end)} size={22} />
                      <span className="text-text-muted text-xs capitalize">{s.emotional_state_end}</span>
                    </div>
                  )}
                  {s.mood_end && (
                    <p className="text-text-muted text-xs capitalize">Left: {s.mood_end}</p>
                  )}
                  {s.duration_seconds > 0 && (
                    <p className="text-text-muted text-xs">{Math.round(s.duration_seconds / 60)}min</p>
                  )}
                  {s.key_insight && (
                    <p className="text-text-muted text-xs leading-relaxed italic line-clamp-2">
                      "{s.key_insight}"
                    </p>
                  )}
                  {s.id && (
                    <button
                      onClick={() => handleToggleExclude(s.id, s.excluded)}
                      className="text-xs font-medium transition-colors block"
                      style={{ color: s.excluded ? sp : '#9E8E83' }}
                    >
                      {s.excluded ? 'included' : 'exclude'}
                    </button>
                  )}
                </div>
              ))}
              <div style={{ width: '20px', flexShrink: 0 }} />
            </div>
            {excludeError && (
              <p className="text-state-activated text-xs mt-2 px-1">{excludeError}</p>
            )}
          </>
        )}
      </div>

      {/* ── Data & privacy ────────────────────────────────────────────────── */}
      <div className="card space-y-3">
        <p className="label">Your data</p>
        <p className="t-caption">Your data is yours. Export everything as JSON at any time.</p>
        <button
          onClick={handleExportData}
          disabled={exporting}
          className="btn-ghost text-sm"
        >
          {exporting ? 'Preparing export...' : 'Export my data →'}
        </button>
      </div>

      {/* ── Account actions ──────────────────────────────────────────────── */}
      <div className="card space-y-4">
        <p className="label">Account</p>

        <button
          onClick={() => { logout(); navigate('/login') }}
          className="btn-secondary w-full"
        >
          Log out for now
        </button>

        {!showDelete ? (
          <button
            onClick={() => setShowDelete(true)}
            className="text-state-crisis text-sm hover:underline w-full text-left"
          >
            Delete account
          </button>
        ) : (
          <div className="space-y-3 border border-state-crisis/20 p-4" style={{ borderRadius: '24px 20px 28px 22px' }}>
            <p className="text-state-crisis text-sm font-medium">Delete account permanently?</p>
            <p className="t-caption leading-relaxed">
              This removes your account, all conversations, pattern reports, and action history. It cannot be undone.
            </p>
            <input
              type="password"
              className="input-field w-full"
              placeholder="Enter your password to confirm"
              value={deletePassword}
              onChange={e => setDeletePassword(e.target.value)}
            />
            {deleteError && <p className="text-state-crisis text-xs">{deleteError}</p>}
            <div className="flex gap-3">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="flex-1 py-3 border border-state-crisis text-state-crisis text-sm hover:bg-state-crisis/10 transition-all" style={{ borderRadius: '16px 4px 16px 4px' }}
              >
                {deleting ? 'Deleting...' : 'Yes, delete everything'}
              </button>
              <button
                onClick={() => { setShowDelete(false); setDeleteError('') }}
                className="flex-1 btn-secondary text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
