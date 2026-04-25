import { useState } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') || ''
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 8) return setError('Password must be at least 8 characters.')
    if (password !== confirm) return setError("Passwords don't match.")
    if (!token) return setError('Reset token is missing. Use the link from your email.')

    setLoading(true)
    setError('')
    try {
      await authAPI.resetPassword(token, password)
      navigate('/login', { state: { message: 'Password updated. You can now log in.' } })
    } catch (err) {
      setError(err.response?.data?.error || 'Reset failed. The link may have expired.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 max-w-lg mx-auto relative overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: '#C06C54', opacity: 0.04, filter: 'blur(60px)' }} />
      <div className="absolute bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: '#8F9779', opacity: 0.06, filter: 'blur(50px)' }} />

      <div className="w-full animate-fade-in relative">
        <div className="mb-10">
          {/* Wordmark */}
          <div className="flex items-center gap-2 mb-8">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C06C54' }} />
            <span className="font-serif text-xl" style={{ color: '#C06C54', letterSpacing: '-0.01em' }}>Unclinq</span>
          </div>
          <h2 className="font-serif text-text-primary"
            style={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.025em' }}>
            Set a new password.
          </h2>
          <p className="t-body mt-2">Choose something you haven't used before.</p>
        </div>

        {!token && (
          <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl mb-6">
            Reset link is invalid or expired.{' '}
            <Link to="/forgot-password" style={{ color: '#C06C54' }} className="underline">
              Request a new one.
            </Link>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">New password</label>
            <input
              type="password"
              className="input-field w-full"
              placeholder="At least 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-sm mb-2">Confirm password</label>
            <input
              type="password"
              className="input-field w-full"
              placeholder="Same password again"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && (
            <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || !token} className="btn-primary w-full mt-2">
            {loading ? 'Updating...' : 'Update password'}
          </button>
        </form>

        <p className="mt-6 text-text-muted text-sm text-center">
          <Link to="/login" style={{ color: '#C06C54' }}>Back to login</Link>
        </p>
      </div>
    </div>
  )
}
