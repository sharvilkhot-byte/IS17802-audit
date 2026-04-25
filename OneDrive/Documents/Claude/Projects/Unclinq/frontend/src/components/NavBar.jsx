import { NavLink } from 'react-router-dom'
import { Home, Sparkles, Zap, BookOpen } from 'lucide-react'
import { useApp } from '../context/AppContext'

const NAV_ITEMS = [
  { path: '/home',     label: 'Home',     Icon: Home },
  { path: '/emora',   label: 'Emora',    Icon: Sparkles, center: true },
  { path: '/actions', label: 'Actions',  Icon: Zap },
  { path: '/insights',label: 'Insights', Icon: BookOpen },
]

export default function NavBar() {
  const { styleColor } = useApp()
  const sp = styleColor?.primary ?? '#4A6741'

  return (
    <nav
      className="fixed bottom-0 z-50 w-full max-w-lg"
      style={{ left: '50%', transform: 'translateX(-50%)' }}
    >
      {/* Glass footer — washi paper frosted bar */}
      <div style={{
        background: 'rgba(248,241,231,0.9)',
        backdropFilter: 'blur(24px) saturate(1.6)',
        WebkitBackdropFilter: 'blur(24px) saturate(1.6)',
        borderTop: '1px solid rgba(192,108,84,0.1)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}>
      <div className="px-6 pt-3 pb-4">
        <div className="flex items-center justify-around">
          {NAV_ITEMS.map(({ path, label, Icon, center }) => (
            <NavLink
              key={path}
              to={path}
              className="flex items-center justify-center"
              style={{ minWidth: center ? '60px' : '52px' }}
            >
              {({ isActive }) => center ? (
                <div
                  className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-250 relative"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${sp}22 0%, ${sp}0D 100%)`
                      : `${sp}1A`,
                    border: isActive ? `1px solid ${sp}45` : `1px solid transparent`,
                    color: sp,
                    boxShadow: isActive
                      ? `0 4px 18px ${sp}44, 0 1px 4px ${sp}22`
                      : 'none',
                    transform: isActive ? 'scale(1.06)' : 'scale(1)',
                  }}
                >
                  {isActive ? (
                    <div className="relative w-5 h-5 flex items-center justify-center">
                      <div className="absolute w-5 h-5 rounded-full emora-orb-ring" style={{ background: sp }} />
                      <div className="absolute w-3 h-3 rounded-full" style={{ background: sp, opacity: 0.35 }} />
                      <div className="absolute w-1.5 h-1.5 rounded-full" style={{ background: sp, opacity: 0.75 }} />
                    </div>
                  ) : (
                    <Icon size={21} strokeWidth={1.8} />
                  )}
                </div>
              ) : (
                <div
                  className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200"
                  style={{
                    background: isActive ? `${sp}16` : 'transparent',
                    color: isActive ? sp : '#8C9688',
                  }}
                >
                  <Icon
                    size={20}
                    strokeWidth={isActive ? 2.2 : 1.7}
                    className="transition-transform duration-200"
                    style={{ transform: isActive ? 'scale(1.05)' : 'scale(1)' }}
                  />
                  <span
                    style={{
                      fontSize: '10px',
                      fontWeight: isActive ? 700 : 500,
                      letterSpacing: '0.035em',
                      lineHeight: 1,
                    }}
                  >
                    {label}
                  </span>
                </div>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      </div>
    </nav>
  )
}
