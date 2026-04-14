import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../store'
import CountdownTimer from '../components/CountdownTimer'
import PanicMeter from '../components/PanicMeter'
import { calcSubjectProgress, getDaysUntil, formatMins, formatDate } from '../utils/helpers'

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [subjects, setSubjects] = useState([])
  const [gamification, setGamification] = useState({ xp: 0, streak: 0, badges: [], level: 1, rank: 1, totalStudents: 1 })
  const [studyPlan, setStudyPlan] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { subjectsAPI, gamificationAPI, planAPI } = await import('../api')
        const [subRes, gamRes, planRes] = await Promise.all([
          subjectsAPI.getAll(),
          gamificationAPI.getStats(),
          planAPI.getActive() // if we change API to just get all active plans
        ])
        
        setSubjects(subRes.data.subjects || [])
        setGamification({ 
          xp: gamRes.data.status?.xp || 0, 
          streak: gamRes.data.status?.streak || 0, 
          badges: gamRes.data.status?.badges || [],
          level: Math.floor((gamRes.data.status?.xp || 0) / 1000) + 1,
          rank: gamRes.data.myRank || 1,
          totalStudents: gamRes.data.totalStudents || 1
        })
        setStudyPlan(planRes.data.plans || [])
      } catch (err) {
        console.error("Dashboard fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Find next upcoming exam
  const allExams = subjects.flatMap(s =>
    (s.examEvents || []).map(e => ({ ...e, subjectName: s.name, subjectId: s._id, subjectColor: s.color }))
  ).sort((a, b) => new Date(a.date || a.examDate) - new Date(b.date || b.examDate))

  const nextExam = allExams[0]
  const nextExamDays = nextExam ? getDaysUntil(nextExam.date || nextExam.examDate) : 99
  const nextExamSubject = nextExam ? subjects.find(s => s._id === (nextExam.subjectId?._id || nextExam.subjectId)) : null
  const nextExamProgress = nextExamSubject ? calcSubjectProgress(nextExamSubject) : 0

  // Combine days from all active plans for "today"
  const today = new Date().toDateString()
  const todayPlan = studyPlan.flatMap(p => p.days || []).find(d => new Date(d.date).toDateString() === today) || null

  if (loading) {
    return <div className="page-container fade-in"><div className="text-center mt-20">Loading dashboard data...</div></div>
  }

  // Greeting
  const hour = new Date().getHours()
  const greeting = hour < 12 ? '☀️ Good Morning' : hour < 17 ? '🌤️ Good Afternoon' : '🌙 Good Evening'

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">{greeting}, {user?.name?.split(' ')[0]}!</h1>
          <p className="page-subtitle">
            {nextExamDays <= 7
              ? `⚡ ${nextExam?.name} in ${nextExamDays} days — time to focus!`
              : `📅 ${nextExam?.name} in ${nextExamDays} days — stay consistent!`}
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/last-night" className="btn btn-danger btn-sm">
            🌙 Last-Night Mode
          </Link>
          <Link to="/ai-tutor" className="btn btn-primary btn-sm">
            🤖 Ask AI Tutor
          </Link>
        </div>
      </div>

      {/* Top Stats Row */}
      <div className="grid-4 mb-6">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(250,84%,62%,0.15)' }}>🔥</div>
          <div>
            <div className="stat-value">{gamification.streak}</div>
            <div className="stat-label">Day Streak</div>
            <div className="stat-delta up">🔥 Keep it going!</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(142,69%,48%,0.12)' }}>✅</div>
          <div>
            <div className="stat-value" style={{ background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {subjects.reduce((acc, s) => acc + (s.modules || []).flatMap(m => m.topics || []).filter(t => (t.status || 'NOT_STARTED') === 'COMPLETED').length, 0)}
            </div>
            <div className="stat-label">Topics Done</div>
            <div className="stat-delta up">↑ 3 today</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(38,92%,55%,0.12)' }}>⭐</div>
          <div>
            <div className="stat-value" style={{ background: 'linear-gradient(135deg, hsl(38,92%,55%), hsl(48,96%,54%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              {gamification.xp.toLocaleString()}
            </div>
            <div className="stat-label">Total XP</div>
            <div className="stat-delta up">Level {gamification.level}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'hsl(168,79%,48%,0.12)' }}>🏆</div>
          <div>
            <div className="stat-value" style={{ background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              #{gamification.rank}
            </div>
            <div className="stat-label">Class Rank</div>
            <div className="stat-delta neutral">of {gamification.totalStudents} students</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>

        {/* Panic Meter + Countdown */}
        {nextExam && (
          <div className="card card-danger">
            <div className="section-title">⏰ Next Exam Alert</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
              <div>
                <PanicMeter
                  daysUntilExam={nextExamDays}
                  completionPercent={nextExamProgress}
                  examName={nextExam.name}
                />
              </div>
              <div>
                <div className="text-sm text-muted mb-2">📚 {nextExam.subjectName}</div>
                <CountdownTimer
                  targetDate={nextExam.date || nextExam.examDate}
                  label={nextExam.name}
                  size="sm"
                />
                <div className="text-xs mt-4 p-2" style={{ background: 'var(--bg-surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontWeight: 800 }}>ETA Tracker:</span> At your current pace, you will finish the syllabus on <strong>{formatDate(new Date((nextExam.date || nextExam.examDate)).getTime() - (2 * 86400000))}</strong>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Today's Study Plan */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <div className="section-title">📅 Today's Plan</div>
            <Link to="/planner" className="btn btn-ghost btn-sm">View Full →</Link>
          </div>
          {todayPlan ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '12px' }}>
                {(todayPlan.topicIds || todayPlan.topics || []).map(task => (
                  <div key={task.topicId || task._id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '10px 12px',
                    background: 'var(--bg-surface2)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)'
                  }}>
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: task.status === 'IN_PROGRESS' ? 'var(--color-warning)' : 'var(--border-default)',
                      flexShrink: 0
                    }} />
                    <div style={{ flex: 1 }}>
                      <div className="text-sm font-semibold">{task.topicTitle || task.title}</div>
                      <div className="text-xs text-muted">{task.subject || 'Topic'} · {formatMins(task.estimatedMins || 30)}</div>
                    </div>
                    {task.status === 'IN_PROGRESS' && (
                      <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>In Progress</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="text-xs text-muted">
                Total: {formatMins(todayPlan.totalMins || 0)} planned today
              </div>
            </div>
          ) : (
            <div className="text-center" style={{ padding: '24px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
              <div>No plan for today — generate one!</div>
              <Link to="/planner" className="btn btn-primary btn-sm" style={{ marginTop: '12px' }}>
                Generate Plan
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Subjects Overview */}
      <div className="section-title">📚 My Subjects</div>
      <div className="grid-3 mb-6">
        {subjects.map(subject => {
          const progress = calcSubjectProgress(subject)
          const nextSubjectExam = subject.examEvents?.[0]
          const daysLeft = nextSubjectExam ? getDaysUntil(nextSubjectExam.date || nextSubjectExam.examDate) : null

          return (
            <Link
              key={subject._id}
              to={`/subjects/${subject._id}`}
              className="card"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              <div className="flex items-center justify-between mb-3">
                <div
                  style={{
                    width: 12, height: 12, borderRadius: '50%',
                    background: subject.color,
                    boxShadow: `0 0 8px ${subject.color}88`
                  }}
                />
                <span className="badge badge-primary">{subject.code}</span>
              </div>

              <div className="font-semibold" style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                {subject.name}
              </div>
              <div className="text-xs text-muted mb-4">{subject.teacherName}</div>

              {/* Progress */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-secondary">Progress</span>
                <span className="text-xs font-bold" style={{ color: subject.color }}>{progress}%</span>
              </div>
              <div className="progress-bar-container">
                <div
                  className="progress-bar"
                  style={{ width: `${progress}%`, background: subject.color }}
                />
              </div>

              {daysLeft !== null && (
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-muted">{nextSubjectExam?.name}</span>
                  <span className="text-xs font-semibold" style={{
                    color: daysLeft <= 7 ? 'hsl(350,80%,72%)' : daysLeft <= 14 ? 'hsl(38,92%,65%)' : 'var(--color-accent-light)'
                  }}>
                    {daysLeft}d away
                  </span>
                </div>
              )}
            </Link>
          )
        })}

        {/* Add Subject CTA */}
        <Link
          to="/subjects"
          className="card"
          style={{
            textDecoration: 'none',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            border: '2px dashed var(--border-default)',
            background: 'transparent',
            cursor: 'pointer',
            minHeight: '150px'
          }}
        >
          <div style={{ fontSize: '2rem', opacity: 0.5 }}>➕</div>
          <div className="text-sm text-muted">Join a Subject</div>
        </Link>
      </div>

      {/* XP Progress Bar */}
      <div className="card card-primary mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="section-title" style={{ marginBottom: '2px' }}>⭐ Level {gamification.level} → {gamification.level + 1}</div>
            <div className="text-xs text-muted">{gamification.xp} / {gamification.level * 1000 + 500} XP</div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {gamification.badges.filter(b => b.earned).slice(0, 4).map(b => (
              <span key={b.id} title={b.name} style={{ fontSize: '1.3rem' }}>{b.icon}</span>
            ))}
            <Link to="/gamification" className="text-xs" style={{ color: 'var(--color-primary-light)', alignSelf: 'center', marginLeft: '4px' }}>
              +{gamification.badges.filter(b => b.earned).length - 4} more →
            </Link>
          </div>
        </div>
        <div className="xp-bar-container" style={{ padding: 0, background: 'transparent' }}>
          <div className="xp-bar" style={{ height: 14 }}>
            <div
              className="xp-fill"
              style={{ width: `${(gamification.xp % 1000) / 10}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Activity / Exam Timeline */}
      <div className="section-title">📆 Upcoming Exams</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {allExams.slice(0, 5).map((exam, idx) => {
          const days = getDaysUntil(exam.date || exam.examDate)
          const isUrgent = days <= 7

          return (
            <div key={idx} className="card" style={{ padding: '14px 16px' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div style={{
                    width: 10, height: 10, borderRadius: '50%',
                    background: exam.subjectColor,
                    boxShadow: `0 0 6px ${exam.subjectColor}88`,
                    flexShrink: 0
                  }} />
                  <div>
                    <div className="text-sm font-semibold">{exam.subjectName}</div>
                    <div className="text-xs text-muted">{exam.name} · {formatDate(exam.date || exam.examDate)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {isUrgent && <span className="badge badge-danger">⚡ Urgent</span>}
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: days <= 3 ? 'hsl(350,80%,72%)' : days <= 7 ? 'hsl(38,92%,65%)' : 'var(--text-secondary)'
                  }}>
                    {days}d
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
