import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { Navigate } from 'react-router-dom'
import { Sparkles, Wind, Zap, FileText } from 'lucide-react'
import { ConnectionIllustration } from '../components/Illustrations'

const FEATURES = [
  { Icon: Sparkles,  title: 'Emora',          desc: "An AI that asks the question you've been avoiding" },
  { Icon: Wind,      title: 'Rescue Mode',     desc: 'A circuit breaker for the moment before you act' },
  { Icon: Zap,       title: 'Action Lab',      desc: "One concrete thing, matched to what you're working through" },
  { Icon: FileText,  title: 'Pattern Report',  desc: "A 15-day mirror. Not what you did — what was running underneath" },
]

export default function Landing() {
  const { isAuthenticated, profile } = useApp()

  if (isAuthenticated) {
    return <Navigate to={profile?.onboarding_completed ? '/home' : '/onboarding'} replace />
  }

  return (
    <div className="min-h-dvh bg-surface flex flex-col items-center justify-center px-6 max-w-lg mx-auto relative overflow-hidden">

      {/* Ambient glow */}
      <div className="absolute -top-20 -right-20 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: '#C06C54', opacity: 0.055, filter: 'blur(70px)' }} />
      <div className="absolute bottom-20 -left-16 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: '#C06C54', opacity: 0.04, filter: 'blur(60px)' }} />

      <div className="animate-fade-in w-full relative">

        {/* Hero illustration + wordmark */}
        <div className="text-center mb-10">

          {/* Botanical hero — potted plant with animated leaves */}
          <div className="flex justify-center mb-8 relative">
            <div className="relative">
              <svg width="180" height="220" viewBox="0 0 400 500" fill="none" xmlns="http://www.w3.org/2000/svg"
                style={{ filter: 'drop-shadow(0 20px 40px rgba(44,55,40,0.14))' }}>
                {/* Warm glow */}
                <circle cx="200" cy="300" r="130" fill="url(#heroGlow)" opacity="0.2" />
                {/* Pot body */}
                <path d="M140 390 L148 290 H252 L260 390 C260 412 238 428 200 428 C162 428 140 412 140 390 Z"
                  fill="#8D6E63" opacity="0.28" />
                {/* Pot rim */}
                <path d="M133 286 H267 L262 306 H138 L133 286 Z"
                  fill="#8D6E63" opacity="0.42" />
                {/* Soil */}
                <ellipse cx="200" cy="292" rx="58" ry="11" fill="#5D4037" opacity="0.22" />
                {/* Main stem */}
                <path d="M200 300 Q198 248 192 196" stroke="#8F9779" strokeLinecap="round" strokeWidth="6" />
                {/* Secondary stem right */}
                <path d="M197 258 Q224 240 234 210" stroke="#8F9779" strokeLinecap="round" strokeWidth="5" opacity="0.85" />
                {/* Leaf left — animated pulse */}
                <path d="M192 196 C158 174 130 208 142 240 C152 255 184 232 192 196 Z"
                  fill="#8F9779" opacity="0.85"
                  style={{ animation: 'pulse 5s ease-in-out infinite' }} />
                <path d="M192 196 L154 228" stroke="#6B7860" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
                {/* Leaf right — animated pulse offset */}
                <path d="M234 210 C266 188 282 228 270 252 C260 264 242 242 234 210 Z"
                  fill="#A4AC86" opacity="0.72"
                  style={{ animation: 'pulse 6s ease-in-out infinite', animationDelay: '1s' }} />
                <path d="M234 210 L264 242" stroke="#6B7860" strokeWidth="1.5" opacity="0.3" strokeLinecap="round" />
                {/* Small bud top */}
                <path d="M193 230 C178 218 166 236 172 248 C178 256 192 242 193 230 Z"
                  fill="#A4AC86" opacity="0.68"
                  style={{ animation: 'pulse 7s ease-in-out infinite', animationDelay: '0.5s' }} />
                {/* Tiny flower at crown */}
                <circle cx="192" cy="192" r="8" fill="#C06C54" opacity="0.6" />
                <circle cx="192" cy="192" r="4" fill="#C06C54" opacity="0.9" />
                <defs>
                  <radialGradient id="heroGlow" cx="0.5" cy="0.5" r="0.5">
                    <stop offset="0%" stopColor="#C06C54" stopOpacity="0.6" />
                    <stop offset="100%" stopColor="#C06C54" stopOpacity="0" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Brand mark row */}
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C06C54' }} />
            <span style={{ fontSize: '10px', fontWeight: 800, letterSpacing: '0.16em', color: '#C06C54' }}>UNCLINQ</span>
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C06C54' }} />
          </div>
          <h1 className="font-serif text-text-primary tracking-tight" style={{ fontSize: '2.5rem', fontWeight: 500, lineHeight: 1.2 }}>
            Know your pattern.<br />
            <span className="italic" style={{ color: '#C06C54' }}>Break it.</span>
          </h1>
          <div className="w-10 h-px mx-auto mt-4 mb-5" style={{ background: '#C06C54' }} />
          <p className="t-body max-w-[260px] mx-auto leading-relaxed">
            An AI that works on the thing underneath —<br />
            <span className="text-text-primary font-medium">not the symptoms, the source.</span>
          </p>
        </div>

        {/* Features */}
        <div className="space-y-2.5 mb-8">
          {FEATURES.map(({ Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-4 px-4 py-3.5 rounded-2xl"
              style={{
                background: 'rgba(255,249,240,0.6)',
                border: '1px solid rgba(192,108,84,0.1)',
                borderLeft: '3px solid rgba(192,108,84,0.3)',
              }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{ background: `${'#C06C54'}14`, color: '#C06C54' }}>
                <Icon size={16} strokeWidth={1.8} />
              </div>
              <div>
                <p className="t-h3">{title}</p>
                <p className="t-caption mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Truth strip */}
        <div className="flex items-center justify-center gap-4 mb-7">
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9E8E83', letterSpacing: '0.04em' }}>No streaks</span>
          <div className="w-1 h-1 rounded-full bg-surface-strong flex-shrink-0" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9E8E83', letterSpacing: '0.04em' }}>No judgment</span>
          <div className="w-1 h-1 rounded-full bg-surface-strong flex-shrink-0" />
          <span style={{ fontSize: '11px', fontWeight: 600, color: '#9E8E83', letterSpacing: '0.04em' }}>No algorithms</span>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Link to="/onboarding" className="btn-primary w-full block text-center">
            Start — it's free
          </Link>
          <Link to="/login" className="btn-ghost w-full block text-center text-text-secondary">
            Already have an account
          </Link>
        </div>

        <p className="mt-8 t-caption text-center max-w-[280px] mx-auto leading-relaxed">
          Not therapy. Not a meditation app.<br />
          A behavioral change system dressed in emotional intelligence.
        </p>
      </div>
    </div>
  )
}
