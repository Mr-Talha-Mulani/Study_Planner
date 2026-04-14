import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { MOCK_SUBJECTS } from '../utils/mockData'
import { calcSubjectProgress, getDaysUntil, difficultyLabel, difficultyClass, formatMins, getTopicsForExam } from '../utils/helpers'
import TopicList from '../components/TopicList'
import CountdownTimer from '../components/CountdownTimer'
import PanicMeter from '../components/PanicMeter'
import toast from 'react-hot-toast'

export default function SubjectsPage() {
  const { id } = useParams()
  const [activeTab, setActiveTab] = useState('MID')
  const [joinCode, setJoinCode] = useState('')
  const [showJoin, setShowJoin] = useState(false)

  const subjects = MOCK_SUBJECTS

  if (id) {
    // Subject detail view
    const subject = subjects.find(s => s._id === id)
    if (!subject) return <div className="page-container">Subject not found</div>

    const progress = calcSubjectProgress(subject)
    const nextExam = subject.examEvents?.[0]
    const daysLeft = nextExam ? getDaysUntil(nextExam.date) : null

    const midTopics = subject.modules.filter(m => m.examScope === 'MID' || m.examScope === 'BOTH').flatMap(m => m.topics)
    const endTopics = subject.modules.filter(m => m.examScope === 'END' || m.examScope === 'BOTH').flatMap(m => m.topics)

    const currentTopics = activeTab === 'MID' ? midTopics : activeTab === 'END' ? endTopics : subject.modules.flatMap(m => m.topics)

    return (
      <div className="page-container fade-in">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-4">
          <Link to="/subjects" className="text-sm text-muted">My Subjects</Link>
          <span className="text-muted">/</span>
          <span className="text-sm text-secondary">{subject.name}</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '1.5rem' }}>
          {/* Left — Topics */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="page-title" style={{ fontSize: '1.4rem' }}>{subject.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <span className="badge badge-primary">{subject.code}</span>
                  <span className="text-xs text-muted">{subject.teacherName}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link to="/ai-tutor" className="btn btn-primary btn-sm">🤖 Ask AI</Link>
                <Link to="/planner" className="btn btn-outline btn-sm">📅 Plan</Link>
              </div>
            </div>

            {/* Progress */}
            <div className="card mb-4" style={{ padding: '16px' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold">Overall Completion</span>
                <span className="font-bold" style={{ color: subject.color }}>{progress}%</span>
              </div>
              <div className="progress-bar-container" style={{ height: 10 }}>
                <div className="progress-bar" style={{ width: `${progress}%`, background: subject.color }} />
              </div>
              <div className="flex gap-4 mt-3">
                <span className="text-xs text-muted">✅ {currentTopics.filter(t => t.status === 'COMPLETED').length} done</span>
                <span className="text-xs text-muted">🔄 {currentTopics.filter(t => t.status === 'IN_PROGRESS').length} in progress</span>
                <span className="text-xs text-muted">⏳ {currentTopics.filter(t => t.status === 'NOT_STARTED').length} remaining</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {['ALL', 'MID', 'END'].map(tab => (
                <button
                  key={tab}
                  className={`btn btn-sm ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab === 'ALL' ? '📚 All Topics' : tab === 'MID' ? '📝 Mid-Term' : '📋 End-Term'}
                  <span style={{
                    marginLeft: '6px',
                    background: 'rgba(255,255,255,0.2)',
                    borderRadius: '999px',
                    padding: '1px 7px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: activeTab === tab ? 'white' : 'var(--text-muted)'
                  }}>
                    {tab === 'ALL' ? subject.modules.flatMap(m => m.topics).length : tab === 'MID' ? midTopics.length : endTopics.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Topic List by Module */}
            {subject.modules
              .filter(m => activeTab === 'ALL' || (activeTab === 'MID' && m.examScope === 'MID') || (activeTab === 'END' && m.examScope === 'END'))
              .map(module => (
                <div key={module._id} className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Module {module.order}: {module.title}</div>
                    <span className={`badge ${module.examScope === 'MID' ? 'badge-primary' : module.examScope === 'END' ? 'badge-accent' : 'badge-warning'}`}>
                      {module.examScope}
                    </span>
                  </div>
                  <TopicList topics={module.topics} />
                </div>
              ))}
          </div>

          {/* Right — Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Exam Countdown */}
            {nextExam && (
              <div className="card card-danger">
                <div className="section-title mb-4">⏰ {nextExam.name}</div>
                <PanicMeter
                  daysUntilExam={daysLeft}
                  completionPercent={progress}
                  examName={nextExam.name}
                />
                <div className="divider" />
                <CountdownTimer targetDate={nextExam.date} label={nextExam.name} size="sm" />
              </div>
            )}

            {/* All Exams */}
            <div className="card">
              <div className="section-title mb-3">📅 Exam Schedule</div>
              {subject.examEvents.map((exam, i) => {
                const d = getDaysUntil(exam.date)
                return (
                  <div key={i} style={{ padding: '10px 0', borderBottom: i < subject.examEvents.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-semibold">{exam.name}</div>
                      <span className={`text-xs font-bold ${d <= 7 ? 'text-danger' : d <= 14 ? 'text-warning' : 'text-accent'}`}>
                        {d}d
                      </span>
                    </div>
                    <div className="text-xs text-muted">{new Date(exam.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                  </div>
                )
              })}
            </div>

            {/* Quick Actions */}
            <div className="card">
              <div className="section-title mb-3">⚡ Quick Actions</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <Link to="/last-night" className="btn btn-danger w-full">🌙 Last-Night Mode</Link>
                <Link to="/ai-tutor" className="btn btn-primary w-full">🤖 AI Tutor Chat</Link>
                <Link to="/pyq-analysis" className="btn btn-outline w-full">📊 PYQ Analysis</Link>
                <Link to="/planner" className="btn btn-outline w-full">📅 Generate Study Plan</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Subjects listing page
  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">My Subjects</h1>
          <p className="page-subtitle">Track progress across all your enrolled subjects</p>
        </div>
        <button
          id="join-subject-btn"
          className="btn btn-primary"
          onClick={() => setShowJoin(!showJoin)}
        >
          ➕ Join Subject
        </button>
      </div>

      {/* Join Subject */}
      {showJoin && (
        <div className="card card-primary mb-6">
          <div className="section-title mb-3">🔑 Join a Subject</div>
          <div className="flex gap-3 items-center">
            <input
              id="join-code-input"
              type="text"
              className="form-input"
              placeholder="Enter 6-character subject code (e.g. DSA301)"
              value={joinCode}
              onChange={e => setJoinCode(e.target.value.toUpperCase())}
              style={{ maxWidth: 300 }}
            />
            <button
              className="btn btn-primary"
              onClick={() => {
                if (joinCode.length === 6) {
                  toast.success(`Joined subject ${joinCode}! 🎉`)
                  setShowJoin(false)
                  setJoinCode('')
                } else {
                  toast.error('Enter a valid 6-character code')
                }
              }}
            >
              Join
            </button>
            <button className="btn btn-ghost" onClick={() => setShowJoin(false)}>Cancel</button>
          </div>
          <div className="text-xs text-muted mt-2">Ask your teacher for the subject code</div>
        </div>
      )}

      {/* Subject Cards */}
      <div className="grid-auto">
        {subjects.map(subject => {
          const progress = calcSubjectProgress(subject)
          const nextExam = subject.examEvents?.[0]
          const daysLeft = nextExam ? getDaysUntil(nextExam.date) : null
          const topics = subject.modules.flatMap(m => m.topics)
          const completed = topics.filter(t => t.status === 'COMPLETED').length

          return (
            <Link
              key={subject._id}
              to={`/subjects/${subject._id}`}
              className="card"
              style={{ textDecoration: 'none', display: 'block' }}
            >
              {/* Color stripe */}
              <div style={{ height: 4, background: subject.color, borderRadius: '2px', marginBottom: '16px', marginLeft: '-24px', marginRight: '-24px', marginTop: '-24px', borderTopLeftRadius: 'var(--radius-lg)', borderTopRightRadius: 'var(--radius-lg)' }} />

              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-bold text-lg">{subject.name}</div>
                  <div className="text-xs text-muted">{subject.teacherName}</div>
                </div>
                <span className="badge badge-primary">{subject.code}</span>
              </div>

              <div className="flex gap-4 mb-4">
                <div>
                  <div className="text-xs text-muted">Topics</div>
                  <div className="font-bold">{completed}/{topics.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Enrolled</div>
                  <div className="font-bold">{subject.enrolled}</div>
                </div>
                <div>
                  <div className="text-xs text-muted">Semester</div>
                  <div className="font-bold">{subject.semester}</div>
                </div>
              </div>

              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-secondary">Completion</span>
                <span className="text-xs font-bold" style={{ color: subject.color }}>{progress}%</span>
              </div>
              <div className="progress-bar-container">
                <div className="progress-bar" style={{ width: `${progress}%`, background: subject.color }} />
              </div>

              {daysLeft !== null && (
                <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid var(--border-subtle)' }}>
                  <span className="text-xs text-muted">Next: {nextExam.name}</span>
                  <span className="text-xs font-bold" style={{
                    color: daysLeft <= 7 ? 'hsl(350,80%,72%)' : daysLeft <= 14 ? 'hsl(38,92%,65%)' : 'var(--color-accent-light)'
                  }}>
                    {daysLeft <= 0 ? '🔴 Today!' : `${daysLeft}d left`}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
