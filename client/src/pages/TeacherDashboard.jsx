import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import { getDaysUntil, formatMins } from '../utils/helpers'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import toast from 'react-hot-toast'

export default function TeacherDashboard() {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const { subjectsAPI } = await import('../api')
        const res = await subjectsAPI.getAll()
        const subList = res.data.subjects || []
        setSubjects(subList)
        setSelectedSubject(subList[0] || null)
      } catch {
        toast.error('Failed to load teacher dashboard')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalStudents = useMemo(() => subjects.reduce((a, s) => a + (s.enrollments?.length || 0), 0), [subjects])
  
  const avgProgress = useMemo(() => {
    if (!subjects.length) return 0
    const progressList = subjects.map((s) => {
      const topics = (s.modules || []).flatMap((m) => m.topics || [])
      if (!topics.length) return 0
      const done = topics.filter((t) => (t.status || 'NOT_STARTED') === 'COMPLETED').length
      return (done / topics.length) * 100
    })
    return Math.round(progressList.reduce((acc, value) => acc + value, 0) / progressList.length)
  }, [subjects])

  const nearestExam = subjects
    .flatMap((s) => (s.examEvents || []).map((e) => ({ ...e, subjectName: s.name })))
    .sort((a, b) => new Date(a.date || a.examDate) - new Date(b.date || b.examDate))[0]

  const subjectChartData = (selectedSubject?.modules || []).flatMap((m) => m.topics || []).map((t) => ({
    topic: t.title.length > 15 ? t.title.slice(0, 15) + '...' : t.title,
    fullTitle: t.title,
    completion: (t.status || 'NOT_STARTED') === 'COMPLETED' ? 100 : Math.floor(Math.random() * 40) + 10 // Placeholder for class avg
  }))

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      {/* Doodle Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">
            Welcome, {user?.name?.split(' ')[0] || 'Teacher'}
          </h1>
          <p className="page-subtitle">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Dashboard Monitoring
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/teacher/subjects" className="btn btn-outline">
            📚 Subjects
          </Link>
          <Link to="/teacher/materials" className="btn btn-primary">
            ➕ Add Materials
          </Link>
        </div>
      </div>

      {/* Stats Grid - Aligned with Student Theme */}
      <div className="grid-4 mb-8">
        {[
          { label: 'Total Students', value: totalStudents, icon: '👥', color: 'var(--color-primary)', desc: `In ${subjects.length} subjects` },
          { label: 'Class Progress', value: `${avgProgress}%`, icon: '📉', color: 'var(--color-success)', desc: 'Average completion' },
          { label: 'At Risk', value: '0', icon: '⚠️', color: 'var(--color-danger)', desc: 'Needs attention' },
          { label: 'Next Exam', value: nearestExam ? `${getDaysUntil(nearestExam.date || nearestExam.examDate)}d` : '-', icon: '📅', color: 'var(--color-warning)', desc: nearestExam?.name || 'Manual Alert' }
        ].map((stat, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ background: 'var(--bg-surface2)', border: '2px solid #000' }}>
              {stat.icon}
            </div>
            <div>
              <div className="stat-label uppercase">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              <div className="text-[10px] font-bold" style={{ color: stat.color }}>{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Main Analytics Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Chart Header & Filters */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="section-title">📊 Topic Completion Analysis</h2>
            <div className="flex gap-2">
              {subjects.slice(0, 3).map(sub => (
                <button
                  key={sub._id}
                  onClick={() => setSelectedSubject(sub)}
                  className={`btn btn-sm ${selectedSubject?._id === sub._id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '11px', padding: '4px 12px' }}
                >
                  {sub.code}
                </button>
              ))}
            </div>
          </div>

          <div className="card" style={{ padding: '2rem' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectChartData}>
                <XAxis dataKey="topic" tick={{ fill: '#000', fontSize: 10, fontFamily: 'var(--font-display)' }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="card" style={{ padding: '10px' }}>
                          <p className="text-xs font-bold mb-1">{payload[0].payload.fullTitle}</p>
                          <p className="text-xs font-bold" style={{ color: 'var(--color-success)' }}>{payload[0].value}% Class Avg</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="completion" radius={[4, 4, 0, 0]} barSize={32} stroke="#000" strokeWidth={2}>
                  {subjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.completion > 80 ? 'var(--color-success)' : 'var(--bg-surface2)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Detail Cards */}
          <h2 className="section-title mt-4">📚 Live Subject Monitoring</h2>
          <div className="grid-2">
            {subjects.map(sub => {
              const topics = (sub.modules || []).flatMap(m => m.topics || [])
              const done = topics.filter(t => t.status === 'COMPLETED').length
              const prog = topics.length ? Math.round((done / topics.length) * 100) : 0
              
              return (
                <div key={sub._id} className="card">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-md">{sub.name}</h3>
                      <p className="text-xs font-bold text-muted">{sub.code} · {sub.enrollments?.length || 0} Students</p>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', border: '2px solid #000', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-surface2)', fontSize: '12px' }}>
                      📋
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="progress-bar-container" style={{ flex: 1, height: '8px', border: '1px solid #000' }}>
                      <div className="progress-bar" style={{ width: `${prog}%`, background: sub.color || 'var(--color-primary)' }} />
                    </div>
                    <span className="text-xs font-bold">{prog}%</span>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '2px solid #000' }}>
                    <Link to="/teacher/subjects" className="text-xs font-bold text-primary">VIEW ANALYTICS →</Link>
                    <span className="text-[10px] font-bold text-muted uppercase">LATEST ACTIVITY: 2m ago</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar - Quick Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card">
            <h3 className="nav-section-label mb-4">⚡ Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link to="/teacher/subjects" className="doodle-action-btn">
                <span className="icon">➕</span>
                <div className="btn-text">
                  <div className="title">New Subject</div>
                  <div className="desc">Create from scratch</div>
                </div>
              </Link>
              <Link to="/teacher/materials" className="doodle-action-btn">
                <span className="icon">📁</span>
                <div className="btn-text">
                  <div className="title">Upload Assets</div>
                  <div className="desc">PDF, Docs, PPTX</div>
                </div>
              </Link>
              <button className="doodle-action-btn" onClick={() => toast.success('Report generation started...')}>
                <span className="icon">📊</span>
                <div className="btn-text">
                  <div className="title">Export Report</div>
                  <div className="desc">Weekly class summary</div>
                </div>
              </button>
            </div>
          </div>

          <div className="card">
            <h3 className="nav-section-label mb-4">📅 Deadlines</h3>
            <div className="flex flex-col gap-4">
              {subjects.slice(0, 4).map(sub => {
                const nextE = sub.examEvents?.[0]
                return (
                  <div key={sub._id} className="flex items-center gap-3">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: sub.color || '#000', border: '1px solid #000' }} />
                    <div className="flex-1">
                      <div className="text-xs font-bold">{sub.code} {nextE?.name || 'Exam'}</div>
                      <div className="text-[10px] text-muted">{nextE ? new Date(nextE.date || nextE.examDate).toLocaleDateString() : 'No date set'}</div>
                    </div>
                    <div className="text-[10px] font-black" style={{ color: 'var(--color-danger)' }}>
                      {nextE ? `${getDaysUntil(nextE.date || nextE.examDate)}D` : 'TBD'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <style>{`
            .doodle-action-btn {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: #fff;
              border: 2px solid #000;
              border-radius: var(--radius-md);
              text-align: left;
              transition: all 0.1s;
              width: 100%;
              cursor: pointer;
            }
            .doodle-action-btn:hover {
              transform: translate(-2px, -2px);
              box-shadow: 3px 3px 0px #000;
              background: var(--bg-surface2);
            }
            .doodle-action-btn:active {
              transform: translate(1px, 1px);
              box-shadow: 1px 1px 0px #000;
            }
            .doodle-action-btn .icon {
              font-size: 1.2rem;
            }
            .doodle-action-btn .title {
              font-size: 11px;
              font-weight: 800;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .doodle-action-btn .desc {
              font-size: 9px;
              color: var(--text-muted);
            }
            .grid-2 {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1.25rem;
            }
          `}</style>

        </div>
      </div>
    </div>
  )
}
