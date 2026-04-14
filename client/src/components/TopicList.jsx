import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { difficultyClass, difficultyLabel, formatMins } from '../utils/helpers'
import { useAppStore } from '../store'

export default function TopicList({ topics = [], onMarkComplete, canEdit = false }) {
  const updateTopicStatus = useAppStore(s => s.updateTopicStatus)
  const [localTopics, setLocalTopics] = useState(topics)
  const [saving, setSaving] = useState(null)

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
              {topic.importanceScore >= 8 && (
                <span style={{ fontSize: '0.65rem', fontWeight: 600, color: 'hsl(350, 80%, 72%)', background: 'hsl(350,80%,58%,0.1)', padding: '2px 7px', borderRadius: '999px', border: '1px solid hsl(350,80%,58%,0.2)' }}>
                  🔥 High Priority
                </span>
              )}
              {topic.pageRef && (
                <span className="text-xs text-muted" style={{ fontStyle: 'italic' }}>📄 {topic.pageRef}</span>
              )}
            </div>
          </div>

          {/* Importance score */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px', flexShrink: 0 }}>
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
