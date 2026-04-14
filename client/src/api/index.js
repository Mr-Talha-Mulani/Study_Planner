import axios from 'axios'
import { useAuthStore } from '../store'

const api = axios.create({
  baseURL: '/api',
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
  updateProgress: (topicId, status) => api.put(`/topics/${topicId}/progress`, { status }),
  getProgress: (subjectId) => api.get(`/topics/progress/${subjectId}`),
}

// Study Plan
export const planAPI = {
  generate: (subjectId, data) => api.post(`/plan/generate/${subjectId}`, data),
  getActive: (subjectId) => api.get(`/plan/${subjectId}`),
  getToday: () => api.get('/plan/today'),
}

// AI
export const aiAPI = {
  chat: (data) => api.post('/ai/chat', data),
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
  getStats: () => api.get('/gamification/stats'),
  getLeaderboard: (subjectId) => api.get(`/gamification/leaderboard/${subjectId}`),
  getBadges: () => api.get('/gamification/badges'),
}

// Study Groups
export const groupsAPI = {
  getAll: () => api.get('/groups'),
  create: (data) => api.post('/groups', data),
  join: (id) => api.post(`/groups/${id}/join`),
  getMessages: (id) => api.get(`/groups/${id}/messages`),
}

// Materials
export const materialsAPI = {
  getAll: (subjectId) => api.get(`/materials/${subjectId}`),
  upload: (subjectId, formData) => api.post(`/materials/${subjectId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
}

// Analytics
export const analyticsAPI = {
  getStudentDashboard: () => api.get('/analytics/student'),
  getTeacherDashboard: (subjectId) => api.get(`/analytics/teacher/${subjectId}`),
}

export default api
