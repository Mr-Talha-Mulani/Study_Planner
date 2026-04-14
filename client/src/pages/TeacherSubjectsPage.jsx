import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Link } from 'react-router-dom'

export default function TeacherSubjectsPage() {
  const [subjects, setSubjects] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [activeSubject, setActiveSubject] = useState(null)
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: '', semester: '', examType: 'MID_END', color: '#008080' })
  const [newTopic, setNewTopic] = useState({ title: '', difficulty: 'MEDIUM', estimatedMins: 45, examScope: 'MID' })

  const loadSubjects = async () => {
    try {
      const { subjectsAPI } = await import('../api')
      const res = await subjectsAPI.getAll()
      setSubjects(res.data.subjects || [])
    } catch {
      toast.error('Failed to load subjects')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadSubjects()
  }, [])

  const createSubject = async () => {
    if (!form.name) { toast.error('Enter subject name'); return }
    try {
      const { subjectsAPI } = await import('../api')
      const res = await subjectsAPI.create(form)
      setSubjects(prev => [...prev, { ...res.data.subject, modules: [], examEvents: [] }])
      setShowCreate(false)
      setForm({ name: '', semester: '', examType: 'MID_END', color: '#008080' })
      toast.success(`Subject created. Code: ${res.data.subject.code}`)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create subject')
    }
  }

  const addTopic = async (subjectId) => {
    if (!newTopic.title) { toast.error('Enter topic title'); return }
    try {
      const { subjectsAPI } = await import('../api')
      await subjectsAPI.addTopic(subjectId, newTopic)
      await loadSubjects()
      setNewTopic({ title: '', difficulty: 'MEDIUM', estimatedMins: 45, examScope: 'MID' })
      toast.success('Topic added')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add topic')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <span className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    )
  }

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="page-title">📚 Manage Subjects</h1>
          <p className="page-subtitle">Configure curriculum, exam schedules, and topic breakdown</p>
        </div>
        <button
          id="create-subject-btn"
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          ➕ Create New Subject
        </button>
      </div>

      {/* Doodle Create Modal */}
      {showCreate && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }} onClick={() => setShowCreate(false)}>
          <div className="card" style={{ padding: '2.5rem', width: '450px', background: 'var(--bg-surface)' }} onClick={e => e.stopPropagation()}>
            <h2 className="section-title mb-6">➕ Create Subject</h2>

            <div className="form-group mb-4">
              <label className="form-label uppercase">Subject Name</label>
              <input
                id="subject-name-input"
                className="form-input"
                placeholder="e.g. Artificial Intelligence"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="form-label uppercase">Semester</label>
                <input
                  className="form-input"
                  placeholder="6th"
                  value={form.semester}
                  onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="form-label uppercase">Theme Color</label>
                <div className="flex gap-2 h-full items-center">
                   {['#000000', '#2a9d8f', '#e63946', '#f4a261', '#457b9d'].map(c => (
                     <div 
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ 
                        width: 24, height: 24, borderRadius: '4px', background: c, 
                        cursor: 'pointer', border: form.color === c ? '2px solid #000' : '1px solid #ddd',
                        boxShadow: form.color === c ? '2px 2px 0px #000' : 'none'
                      }} 
                    />
                   ))}
                </div>
              </div>
            </div>

            <div className="form-group mb-8">
              <label className="form-label uppercase">Exam Format</label>
              <select
                className="form-select"
                value={form.examType}
                onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}
              >
                <option value="MID_END">Mid-Term & End-Term</option>
                <option value="IA1_IA2">IA1 & IA2 (Internal Assessment)</option>
                <option value="CT1_CT2_FINALS">CT1, CT2 & Final Exams</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button className="btn btn-primary flex-1" onClick={createSubject}>Create Subject</button>
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Subject List Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {subjects.map(sub => (
          <div key={sub._id} className="card" style={{ padding: '2rem' }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div style={{ width: 50, height: 50, borderRadius: 'var(--radius-sm)', border: '2px solid #000', background: 'var(--bg-surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub.color || '#000', fontSize: '1.5rem' }}>
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold">{sub.name}</span>
                    <span className="badge badge-primary">{sub.code}</span>
                  </div>
                  <div className="flex gap-6 mt-1">
                    {[
                      { l: 'ENROLLED', v: sub.enrollments?.length || 0 },
                      { l: 'TOPICS', v: (sub.modules || []).flatMap(m => m.topics || []).length },
                      { l: 'SEMESTER', v: sub.semester || 'N/A' }
                    ].map((it, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[9px] font-bold text-muted uppercase tracking-wider">{it.l}</span>
                        <span className="text-sm font-bold">{it.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className={`btn btn-sm ${activeSubject === sub._id ? 'btn-primary' : 'btn-outline'}`}
                  style={{ fontSize: '12px' }}
                  onClick={() => setActiveSubject(activeSubject === sub._id ? null : sub._id)}
                >
                  {activeSubject === sub._id ? 'CLOSE CONFIG' : 'MANAGE CURRICULUM'}
                </button>
                <div
                  className="btn btn-sm btn-primary"
                  style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'copy' }}
                  onClick={() => {
                    navigator.clipboard.writeText(sub.code)
                    toast.success(`Share code ${sub.code} copied!`)
                  }}
                >
                  <span>SHARE CODE</span>
                  <span className="font-black">{sub.code}</span>
                </div>
              </div>
            </div>

            {/* Config Panel */}
            {activeSubject === sub._id && (
              <div className="fade-in" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '2px solid #000' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Automated Topic Parsing */}
                  <div className="card" style={{ background: 'var(--bg-surface2)', padding: '1.5rem' }}>
                    <h4 className="section-title" style={{ fontSize: '0.9rem' }}>🤖 AI Syllabus Parser</h4>
                    <div
                      className="upload-zone"
                      style={{ border: '2px dashed #000', borderRadius: 'var(--radius-md)', padding: '2rem', textAlign: 'center', background: '#fff' }}
                      onClick={() => toast.success('Upload a PDF to automatically generate the topic roadmap!')}
                    >
                      <div className="text-2xl mb-2">📃</div>
                      <p className="text-xs font-bold">DRAG SYLLABUS PDF</p>
                      <p className="text-[10px] text-muted">We will auto-generate modules & topics</p>
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="card" style={{ background: 'var(--bg-surface2)', padding: '1.5rem' }}>
                    <h4 className="section-title" style={{ fontSize: '0.9rem' }}>➕ Manual Topic Entry</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        className="form-input"
                        placeholder="e.g. Memory Management"
                        value={newTopic.title}
                        onChange={e => setNewTopic(p => ({ ...p, title: e.target.value }))}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                         <select className="form-select" value={newTopic.difficulty} onChange={e => setNewTopic(p => ({ ...p, difficulty: e.target.value }))}>
                           <option value="EASY">Easy</option>
                           <option value="MEDIUM">Med</option>
                           <option value="HARD">Hard</option>
                         </select>
                         <select className="form-select" value={newTopic.examScope} onChange={e => setNewTopic(p => ({ ...p, examScope: e.target.value }))}>
                           <option value="MID">Mid</option>
                           <option value="END">End</option>
                           <option value="BOTH">Both</option>
                         </select>
                         <input type="number" className="form-input" placeholder="Mins" value={newTopic.estimatedMins} onChange={e => setNewTopic(p => ({ ...p, estimatedMins: parseInt(e.target.value) }))} />
                      </div>
                      <button
                        className="btn btn-primary w-full"
                        onClick={() => addTopic(sub._id)}
                      >
                        ADD TOPIC
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exam Sync */}
                <div className="mt-8">
                   <h4 className="section-title" style={{ fontSize: '0.9rem' }}>⏰ Exam Calendar Sync</h4>
                   <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                         <label className="form-label uppercase" style={{ fontSize: '0.7rem' }}>MID-TERM EXAM DATE</label>
                         <input type="date" className="form-input" />
                      </div>
                      <div className="form-group">
                         <label className="form-label uppercase" style={{ fontSize: '0.7rem' }}>END-TERM EXAM DATE</label>
                         <input type="date" className="form-input" />
                      </div>
                   </div>
                   <button className="btn btn-outline w-full mt-4">
                      PUSH TO STUDENT CALENDARS & NOTIFY 
                   </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .upload-zone:hover {
          background: var(--bg-surface) !important;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

