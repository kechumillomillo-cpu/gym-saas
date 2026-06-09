import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

export const api = axios.create({ baseURL: API_URL, withCredentials: false })

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('accessToken')
    if (token) config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let isRefreshing = false
let failedQueue: Array<{ resolve: (v: string) => void; reject: (e: any) => void }> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve(token!)))
  failedQueue = []
}

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => failedQueue.push({ resolve, reject }))
          .then((token) => { original.headers.Authorization = `Bearer ${token}`; return api(original) })
          .catch((e) => Promise.reject(e))
      }
      original._retry = true
      isRefreshing = true
      const refreshToken = localStorage.getItem('refreshToken')
      if (!refreshToken) { signalLogout(); return Promise.reject(error) }
      try {
        const { data } = await axios.post(`${API_URL}/auth/refresh`, { refreshToken })
        localStorage.setItem('accessToken', data.accessToken)
        localStorage.setItem('refreshToken', data.refreshToken)
        processQueue(null, data.accessToken)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch (e) {
        processQueue(e, null)
        signalLogout()
        return Promise.reject(e)
      } finally {
        isRefreshing = false
      }
    }
    return Promise.reject(error)
  },
)

function signalLogout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('gymSlug')
  window.dispatchEvent(new Event('auth:logout'))
}

export const authApi = {
  login: (data: { email: string; password: string; gymSlug?: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
  logout: (refreshToken?: string) => api.post('/auth/logout', { refreshToken }),
  me: () => api.get('/auth/me'),
  changePassword: (data: { currentPassword: string; newPassword: string }) => api.patch('/auth/change-password', data),
}

export const membersApi = {
  list: (params?: any) => api.get('/members', { params }),
  get: (id: string) => api.get(`/members/${id}`),
  create: (data: any) => api.post('/members', data),
  update: (id: string, data: any) => api.patch(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
  qr: (id: string) => api.get(`/members/${id}/qr`),
  history: (id: string) => api.get(`/members/${id}/history`),
}

export const routinesApi = {
  list: () => api.get('/routines'),
  get: (id: string) => api.get(`/routines/${id}`),
  create: (data: any) => api.post('/routines', data),
  update: (id: string, data: any) => api.patch(`/routines/${id}`, data),
  delete: (id: string) => api.delete(`/routines/${id}`),
  assign: (data: any) => api.post('/routines/assign', data),
  expiring: (days?: number) => api.get('/routines/expiring', { params: { days } }),
  getMemberRoutine: (memberId: string) => api.get(`/routines/member/${memberId}`),
}

export const exercisesApi = {
  list: (params?: any) => api.get('/exercises', { params }),
  get: (id: string) => api.get(`/exercises/${id}`),
  categories: () => api.get('/exercises/categories'),
  create: (data: any) => api.post('/exercises', data),
  update: (id: string, data: any) => api.patch(`/exercises/${id}`, data),
  delete: (id: string) => api.delete(`/exercises/${id}`),
}

export const paymentsApi = {
  list: (params?: any) => api.get('/payments', { params }),
  create: (data: any) => api.post('/payments', data),
  markPaid: (id: string) => api.patch(`/payments/${id}/paid`),
  plans: () => api.get('/payments/plans'),
  createPlan: (data: any) => api.post('/payments/plans', data),
  createMpPreference: (data: any) => api.post('/payments/mp-preference', data),
  monthRevenue: () => api.get('/payments/revenue/month'),
}

export const schedulesApi = {
  slots: () => api.get('/schedules/slots'),
  createSlot: (data: any) => api.post('/schedules/slots', data),
  updateSlot: (id: string, data: any) => api.patch(`/schedules/slots/${id}`, data),
  deleteSlot: (id: string) => api.delete(`/schedules/slots/${id}`),
  reservations: (params?: any) => api.get('/schedules/reservations', { params }),
  reserve: (data: any) => api.post('/schedules/reserve', data),
  cancelReservation: (id: string) => api.patch(`/schedules/reservations/${id}/cancel`),
  holidays: () => api.get('/schedules/holidays'),
  addHoliday: (data: any) => api.post('/schedules/holidays', data),
  occupancy: (weekStart: string) => api.get('/schedules/occupancy', { params: { weekStart } }),
}

export const attendanceApi = {
  list: (params?: any) => api.get('/attendance', { params }),
  checkIn: (memberId: string) => api.post('/attendance/checkin', { memberId }),
  today: () => api.get('/attendance/today'),
  stats: (days?: number) => api.get('/attendance/stats', { params: { days } }),
}

export const nutritionApi = {
  createMetric: (data: any) => api.post('/nutrition/metrics', data),
  getMetrics: (memberId: string) => api.get(`/nutrition/metrics/${memberId}`),
  getLatest: (memberId: string) => api.get(`/nutrition/metrics/${memberId}/latest`),
  addPhoto: (data: any) => api.post('/nutrition/photos', data),
  getPhotos: (memberId: string) => api.get(`/nutrition/photos/${memberId}`),
}

export const dashboardApi = {
  stats: () => api.get('/dashboard/stats'),
  activity: () => api.get('/dashboard/activity'),
  expiries: () => api.get('/dashboard/expiries'),
  revenueChart: (months?: number) => api.get('/dashboard/revenue-chart', { params: { months } }),
}

export const reportsApi = {
  billing: (year: number, month: number) => api.get('/reports/billing', { params: { year, month } }),
  retention: () => api.get('/reports/retention'),
  members: () => api.get('/reports/members'),
  attendance: (days?: number) => api.get('/reports/attendance', { params: { days } }),
}

export const adminApi = {
  getGym: () => api.get('/admin/gym'),
  updateGym: (data: any) => api.patch('/admin/gym', data),
  getUsers: () => api.get('/admin/users'),
  createUser: (data: any) => api.post('/admin/users', data),
  updateRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
  deactivate: (id: string) => api.patch(`/admin/users/${id}/deactivate`),
  getAudit: (page?: number) => api.get('/admin/audit', { params: { page } }),
  getAnnouncements: () => api.get('/admin/announcements'),
  createAnnouncement: (data: any) => api.post('/admin/announcements', data),
}

export const notificationsApi = {
  list: (params?: any) => api.get('/notifications', { params }),
  sendCustom: (data: any) => api.post('/notifications/custom', data),
  saveFcmToken: (token: string) => api.post('/notifications/fcm-token', { token }),
}

export const tenantsApi = {
  getBySlug: (slug: string) => api.get(`/tenants/${slug}`),
}
