import { useState } from 'react'
import toast from 'react-hot-toast'
import { difficultyClass, difficultyLabel, formatMins } from '../utils/helpers'

export default function TopicList({ topics = [], onMarkComplete, canEdit = false }) {
  const [localTopics, setLocalTopics] = useState(topics)

  const handleToggle = (topicId) => {
    setLocalTopics(prev => prev.map(t => {
      if (t._id === topicId) {
        const newStatus = t.status === 'COMPLETED' ? 'NOT_STARTED' : 'COMPLETED'
        if (newStatus === 'COMPLETED') {
          toast.success('🎉 Topic marked complete! +10 XP', { duration: 2000 })
        }
        onMarkComplete?.(topicId, newStatus)
        return { ...t, status: newStatus }
      }
      return t
    }))
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
          <div className={`topic-checkbox ${topic.status === 'COMPLETED' ? 'checked' : ''}`}>
            {topic.status === 'COMPLETED' && (
              <span style={{ color: 'white', fontSize: '0.75rem', fontWeight: 700 }}>✓</span>
            )}
            {topic.status === 'IN_PROGRESS' && (
              <span style={{ color: 'var(--color-warning)', fontSize: '0.7rem' }}>◐</span>
            )}
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
