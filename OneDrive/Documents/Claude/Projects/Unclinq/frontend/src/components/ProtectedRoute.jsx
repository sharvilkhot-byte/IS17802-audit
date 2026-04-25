import { Navigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function ProtectedRoute({ children, requireOnboarding = true }) {
  const { isAuthenticated, profile, loading } = useApp()

  if (loading) {
    return (
      <div className="min-h-dvh bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 animate-spin" style={{ borderColor: 'rgba(192,108,84,0.3)', borderTopColor: '#C06C54' }} />
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (requireOnboarding && profile && !profile.onboarding_completed) {
    return <Navigate to="/onboarding" replace />
  }

  return children
}
