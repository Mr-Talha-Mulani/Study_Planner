import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'

const FILE_ICONS = { pdf: '📕', pptx: '📊', docx: '📝', xlsx: '📈' }

export default function TeacherMaterialsPage() {
  const [subjects, setSubjects] = useState([])
  const [selectedSubject, setSelectedSubject] = useState('')
  const [materials, setMaterials] = useState([])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    import('../api').then(({ subjectsAPI }) => {
      subjectsAPI.getAll().then(res => {
        const subs = res.data.subjects || []
        setSubjects(subs)
        if (subs.length > 0) setSelectedSubject(subs[0]._id)
        setLoading(false)
      })
    })
  }, [])

  useEffect(() => {
    if (!selectedSubject) return
    import('../api').then(({ materialsAPI }) => {
      materialsAPI.getAll(selectedSubject).then(res => {
        setMaterials(res.data.materials || [])
      })
    })
  }, [selectedSubject])

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }

  const uploadFiles = async (files) => {
    if (!selectedSubject) {
      toast.error('Select a subject first')
      return
    }
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append('subjectId', selectedSubject)
      for (const file of files) {
        formData.append('files', file)
      }
      
      const { materialsAPI } = await import('../api')
      const res = await materialsAPI.upload(formData)
      
      setMaterials(prev => [...res.data.materials, ...prev])
      toast.success(`✅ ${files.length} file${files.length > 1 ? 's' : ''} uploaded! AI mapped topics.`)
    } catch (err) {
      toast.error('Upload failed')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">📁 Study Materials</h1>
          <p className="page-subtitle">Upload notes, slides, and reference materials — AI maps them to syllabus topics</p>
        </div>
        <select
          className="form-select"
          style={{ width: 240 }}
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
        >
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Upload Zone */}
      <div
        id="materials-upload-zone"
        className={`card mb-6 ${dragOver ? 'dragover' : ''}`}
        style={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          justifyContent: 'center', 
          padding: '3rem', 
          borderStyle: 'dashed',
          cursor: 'pointer',
          background: dragOver ? 'var(--bg-surface2)' : '#fff'
        }}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => document.getElementById('materials-file-input').click()}
      >
        <input
          id="materials-file-input"
          type="file"
          multiple
          accept=".pdf,.docx,.pptx"
          style={{ display: 'none' }}
          onChange={e => uploadFiles(Array.from(e.target.files))}
        />
        {uploading ? (
          <>
            <div className="spinner" style={{ margin: '0 auto 16px' }} />
            <div className="font-bold">Uploading & AI mapping...</div>
          </>
        ) : (
          <>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
            <div className="font-bold text-lg">Drop Files Here</div>
            <div className="text-sm text-muted font-bold">PDF, DOCX, PPTX · Multiple files supported</div>
            <div className="btn btn-primary btn-sm mt-4" style={{ pointerEvents: 'none' }}>Browse Files</div>
          </>
        )}
      </div>

      {/* AI Help Card */}
      <div className="card mb-6" style={{ background: 'var(--bg-surface2)', borderLeft: '10px solid var(--color-info)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <div>
            <div className="font-bold uppercase text-xs" style={{ color: 'var(--color-info)' }}>AI Topic Mapping</div>
            <div style={{ fontSize: '0.875rem', marginTop: '4px', fontWeight: 500 }}>
              After upload, AI automatically maps each file to relevant syllabus topics based on filename and content analysis. Students can then see exactly which file covers which topic.
            </div>
          </div>
        </div>
      </div>

      {/* Materials List */}
      <div className="section-title mb-4">📋 Uploaded Materials ({materials.length})</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {materials.map(material => (
          <div key={material._id} className="card" style={{ padding: '14px 18px' }}>
            <div className="flex items-center gap-4">
              <div style={{ fontSize: '2rem', flexShrink: 0 }}>
                {FILE_ICONS[material.type || material.fileType] || '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold text-sm truncate">{material.name || material.originalName}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted">{material.size ? Math.round(material.size / 1024) + ' KB' : material.fileSize ? Math.round(material.fileSize / 1024) + ' KB' : 'Unknown size'}</span>
                  <span className="text-xs text-muted">Uploaded {new Date(material.createdAt || material.uploadedAt).toLocaleDateString()}</span>
                  <span className="text-xs text-muted">by {material.uploadedBy?.name || material.uploadedBy || 'Unknown'}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {material.mappedTopics.length > 0 && (
                  <span className="badge badge-accent">{material.mappedTopics.length} topics mapped</span>
                )}
                <span className="badge badge-primary text-xs">{(material.type || material.fileType || 'file').toUpperCase()}</span>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ fontSize: '1rem' }}
                  onClick={() => toast(`Preview: ${material.name || material.originalName}`)}
                >
                  👁
                </button>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ fontSize: '1rem', color: 'hsl(350,80%,60%)' }}
                  onClick={() => {
                    setMaterials(prev => prev.filter(m => m._id !== material._id))
                    toast.success('File deleted')
                  }}
                >
                  🗑
                </button>
              </div>
            </div>
          </div>
        ))}

        {materials.length === 0 && (
          <div className="card text-center" style={{ padding: '3rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📂</div>
            <div className="font-semibold">No Materials Uploaded Yet</div>
            <div className="text-muted text-sm mt-2">Upload PDF, DOCX, or PPTX files above</div>
          </div>
        )}
      </div>
    </div>
  )
}
