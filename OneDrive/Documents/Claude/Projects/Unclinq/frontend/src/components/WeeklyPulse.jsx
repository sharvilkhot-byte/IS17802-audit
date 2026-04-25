/**
 * WEEKLY PULSE
 * Shown on app open (instead of plain reentry) once every 7 days for all non-maintenance users.
 * Shows a quiet 7-day summary: sessions, actions, rescues, one Emora insight.
 * Not a report. Not a reward. Just: "here's what happened."
 */

import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { primaryBtn } from '../utils/styleColors'

function getWeeklyContext({ session_count, actions_completed, rescue_count }) {
  if (session_count === 0 && rescue_count === 0)
    return "A quiet week. That's information too."
  if (rescue_count > 0 && session_count === 0)
    return `You used Rescue Mode ${rescue_count === 1 ? 'once' : `${rescue_count} times`} this week. That's the work.`
  if (session_count >= 3 && actions_completed >= 2)
    return "You've been consistent. That's rarer than it sounds."
  if (session_count >= 1 && actions_completed === 0)
    return "Talking is also doing. Don't discount the sessions."
  return null
}

export default function WeeklyPulse({ pulseData, onDismiss }) {
  const navigate = useNavigate()
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'
  const { session_count, actions_completed, rescue_count, emora_noticed } = pulseData
  const weeklyContext = getWeeklyContext({ session_count, actions_completed, rescue_count })

  function handleTalkToEmora() {
    onDismiss()
    navigate('/emora')
  }

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center px-8 animate-fade-in max-w-lg mx-auto">
      <div className="w-full space-y-8">

        {/* Header */}
        <div className="space-y-2">
          <p className="label">Last 7 days</p>
          <p className="text-text-primary text-xl font-light">Here's what happened.</p>
        </div>

        {/* Stats — always show all three; dim zeros so the card stays consistent */}
        <div className="card space-y-4">
          <div className="flex gap-8">
            <div className={session_count === 0 ? 'opacity-30' : ''}>
              <p className="text-2xl font-light" style={{ color: sp }}>{session_count}</p>
              <p className="text-text-muted text-xs mt-1">
                {session_count === 1 ? 'session' : 'sessions'}
              </p>
            </div>
            <div className={actions_completed === 0 ? 'opacity-30' : ''}>
              <p className="text-2xl font-light" style={{ color: sp }}>{actions_completed}</p>
              <p className="text-text-muted text-xs mt-1">
                {actions_completed === 1 ? 'action' : 'actions'}
              </p>
            </div>
            <div className={rescue_count === 0 ? 'opacity-30' : ''}>
              <p className="text-2xl font-light" style={{ color: sp }}>{rescue_count}</p>
              <p className="text-text-muted text-xs mt-1">
                {rescue_count === 1 ? 'rescue' : 'rescues'}
              </p>
            </div>
          </div>

          {/* Emora noticed */}
          {weeklyContext && (
            <div className="border-t border-surface-border pt-4">
              <p className="text-text-secondary text-sm leading-relaxed">{weeklyContext}</p>
            </div>
          )}

          {emora_noticed && (
            <div className="border-t border-surface-border pt-4">
              <p className="label mb-2">One thing Emora noticed</p>
              <p className="text-text-secondary text-sm leading-relaxed italic line-clamp-4">
                "{emora_noticed}"
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <button
            onClick={handleTalkToEmora}
            className="btn-primary w-full"
            style={primaryBtn(styleColor)}
          >
            Talk to Emora
          </button>
          <button
            onClick={onDismiss}
            className="btn-ghost w-full"
          >
            Take me in
          </button>
        </div>

      </div>
    </div>
  )
}
