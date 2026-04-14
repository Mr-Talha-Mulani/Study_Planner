import { useEffect, useState } from 'react'
import { getDaysUntil } from '../utils/helpers'
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

export default function AnalyticsPage() {
  const [subjects, setSubjects] = useState([])
  const [summary, setSummary] = useState({ completedTopics: 0, totalHoursStr: '0h', planAdherencePct: 0, examReadinessPct: 0 })
  const [progressHistory, setProgressHistory] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const { analyticsAPI, subjectsAPI } = await import('../api')
        const [analyticsRes, subjectsRes] = await Promise.all([
          analyticsAPI.getStudentDashboard(),
          subjectsAPI.getAll()
        ])
        setSubjects(subjectsRes.data.subjects || [])
        setSummary(analyticsRes.data.summary || summary)
        setProgressHistory(analyticsRes.data.history || [])
      } catch {
        // keep safe defaults
      }
    }
    load()
  }, [])

  const totalTopics = subjects.flatMap(s => (s.modules || []).flatMap(m => m.topics || [])).length
  const completedTopics = summary.completedTopics || 0

  return (
    <div className="page-container fade-in">
      <h1 className="page-title">📈 My Progress</h1>
      <p className="page-subtitle">Comprehensive analytics of your study activity and performance</p>

      {/* Stats grid */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(250,84%,62%,0.12)' }}>📚</div>
          <div>
            <div className="stat-value">{completedTopics}/{totalTopics}</div>
            <div className="stat-label">Topics Done</div>
            <div className="stat-delta up">{Math.round((completedTopics/totalTopics)*100)}% complete</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(168,79%,48%,0.12)' }}>⏱</div>
          <div>
            <div className="stat-value" style={{ background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{summary.totalHoursStr}</div>
            <div className="stat-label">Hours This Week</div>
            <div className="stat-delta up">Tracked from progress logs</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(38,92%,55%,0.12)' }}>🎯</div>
          <div>
            <div className="stat-value" style={{ background: 'linear-gradient(135deg, hsl(38,92%,55%), hsl(48,96%,54%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{summary.planAdherencePct}%</div>
            <div className="stat-label">Plan Adherence</div>
            <div className="stat-delta up">Consistent schedule</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(200,85%,55%,0.12)' }}>🧠</div>
          <div>
            <div className="stat-value" style={{ background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{summary.examReadinessPct}%</div>
            <div className="stat-label">Exam Readiness</div>
            <div className="stat-delta up">Based on progress</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Area Chart */}
        <div className="card">
          <div className="section-title mb-4">📊 Topics Completed (This Week)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={progressHistory}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Area type="monotone" dataKey="topics" stroke="hsl(250,84%,62%)" fill="hsl(250,84%,62%,0.15)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Line Chart */}
        <div className="card">
          <div className="section-title mb-4">⏱ Study Hours (This Week)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressHistory}>
              <XAxis dataKey="day" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)' }} />
              <Line type="monotone" dataKey="hours" stroke="hsl(168,79%,48%)" strokeWidth={2} dot={{ fill: 'hsl(168,79%,48%)', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject breakdown */}
      <div className="section-title mb-4">📚 Per-Subject Breakdown</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {subjects.map(sub => {
          const topics = (sub.modules || []).flatMap(m => m.topics || [])
          const done = topics.filter(t => (t.status || 'NOT_STARTED') === 'COMPLETED')
          const inProg = topics.filter(t => (t.status || 'NOT_STARTED') === 'IN_PROGRESS')
          const pct = topics.length ? Math.round((done.length / topics.length) * 100) : 0
          const nextExam = sub.examEvents?.[0]
          const daysLeft = nextExam ? getDaysUntil(nextExam.date || nextExam.examDate) : null

          return (
            <div key={sub._id} className="card" style={{ padding: '16px 20px' }}>
              <div className="flex items-center gap-4 mb-3">
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: sub.color, flexShrink: 0 }} />
                <div style={{ flex: 1 }}>
                  <div className="font-semibold">{sub.name}</div>
                  <div className="text-xs text-muted">{sub.code} · {sub.semester}</div>
                </div>
                {daysLeft !== null && (
                  <div className="text-right">
                    <div className="text-xs text-muted">Next exam</div>
                    <div className="text-sm font-bold" style={{ color: daysLeft <= 7 ? 'hsl(350,80%,72%)' : 'var(--text-secondary)' }}>
                      {daysLeft}d
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-6 mb-3">
                <div>
                  <div className="text-xs text-muted">Completed</div>
                  <div className="font-bold text-sm" style={{ color: 'hsl(142,69%,60%)' }}>{done.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">In Progress</div>
                  <div className="font-bold text-sm" style={{ color: 'hsl(38,92%,65%)' }}>{inProg.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Remaining</div>
                  <div className="font-bold text-sm" style={{ color: 'var(--text-secondary)' }}>{topics.length - done.length - inProg.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Total</div>
                  <div className="font-bold text-sm">{topics.length}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="progress-bar-container" style={{ flex: 1, height: 10 }}>
                  <div className="progress-bar" style={{ width: `${pct}%`, background: sub.color }} />
                </div>
                <span className="text-sm font-bold" style={{ color: sub.color, minWidth: 40 }}>{pct}%</span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
