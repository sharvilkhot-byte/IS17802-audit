import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import { getStyleColor, applyCssVars } from '../utils/styleColors'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false)

  // Load user from localStorage on mount
  useEffect(() => {
    const token = localStorage.getItem('unclinq_token')
    const cachedUser = localStorage.getItem('unclinq_user')

    if (token && cachedUser) {
      const cached = JSON.parse(cachedUser)
      // Set profile immediately from cache so CSS vars are applied before server responds
      setUser(cached)
      setProfile(cached)

      // Refresh from server — with a 10s timeout so a dead server doesn't hang the app
      const meRequest = Promise.race([
        authAPI.me(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 10000))
      ])
      meRequest
        .then(res => {
          const serverUser = res.data.user
          // Preserve locally-stored fields the backend may not return (e.g. color_preference)
          const merged = {
            ...serverUser,
            color_preference: serverUser.color_preference ?? cached.color_preference ?? null,
          }
          setUser(merged)
          setProfile(merged)
          localStorage.setItem('unclinq_user', JSON.stringify(merged))
        })
        .catch(() => {
          // Token invalid or server unreachable — clear session
          logout()
        })
        .finally(() => {
          setLoading(false)
          setAuthChecked(true)
        })
    } else {
      setLoading(false)
      setAuthChecked(true)
    }
  }, [])

  const login = useCallback((token, userData) => {
    localStorage.setItem('unclinq_token', token)
    localStorage.setItem('unclinq_user', JSON.stringify(userData))
    setUser(userData)
    setProfile(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('unclinq_token')
    localStorage.removeItem('unclinq_user')
    setUser(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback((updates) => {
    setProfile(prev => ({ ...prev, ...updates }))
    const cached = JSON.parse(localStorage.getItem('unclinq_user') || '{}')
    localStorage.setItem('unclinq_user', JSON.stringify({ ...cached, ...updates }))
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      const res = await authAPI.me()
      const serverUser = res.data.user
      const cached = JSON.parse(localStorage.getItem('unclinq_user') || '{}')
      const merged = {
        ...serverUser,
        color_preference: serverUser.color_preference ?? cached.color_preference ?? null,
      }
      setUser(merged)
      setProfile(merged)
      localStorage.setItem('unclinq_user', JSON.stringify(merged))
    } catch (err) {
      console.error('Failed to refresh profile')
    }
  }, [])

  const styleColor = getStyleColor(profile?.color_preference ?? profile?.primary_style)

  // Apply CSS custom properties whenever the resolved palette changes.
  // Using the palette's primary as the dep key so React reliably detects changes
  // (object identity alone can be fragile when derived from state).
  useEffect(() => {
    applyCssVars(styleColor)
  }, [styleColor?.primary])

  return (
    <AppContext.Provider value={{
      user,
      profile,
      loading,
      authChecked,
      isAuthenticated: !!user,
      styleColor,
      login,
      logout,
      updateProfile,
      refreshProfile
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
