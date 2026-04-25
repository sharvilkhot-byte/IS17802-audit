import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../services/api'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return setError('Enter your email address.')
    setLoading(true)
    setError('')
    try {
      await authAPI.forgotPassword(email.trim())
      setSent(true)
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong. Try again.')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 max-w-lg mx-auto animate-fade-in relative overflow-hidden">
        {/* Ambient blobs */}
        <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
          style={{ background: '#C06C54', opacity: 0.04, filter: 'blur(60px)' }} />
        <div className="absolute bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: '#8F9779', opacity: 0.05, filter: 'blur(50px)' }} />

        <div className="w-full space-y-8 text-center relative">
          {/* Wordmark */}
          <div className="flex items-center justify-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C06C54' }} />
            <span className="font-serif text-xl" style={{ color: '#C06C54', letterSpacing: '-0.01em' }}>Unclinq</span>
          </div>

          <div className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center"
            style={{ background: 'rgba(78,122,58,0.08)', border: '1px solid rgba(78,122,58,0.2)' }}>
            <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}
              style={{ color: '#4E7A3A' }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <div>
            <h2 className="font-serif text-text-primary mb-2"
              style={{ fontSize: '1.75rem', fontWeight: 500, letterSpacing: '-0.02em' }}>
              Check your email.
            </h2>
            <p className="t-body leading-relaxed max-w-[280px] mx-auto">
              If that address is registered, a reset link is on its way. It expires in 1 hour.
            </p>
          </div>

          <Link to="/login" className="text-sm font-medium transition-opacity hover:opacity-70 block"
            style={{ color: '#C06C54' }}>
            Back to login
          </Link>
        </div>
      </div>
    )
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
            Reset your password.
          </h2>
          <p className="t-body mt-2">
            Enter your email and we'll send a reset link.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-text-secondary text-sm mb-2">Email</label>
            <input
              type="email"
              className="input-field w-full"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          {error && (
            <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl">
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Sending...' : 'Send reset link'}
          </button>
        </form>

        <p className="mt-6 text-text-muted text-sm text-center">
          Remembered it?{' '}
          <Link to="/login" style={{ color: '#C06C54' }}>Sign in</Link>
        </p>
      </div>
    </div>
  )
}
