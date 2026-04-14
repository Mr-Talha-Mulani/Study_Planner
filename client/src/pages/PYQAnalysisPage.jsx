import { useEffect, useState } from 'react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import toast from 'react-hot-toast'

export default function PYQAnalysisPage() {
  const [analysis, setAnalysis] = useState([])
  const [subjects, setSubjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState(null)
  const [selectedSubject, setSelectedSubject] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const { subjectsAPI } = await import('../api')
        const res = await subjectsAPI.getAll()
        const subList = res.data.subjects || []
        setSubjects(subList)
        if (subList.length > 0) {
          setSelectedSubject(subList[0]._id)
        }
      } catch {
        toast.error('Failed to load subjects')
      }
    }
    load()
  }, [])

  const analyzeFile = async () => {
    if (!uploadedFile) {
      toast.error('Please upload a PYQ paper first')
      return
    }
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('subjectId', selectedSubject)
      formData.append('files', uploadedFile)
      const { aiAPI } = await import('../api')
      const res = await aiAPI.analyzePYQ(formData)
      setAnalysis(res.data.analysis || [])
      toast.success('PYQ analysis complete')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to analyze PYQ')
    } finally {
      setLoading(false)
    }
  }

  const radarData = analysis.slice(0, 6).map(item => ({
    topic: item.topicTitle.split(' ').slice(0, 2).join(' '),
    score: item.importanceScore
  }))

  const chartData = analysis.map(item => ({
    name: item.topicTitle.split(' ').slice(0, 3).join(' '),
    frequency: item.frequency,
    importance: item.importanceScore
  }))

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">📊 PYQ Analysis Engine</h1>
          <p className="page-subtitle">Upload past question papers — AI identifies high-frequency topics and patterns</p>
        </div>
        <select
          className="form-select"
          value={selectedSubject}
          onChange={e => setSelectedSubject(e.target.value)}
          style={{ width: 240 }}
        >
          {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      {/* Charts — only show after analysis */}
      {analysis.length > 0 ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Upload Zone */}
            <div className="card">
              <div className="section-title mb-4">📄 Upload PYQ Papers</div>
              <div
                id="pyq-upload-zone"
                className={`upload-zone ${dragOver ? 'dragover' : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault()
                  setDragOver(false)
                  const file = e.dataTransfer.files[0]
                  if (file) { setUploadedFile(file); toast.success(`📄 ${file.name} uploaded`) }
                }}
                onClick={() => document.getElementById('pyq-file-input').click()}
              >
                <input id="pyq-file-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                  onChange={e => { const f = e.target.files[0]; if (f) { setUploadedFile(f); toast.success(`📄 ${f.name} uploaded`) } }} />
                <div className="upload-zone-icon">📃</div>
                {uploadedFile ? (
                  <>
                    <div className="font-semibold" style={{ color: 'var(--color-accent-light)' }}>{uploadedFile.name}</div>
                    <div className="text-xs text-muted">{(uploadedFile.size / 1024).toFixed(1)} KB</div>
                  </>
                ) : (
                  <>
                    <div className="font-semibold">Drop PYQ Paper Here</div>
                    <div className="text-xs text-muted">PDF or DOCX · Click to browse</div>
                  </>
                )}
              </div>
              <button id="analyze-pyq-btn" className="btn btn-primary w-full mt-4" onClick={analyzeFile} disabled={loading}>
                {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> AI Analyzing...</> : '🤖 Re-Analyze'}
              </button>
            </div>

            {/* Radar Chart */}
            <div className="card">
              <div className="section-title mb-4">🕸️ Topic Coverage Radar</div>
              <ResponsiveContainer width="100%" height={200}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="var(--border-default)" />
                  <PolarAngleAxis dataKey="topic" tick={{ fill: 'var(--text-secondary)', fontSize: 10 }} />
                  <Radar name="Importance" dataKey="score" stroke="hsl(250,84%,62%)" fill="hsl(250,84%,62%)" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="card mb-6">
            <div className="section-title mb-4">📈 Topic Frequency Analysis</div>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 0, right: 20, left: 0, bottom: 60 }}>
                <XAxis dataKey="name" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: 'var(--bg-surface)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '0.8rem' }} />
                <Bar dataKey="frequency" name="PYQ Frequency" fill="hsl(250,84%,62%)" radius={[4,4,0,0]} />
                <Bar dataKey="importance" name="Importance Score" fill="hsl(168,79%,48%)" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Top Topics Table */}
          <div className="card">
            <div className="section-title mb-4">🔥 High-Priority Topics (by PYQ frequency)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[...analysis].sort((a, b) => b.frequency - a.frequency).map((item, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '12px 14px', borderRadius: 'var(--radius-md)', background: idx < 3 ? 'hsl(350,80%,58%,0.06)' : 'var(--bg-surface2)', border: `1px solid ${idx < 3 ? 'hsl(350,80%,58%,0.2)' : 'var(--border-subtle)'}` }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: idx === 0 ? 'linear-gradient(135deg, hsl(48,100%,50%), hsl(38,100%,55%))' : idx === 1 ? 'linear-gradient(135deg, hsl(220,10%,75%), hsl(220,10%,85%))' : idx === 2 ? 'linear-gradient(135deg, hsl(25,80%,50%), hsl(25,80%,65%))' : 'var(--bg-surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem', color: idx < 3 ? (idx === 1 ? 'hsl(220,10%,30%)' : 'hsl(38,80%,25%)') : 'var(--text-muted)', flexShrink: 0 }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="text-sm font-semibold">{item.topicTitle}</div>
                  </div>
                  <div className="text-center" style={{ minWidth: 60 }}>
                    <div className="font-bold text-sm">{item.frequency}×</div>
                    <div className="text-xs text-muted">in PYQs</div>
                  </div>
                  <div style={{ minWidth: 100 }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-muted">Importance</span>
                      <span className="text-xs font-bold" style={{ color: item.importanceScore >= 8 ? 'hsl(350,80%,72%)' : 'hsl(38,92%,65%)' }}>{item.importanceScore}/10</span>
                    </div>
                    <div className="progress-bar-container" style={{ height: 5 }}>
                      <div className="progress-bar" style={{ width: `${item.importanceScore * 10}%`, background: item.importanceScore >= 8 ? 'var(--grad-danger)' : 'var(--grad-primary)' }} />
                    </div>
                  </div>
                  {idx < 3 && <span className="badge badge-danger">🔥 Must Study</span>}
                </div>
              ))}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Upload Zone */}
          <div className="card">
            <div className="section-title mb-4">📄 Upload PYQ Papers</div>
            <div
              id="pyq-upload-zone"
              className={`upload-zone ${dragOver ? 'dragover' : ''}`}
              onDragOver={e => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={e => {
                e.preventDefault()
                setDragOver(false)
                const file = e.dataTransfer.files[0]
                if (file) { setUploadedFile(file); toast.success(`📄 ${file.name} ready`) }
              }}
              onClick={() => document.getElementById('pyq-file-input').click()}
            >
              <input id="pyq-file-input" type="file" accept=".pdf,.docx" style={{ display: 'none' }}
                onChange={e => { const f = e.target.files[0]; if (f) { setUploadedFile(f); toast.success(`📄 ${f.name} ready`) } }} />
              <div className="upload-zone-icon">📃</div>
              {uploadedFile ? (
                <>
                  <div className="font-semibold" style={{ color: 'var(--color-accent-light)' }}>{uploadedFile.name}</div>
                  <div className="text-xs text-muted">{(uploadedFile.size / 1024).toFixed(1)} KB · Ready to analyze</div>
                </>
              ) : (
                <>
                  <div className="font-semibold">Drop PYQ Paper Here</div>
                  <div className="text-xs text-muted">PDF or DOCX · Click to browse</div>
                </>
              )}
            </div>
            <button id="analyze-pyq-btn" className="btn btn-primary w-full mt-4" onClick={analyzeFile} disabled={loading || !uploadedFile}>
              {loading ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> AI Analyzing...</> : uploadedFile ? '🤖 Analyze with AI' : '📂 Upload a file first'}
            </button>
          </div>

          {/* Empty state for charts */}
          <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="pyq-empty">
              <div style={{ fontSize: '3rem' }}>📊</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>No Analysis Yet</div>
              <div style={{ fontSize: '0.85rem' }}>Upload a PYQ paper and click <strong>Analyze</strong> to reveal topic patterns and exam hotspots.</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
