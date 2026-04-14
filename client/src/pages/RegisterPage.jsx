import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT', institution: '' })
  const [loading, setLoading] = useState(false)
  const { setAuth } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    setLoading(true)

    // Phase 1: Mock register
    await new Promise(r => setTimeout(r, 1000))

    const user = {
      _id: 'user-' + Date.now(),
      name: form.name,
      email: form.email,
      role: form.role,
      institution: form.institution,
      createdAt: new Date().toISOString()
    }

    setAuth(user, 'mock-token-' + Date.now())
    toast.success(`Welcome to Smart Study Planner, ${form.name.split(' ')[0]}! 🎉`)

    navigate(form.role === 'TEACHER' ? '/teacher/dashboard' : '/dashboard')
    setLoading(false)
  }

  return (
    <div className="auth-container">
      <div className="auth-card slide-up">
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <div style={{
            width: 64, height: 64,
            background: 'var(--grad-accent)',
            borderRadius: 16,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.8rem',
            margin: '0 auto 1rem',
            boxShadow: 'var(--shadow-accent)'
          }}>
            🎓
          </div>
          <h1 style={{ fontSize: '1.75rem', background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Create Account
          </h1>
          <p className="text-secondary text-sm">Join Smart Study Planner today</p>
        </div>

        {/* Role Selector */}
        <div className="tabs" style={{ width: '100%', marginBottom: '1.5rem' }}>
          <button
            className={`tab ${form.role === 'STUDENT' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setForm(f => ({ ...f, role: 'STUDENT' }))}
            type="button"
          >
            🎓 Student
          </button>
          <button
            className={`tab ${form.role === 'TEACHER' ? 'active' : ''}`}
            style={{ flex: 1 }}
            onClick={() => setForm(f => ({ ...f, role: 'TEACHER' }))}
            type="button"
          >
            👩‍🏫 Teacher
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input
              id="register-name"
              type="text"
              className="form-input"
              placeholder="Arjun Sharma"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              id="register-email"
              type="email"
              className="form-input"
              placeholder="you@college.edu"
              value={form.email}
              onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Institution (Optional)</label>
            <input
              id="register-institution"
              type="text"
              className="form-input"
              placeholder="Mumbai Engineering College"
              value={form.institution}
              onChange={e => setForm(f => ({ ...f, institution: e.target.value }))}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="register-password"
              type="password"
              className="form-input"
              placeholder="Min. 6 characters"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
            />
          </div>

          <button
            id="register-submit"
            type="submit"
            className="btn btn-primary btn-lg w-full"
            disabled={loading}
            style={{ marginTop: '0.5rem' }}
          >
            {loading ? (
              <><span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Creating Account...</>
            ) : `Create ${form.role === 'TEACHER' ? 'Teacher' : 'Student'} Account 🚀`}
          </button>
        </form>

        <div className="text-center" style={{ marginTop: '1.5rem' }}>
          <span className="text-muted text-sm">Already have an account? </span>
          <Link to="/login" style={{ color: 'var(--color-primary-light)', fontWeight: 600, fontSize: '0.875rem' }}>
            Sign In →
          </Link>
        </div>
      </div>
    </div>
  )
}
