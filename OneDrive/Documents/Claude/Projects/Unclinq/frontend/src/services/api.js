import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || '/api'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' }
})

// Attach JWT token to every request
api.interceptors.request.use(config => {
  const token = localStorage.getItem('unclinq_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Handle auth errors globally + proactive token refresh
api.interceptors.response.use(
  res => res,
  async err => {
    const originalRequest = err.config
    if (err.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        // Try to refresh the token silently
        const refreshRes = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          headers: { Authorization: `Bearer ${localStorage.getItem('unclinq_token')}` }
        })
        const newToken = refreshRes.data.token
        localStorage.setItem('unclinq_token', newToken)
        originalRequest.headers.Authorization = `Bearer ${newToken}`
        return api(originalRequest)
      } catch (_refreshErr) {
        // Refresh also failed — clear session and redirect
        localStorage.removeItem('unclinq_token')
        localStorage.removeItem('unclinq_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

// ─── Auth ─────────────────────────────────────────────────────────────────
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, new_password) => api.post('/auth/reset-password', { token, new_password }),
  deleteAccount: (password) => api.delete('/auth/account', { data: { password } }),
  updateSettings: (data) => api.patch('/auth/settings', data),
  requestReassessment: () => api.post('/auth/request-reassessment'),
  exportData: () => api.get('/auth/export-data'),
  // OTP (passwordless)
  sendOtp: (email, purpose = 'login') => api.post('/auth/send-otp', { email, purpose }),
  verifyOtp: (email, code, purpose = 'login', name) => api.post('/auth/verify-otp', { email, code, purpose, name }),
}

// ─── Onboarding ───────────────────────────────────────────────────────────
export const onboardingAPI = {
  complete: (data) => api.post('/onboarding/complete', data),
  status: () => api.get('/onboarding/status')
}

// ─── Emora ────────────────────────────────────────────────────────────────
export const emoraAPI = {
  sendMessage: (message, context = null) => api.post('/emora/message', { message, ...(context && { context }) }),
  endSession: (payload = {}) => api.post('/emora/session-end', payload),
  sessionHistory: () => api.get('/emora/session-history'),
  currentSession: () => api.get('/emora/current-session'),
  toggleExclude: (sessionId, excluded) => api.patch(`/emora/sessions/${sessionId}/exclude`, { excluded }),
}

// ─── Rescue Mode ──────────────────────────────────────────────────────────
export const rescueAPI = {
  start: (data) => api.post('/rescue/start', data),
  end: (data) => api.post('/rescue/end', data),
  history: () => api.get('/rescue/history')
}

// ─── Action Lab ───────────────────────────────────────────────────────────
export const actionLabAPI = {
  getNext: () => api.get('/action-lab/next'),
  complete: (historyId) => api.post('/action-lab/complete', { history_id: historyId }),
  skip: (historyId) => api.post('/action-lab/skip', { history_id: historyId }),
  markHard: (historyId) => api.post('/action-lab/mark-hard', { history_id: historyId }),
  effectiveness: (historyId, rating) => api.post('/action-lab/effectiveness', { history_id: historyId, rating }),
  history: () => api.get('/action-lab/history')
}

// ─── Insight Tabs ─────────────────────────────────────────────────────────
export const insightTabsAPI = {
  getAll: () => api.get('/insight-tabs'),
  markRead: (tabId, dwellSeconds) => api.post(`/insight-tabs/${tabId}/read`, { dwell_seconds: dwellSeconds }),
  // Phase 3 only: longitudinal pattern comparison (earliest vs. recent sessions)
  getPatternArchive: () => api.get('/insight-tabs/pattern-archive'),
}

// ─── Pattern Report ───────────────────────────────────────────────────────
export const patternReportAPI = {
  getLatest: () => api.get('/pattern-report/latest'),
  getAll: () => api.get('/pattern-report/all'),
  getById: (id) => api.get(`/pattern-report/${id}`),
  generate: () => api.post('/pattern-report/generate')
}

// ─── Notifications (E-03) ────────────────────────────────────────────────
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  dismiss: (id) => api.post(`/notifications/${id}/dismiss`),
}

// ─── Week 1 Experience (E-01) ─────────────────────────────────────────────
export const week1API = {
  // Called on every app open — returns re-entry prompt, plant stage, micro-report, crisis gate
  reentry: () => api.get('/week1/reentry'),
  // Returns the Day 7 micro-report if available
  getMicroReport: () => api.get('/week1/micro-report'),
  // Records app open timestamp (lightweight ping)
  appOpen: () => api.post('/week1/app-open'),
  // Clears the pending phase entry moment after the user dismisses it
  dismissPhaseEntry: () => api.post('/week1/dismiss-phase-entry'),
  // Fetch the first pending milestone event
  getPendingMilestone: () => api.get('/week1/pending-milestone'),
  // Mark a milestone as seen
  dismissMilestone: (id) => api.post(`/week1/dismiss-milestone/${id}`),
}

export default api
