import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store'
import Sidebar from './components/Sidebar'

// Auth Pages
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

// Student Pages
import DashboardPage from './pages/DashboardPage'
import SubjectsPage from './pages/SubjectsPage'
import PlannerPage from './pages/PlannerPage'
import LastNightPage from './pages/LastNightPage'
import AITutorPage from './pages/AITutorPage'
import PYQAnalysisPage from './pages/PYQAnalysisPage'
import GamificationPage from './pages/GamificationPage'
import StudyGroupsPage from './pages/StudyGroupsPage'
import AnalyticsPage from './pages/AnalyticsPage'

// Teacher Pages
import TeacherDashboard from './pages/TeacherDashboard'
import TeacherSubjectsPage from './pages/TeacherSubjectsPage'
import TeacherMaterialsPage from './pages/TeacherMaterialsPage'
import ProfilePage from './pages/ProfilePage'

// Protected Route
function ProtectedRoute({ children, requiredRole }) {
  const { isAuthenticated, user, isHydrated, isAuthChecking } = useAuthStore()
  if (!isHydrated || isAuthChecking) return null
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (requiredRole && user?.role !== requiredRole) return <Navigate to="/dashboard" replace />
  return children
}

// Layout wrapper
function AppLayout({ children }) {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}

export default function App() {
  const { isAuthenticated, user, token, isHydrated, isAuthChecking, bootstrapAuth } = useAuthStore()

  useEffect(() => {
    if (!isHydrated) return
    if (token) {
      bootstrapAuth()
    }
  }, [isHydrated, token, bootstrapAuth])

  if (!isHydrated || isAuthChecking) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="text-muted">Checking session...</div>
      </div>
    )
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to={user?.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard'} /> : <LoginPage />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={user?.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard'} /> : <RegisterPage />} />
      <Route path="/" element={<Navigate to={isAuthenticated ? (user?.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard') : '/login'} />} />

      {/* Student Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <AppLayout><DashboardPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/subjects" element={
        <ProtectedRoute>
          <AppLayout><SubjectsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/subjects/:id" element={
        <ProtectedRoute>
          <AppLayout><SubjectsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/planner" element={
        <ProtectedRoute>
          <AppLayout><PlannerPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/last-night" element={
        <ProtectedRoute>
          <AppLayout><LastNightPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/ai-tutor" element={
        <ProtectedRoute>
          <AppLayout><AITutorPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/pyq-analysis" element={
        <ProtectedRoute>
          <AppLayout><PYQAnalysisPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/gamification" element={
        <ProtectedRoute>
          <AppLayout><GamificationPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/study-groups" element={
        <ProtectedRoute>
          <AppLayout><StudyGroupsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute>
          <AppLayout><AnalyticsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/settings" element={
        <ProtectedRoute>
          <AppLayout>
            <div className="page-container fade-in">
              <h1 className="page-title">⚙️ Settings</h1>
              <p className="page-subtitle">Manage your account and preferences</p>
              <div className="card mt-6">
                <div className="text-muted text-center" style={{ padding: '2rem' }}>Settings panel — coming in Phase 3</div>
              </div>
            </div>
          </AppLayout>
        </ProtectedRoute>
      } />

      {/* Teacher Routes */}
      <Route path="/teacher/dashboard" element={
        <ProtectedRoute requiredRole="TEACHER">
          <AppLayout><TeacherDashboard /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/subjects" element={
        <ProtectedRoute requiredRole="TEACHER">
          <AppLayout><TeacherSubjectsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/materials" element={
        <ProtectedRoute requiredRole="TEACHER">
          <AppLayout><TeacherMaterialsPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/pyq" element={
        <ProtectedRoute requiredRole="TEACHER">
          <AppLayout><PYQAnalysisPage /></AppLayout>
        </ProtectedRoute>
      } />
      <Route path="/teacher/analytics" element={
        <ProtectedRoute requiredRole="TEACHER">
          <AppLayout><AnalyticsPage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* Shared Routes */}
      <Route path="/profile" element={
        <ProtectedRoute>
          <AppLayout><ProfilePage /></AppLayout>
        </ProtectedRoute>
      } />

      {/* 404 */}
      <Route path="*" element={
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px' }}>
          <div style={{ fontSize: '6rem' }}>🔍</div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>404 — Page Not Found</h1>
          <a href="/dashboard" className="btn btn-primary">Go Home</a>
        </div>
      } />
    </Routes>
  )
}
