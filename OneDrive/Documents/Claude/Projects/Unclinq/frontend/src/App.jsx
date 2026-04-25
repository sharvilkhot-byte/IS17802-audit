import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom'
import { Wind } from 'lucide-react'
import { AppProvider } from './context/AppContext'
import ProtectedRoute from './components/ProtectedRoute'
import NavBar from './components/NavBar'
import TopBar from './components/TopBar'

function RescueFAB() {
  const { pathname } = useLocation()
  if (pathname === '/rescue') return null
  return (
    <Link
      to="/rescue"
      aria-label="Rescue Mode"
      className="fixed z-40 flex items-center justify-center transition-transform hover:scale-105 active:scale-95"
      style={{
        bottom: 'calc(96px + env(safe-area-inset-bottom))',
        right: 'max(24px, env(safe-area-inset-right))',
        width: '52px',
        height: '52px',
        background: '#2C332B',
        borderRadius: '50%',
        boxShadow: '0 8px 24px rgba(44,51,43,0.25)',
        border: '1px solid rgba(255,255,255,0.1)',
      }}>
      <Wind size={21} style={{ color: '#D48C70' }} strokeWidth={1.7} />
    </Link>
  )
}

// Pages
import Landing from './pages/Landing'
import Login from './pages/Login'
import Register from './pages/Register'
import Onboarding from './pages/Onboarding'
import Home from './pages/Home'
import Emora from './pages/Emora'
import RescueMode from './pages/RescueMode'
import ActionLab from './pages/ActionLab'
import InsightTabs from './pages/InsightTabs'
import PatternReport from './pages/PatternReport'
import Settings from './pages/Settings'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import { StyleGuide } from './design-system'
import { InsightPreview, ActionPreview } from './pages/CardPreview'

function AppLayout({ children }) {
  return (
    <div className="min-h-dvh bg-surface max-w-lg mx-auto relative">
      <TopBar />
      {children}
      <NavBar />
      <RescueFAB />
      {/* Bottom padding: nav bar + safe area for home indicator */}
      <div style={{ height: 'calc(80px + env(safe-area-inset-bottom))' }} />
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Onboarding — public. Quiz comes first, account created at the end. */}
          <Route path="/onboarding" element={<Onboarding />} />

          {/* App — protected + onboarding required */}
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <AppLayout><Home /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/emora"
            element={
              <ProtectedRoute>
                <AppLayout><Emora /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/rescue"
            element={
              <ProtectedRoute>
                <AppLayout><RescueMode /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/actions"
            element={
              <ProtectedRoute>
                <AppLayout><ActionLab /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/insights"
            element={
              <ProtectedRoute>
                <AppLayout><InsightTabs /></AppLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/report"
            element={
              <ProtectedRoute>
                <AppLayout><PatternReport /></AppLayout>
              </ProtectedRoute>
            }
          />

          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <AppLayout><Settings /></AppLayout>
              </ProtectedRoute>
            }
          />

          {/* Design system style guide — dev only */}
          <Route path="/style-guide" element={<StyleGuide />} />
          {/* Card previews — dev only */}
          <Route path="/preview-insight" element={<InsightPreview />} />
          <Route path="/preview-action" element={<ActionPreview />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  )
}
