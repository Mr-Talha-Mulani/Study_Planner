import { useState } from 'react'
import { MOCK_TEACHER_SUBJECTS, MOCK_SUBJECTS } from '../utils/mockData'
import toast from 'react-hot-toast'

export default function TeacherSubjectsPage() {
  const [subjects, setSubjects] = useState(MOCK_TEACHER_SUBJECTS)
  const [showCreate, setShowCreate] = useState(false)
  const [activeSubject, setActiveSubject] = useState(null)
  const [form, setForm] = useState({ name: '', semester: '', examType: 'MID_END' })
  const [newTopic, setNewTopic] = useState({ title: '', difficulty: 'MEDIUM', estimatedMins: 45, examScope: 'MID' })

  const createSubject = () => {
    if (!form.name) { toast.error('Enter subject name'); return }
    const code = form.name.split(' ').map(w => w[0].toUpperCase()).join('').slice(0, 3) + Math.floor(100 + Math.random() * 900)
    const subject = {
      _id: 'ts-' + Date.now(),
      name: form.name,
      code,
      semester: form.semester,
      enrolled: 0,
      atRisk: 0,
      avgProgress: 0,
      topics: 0,
      nextExam: null,
      examName: '',
      color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 55%)`,
      topicCompletionByClass: []
    }
    setSubjects(prev => [...prev, subject])
    setShowCreate(false)
    setForm({ name: '', semester: '', examType: 'MID_END' })
    toast.success(`✅ Subject "${subject.name}" created! Code: ${code}`)
  }

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">📚 Manage Subjects</h1>
          <p className="page-subtitle">Create subjects, manage topics, and configure exam schedules</p>
        </div>
        <button
          id="create-subject-btn"
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          ➕ Create Subject
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>➕ Create New Subject</h2>

            <div className="form-group mb-4">
              <label className="form-label">Subject Name</label>
              <input
                id="subject-name-input"
                className="form-input"
                placeholder="Data Structures & Algorithms"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="form-group mb-4">
              <label className="form-label">Semester</label>
              <input
                className="form-input"
                placeholder="3rd Sem"
                value={form.semester}
                onChange={e => setForm(f => ({ ...f, semester: e.target.value }))}
              />
            </div>
            <div className="form-group mb-6">
              <label className="form-label">Exam Type</label>
              <select
                className="form-select"
                value={form.examType}
                onChange={e => setForm(f => ({ ...f, examType: e.target.value }))}
              >
                <option value="MID_END">Mid-Term & End-Term</option>
                <option value="IA1_IA2">IA1 & IA2</option>
                <option value="CT1_CT2_FINALS">CT1, CT2 & Finals</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button className="btn btn-primary flex-1" onClick={createSubject}>Create Subject</button>
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Subject List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {subjects.map(sub => (
          <div key={sub._id} className="card" style={{ padding: '20px' }}>
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div style={{ width: 14, height: 14, borderRadius: '50%', background: sub.color, flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-bold text-lg">{sub.name}</span>
                    <span className="badge badge-primary">{sub.code}</span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted">
                    <span>👥 {sub.enrolled} students</span>
                    <span>📝 {sub.topics} topics</span>
                    <span>📊 {sub.avgProgress}% avg progress</span>
                    {sub.atRisk > 0 && <span style={{ color: 'hsl(350,80%,72%)' }}>⚠️ {sub.atRisk} at risk</span>}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  className="btn btn-outline btn-sm"
                  onClick={() => setActiveSubject(activeSubject === sub._id ? null : sub._id)}
                >
                  {activeSubject === sub._id ? 'Close ↑' : 'Manage →'}
                </button>
                <button
                  className="btn btn-accent btn-sm"
                  onClick={() => {
                    navigator.clipboard.writeText(sub.code)
                    toast.success(`Code ${sub.code} copied!`)
                  }}
                >
                  📋 {sub.code}
                </button>
              </div>
            </div>

            {/* Expanded management */}
            {activeSubject === sub._id && (
              <div style={{ marginTop: '1.5rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                  {/* Upload Syllabus */}
                  <div>
                    <div className="section-title mb-3">📄 Upload Syllabus</div>
                    <div
                      className="upload-zone"
                      style={{ padding: '24px' }}
                      onClick={() => toast.success('📄 Click to upload syllabus (PDF/DOCX)')}
                    >
                      <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📄</div>
                      <div className="text-sm font-semibold">Upload Syllabus PDF</div>
                      <div className="text-xs text-muted">AI will parse topics automatically</div>
                    </div>
                  </div>

                  {/* Add Topic Manually */}
                  <div>
                    <div className="section-title mb-3">➕ Add Topic Manually</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <input
                        className="form-input"
                        placeholder="Topic title"
                        value={newTopic.title}
                        onChange={e => setNewTopic(p => ({ ...p, title: e.target.value }))}
                      />
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
                        <select className="form-select" value={newTopic.difficulty} onChange={e => setNewTopic(p => ({ ...p, difficulty: e.target.value }))}>
                          <option value="EASY">Easy</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HARD">Hard</option>
                        </select>
                        <select className="form-select" value={newTopic.examScope} onChange={e => setNewTopic(p => ({ ...p, examScope: e.target.value }))}>
                          <option value="MID">Mid</option>
                          <option value="END">End</option>
                          <option value="BOTH">Both</option>
                        </select>
                        <input
                          type="number"
                          className="form-input"
                          placeholder="Mins"
                          value={newTopic.estimatedMins}
                          onChange={e => setNewTopic(p => ({ ...p, estimatedMins: parseInt(e.target.value) }))}
                        />
                      </div>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => {
                          if (!newTopic.title) { toast.error('Enter topic title'); return }
                          toast.success(`✅ Topic "${newTopic.title}" added`)
                          setNewTopic({ title: '', difficulty: 'MEDIUM', estimatedMins: 45, examScope: 'MID' })
                        }}
                      >
                        Add Topic
                      </button>
                    </div>
                  </div>
                </div>

                {/* Set Exam Dates */}
                <div style={{ marginTop: '1rem' }}>
                  <div className="section-title mb-3">📅 Set Exam Dates</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div className="form-group">
                      <label className="form-label">Mid-Term Date</label>
                      <input type="date" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label className="form-label">End-Term Date</label>
                      <input type="date" className="form-input" />
                    </div>
                  </div>
                  <button
                    className="btn btn-accent btn-sm mt-3"
                    onClick={() => toast.success('✅ Exam dates saved and students notified!')}
                  >
                    💾 Save Exam Dates & Notify Students
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
