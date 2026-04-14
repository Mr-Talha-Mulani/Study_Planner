import { NavLink, useNavigate } from 'react-router-dom'
import { useAuthStore, useAppStore } from '../store'
import { getInitials, stringToColor } from '../utils/helpers'

const studentNav = [
  { path: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/subjects', icon: '📚', label: 'My Subjects' },
  { path: '/planner', icon: '📅', label: 'Study Planner' },
  { path: '/last-night', icon: '🌙', label: 'Last-Night Mode' },
  { path: '/ai-tutor', icon: '🤖', label: 'AI Tutor' },
  { path: '/pyq-analysis', icon: '📊', label: 'PYQ Analysis' },
  { path: '/gamification', icon: '🏆', label: 'Achievements' },
  { path: '/study-groups', icon: '👥', label: 'Study Groups' },
  { path: '/analytics', icon: '📈', label: 'My Progress' },
]

const teacherNav = [
  { path: '/teacher/dashboard', icon: '🏠', label: 'Dashboard' },
  { path: '/teacher/subjects', icon: '📚', label: 'My Subjects' },
  { path: '/teacher/materials', icon: '📁', label: 'Materials' },
  { path: '/teacher/pyq', icon: '📄', label: 'Upload PYQs' },
  { path: '/teacher/analytics', icon: '📈', label: 'Class Analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuthStore()
  const { sidebarOpen, toggleTheme, theme } = useAppStore()
  const navigate = useNavigate()

  const navItems = user?.role === 'TEACHER' ? teacherNav : studentNav
  const initials = getInitials(user?.name || 'User')
  const avatarColor = stringToColor(user?.name || 'User')

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className={`sidebar ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="logo-icon">📖</div>
        <div>
          <div className="logo-text">StudyPlanner</div>
          <div className="logo-sub">AI-Powered Platform</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav-section">
        <div className="nav-section-label">
          {user?.role === 'TEACHER' ? 'Teacher' : 'Student'} Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Bottom section */}
      <div className="nav-section">
        <div className="nav-section-label">Settings</div>
        <button className="nav-item" onClick={toggleTheme}>
          <span className="nav-icon">{theme === 'dark' ? '☀️' : '🌙'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <span className="nav-icon">⚙️</span>
          <span>Settings</span>
        </NavLink>
      </div>

      {/* User Profile */}
      <div className="card-glass" style={{ padding: '12px', marginTop: '8px' }}>
        <div className="flex items-center gap-3">
          <div
            className="avatar"
            style={{ background: avatarColor, width: 38, height: 38, fontSize: '0.8rem' }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="text-sm font-semibold truncate">{user?.name || 'User'}</div>
            <div className="text-xs text-muted truncate">{user?.role || 'STUDENT'}</div>
          </div>
          <button
            className="btn-ghost btn-icon"
            onClick={handleLogout}
            title="Logout"
            style={{ fontSize: '1rem', padding: '6px', borderRadius: '8px', color: 'var(--text-muted)' }}
          >
            🚪
          </button>
        </div>
      </div>
    </aside>
  )
}
