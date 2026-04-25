import { useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'

// Pages that get the TopBar — title shown, back destination if applicable.
// /home, /emora, /rescue have their own full-bleed headers; skip them.
const PAGE_META = {
  '/actions':  { title: 'Action Lab' },
  '/insights': { title: 'Insights' },
  '/report':   { title: 'Pattern Report', back: '/home' },
  '/settings': { title: 'Settings',       back: '/home' },
}

export default function TopBar() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { styleColor } = useApp()

  const meta = PAGE_META[pathname]
  if (!meta) return null

  const sp = styleColor?.primary ?? '#4A6741'

  return (
    <header
      className="sticky top-0 z-40 flex items-center justify-between px-4"
      style={{
        height: 'calc(52px + env(safe-area-inset-top))',
        paddingTop: 'env(safe-area-inset-top)',
        background: 'rgba(248,241,231,0.92)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid rgba(192,108,84,0.12)',
      }}
    >
      {/* Left — back or spacer */}
      <div style={{ width: '64px' }}>
        {meta.back && (
          <button
            onClick={() => navigate(meta.back)}
            className="flex items-center gap-0.5 transition-opacity active:opacity-60"
            style={{ color: sp }}
          >
            <ChevronLeft size={18} strokeWidth={2.2} />
            <span style={{ fontSize: '14px', fontWeight: 600 }}>Back</span>
          </button>
        )}
      </div>

      {/* Center — style dot + page title */}
      <div className="flex items-center gap-2">
        <span
          className="rounded-full"
          style={{
            width: '7px',
            height: '7px',
            background: sp,
            flexShrink: 0,
          }}
        />
        <span
          className="text-text-primary"
          style={{ fontSize: '15px', fontWeight: 700, letterSpacing: '-0.01em' }}
        >
          {meta.title}
        </span>
      </div>

      {/* Right — settings icon (except on settings page itself) */}
      <div style={{ width: '64px' }} className="flex justify-end">
        {pathname !== '/settings' && (
          <button
            onClick={() => navigate('/settings')}
            className="w-8 h-8 flex items-center justify-center rounded-xl transition-colors"
            style={{ color: '#9E8E83' }}
          >
            <Settings size={17} strokeWidth={1.7} />
          </button>
        )}
      </div>
    </header>
  )
}
