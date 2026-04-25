/**
 * IN-APP NOTIFICATION (E-03)
 * Renders a single soft, dismissable notification at the top of the home screen.
 * No bold "!" icons. No urgency theatre. Just a quiet signal.
 */

import { useNavigate } from 'react-router-dom'
import { notificationsAPI } from '../services/api'
import { useApp } from '../context/AppContext'

export default function InAppNotification({ notification, onDismiss }) {
  const navigate = useNavigate()
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'

  if (!notification) return null

  async function handleTap() {
    await notificationsAPI.dismiss(notification.id).catch(() => {})
    onDismiss(notification.id)
    if (notification.action_path) navigate(notification.action_path)
  }

  async function handleDismiss(e) {
    e.stopPropagation()
    await notificationsAPI.dismiss(notification.id).catch(() => {})
    onDismiss(notification.id)
  }

  return (
    <div
      onClick={handleTap}
      className="flex items-center justify-between gap-3 px-4 py-3.5 border border-surface-border bg-surface-card cursor-pointer transition-all animate-fade-in"
      style={{ borderRadius: '24px 20px 28px 22px', borderColor: `${sp}26` }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && handleTap()}
    >
      <p className="text-text-secondary text-sm leading-relaxed flex-1">
        {notification.message}
      </p>
      <button
        onClick={handleDismiss}
        className="text-text-muted hover:text-text-secondary flex-shrink-0 text-lg leading-none"
        aria-label="Dismiss"
      >
        ×
      </button>
    </div>
  )
}
