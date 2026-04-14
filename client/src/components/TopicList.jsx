import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { difficultyClass, difficultyLabel, formatMins } from '../utils/helpers'
import { useAppStore } from '../store'

export default function TopicList({ topics = [], onMarkComplete, canEdit = false }) {
  const updateTopicStatus = useAppStore(s => s.updateTopicStatus)
  const [localTopics, setLocalTopics] = useState(topics)
  const [saving, setSaving] = useState(null)
  const [expandedNote, setExpandedNote] = useState(null) // topicId
  const [noteText, setNoteText] = useState('')

  useEffect(() => {
    setLocalTopics(topics)
  }, [topics])

  const handleToggle = async (topicId) => {
    // Optimistically update UI first
    let newStatus = 'NOT_STARTED'
    setLocalTopics(prev => prev.map(t => {
      if (t._id === topicId) {
        newStatus = t.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED'
        return { ...t, status: newStatus }
      }
      return t
    }))
    
    // Sync to global store immediately for reactivity across components
    updateTopicStatus(topicId, newStatus)
    onMarkComplete?.(topicId, newStatus)  // Optimistic update for parent UI

    if (newStatus === 'COMPLETED') toast.success('🎉 Topic marked complete! +10 XP', { duration: 2000 })

    // Persist to backend
    setSaving(topicId)
    try {
      const { topicsAPI } = await import('../api')
      await topicsAPI.updateProgress(topicId, newStatus)
    } catch {
      // Revert UI on failure
      const revertStatus = newStatus === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED'
      setLocalTopics(prev => prev.map(t => t._id === topicId ? { ...t, status: revertStatus } : t))
      updateTopicStatus(topicId, revertStatus)
      onMarkComplete?.(topicId, revertStatus) // Revert parent UI 
      toast.error('Failed to save. Try again.')
    } finally {
      setSaving(null)
    }
  }

  const saveNote = async (topicId) => {
    try {
      setSaving(topicId)
      const { topicsAPI } = await import('../api')
      await topicsAPI.updateProgress(topicId, localTopics.find(t=>t._id===topicId)?.status || 'NOT_STARTED', { notes: noteText })
      toast.success('Note saved!')
      setLocalTopics(prev => prev.map(t => t._id === topicId ? { ...t, notes: noteText } : t))
      setExpandedNote(null)
    } catch {
      toast.error('Failed to save note')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {localTopics.map((topic, idx) => (
        <div
          key={topic._id}
          className={`topic-card ${topic.status === 'COMPLETED' ? 'completed' : ''}`}
          onClick={() => handleToggle(topic._id)}
          style={{ animationDelay: `${idx * 0.05}s` }}
        >
          {/* Checkbox */}
          <div
            className={`topic-checkbox ${topic.status === 'COMPLETED' ? 'checked' : ''}`}
            style={{ opacity: saving === topic._id ? 0.5 : 1, transition: 'opacity 0.2s' }}
          >
            {saving === topic._id ? (
              <span style={{ color: 'var(--color-primary)', fontSize: '0.7rem' }}>⟳</span>
            ) : topic.status === 'COMPLETED' ? (
              <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
            ) : topic.status === 'IN_PROGRESS' ? (
              <span style={{ color: 'var(--color-warning)', fontSize: '0.7rem' }}>◐</span>
            ) : null}
          </div>

          {/* Topic info */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: topic.status === 'COMPLETED' ? 'var(--text-muted)' : 'var(--text-primary)',
              textDecoration: topic.status === 'COMPLETED' ? 'line-through' : 'none',
              marginBottom: '4px'
            }}>
              {topic.title}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`diff-tag ${difficultyClass(topic.difficulty)}`}>
                {difficultyLabel(topic.difficulty)}
              </span>
              <span className="text-xs text-muted">⏱ {formatMins(topic.estimatedMins)}</span>
              {topic.importanceScore >= 8 ? (
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(350, 80%, 72%)', background: 'hsl(350,80%,58%,0.1)', padding: '2px 7px', borderRadius: '999px', border: '1px solid hsl(350,80%,58%,0.2)' }}>
                  🔥 High Priority
                </span>
              ) : topic.importanceScore >= 5 ? (
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(38, 92%, 65%)', background: 'hsl(38,92%,65%,0.1)', padding: '2px 7px', borderRadius: '999px', border: '1px solid hsl(38,92%,65%,0.2)' }}>
                  ⚡ Med Priority
                </span>
              ) : (
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)', background: 'var(--bg-surface2)', padding: '2px 7px', borderRadius: '999px', border: '1px solid var(--border-subtle)' }}>
                  🧊 Low Priority
                </span>
              )}
              {topic.pageRef && (
                <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>📄 {topic.pageRef}</span>
              )}
            </div>
            
            {/* Notes UI */}
            {expandedNote === topic._id && (
              <div style={{ marginTop: '10px' }} onClick={e => e.stopPropagation()}>
                <textarea 
                  className="form-input" 
                  style={{ minHeight: '60px', padding: '8px', fontSize: '0.8rem' }}
                  placeholder="Add your study notes here..."
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button className="btn btn-ghost btn-sm" onClick={() => setExpandedNote(null)}>Cancel</button>
                  <button className="btn btn-primary btn-sm" onClick={() => saveNote(topic._id)}>Save Note</button>
                </div>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button 
              className="btn btn-ghost btn-icon" 
              style={{ padding: '4px' }}
              onClick={(e) => { e.stopPropagation(); setExpandedNote(topic._id === expandedNote ? null : topic._id); setNoteText(topic.notes || '') }}
              title="Add Notes"
            >
              📝
            </button>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{
                fontSize: '0.75rem',
                fontWeight: 800,
              color: topic.importanceScore >= 8 ? 'hsl(350,80%,72%)' : topic.importanceScore >= 6 ? 'hsl(38,92%,65%)' : 'var(--text-muted)'
            }}>
              {topic.importanceScore}/10
            </div>
            <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Imp</div>
            </div>
          </div>
        </div>
      ))}

      {localTopics.length === 0 && (
        <div className="text-center" style={{ padding: '32px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
          <div>No topics yet</div>
        </div>
      )}
    </div>
  )
}
