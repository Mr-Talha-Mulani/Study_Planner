import { useState } from 'react'
import { MOCK_SUBJECTS, MOCK_STUDY_PLAN } from '../utils/mockData'
import { formatMins, formatDate, getDaysUntil } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function PlannerPage() {
  const [plan, setPlan] = useState(MOCK_STUDY_PLAN)
  const [generating, setGenerating] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState(MOCK_SUBJECTS[0]._id)
  const [dailyHours, setDailyHours] = useState(3)
  const [activeDay, setActiveDay] = useState(0)

  const subjects = MOCK_SUBJECTS

  const generatePlan = async () => {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1800))

    // Mock generated plan
    const today = new Date()
    const newPlan = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      return {
        date: date.toISOString().split('T')[0],
        topics: [
          { topicId: `t${i * 2 + 3}`, topicTitle: `Generated Topic ${i * 2 + 1}`, subject: 'DSA', estimatedMins: Math.floor(45 + Math.random() * 60), status: 'NOT_STARTED' },
          { topicId: `t${i * 2 + 4}`, topicTitle: `Generated Topic ${i * 2 + 2}`, subject: 'DBMS', estimatedMins: Math.floor(30 + Math.random() * 50), status: 'NOT_STARTED' },
        ],
        totalMins: Math.floor(90 + Math.random() * 90)
      }
    })
    setPlan(newPlan)
    toast.success('📅 AI Study Plan generated! 7-day schedule ready.')
    setGenerating(false)
  }

  const selectedDay = plan[activeDay]

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">📅 Study Planner</h1>
          <p className="page-subtitle">AI-generated day-by-day study schedule based on your syllabus and exam dates</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '1.5rem' }}>
        {/* Config Panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="card">
            <div className="section-title mb-4">⚙️ Generate Plan</div>

            <div className="form-group mb-4">
              <label className="form-label">Subject</label>
              <select
                className="form-select"
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
              >
                {subjects.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group mb-4">
              <label className="form-label">Daily Study Hours: {dailyHours}h</label>
              <input
                type="range"
                min={1}
                max={8}
                step={0.5}
                value={dailyHours}
                onChange={e => setDailyHours(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-primary)' }}
              />
              <div className="flex justify-between text-xs text-muted mt-1">
                <span>1h</span><span>4h</span><span>8h</span>
              </div>
            </div>

            <div className="form-group mb-6">
              <label className="form-label">Target Exam</label>
              <select className="form-select">
                <option>Mid Term — in {getDaysUntil(MOCK_SUBJECTS[0].examEvents[0].date)} days</option>
                <option>End Term — in {getDaysUntil(MOCK_SUBJECTS[0].examEvents[1].date)} days</option>
              </select>
            </div>

            <button
              id="generate-plan-btn"
              className="btn btn-primary w-full"
              onClick={generatePlan}
              disabled={generating}
            >
              {generating ? (
                <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Generating...</>
              ) : '🤖 Generate AI Plan'}
            </button>

            <div className="alert alert-info mt-3" style={{ fontSize: '0.78rem' }}>
              <span>💡</span>
              <span>AI will distribute topics based on difficulty, importance, and your available time.</span>
            </div>
          </div>

          {/* Plan Summary */}
          {plan.length > 0 && (
            <div className="card">
              <div className="section-title mb-3">📊 Plan Summary</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Days covered</span>
                  <span className="font-semibold">{plan.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total topics</span>
                  <span className="font-semibold">{plan.reduce((a, d) => a + d.topics.length, 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Total time</span>
                  <span className="font-semibold">{formatMins(plan.reduce((a, d) => a + d.totalMins, 0))}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted">Avg. per day</span>
                  <span className="font-semibold">{formatMins(Math.round(plan.reduce((a, d) => a + d.totalMins, 0) / plan.length))}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Plan View */}
        <div>
          {plan.length > 0 ? (
            <>
              {/* Day Selector */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
                {plan.map((day, idx) => {
                  const d = new Date(day.date)
                  const isToday = day.date === new Date().toISOString().split('T')[0]
                  const isPast = new Date(day.date) < new Date() && !isToday
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveDay(idx)}
                      style={{
                        flexShrink: 0,
                        padding: '10px 16px',
                        borderRadius: 'var(--radius-lg)',
                        border: activeDay === idx ? 'none' : '1px solid var(--border-subtle)',
                        background: activeDay === idx ? 'var(--grad-primary)' : 'var(--bg-surface)',
                        color: activeDay === idx ? 'white' : isPast ? 'var(--text-muted)' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        minWidth: 72,
                        boxShadow: activeDay === idx ? 'var(--shadow-primary)' : 'none',
                        transition: 'all 0.15s'
                      }}
                    >
                      <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', opacity: 0.8 }}>
                        {d.toLocaleDateString('en-IN', { weekday: 'short' })}
                      </div>
                      <div style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {d.getDate()}
                      </div>
                      {isToday && <div style={{ fontSize: '0.6rem', fontWeight: 700, marginTop: '2px' }}>TODAY</div>}
                    </button>
                  )
                })}
              </div>

              {/* Day Detail */}
              {selectedDay && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                        {new Date(selectedDay.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                      </h2>
                      <div className="text-sm text-muted">{selectedDay.topics.length} topics · {formatMins(selectedDay.totalMins)} total</div>
                    </div>
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => toast.success('✅ Day marked complete! Great work!')}
                    >
                      Mark Day Done ✓
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {selectedDay.topics.map((task, i) => (
                      <div
                        key={task.topicId}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '14px',
                          padding: '14px 16px',
                          background: 'var(--bg-surface2)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px solid var(--border-subtle)',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                        onClick={() => toast.success(`${task.topicTitle} — marked!`)}
                      >
                        <div style={{
                          width: 36, height: 36,
                          borderRadius: '50%',
                          background: `hsl(${i * 60 + 250}, 80%, 30%)`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 800, fontSize: '0.9rem', color: 'white',
                          flexShrink: 0
                        }}>
                          {i + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div className="text-sm font-semibold">{task.topicTitle}</div>
                          <div className="text-xs text-muted mt-1">
                            {task.subject} · ⏱ {formatMins(task.estimatedMins)}
                          </div>
                        </div>
                        <span className={`badge ${task.status === 'COMPLETED' ? 'badge-success' : task.status === 'IN_PROGRESS' ? 'badge-warning' : 'badge-primary'}`}>
                          {task.status === 'COMPLETED' ? '✓ Done' : task.status === 'IN_PROGRESS' ? '▶ Active' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '4rem' }}>
              <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>No Plan Generated Yet</div>
              <div className="text-muted text-sm mb-4">Configure your preferences and let AI create the perfect study schedule</div>
              <button className="btn btn-primary" onClick={generatePlan}>
                🤖 Generate My Plan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
