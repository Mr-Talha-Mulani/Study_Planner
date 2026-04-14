import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'STUDENT' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Connect to real backend API
      const { authAPI } = await import('../api')
      const response = await authAPI.login({ email: form.email, password: form.password })
      
      const { user, token } = response.data
      setAuth(user, token)

      toast.success(`Welcome back, ${user.name.split(' ')[0]}! 👋`)

      if (user.role === 'TEACHER') {
        navigate('/teacher/dashboard')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      toast.error(err.response?.data?.error || 'Login failed')
    } finally {
      setLoading(false)
    }
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
