import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      isAuthChecking: false,

      setAuth: (user, token) => set({ user, token, isAuthenticated: true }),

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false })
      },

      setHydrated: (value) => set({ isHydrated: value }),

      bootstrapAuth: async () => {
        const state = get()
        if (!state.token) {
          set({ isHydrated: true, isAuthChecking: false })
          return
        }

        set({ isAuthChecking: true })
        try {
          const { authAPI } = await import('../api')
          const res = await authAPI.me()
          set({ user: res.data.user, isAuthenticated: true })
        } catch {
          set({ user: null, token: null, isAuthenticated: false })
        } finally {
          set({ isHydrated: true, isAuthChecking: false })
        }
      },

      updateUser: (updates) => set((state) => ({
        user: { ...state.user, ...updates }
      })),
    }),
    {
      name: 'ssp-auth',
      partialize: (state) => ({ user: state.user, token: state.token, isAuthenticated: state.isAuthenticated }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true)
      }
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

  updateTopicStatus: (topicId, status) => set((state) => {
    const updatedSubjects = state.subjects.map(sub => ({
      ...sub,
      modules: sub.modules?.map(mod => ({
        ...mod,
        topics: mod.topics?.map(topic => 
          topic._id === topicId ? { ...topic, status } : topic
        )
      }))
    }))
    
    // Recalculate stats
    const allTopics = updatedSubjects.flatMap(s => (s.modules || []).flatMap(m => m.topics || []))
    const completed = allTopics.filter(t => t.status === 'COMPLETED').length
    
    const updatedCurrentSubject = state.currentSubject ? 
      updatedSubjects.find(s => s._id === state.currentSubject._id) || state.currentSubject
      : null;

    return { 
      subjects: updatedSubjects,
      currentSubject: updatedCurrentSubject,
      stats: { ...state.stats, completedTopics: completed }
    }
  }),
}))
