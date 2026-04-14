import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
    }),
    {
      name: 'ssp-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated })
    }
  )
)

export const useAppStore = create((set, get) => ({
  theme: 'dark',
  sidebarOpen: true,
  
  // Student data
  subjects: [],
  currentSubject: null,
  studyPlan: [],
  todaysTasks: [],
  
  // Stats
  stats: {
    totalTopics: 0,
    completedTopics: 0,
    studyStreak: 0,
    totalXP: 0,
    level: 1,
    badges: []
  },

  toggleTheme: () => {
    const newTheme = get().theme === 'dark' ? 'light' : 'dark'
    document.documentElement.setAttribute('data-theme', newTheme)
    set({ theme: newTheme })
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  setSubjects: (subjects) => set({ subjects }),
  setCurrentSubject: (subject) => set({ currentSubject: subject }),
  setStudyPlan: (plan) => set({ studyPlan: plan }),
  setTodaysTasks: (tasks) => set({ todaysTasks: tasks }),
  setStats: (stats) => set((state) => ({ stats: { ...state.stats, ...stats } })),

  markTopicComplete: (topicId) => set((state) => ({
    stats: {
      ...state.stats,
      completedTopics: state.stats.completedTopics + 1,
      totalXP: state.stats.totalXP + 10
    }
  })),
}))
