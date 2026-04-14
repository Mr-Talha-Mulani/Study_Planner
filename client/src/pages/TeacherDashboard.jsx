import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { MOCK_TEACHER_SUBJECTS } from '../utils/mockData'
import { formatDate, getDaysUntil } from '../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const subjects = MOCK_TEACHER_SUBJECTS
  const [selectedSubject, setSelectedSubject] = useState(subjects[0])

  const totalStudents = subjects.reduce((a, s) => a + s.enrolled, 0)
  const avgProgress = Math.round(subjects.reduce((a, s) => a + s.avgProgress, 0) / subjects.length)
  const atRiskTotal = subjects.reduce((a, s) => a + s.atRisk, 0)

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">Welcome, {user?.name?.split(' ')[1] || 'Teacher'}!</h1>
          <p className="page-subtitle">{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · {subjects.length} subjects active</p>
        </div>
        <div className="flex gap-3">
          <Link to="/teacher/subjects" className="btn btn-primary">📚 Manage Subjects</Link>
          <Link to="/teacher/materials" className="btn btn-outline">📁 Upload Materials</Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(250,84%,62%,0.12)' }}>👥</div>
          <div>
            <div className="stat-value">{totalStudents}</div>
            <div className="stat-label">Total Students</div>
            <div className="stat-delta neutral">across {subjects.length} subjects</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(142,69%,48%,0.12)' }}>📈</div>
          <div>
            <div className="stat-value" style={{ background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {avgProgress}%
            </div>
            <div className="stat-label">Avg. Class Progress</div>
            <div className="stat-delta up">↑ 8% this week</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(350,80%,58%,0.12)' }}>⚠️</div>
          <div>
            <div className="stat-value" style={{ color: 'hsl(350,80%,72%)' }}>{atRiskTotal}</div>
            <div className="stat-label">At-Risk Students</div>
            <div className="stat-delta down">Need attention</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(38,92%,55%,0.12)' }}>📅</div>
          <div>
            <div className="stat-value" style={{ background: 'linear-gradient(135deg, hsl(38,92%,55%), hsl(48,96%,54%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {getDaysUntil(subjects[0].nextExam)}d
            </div>
            <div className="stat-label">Days to Next Exam</div>
            <div className="stat-delta down">{subjects[0].examName} coming up</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
        {/* Main content */}
        <div>
          {/* Subject Selector */}
          <div className="flex gap-3 mb-4">
            {subjects.map(sub => (
              <button
                key={sub._id}
                className={`btn btn-sm ${selectedSubject._id === sub._id ? 'btn-primary' : 'btn-outline'}`}
                onClick={() => setSelectedSubject(sub)}
              >
                {sub.name.split(' ')[0]}
              </button>
            ))}
          </div>

          {/* Class Progress Chart */}
          <div className="card mb-4">
            <div className="section-title mb-4">📊 Class Topic Completion — {selectedSubject.name}</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={selectedSubject.topicCompletionByClass} margin={{ top: 0, right: 0, left: 0, bottom: 60 }}>
                <XAxis
                  dataKey="topic"
                  tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
                  angle={-30}
                  textAnchor="end"
                  interval={0}
                />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} domain={[0, 100]} />
                <Tooltip
                  formatter={(v) => [`${v}%`, 'Completion']}
                  contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px' }}
                />
                <Bar dataKey="completion" name="Class Completion %" fill="hsl(250,84%,62%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Cards */}
          {subjects.map(sub => {
            const daysLeft = getDaysUntil(sub.nextExam)
            return (
              <div key={sub._id} className="card mb-4">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: sub.color }} />
                      <span className="font-bold">{sub.name}</span>
                      <span className="badge badge-primary">{sub.code}</span>
                    </div>
                    <div className="text-xs text-muted">{sub.enrolled} students · {sub.topics} topics</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-muted">Next Exam</div>
                    <div className="text-sm font-bold" style={{ color: daysLeft <= 7 ? 'hsl(350,80%,72%)' : 'var(--color-accent-light)' }}>
                      {sub.examName} in {daysLeft}d
                    </div>
                  </div>
                </div>

                <div className="flex gap-6 mb-3">
                  <div>
                    <div className="text-xs text-muted">Avg. Progress</div>
                    <div className="font-bold" style={{ color: sub.color }}>{sub.avgProgress}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">At Risk</div>
                    <div className="font-bold text-danger">{sub.atRisk}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted">Enrolled</div>
                    <div className="font-bold">{sub.enrolled}</div>
                  </div>
                </div>

                <div className="progress-bar-container mb-3" style={{ height: 8 }}>
                  <div className="progress-bar" style={{ width: `${sub.avgProgress}%`, background: sub.color }} />
                </div>

                <div className="flex gap-2">
                  <Link to={`/teacher/subjects`} className="btn btn-outline btn-sm">View Details</Link>
                  <button
                    className="btn btn-sm"
                    style={{ background: 'hsl(350,80%,58%,0.1)', color: 'hsl(350,80%,72%)', border: '1px solid hsl(350,80%,58%,0.25)' }}
                    onClick={() => toast.success(`📢 Reminder sent to ${sub.atRisk} at-risk students!`)}
                  >
                    ⚠️ Send Reminder to {sub.atRisk} At-Risk
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* Right sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Quick Actions */}
          <div className="card">
            <div className="section-title mb-3">⚡ Quick Actions</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <Link to="/teacher/materials" className="btn btn-primary w-full">📁 Upload Study Material</Link>
              <Link to="/teacher/pyq" className="btn btn-accent w-full">📄 Upload PYQ Papers</Link>
              <Link to="/teacher/subjects" className="btn btn-outline w-full">➕ Create New Subject</Link>
              <button
                className="btn btn-outline w-full"
                onClick={() => toast.success('📊 Weekly report sent to all students!')}
              >
                📊 Send Weekly Report
              </button>
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="card">
            <div className="section-title mb-3">📅 Exam Calendar</div>
            {subjects.map(sub => {
              const d = getDaysUntil(sub.nextExam)
              return (
                <div key={sub._id} style={{ padding: '10px 0', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold">{sub.name}</div>
                      <div className="text-xs text-muted">{sub.examName}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold" style={{ color: d <= 7 ? 'hsl(350,80%,72%)' : 'var(--color-accent-light)' }}>
                        {d}d
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
