import { useState, useRef, useEffect } from 'react'
import { Link, useNavigate, useLocation, Navigate } from 'react-router-dom'
import { authAPI } from '../services/api'
import { useApp } from '../context/AppContext'

// Ambient background blobs (shared decoration)
function Blobs() {
  return (
    <>
      <div className="absolute -top-24 -right-20 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: '#C06C54', opacity: 0.04, filter: 'blur(60px)' }} />
      <div className="absolute bottom-16 -left-16 w-56 h-56 rounded-full pointer-events-none"
        style={{ background: '#8F9779', opacity: 0.06, filter: 'blur(50px)' }} />
    </>
  )
}

// 6-box OTP input
function OtpInput({ value, onChange, disabled }) {
  const inputs = useRef([])
  const digits = (value + '      ').slice(0, 6).split('')

  function handleKey(i, e) {
    if (e.key === 'Backspace') {
      e.preventDefault()
      const next = value.slice(0, i) + value.slice(i + 1)
      onChange(next)
      if (i > 0) inputs.current[i - 1]?.focus()
      return
    }
    if (e.key === 'ArrowLeft' && i > 0) { inputs.current[i - 1]?.focus(); return }
    if (e.key === 'ArrowRight' && i < 5) { inputs.current[i + 1]?.focus(); return }
  }

  function handleChange(i, e) {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char) return
    const next = value.slice(0, i) + char + value.slice(i + 1)
    onChange(next.slice(0, 6))
    if (i < 5) inputs.current[i + 1]?.focus()
  }

  function handlePaste(e) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    onChange(pasted)
    const focusIdx = Math.min(pasted.length, 5)
    inputs.current[focusIdx]?.focus()
  }

  return (
    <div className="flex gap-3 justify-center">
      {[0, 1, 2, 3, 4, 5].map(i => (
        <input
          key={i}
          ref={el => inputs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          disabled={disabled}
          value={digits[i].trim()}
          onChange={e => handleChange(i, e)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          onFocus={e => e.target.select()}
          className="w-12 h-14 text-center text-xl font-semibold rounded-2xl border transition-all outline-none"
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: digits[i].trim() ? '1.5px solid #C06C54' : '1.5px solid rgba(0,0,0,0.12)',
            color: 'var(--text-primary, #1A1A18)',
            opacity: disabled ? 0.5 : 1,
          }}
        />
      ))}
    </div>
  )
}

export default function Login() {
  const { login, isAuthenticated } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const successMessage = location.state?.message || ''

  // step: 'email' | 'otp'
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendCooldown, setResendCooldown] = useState(0)

  // countdown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  // Auto-submit when 6 digits are entered
  useEffect(() => {
    if (otp.length === 6 && step === 'otp' && !loading) {
      handleVerifyOtp()
    }
  }, [otp])

  if (isAuthenticated) return <Navigate to="/home" replace />

  async function handleSendOtp(e) {
    e?.preventDefault()
    if (!email.trim()) return setError('Enter your email address.')
    setError('')
    setLoading(true)
    try {
      await authAPI.sendOtp(email.trim(), 'login')
      setStep('otp')
      setResendCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send code. Try again.')
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyOtp() {
    if (otp.length < 6) return
    setError('')
    setLoading(true)
    try {
      const res = await authAPI.verifyOtp(email.trim(), otp, 'login')
      login(res.data.token, res.data.user)
      navigate(res.data.onboarding_completed ? '/home' : '/onboarding')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid code. Try again.')
      setOtp('')
    } finally {
      setLoading(false)
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return
    setError('')
    setOtp('')
    setLoading(true)
    try {
      await authAPI.sendOtp(email.trim(), 'login')
      setResendCooldown(60)
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to resend. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 max-w-lg mx-auto relative overflow-hidden">
      <Blobs />
      <div className="w-full animate-fade-in relative">
        {/* Wordmark */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C06C54' }} />
          <span className="font-serif text-xl" style={{ color: '#C06C54', letterSpacing: '-0.01em' }}>Unclinq</span>
        </div>

        {step === 'email' ? (
          <>
            <div className="mb-10">
              <h2 className="font-serif text-text-primary" style={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.025em' }}>
                Welcome back.
              </h2>
              <p className="t-body mt-2">Your work is still here.</p>
            </div>

            {successMessage && (
              <div className="bg-state-stable/10 border border-state-stable/30 text-state-stable text-sm px-4 py-3 rounded-2xl mb-6">
                {successMessage}
              </div>
            )}

            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-text-secondary text-sm mb-2">Email</label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  className="input-field"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError('') }}
                />
              </div>

              {error && (
                <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl">
                  {error}
                </div>
              )}

              <button type="submit" className="btn-primary w-full mt-2" disabled={loading || !email.trim()}>
                {loading ? 'Sending code…' : 'Send code'}
              </button>
            </form>

            <p className="mt-6 text-text-muted text-sm text-center">
              Don't have an account?{' '}
              <Link to="/register" style={{ color: '#C06C54' }}>Create one</Link>
            </p>
          </>
        ) : (
          <>
            <div className="mb-10">
              <button
                onClick={() => { setStep('email'); setOtp(''); setError('') }}
                className="flex items-center gap-1.5 text-sm mb-6 transition-opacity hover:opacity-60"
                style={{ color: '#9B9B97' }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M12 5l-7 7 7 7" />
                </svg>
                Back
              </button>
              <h2 className="font-serif text-text-primary" style={{ fontSize: '2rem', fontWeight: 500, lineHeight: 1.2, letterSpacing: '-0.025em' }}>
                Check your email.
              </h2>
              <p className="t-body mt-2">
                We sent a 6-digit code to <span style={{ color: '#C06C54' }}>{email}</span>
              </p>
            </div>

            <div className="space-y-6">
              <OtpInput value={otp} onChange={setOtp} disabled={loading} />

              {error && (
                <div className="bg-state-crisis/10 border border-state-crisis/30 text-state-crisis text-sm px-4 py-3 rounded-2xl text-center">
                  {error}
                </div>
              )}

              <button
                className="btn-primary w-full"
                onClick={handleVerifyOtp}
                disabled={loading || otp.length < 6}
              >
                {loading ? 'Verifying…' : 'Verify code'}
              </button>

              <div className="text-center">
                {resendCooldown > 0 ? (
                  <p className="text-sm" style={{ color: '#9B9B97' }}>
                    Resend in {resendCooldown}s
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="text-sm transition-opacity hover:opacity-70"
                    style={{ color: '#C06C54' }}
                  >
                    Resend code
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
