import axios from 'axios'
import { useAuthStore } from '../store'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' }
})

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout()
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  me: () => api.get('/auth/me'),
}

// Subjects
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getOne: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
  join: (code) => api.post('/subjects/join', { code }),
  getTopics: (id) => api.get(`/subjects/${id}/topics`),
  addTopic: (id, data) => api.post(`/subjects/${id}/topics`, data),
  uploadSyllabus: (id, formData) => api.post(`/subjects/${id}/syllabus`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Topics
export const topicsAPI = {
  updateProgress: (topicId, status, extras = {}) => api.put(`/topics/${topicId}/progress`, { status, ...extras }),
  getProgress: (subjectId) => api.get(`/topics/progress/${subjectId}`),
}

// Study Plan
export const planAPI = {
  generate: (subjectId, data) => api.post('/plan/generate', { ...data, subjectId }),
  getActive: () => api.get(`/plan`),
  getToday: () => api.get('/plan/today'),
}

// AI
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
  getHistory: (subjectId) => api.get(`/ai/history/${subjectId}`),
  summarizeTopic: (topicId, level) => api.post(`/ai/summarize/${topicId}`, { level }),
  generatePlan: (data) => api.post('/ai/generate-plan', data),
  lastNight: (data) => api.post('/ai/last-night', data),
  analyzePYQ: (formData) => api.post('/ai/analyze-pyq', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getWeeklyReport: () => api.get('/ai/weekly-report'),
}

// Gamification
export const gamificationAPI = {
  getStats: () => api.get('/gamification/status'),
  getLeaderboard: () => api.get('/gamification/leaderboard'),
  getBadges: () => api.get('/gamification/badges'),
}

// Study Groups
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  create: (data) => api.post('/groups', data),
  join: (id) => api.put(`/groups/${id}/join`),
  getOne: (id) => api.get(`/groups/${id}`),
  sendMessage: (id, text) => api.post(`/groups/${id}/message`, { text }),
}

// Materials
export const materialsAPI = {
  getAll: (subjectId) => api.get(`/materials/${subjectId}`),
  upload: (formData) => api.post(`/materials/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMyUploads: () => api.get('/materials/user/my-uploads'),
}

// Analytics
export const analyticsAPI = {
  getStudentDashboard: () => api.get('/analytics'),
  getTeacherDashboard: (subjectId) => api.get(`/analytics/teacher/${subjectId}`),
}

export default api
