import { useState } from 'react'
import { MOCK_MATERIALS, MOCK_SUBJECTS } from '../utils/mockData'
import toast from 'react-hot-toast'

const FILE_ICONS = { pdf: '📕', pptx: '📊', docx: '📝', xlsx: '📈' }

export default function TeacherMaterialsPage() {
  const [selectedSubject, setSelectedSubject] = useState(MOCK_SUBJECTS[0]._id)
  const [materials, setMaterials] = useState(MOCK_MATERIALS[MOCK_SUBJECTS[0]._id] || [])
  const [dragOver, setDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)

  const handleDrop = async (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    uploadFiles(files)
  }

  const uploadFiles = async (files) => {
    setUploading(true)
    for (const file of files) {
      await new Promise(r => setTimeout(r, 800))
      const ext = file.name.split('.').pop().toLowerCase()
      const newMaterial = {
        _id: 'm' + Date.now(),
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type: ext,
        uploadedBy: 'Prof. Meera',
        uploadedAt: new Date().toISOString().split('T')[0],
        mappedTopics: []
      }
      setMaterials(prev => [newMaterial, ...prev])
    }
    toast.success(`✅ ${files.length} file${files.length > 1 ? 's' : ''} uploaded! AI is mapping topics...`)
    setUploading(false)
    setTimeout(() => {
      toast('🤖 AI has mapped topics to your uploaded materials!', { icon: '✅' })
    }, 2000)
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
          {MOCK_SUBJECTS.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Upload Zone */}
      <div
        id="materials-upload-zone"
        className={`upload-zone mb-6 ${dragOver ? 'dragover' : ''}`}
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
            <div className="font-semibold">Uploading & AI mapping...</div>
          </>
        ) : (
          <>
            <div className="upload-zone-icon">📂</div>
            <div className="font-semibold text-lg">Drop Files Here</div>
            <div className="text-sm text-muted">PDF, DOCX, PPTX · Multiple files supported</div>
            <div className="btn btn-primary btn-sm mt-4" style={{ pointerEvents: 'none' }}>Browse Files</div>
          </>
        )}
      </div>

      {/* Alert */}
      <div className="alert alert-info mb-6">
        <span>🤖</span>
        <div>
          <div className="font-semibold">AI Topic Mapping</div>
          <div style={{ fontSize: '0.8rem', marginTop: '4px' }}>
            After upload, AI automatically maps each file to relevant syllabus topics based on filename and content analysis. Students can then see exactly which file covers which topic.
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
                {FILE_ICONS[material.type] || '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div className="font-semibold text-sm truncate">{material.name}</div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-muted">{material.size}</span>
                  <span className="text-xs text-muted">Uploaded {material.uploadedAt}</span>
                  <span className="text-xs text-muted">by {material.uploadedBy}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {material.mappedTopics.length > 0 && (
                  <span className="badge badge-accent">{material.mappedTopics.length} topics mapped</span>
                )}
                <span className="badge badge-primary text-xs">{material.type.toUpperCase()}</span>
                <button
                  className="btn btn-ghost btn-icon"
                  style={{ fontSize: '1rem' }}
                  onClick={() => toast(`Preview: ${material.name}`)}
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
