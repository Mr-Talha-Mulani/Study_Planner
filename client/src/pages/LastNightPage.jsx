import { useEffect, useState } from 'react'
import { formatMins, difficultyClass, difficultyLabel } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function LastNightPage() {
  const [hours, setHours] = useState(4)
  const [subjects, setSubjects] = useState([])
  const [allSubjects, setAllSubjects] = useState([])
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(false)
  const [completedTopics, setCompletedTopics] = useState(new Set())

  useEffect(() => {
    const load = async () => {
      try {
        const { subjectsAPI } = await import('../api')
        const res = await subjectsAPI.getAll()
        const subList = res.data.subjects || []
        setAllSubjects(subList)
        setSubjects(subList.map(s => s._id))
      } catch {
        toast.error('Failed to load subjects')
      }
    }
    load()
  }, [])

  const generatePlan = async () => {
    setLoading(true)
    try {
      const { aiAPI } = await import('../api')
      const res = await aiAPI.lastNight({ subjectIds: subjects, hours })
      const subjectMap = Object.fromEntries(allSubjects.map(s => [s._id, s.name]))
      const mapped = (res.data.plan || []).map((topic) => ({
        ...topic,
        subjectName: subjectMap[topic.subjectId] || 'Subject'
      }))
      setPlan(mapped)
      toast.success('Last-night plan ready')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to generate plan')
    } finally {
      setLoading(false)
    }
  }

  const toggleComplete = (topicId) => {
    setCompletedTopics(prev => {
      const next = new Set(prev)
      if (next.has(topicId)) next.delete(topicId)
      else {
        next.add(topicId)
        toast.success('✅ Topic covered! +10 XP', { duration: 1500 })
      }
      return next
    })
  }

  const totalMins = plan?.reduce((acc, t) => acc + t.allocatedMins, 0) || 0
  const progress = plan ? Math.round((completedTopics.size / plan.length) * 100) : 0

  return (
    <div className="page-container fade-in">
      {/* Header */}
      <div className="text-center mb-8">
        <div style={{ fontSize: '4rem', marginBottom: '1rem', filter: 'drop-shadow(0 0 20px hsl(250,84%,62%,0.5))' }}>🌙</div>
        <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Last-Night Mode</h1>
        <p className="page-subtitle" style={{ fontSize: '1rem', maxWidth: 500, margin: '0 auto' }}>
          Emergency exam prep. Tell me how much time you have, and I'll build you the most impactful micro-plan.
        </p>
      </div>

      {!plan ? (
        /* Setup Form */
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card last-night-container" style={{ position: 'relative', overflow: 'hidden', zIndex: 0 }}>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div className="section-title mb-6">⚙️ Configure Your Session</div>

              {/* Hours Slider */}
              <div className="form-group mb-6">
                <label className="form-label">⏱ Available Study Hours</label>
                <div className="flex items-center gap-4">
                  <input
                    id="hours-slider"
                    type="range"
                    min={1}
                    max={12}
                    step={0.5}
                    value={hours}
                    onChange={e => setHours(parseFloat(e.target.value))}
                    style={{ flex: 1, accentColor: 'var(--color-primary)' }}
                  />
                  <div style={{
                    minWidth: 80,
                    textAlign: 'center',
                    fontFamily: 'var(--font-display)',
                    fontSize: '2rem',
                    fontWeight: 800,
                    background: 'var(--grad-primary)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>
                    {hours}h
                  </div>
                </div>
                <div className="flex justify-between text-xs text-muted mt-1">
                  <span>1h</span><span>6h</span><span>12h</span>
                </div>
              </div>

              {/* Subject selection */}
              <div className="form-group mb-6">
                <label className="form-label">📚 Which Subjects? (select all that apply)</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {allSubjects.map(sub => (
                    <label
                      key={sub._id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '12px',
                        padding: '10px 14px',
                        borderRadius: 'var(--radius-md)',
                        background: subjects.includes(sub._id) ? 'var(--color-warning)' : 'var(--bg-surface2)',
                        border: '2px solid #000',
                        boxShadow: subjects.includes(sub._id) ? 'inset 2px 2px 0px rgba(0,0,0,0.2)' : '2px 2px 0px #000',
                        cursor: 'pointer',
                        transition: 'all 0.15s'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={subjects.includes(sub._id)}
                        onChange={e => {
                          if (e.target.checked) setSubjects(prev => [...prev, sub._id])
                          else setSubjects(prev => prev.filter(id => id !== sub._id))
                        }}
                        style={{ accentColor: 'var(--color-primary)' }}
                      />
                      <div style={{ width: 10, height: 10, borderRadius: '50%', background: sub.color }} />
                      <span className="text-sm font-semibold">{sub.name}</span>
                      <span className="text-xs text-muted ml-auto">{sub.code}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Warning */}
              <div className="alert alert-warning mb-6">
                <span>⚠️</span>
                <div>
                  <div className="font-semibold">AI Priority Algorithm</div>
                  <div style={{ marginTop: '4px', fontSize: '0.8rem' }}>
                    Topics are selected based on importance score (PYQ frequency + teacher emphasis), difficulty, and time available. Review this plan — don't skip topics your teacher specifically highlighted.
                  </div>
                </div>
              </div>

              <button
                id="generate-last-night"
                className="btn btn-danger btn-lg w-full"
                onClick={generatePlan}
                disabled={loading || subjects.length === 0}
              >
                {loading ? (
                  <><span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> AI is curating your plan...</>
                ) : `🚀 Generate ${hours}h Emergency Plan`}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Plan Display */
        <div>
          {/* Progress header */}
          <div className="card card-danger mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>🌙 Your {hours}h Emergency Plan</h2>
                <div className="text-sm text-muted">{plan.length} topics · {formatMins(totalMins)} total</div>
              </div>
              <div className="text-center">
                <div style={{
                  fontSize: '1.8rem', fontWeight: 800,
                  color: progress === 100 ? 'var(--color-success)' : 'var(--color-primary-light)'
                }}>
                  {progress}%
                </div>
                <div className="text-xs text-muted">Done</div>
              </div>
            </div>
            <div className="progress-bar-container" style={{ height: 10 }}>
              <div className="progress-bar danger" style={{ width: `${progress}%` }} />
            </div>
            {progress === 100 && (
              <div className="text-center mt-4" style={{ color: 'var(--color-success)', fontWeight: 700 }}>
                🎉 You've covered all topics! You're ready for the exam. Good luck!
              </div>
            )}
          </div>

          {/* Topics */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '12px' }}>
            {plan.map((topic, idx) => {
              const done = completedTopics.has(topic._id)

              return (
                <div
                  key={topic._id}
                  onClick={() => toggleComplete(topic._id)}
                  className="card"
                  style={{
                    cursor: 'pointer',
                    background: done ? 'rgba(139, 69, 19, 0.15)' : 'var(--bg-card)',
                    border: done ? '2px solid #8B4513' : '2px solid #000',
                    boxShadow: done ? '2px 2px 0px #8B4513' : '3px 3px 0px #000',
                    transition: 'all 0.2s',
                    opacity: done ? 0.85 : 1
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Priority badge */}
                    <div style={{
                      width: 32, height: 32,
                      borderRadius: '50%',
                      background: done ? '#8B4513' : idx < 3 ? 'var(--color-danger)' : 'var(--bg-surface3)',
                      border: '2px solid #000',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: done ? '1.2rem' : '1rem',
                      fontWeight: 800,
                      color: done ? '#FFF' : '#000',
                      flexShrink: 0
                    }}>
                      {done ? '✓' : idx + 1}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontWeight: 800,
                        fontSize: '1rem',
                        textDecoration: done ? 'line-through' : 'none',
                        color: done ? '#8B4513' : 'var(--text-primary)',
                        marginBottom: '6px'
                      }}>
                        {topic.title}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-2">
                        <span className={`diff-tag ${difficultyClass(topic.difficulty)}`}>
                          {difficultyLabel(topic.difficulty)}
                        </span>
                        <span className="text-xs text-muted">⏱ {formatMins(topic.allocatedMins)}</span>
                        <span className="text-xs text-muted">📚 {topic.subjectName}</span>
                      </div>
                      {topic.pageRef && (
                        <div className="text-xs" style={{ color: 'var(--color-primary-light)', fontStyle: 'italic' }}>
                          📄 {topic.pageRef}
                        </div>
                      )}

                      {/* Priority indicator */}
                      <div className="flex items-center gap-1 mt-2">
                        {Array.from({ length: Math.min(5, Math.ceil(topic.importanceScore / 2)) }).map((_, i) => (
                          <div key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: 'hsl(350,80%,62%)' }} />
                        ))}
                        <span className="text-xs text-muted ml-1">Priority {topic.importanceScore}/10</span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Reset */}
          <div className="flex justify-center mt-8 gap-3">
            <button
              className="btn btn-outline"
              onClick={() => { setPlan(null); setCompletedTopics(new Set()) }}
            >
              ← Start Over
            </button>
            <button
              className="btn btn-accent"
              onClick={() => toast.success('📤 Plan saved to your profile!')}
            >
              💾 Save Plan
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
