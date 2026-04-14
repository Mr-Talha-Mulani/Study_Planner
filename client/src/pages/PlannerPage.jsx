import { useEffect, useState } from 'react'
import { formatMins, getDaysUntil } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function PlannerPage() {
  const [plan, setPlan] = useState([])
  const [generating, setGenerating] = useState(false)
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [targetExamId, setTargetExamId] = useState('')
  const [dailyHours, setDailyHours] = useState(3)
  const [activeDay, setActiveDay] = useState(0)

  useEffect(() => {
    const load = async () => {
      try {
        const { subjectsAPI, planAPI } = await import('../api')
        const [subRes, planRes] = await Promise.all([subjectsAPI.getAll(), planAPI.getActive()])
        const subList = subRes.data.subjects || []
        setSubjects(subList)
        if (subList.length > 0) {
          setSelectedSubject(subList[0]._id)
          setTargetExamId(subList[0].examEvents?.[0]?._id || '')
        }

        const active = (planRes.data.plans || [])[0]
        if (active) {
          const { topicsAPI } = await import('../api')
          const subId = active.subjectId._id || active.subjectId
          
          let progMap = {}
          try {
            const progRes = await topicsAPI.getProgress(subId)
            progRes.data.progress.forEach(p => {
              if (p.status === 'COMPLETED') progMap[p.topicId.toString()] = 'DONE'
            })
          } catch (e) {
            console.error(e)
          }
          setTaskStatuses(progMap)

          const mapped = (active.days || []).map((day) => ({
            date: day.date,
            topics: (day.topicIds || []).map((topic) => ({
              topicId: topic._id,
              topicTitle: topic.title,
              estimatedMins: topic.estimatedMins || 30,
              status: 'NOT_STARTED'
            })),
            totalMins: day.totalMins || 0
          }))
          setPlan(mapped)
        }
      } catch {
        toast.error('Failed to load planner data')
      }
    }

    load()
  }, [])

  const generatePlan = async () => {
    if (!selectedSubject) {
      toast.error('Select a subject first')
      return
    }

    setGenerating(true)
    try {
      const { planAPI } = await import('../api')
      const res = await planAPI.generate(selectedSubject, {
        subjectId: selectedSubject,
        dailyHours,
        targetExamId: targetExamId || undefined
      })

      const serverPlan = res.data.plan
      const newPlan = (serverPlan.days || []).map((day) => ({
        date: day.date,
        topics: (day.topicIds || []).map((topic) => ({
          topicId: topic._id || topic,
          topicTitle: topic.title || 'Planned topic',
          estimatedMins: topic.estimatedMins || Math.round((day.totalMins || 0) / Math.max((day.topicIds || []).length, 1)),
          status: 'NOT_STARTED'
        })),
        totalMins: day.totalMins || 0
      }))
      setPlan(newPlan)
      setActiveDay(0)
      toast.success('Study plan generated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plan')
    } finally {
      setGenerating(false)
    }
  }

  const [taskStatuses, setTaskStatuses] = useState({}) // { topicId: 'DONE' | 'PENDING' }

  const selectedDay = plan[activeDay]

  const toggleTask = async (task) => {
    const id = task.topicId || task._id
    const currentDone = taskStatuses[id] === 'DONE'
    const newStatus = currentDone ? 'NOT_STARTED' : 'COMPLETED'
    
    setTaskStatuses(prev => ({ ...prev, [id]: currentDone ? 'PENDING' : 'DONE' }))
    if (!currentDone) toast.success(`✅ ${task.topicTitle || task.title} — done!`, { duration: 1800 })
    
    try {
      const { topicsAPI } = await import('../api')
      const { useAppStore } = await import('../store')
      
      // Also pass some dummy time spent since we don't track it on this UI view currently
      await topicsAPI.updateProgress(id, newStatus, { timeSpentMins: 30 })
      useAppStore.getState().updateTopicStatus(id, newStatus)
    } catch {
      setTaskStatuses(prev => ({ ...prev, [id]: currentDone ? 'DONE' : 'PENDING' }))
      toast.error('Failed to sync progress')
    }
  }

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
              <select className="form-select" value={targetExamId} onChange={e => setTargetExamId(e.target.value)}>
                <option value="">No specific exam</option>
                {(subjects.find(s => s._id === selectedSubject)?.examEvents || []).map((exam) => (
                  <option key={exam._id} value={exam._id}>
                    {exam.name} - in {getDaysUntil(exam.date || exam.examDate)} days
                  </option>
                ))}
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
              {selectedDay && (() => {
                const allTasks = (selectedDay.topics || selectedDay.topicIds || [])
                const pending = allTasks.filter(t => taskStatuses[t.topicId || t._id] !== 'DONE')
                const done = allTasks.filter(t => taskStatuses[t.topicId || t._id] === 'DONE')

                return (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>
                          {new Date(selectedDay.date).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
                        </h2>
                        <div className="text-sm text-muted">
                          {allTasks.length} topics · {formatMins(selectedDay.totalMins || 0)} total · {done.length}/{allTasks.length} done
                        </div>
                      </div>
                      <button
                        className="btn btn-accent btn-sm"
                        onClick={() => {
                          const allIds = {}
                          allTasks.forEach(t => { allIds[t.topicId || t._id] = 'DONE' })
                          setTaskStatuses(prev => ({ ...prev, ...allIds }))
                          toast.success('🎯 Day complete! Great work!')
                        }}
                      >
                        Mark Day Done ✓
                      </button>
                    </div>

                    {/* Pending Tasks */}
                    {pending.length > 0 && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: done.length > 0 ? '1.5rem' : 0 }}>
                        {pending.map((task, i) => {
                          const id = task.topicId || task._id
                          return (
                            <div
                              key={id}
                              onClick={() => toggleTask(task)}
                              style={{
                                display: 'flex', alignItems: 'center', gap: '14px',
                                padding: '13px 16px',
                                background: 'var(--bg-surface2)',
                                borderRadius: 'var(--radius-md)',
                                border: '1px solid var(--border-subtle)',
                                cursor: 'pointer',
                                transition: 'all 0.15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--color-primary)'}
                              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-subtle)'}
                            >
                              {/* Custom Checkbox */}
                              <div style={{
                                width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                                border: '2px solid var(--border-default)',
                                background: 'transparent',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                transition: 'all 0.15s'
                              }} />
                              <div style={{
                                width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                                background: `hsl(${i * 47 + 210}, 70%, 28%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontWeight: 800, fontSize: '0.85rem', color: 'white'
                              }}>
                                {i + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{task.topicTitle || task.title || 'Planned topic'}</div>
                                <div className="text-xs text-muted mt-1">⏱ {formatMins(task.estimatedMins || 30)}</div>
                              </div>
                              <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>Pending</span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Completed Tasks */}
                    {done.length > 0 && (
                      <div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--color-success)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span>✅</span> Completed ({done.length})
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {done.map(task => {
                            const id = task.topicId || task._id
                            return (
                              <div
                                key={id}
                                onClick={() => toggleTask(task)}
                                style={{
                                  display: 'flex', alignItems: 'center', gap: '14px',
                                  padding: '11px 16px',
                                  background: 'var(--color-success-bg, hsl(158,50%,12%))',
                                  borderRadius: 'var(--radius-md)',
                                  border: '1px solid hsl(158,60%,22%)',
                                  cursor: 'pointer',
                                  opacity: 0.75,
                                  transition: 'all 0.15s'
                                }}
                              >
                                {/* Checked box */}
                                <div style={{
                                  width: 22, height: 22, borderRadius: '6px', flexShrink: 0,
                                  background: 'var(--color-success, #4ECDC4)',
                                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  transition: 'all 0.15s'
                                }}>
                                  <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 800 }}>✓</span>
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{
                                    fontSize: '0.875rem', fontWeight: 600,
                                    textDecoration: 'line-through',
                                    color: 'var(--text-muted)'
                                  }}>{task.topicTitle || task.title || 'Planned topic'}</div>
                                  <div className="text-xs" style={{ color: 'var(--color-success)', marginTop: '2px' }}>⏱ {formatMins(task.estimatedMins || 30)}</div>
                                </div>
                                <span className="badge" style={{ fontSize: '0.7rem', background: 'hsl(158,60%,20%)', color: 'var(--color-success, #4ECDC4)', border: '1px solid hsl(158,60%,30%)' }}>Done ✓</span>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )}

                    {pending.length === 0 && done.length === 0 && (
                      <div className="text-center" style={{ padding: '2rem', color: 'var(--text-muted)' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎉</div>
                        <div>No tasks for this day</div>
                      </div>
                    )}
                  </div>
                )
              })()}
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
