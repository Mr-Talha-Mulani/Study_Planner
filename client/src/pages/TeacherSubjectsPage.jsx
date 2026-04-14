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
    <div className="page-container fade-in" style={{ backgroundColor: '#0F2C2C', minHeight: '100vh', padding: '2rem' }}>
      <div className="flex items-center justify-between mb-10">
        <div>
          <h1 className="text-3xl font-extrabold" style={{ color: '#E0F2F1' }}>📚 Manage Subjects</h1>
          <p className="text-sm mt-1" style={{ color: '#80CBC4', opacity: 0.8 }}>Configure curriculum, exam schedules, and topic breakdown</p>
        </div>
        <button
          id="create-subject-btn"
          className="btn btn-primary"
          style={{ background: '#008080', border: 'none', boxShadow: '0 4px 14px rgba(0, 128, 128, 0.4)' }}
          onClick={() => setShowCreate(true)}
        >
          ➕ Create New Subject
        </button>
      </div>

      {/* Premium Create Modal */}
      {showCreate && (
        <div className="modal-overlay" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }} onClick={() => setShowCreate(false)}>
          <div className="modal card-subtle" style={{ background: '#2C3E3E', border: '1px solid #3d5151', padding: '2.5rem', width: '450px' }} onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-6" style={{ color: '#E0F2F1' }}>➕ Create Subject</h2>

            <div className="form-group mb-4">
              <label className="text-xs font-bold mb-2 block uppercase tracking-wider" style={{ color: '#80CBC4' }}>Subject Name</label>
              <input
                id="subject-name-input"
                className="form-input"
                style={{ background: '#1A2A2A', border: '1px solid #3d5151', color: '#E0F2F1' }}
                placeholder="e.g. Artificial Intelligence"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            
            <div className="grid-2 mb-4">
              <div className="form-group">
                <label className="text-xs font-bold mb-2 block uppercase tracking-wider" style={{ color: '#80CBC4' }}>Semester</label>
                <input
                  className="form-input"
                  style={{ background: '#1A2A2A', border: '1px solid #3d5151', color: '#E0F2F1' }}
                  placeholder="6th"
                  value={form.semester}
                  onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
                />
              </div>
              <div className="form-group">
                <label className="text-xs font-bold mb-2 block uppercase tracking-wider" style={{ color: '#80CBC4' }}>Theme Color</label>
                <div className="flex gap-2 h-full items-center">
                   {['#008080', '#4ECDC4', '#FF6B6B', '#F7B731', '#F97316'].map(c => (
                     <div 
                      key={c}
                      onClick={() => setForm(f => ({ ...f, color: c }))}
                      style={{ 
                        width: 24, height: 24, borderRadius: '6px', background: c, 
                        cursor: 'pointer', border: form.color === c ? '2px solid white' : 'none' 
                      }} 
                    />
                   ))}
                </div>
              </div>
            </div>

            <div className="form-group mb-8">
              <label className="text-xs font-bold mb-2 block uppercase tracking-wider" style={{ color: '#80CBC4' }}>Exam Format</label>
              <select
                className="form-select"
                style={{ background: '#1A2A2A', border: '1px solid #3d5151', color: '#E0F2F1' }}
                value={form.examType}
                onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}
              >
                <option value="MID_END">Mid-Term & End-Term</option>
                <option value="IA1_IA2">IA1 & IA2 (Internal Assessment)</option>
                <option value="CT1_CT2_FINALS">CT1, CT2 & Final Exams</option>
              </select>
            </div>

            <div className="flex gap-4">
              <button className="btn btn-primary flex-1" style={{ background: '#008080' }} onClick={createSubject}>Create Subject</button>
              <button className="btn" style={{ background: 'transparent', color: '#80CBC4' }} onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Subject List Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem' }}>
        {subjects.map(sub => (
          <div key={sub._id} className="card-subtle" style={{ 
            background: '#2C3E3E', padding: '2rem', border: '1px solid #3d5151', borderRadius: '16px'
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div style={{ width: 50, height: 50, borderRadius: '12px', background: `${sub.color || '#008080'}33`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: sub.color || '#008080', fontSize: '1.5rem' }}>
                  📚
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-xl font-bold" style={{ color: '#E0F2F1' }}>{sub.name}</span>
                    <span className="text-[10px] font-black tracking-widest px-2 py-1 rounded" style={{ background: '#1A2A2A', color: '#4ECDC4' }}>{sub.code}</span>
                  </div>
                  <div className="flex gap-6 mt-1">
                    {[
                      { l: 'ENROLLED', v: sub.enrollments?.length || 0 },
                      { l: 'TOPICS', v: (sub.modules || []).flatMap(m => m.topics || []).length },
                      { l: 'SEMESTER', v: sub.semester || 'N/A' }
                    ].map((it, idx) => (
                      <div key={idx} className="flex flex-col">
                        <span className="text-[9px] font-bold" style={{ color: '#80CBC4', opacity: 0.6 }}>{it.l}</span>
                        <span className="text-sm font-bold" style={{ color: '#E0F2F1' }}>{it.v}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  className="btn"
                  style={{ background: '#1A2A2A', color: '#E0F2F1', border: '1px solid #3d5151', fontSize: '12px' }}
                  onClick={() => setActiveSubject(activeSubject === sub._id ? null : sub._id)}
                >
                  {activeSubject === sub._id ? 'CLOSE CONFIG' : 'MANAGE CURRICULUM'}
                </button>
                <div
                  className="btn"
                  style={{ background: '#008080', color: 'white', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'copy' }}
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
              <div className="fade-in" style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                  {/* Automated Topic Parsing */}
                  <div className="card-subtle" style={{ background: '#1A2A2A', border: '1px solid #3d5151', padding: '1.5rem', borderRadius: '12px' }}>
                    <h4 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#80CBC4' }}>🤖 AI Syllabus Parser</h4>
                    <div
                      className="upload-zone"
                      style={{ border: '2px dashed #3d5151', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}
                      onClick={() => toast.success('Upload a PDF to automatically generate the topic roadmap!')}
                    >
                      <div className="text-2xl mb-2">📃</div>
                      <p className="text-xs font-bold" style={{ color: '#E0F2F1' }}>DRAG SYLLABUS PDF</p>
                      <p className="text-[10px]" style={{ color: '#80CBC4' }}>We will auto-generate modules & topics</p>
                    </div>
                  </div>

                  {/* Manual Entry */}
                  <div className="card-subtle" style={{ background: '#1A2A2A', border: '1px solid #3d5151', padding: '1.5rem', borderRadius: '12px' }}>
                    <h4 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#80CBC4' }}>➕ Manual Topic Entry</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <input
                        className="form-input"
                        style={{ background: '#0F2C2C', border: '1px solid #3d5151', color: '#E0F2F1' }}
                        placeholder="e.g. Memory Management"
                        value={newTopic.title}
                        onChange={e => setNewTopic(p => ({ ...p, title: e.target.value }))}
                      />
                      <div className="grid-3 gap-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                         <select className="form-select" style={{ background: '#0F2C2C', border: '1px solid #3d5151', color: '#E0F2F1' }} value={newTopic.difficulty} onChange={e => setNewTopic(p => ({ ...p, difficulty: e.target.value }))}>
                           <option value="EASY">Easy</option>
                           <option value="MEDIUM">Med</option>
                           <option value="HARD">Hard</option>
                         </select>
                         <select className="form-select" style={{ background: '#0F2C2C', border: '1px solid #3d5151', color: '#E0F2F1' }} value={newTopic.examScope} onChange={e => setNewTopic(p => ({ ...p, examScope: e.target.value }))}>
                           <option value="MID">Mid</option>
                           <option value="END">End</option>
                           <option value="BOTH">Both</option>
                         </select>
                         <input type="number" className="form-input" style={{ background: '#0F2C2C', border: '1px solid #3d5151', color: '#E0F2F1' }} placeholder="Mins" value={newTopic.estimatedMins} onChange={e => setNewTopic(p => ({ ...p, estimatedMins: parseInt(e.target.value) }))} />
                      </div>
                      <button
                        className="btn btn-primary w-full"
                        style={{ background: '#008080' }}
                        onClick={() => addTopic(sub._id)}
                      >
                        ADD TOPIC
                      </button>
                    </div>
                  </div>
                </div>

                {/* Exam Sync */}
                <div className="mt-8">
                   <h4 className="text-sm font-bold mb-4 uppercase tracking-widest" style={{ color: '#80CBC4' }}>⏰ Exam Calendar Sync</h4>
                   <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                      <div className="form-group">
                         <label className="text-[10px] font-bold block mb-1" style={{ color: '#80CBC4' }}>MID-TERM EXAM DATE</label>
                         <input type="date" className="form-input" style={{ background: '#1A2A2A', border: '1px solid #3d5151', color: '#E0F2F1' }} />
                      </div>
                      <div className="form-group">
                         <label className="text-[10px] font-bold block mb-1" style={{ color: '#80CBC4' }}>END-TERM EXAM DATE</label>
                         <input type="date" className="form-input" style={{ background: '#1A2A2A', border: '1px solid #3d5151', color: '#E0F2F1' }} />
                      </div>
                   </div>
                   <button className="btn w-full mt-4" style={{ background: '#2C3E3E', color: '#4ECDC4', border: '1px solid #4ECDC433' }}>
                      PUSH TO STUDENT CALENDARS & NOTIFY 
                   </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <style>{`
        .card-subtle {
          box-shadow: 0 4px 24px rgba(0,0,0,0.3);
        }
        .grid-3 {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
        }
        .upload-zone:hover {
          border-color: #008080 !important;
          background: rgba(0,128,128,0.05);
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}

