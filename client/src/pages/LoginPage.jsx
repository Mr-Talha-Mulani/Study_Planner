import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'
import { MOCK_USER_STUDENT, MOCK_USER_TEACHER } from '../utils/mockData'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'STUDENT' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    // Phase 1: Mock login (Phase 2 replaces with real API)
    await new Promise(r => setTimeout(r, 900))

    const user = form.role === 'TEACHER' ? MOCK_USER_TEACHER : MOCK_USER_STUDENT
    setAuth({ ...user, role: form.role }, 'mock-token-' + Date.now())

    toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)

    if (form.role === 'TEACHER') {
      navigate('/teacher/dashboard')
    } else {
      navigate('/dashboard')
    }
    setLoading(false)
  }

  const demoLogin = (role) => {
    setForm({
      email: role === 'TEACHER' ? 'meera@college.edu' : 'arjun@college.edu',
      password: 'demo1234',
      role
    })
  }

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{
            width: 64,
            height: 64,
            background: 'var(--grad-primary)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-primary)'
          }}>
            📖
          </div>
          <h1 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Smart Study Planner
          </h1>
          <p className="text-secondary text-sm">AI-Powered Academic Progress Platform</p>
        </div>

        {/* Role Selector */}
        <div className="tabs" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <button
            className={`tab ${form.role === 'STUDENT' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setForm(f => ({ ...f, role: 'STUDENT' }))}
          >
            🎓 Student
          </button>
          <button
            className={`tab ${form.role === 'TEACHER' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setForm(f => ({ ...f, role: 'TEACHER' }))}
          >
            👩‍🏫 Teacher
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="login-email"
              type="email"
              className="form-input"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            id="login-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Signing In...</>
            ) : 'Sign In 🚀'}
          </button>
        </form>

        {/* Demo Accounts */}
        <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-surface2)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
          <div className="text-xs text-muted text-center" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>
            🎯 Demo Accounts
          </div>
          <div className="flex gap-2">
            <button
              id="demo-student"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
              onClick={() => demoLogin('STUDENT')}
              type="button"
            >
              🎓 Student Demo
            </button>
            <button
              id="demo-teacher"
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.75rem' }}
              onClick={() => demoLogin('TEACHER')}
              type="button"
            >
              👩‍🏫 Teacher Demo
            </button>
          </div>
        </div>

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <span className="text-muted text-sm">Don't have an account? </span>
          <Link to="/register" style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.875rem' }}>
            Register →
          </Link>
        </div>
      </div>
    </div>
  )
}
