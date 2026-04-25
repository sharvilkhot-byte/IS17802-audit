/**
 * MAINTENANCE MODE CARD
 *
 * Replaces the standard home dashboard for users in Maintenance phase.
 * The app no longer needs to be a daily tool — it becomes a periodic check-in.
 *
 * Design principles:
 * - Quieter than the normal home screen. Less urgency.
 * - "Check in when something stirs" — not "complete your daily tasks."
 * - Emora is still available, but framed as a sounding board, not a coach.
 * - Pattern Archive is the main longitudinal view.
 * - No action lab progress bars. No rescue mode urgency framing.
 *   (Rescue Mode remains available — just not front-and-center.)
 */

import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

function formatDuration(firstSessionAt) {
  if (!firstSessionAt) return null
  const weeks = Math.floor((Date.now() - new Date(firstSessionAt).getTime()) / (1000 * 60 * 60 * 24 * 7))
  if (weeks < 4) return `${weeks}w`
  const months = Math.floor(weeks / 4.3)
  if (months < 12) return `${months}mo`
  return `${Math.floor(months / 12)}yr`
}

function daysSince(ts) {
  if (!ts) return null
  return Math.floor((Date.now() - new Date(ts).getTime()) / (1000 * 60 * 60 * 24))
}

export default function MaintenanceModeCard({ profile }) {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  const firstName = profile?.name ? profile.name.split(' ')[0] : null
  const improvedPatterns = profile?.improved_patterns || []
  const activePatterns = profile?.active_patterns || []
  const sessionCount = profile?.session_count || 0
  const duration = formatDuration(profile?.first_session_at)
  const daysSinceLastSession = daysSince(profile?.last_active)
  const hasPatternData = improvedPatterns.length > 0 || activePatterns.length > 0

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Quiet greeting — no urgency */}
      <div className="space-y-1">
        <p className="text-text-muted text-sm">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
        <h1 className="text-2xl font-medium text-text-primary">
          {firstName ? `Hey, ${firstName}.` : 'Hey.'}
        </h1>
        <p className="text-text-secondary text-sm leading-relaxed pt-1">
          {daysSinceLastSession !== null && daysSinceLastSession > 7
            ? "It's been a while. Check in when you're ready."
            : 'Check in when something stirs.'}
        </p>
      </div>

      {/* Journey summary — understated stats */}
      {(sessionCount > 0 || duration) && (
        <div className="flex gap-5 px-1">
          {duration && (
            <div>
              <p className="font-light leading-none" style={{ fontSize: '1.5rem', color: sp }}>{duration}</p>
              <p className="text-text-muted text-xs mt-1.5">working on this</p>
            </div>
          )}
          {sessionCount > 0 && (
            <div>
              <p className="font-light leading-none" style={{ fontSize: '1.5rem', color: sp }}>{sessionCount}</p>
              <p className="text-text-muted text-xs mt-1.5">conversations</p>
            </div>
          )}
          {improvedPatterns.length > 0 && (
            <div>
              <p className="font-light leading-none" style={{ fontSize: '1.5rem', color: sp }}>{improvedPatterns.length}</p>
              <p className="text-text-muted text-xs mt-1.5">patterns shifted</p>
            </div>
          )}
        </div>
      )}

      {/* Primary action: Emora — framed as sounding board */}
      <Link
        to="/emora"
        className="block card transition-colors"
        style={{ borderColor: '#E6E0D8' }}
      >
        <p className="text-text-primary font-medium mb-1">Talk to Emora</p>
        <p className="text-text-muted text-sm">
          Something on your mind. Process it here.
        </p>
      </Link>

      {/* Pattern Archive — the longitudinal view */}
      <Link
        to="/insights"
        className="block card transition-colors"
        style={{ borderColor: '#E6E0D8' }}
      >
        <p className="text-text-primary font-medium mb-1">Pattern Archive</p>
        <p className="text-text-muted text-sm">
          Where you started. Where you are now.
        </p>
      </Link>

      {/* Improved patterns — only if there are any */}
      {improvedPatterns.length > 0 && (
        <div className="card space-y-3">
          <p className="text-text-muted text-xs uppercase tracking-widest">What shifted</p>
          <div className="space-y-1.5">
            {improvedPatterns.slice(0, 4).map((pattern, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-state-stable mt-2 flex-shrink-0" />
                <p className="text-text-secondary text-sm leading-relaxed">
                  {pattern.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Anything still active — present without judgment */}
      {activePatterns.length > 0 && (
        <div className="card space-y-3">
          <p className="text-text-muted text-xs uppercase tracking-widest">Still watching</p>
          <div className="space-y-1.5">
            {activePatterns.slice(0, 3).map((pattern, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="w-1 h-1 rounded-full bg-text-muted/40 mt-2 flex-shrink-0" />
                <p className="text-text-secondary text-sm leading-relaxed">
                  {pattern.replace(/_/g, ' ')}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Divider */}
      <div className="h-px bg-surface-border" />

      {/* Secondary: still available, just quieter */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/rescue"
          className="block p-4 border border-surface-border bg-surface-card hover:border-surface-strong transition-all duration-200" style={{ borderRadius: '24px 20px 28px 22px' }}
        >
          <p className="text-text-primary font-medium text-sm">Rescue Mode</p>
          <p className="text-text-muted text-xs mt-1">If you need it</p>
        </Link>
        <Link
          to="/actions"
          className="block p-4 border border-surface-border bg-surface-card hover:border-surface-strong transition-all duration-200" style={{ borderRadius: '24px 20px 28px 22px' }}
        >
          <p className="text-text-primary font-medium text-sm">Actions</p>
          <p className="text-text-muted text-xs mt-1">Something to do differently</p>
        </Link>
      </div>

      {/* Earned security acknowledgment — understated */}
      <div className="card border-surface-border/40 opacity-60">
        <p className="text-text-muted text-xs uppercase tracking-widest mb-2">Where you are</p>
        <p className="text-text-secondary text-sm leading-relaxed">
          Maintenance. You've done the work. Use this when something needs attention — not every day.
        </p>
      </div>

    </div>
  )
}
