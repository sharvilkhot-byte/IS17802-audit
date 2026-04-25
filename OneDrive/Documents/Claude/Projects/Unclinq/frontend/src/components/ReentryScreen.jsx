/**
 * RE-ENTRY SCREEN
 * Shown when a user returns after 3+ days away.
 * No guilt. No "we missed you." Just an honest question.
 * Two soft options: talk to Emora, or go to the app.
 */

import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { primaryBtn } from '../utils/styleColors'

export default function ReentryScreen({ reentryData, onDismiss }) {
  const navigate = useNavigate()
  const { styleColor } = useApp()

  const { days_away, question } = reentryData

  const daysLabel = days_away === 1 ? '1 day' : `${days_away} days`

  function handleTalkToEmora() {
    onDismiss()
    navigate('/emora')
  }

  function handleShowApp() {
    onDismiss()
  }

  return (
    <div className="fixed inset-0 bg-surface z-50 flex flex-col items-center justify-center px-8 animate-fade-in max-w-lg mx-auto">
      <div className="w-full space-y-10">

        {/* Message */}
        <div className="space-y-4 text-center">
          <p className="text-text-muted text-sm">
            You've been away for {daysLabel}.
          </p>
          <p className="text-text-primary text-2xl font-light leading-relaxed">
            {question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          <button
            onClick={handleTalkToEmora}
            className="btn-primary w-full"
            style={primaryBtn(styleColor)}
          >
            Talk to Emora
          </button>
          <button
            onClick={handleShowApp}
            className="btn-ghost w-full"
          >
            Not yet
          </button>
        </div>

      </div>
    </div>
  )
}
