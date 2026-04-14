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
    <div className="page-container fade-in" style={{ backgroundColor: '#0F2C2C', minHeight: '100vh', padding: '2rem' }}>
      {/* Premium Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ color: '#E0F2F1' }}>
            Welcome, <span style={{ color: '#4ECDC4' }}>{user?.name?.split(' ')[0] || 'Teacher'}</span>
          </h1>
          <p className="text-sm mt-1" style={{ color: '#80CBC4', opacity: 0.8 }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })} · Dashboard Monitoring
          </p>
        </div>
        <div className="flex gap-4">
          <Link to="/teacher/subjects" className="btn" style={{ background: '#2C3E3E', color: '#E0F2F1', border: '1px solid #3d5151' }}>
            📚 Subjects
          </Link>
          <Link to="/teacher/materials" className="btn btn-primary" style={{ background: '#008080', border: 'none', boxShadow: '0 4px 14px rgba(0, 128, 128, 0.4)' }}>
            ➕ Add Materials
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid-4 mb-8">
        {[
          { label: 'Total Students', value: totalStudents, icon: '👥', color: '#4ECDC4', desc: `In ${subjects.length} subjects` },
          { label: 'Class Progress', value: `${avgProgress}%`, icon: '📉', color: '#008080', desc: 'Average completion' },
          { label: 'At Risk', value: '0', icon: '⚠️', color: '#FF6B6B', desc: 'Needs attention' },
          { label: 'Next Exam', value: nearestExam ? `${getDaysUntil(nearestExam.date || nearestExam.examDate)}d` : '-', icon: '📅', color: '#F7B731', desc: nearestExam?.name || 'Manual Alert' }
        ].map((stat, i) => (
          <div key={i} className="card-subtle" style={{ 
            background: '#2C3E3E', 
            border: '1px solid #3d5151', 
            borderRadius: '16px', 
            padding: '1.5rem',
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem',
            transition: 'transform 0.2s ease',
            cursor: 'default'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: 'rgba(255,255,255,0.03)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: `1px solid ${stat.color}33`
            }}>
              {stat.icon}
            </div>
            <div>
              <div className="text-xs font-bold uppercase tracking-wider" style={{ color: '#80CBC4', opacity: 0.7 }}>{stat.label}</div>
              <div className="text-2xl font-black" style={{ color: '#E0F2F1' }}>{stat.value}</div>
              <div className="text-[10px] mt-1 font-medium" style={{ color: stat.color }}>{stat.desc}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem' }}>
        {/* Main Analytics Area */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Chart Header & Filters */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold" style={{ color: '#E0F2F1' }}>📊 Topic Completion Analysis</h2>
            <div className="flex gap-2">
              {subjects.slice(0, 3).map(sub => (
                <button
                  key={sub._id}
                  onClick={() => setSelectedSubject(sub)}
                  style={{
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 700,
                    transition: 'all 0.2s',
                    background: selectedSubject?._id === sub._id ? '#008080' : 'transparent',
                    color: selectedSubject?._id === sub._id ? '#fff' : '#80CBC4',
                    border: `1px solid ${selectedSubject?._id === sub._id ? '#008080' : '#3d5151'}`
                  }}
                >
                  {sub.code}
                </button>
              ))}
            </div>
          </div>

          <div className="card-subtle" style={{ background: '#2C3E3E', borderRadius: '20px', padding: '2rem', border: '1px solid #3d5151' }}>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={subjectChartData}>
                <XAxis dataKey="topic" tick={{ fill: '#80CBC4', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div style={{ background: '#1A2A2A', border: '1px solid #008080', padding: '10px', borderRadius: '8px' }}>
                          <p className="text-xs font-bold text-white mb-1">{payload[0].payload.fullTitle}</p>
                          <p className="text-xs" style={{ color: '#4ECDC4' }}>{payload[0].value}% Class Avg</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Bar dataKey="completion" radius={[6, 6, 0, 0]} barSize={32}>
                  {subjectChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.completion > 80 ? '#4ECDC4' : '#008080'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Subject Detail Cards */}
          <h2 className="text-lg font-bold mt-4" style={{ color: '#E0F2F1' }}>📚 Live Subject Monitoring</h2>
          <div className="grid-2">
            {subjects.map(sub => {
              const topics = (sub.modules || []).flatMap(m => m.topics || [])
              const done = topics.filter(t => t.status === 'COMPLETED').length
              const prog = topics.length ? Math.round((done / topics.length) * 100) : 0
              
              return (
                <div key={sub._id} className="card-subtle" style={{ 
                  background: '#2C3E3E', 
                  borderRadius: '16px', 
                  padding: '1.25rem', 
                  border: '1px solid #3d5151',
                  transition: 'border-color 0.2s'
                }} onMouseEnter={e => e.currentTarget.style.borderColor = '#008080'} onMouseLeave={e => e.currentTarget.style.borderColor = '#3d5151'}>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-md" style={{ color: '#E0F2F1' }}>{sub.name}</h3>
                      <p className="text-xs font-bold" style={{ color: '#80CBC4', opacity: 0.6 }}>{sub.code} · {sub.enrollments?.length || 0} Students</p>
                    </div>
                    <div style={{ width: 36, height: 36, borderRadius: '10px', background: `${sub.color || '#008080'}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub.color || '#008080', fontSize: '12px' }}>
                      📋
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex-1" style={{ height: '6px', background: 'rgba(0,0,0,0.2)', borderRadius: '10px' }}>
                      <div style={{ width: `${prog}%`, height: '100%', background: sub.color || '#4ECDC4', borderRadius: '10px', boxShadow: `0 0 10px ${sub.color || '#4ECDC4'}88` }} />
                    </div>
                    <span className="text-xs font-bold" style={{ color: '#E0F2F1' }}>{prog}%</span>
                  </div>
                  
                  <div className="flex justify-between mt-4 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <Link to="/teacher/subjects" className="text-xs font-bold" style={{ color: '#4ECDC4' }}>VIEW ANALYTICS →</Link>
                    <span className="text-[10px] font-bold" style={{ color: '#80CBC4' }}>LATEST ACTIVITY: 2m ago</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Sidebar - Quick Access */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="card-subtle" style={{ background: '#2C3E3E', borderRadius: '20px', padding: '1.5rem', border: '1px solid #3d5151' }}>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#80CBC4', opacity: 0.8 }}>⚡ Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <Link to="/teacher/subjects" className="btn-action">
                <span className="icon">➕</span>
                <div className="btn-text">
                  <div className="title">New Subject</div>
                  <div className="desc">Create from scratch</div>
                </div>
              </Link>
              <Link to="/teacher/materials" className="btn-action">
                <span className="icon">📁</span>
                <div className="btn-text">
                  <div className="title">Upload Assets</div>
                  <div className="desc">PDF, Docs, PPTX</div>
                </div>
              </Link>
              <button className="btn-action" onClick={() => toast.success('Report generation started...')}>
                <span className="icon">📊</span>
                <div className="btn-text">
                  <div className="title">Export Report</div>
                  <div className="desc">Weekly class summary</div>
                </div>
              </button>
            </div>
          </div>

          <div className="card-subtle" style={{ background: '#2C3E3E', borderRadius: '20px', padding: '1.5rem', border: '1px solid #3d5151' }}>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#80CBC4', opacity: 0.8 }}>📅 Upcoming Deadlines</h3>
            <div className="flex flex-col gap-4">
              {subjects.slice(0, 4).map(sub => {
                const nextE = sub.examEvents?.[0]
                return (
                  <div key={sub._id} className="flex items-center gap-3">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: sub.color || '#4ECDC4' }} />
                    <div className="flex-1">
                      <div className="text-xs font-bold" style={{ color: '#E0F2F1' }}>{sub.code} {nextE?.name || 'Exam'}</div>
                      <div className="text-[10px]" style={{ color: '#80CBC4' }}>{nextE ? new Date(nextE.date || nextE.examDate).toLocaleDateString() : 'No date set'}</div>
                    </div>
                    <div className="text-[10px] font-black" style={{ color: '#FF6B6B' }}>
                      {nextE ? `${getDaysUntil(nextE.date || nextE.examDate)}D` : 'TBD'}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <style>{`
            .btn-action {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: rgba(255,255,255,0.02);
              border: 1px solid rgba(255,255,255,0.05);
              border-radius: 12px;
              text-align: left;
              transition: all 0.2s;
              width: 100%;
            }
            .btn-action:hover {
              background: rgba(0, 128, 128, 0.1);
              border-color: #008080;
              transform: translateX(4px);
            }
            .btn-action .icon {
              font-size: 1.2rem;
              opacity: 0.8;
            }
            .btn-action .title {
              font-size: 11px;
              font-weight: 800;
              color: #E0F2F1;
              text-transform: uppercase;
              letter-spacing: 0.5px;
            }
            .btn-action .desc {
              font-size: 9px;
              color: #80CBC4;
              opacity: 0.7;
            }
            .grid-2 {
              display: grid;
              grid-template-columns: repeat(2, 1fr);
              gap: 1.25rem;
            }
            .card-subtle {
              box-shadow: 0 4px 20px rgba(0,0,0,0.2);
            }
          `}</style>

        </div>
      </div>
    </div>
  )
}
