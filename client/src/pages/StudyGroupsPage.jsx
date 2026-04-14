import { useEffect, useState } from 'react'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

export default function StudyGroupsPage() {
  const { user } = useAuthStore()
  const [groups, setGroups] = useState([])
  const [activeGroup, setActiveGroup] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [showCreate, setShowCreate] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', subject: '' })

  useEffect(() => {
    const load = async () => {
      try {
        const { groupsAPI } = await import('../api')
        const res = await groupsAPI.getAll()
        setGroups(res.data.groups || [])
      } catch {
        toast.error('Failed to load groups')
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (!activeGroup?._id) return
    const loadMessages = async () => {
      try {
        const { groupsAPI } = await import('../api')
        const res = await groupsAPI.getOne(activeGroup._id)
        const group = res.data.group
        setMessages((group?.messages || []).map((m, idx) => ({
          id: `${m._id || idx}`,
          user: m.userId?.name || 'Member',
          avatar: (m.userId?.name || 'M').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2),
          color: 'hsl(250,84%,62%)',
          text: m.text,
          time: new Date(m.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          isMe: (m.userId?._id || m.userId) === user?._id
        })))
      } catch {
        setMessages([])
      }
    }
    loadMessages()
  }, [activeGroup, user?._id])

  const joinGroup = async (groupId) => {
    try {
      const { groupsAPI } = await import('../api')
      await groupsAPI.join(groupId)
      const res = await groupsAPI.getAll()
      setGroups(res.data.groups || [])
      toast.success('Joined the study group')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Unable to join group')
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    if (!message.trim() || !activeGroup?._id) return
    try {
      const { groupsAPI } = await import('../api')
      await groupsAPI.sendMessage(activeGroup._id, message)
      setMessages(prev => [...prev, {
        id: Date.now(),
        user: user?.name || 'You',
        avatar: (user?.name || 'Y').split(' ').map(n => n[0]).join('').toUpperCase(),
        color: 'hsl(250,84%,62%)',
        text: message,
        time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        isMe: true
      }])
      setMessage('')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Message send failed')
    }
  }

  const createGroup = async () => {
    if (!newGroup.name) { toast.error('Enter a group name'); return }
    try {
      const { groupsAPI } = await import('../api')
      await groupsAPI.create({ name: newGroup.name, description: newGroup.subject || 'General' })
      const res = await groupsAPI.getAll()
      setGroups(res.data.groups || [])
      setShowCreate(false)
      setNewGroup({ name: '', subject: '' })
      toast.success('Study group created')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create group')
    }
  }

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">👥 Study Groups</h1>
          <p className="page-subtitle">Collaborate with classmates, share notes, and track group progress</p>
        </div>
        <button
          id="create-group-btn"
          className="btn btn-primary"
          onClick={() => setShowCreate(true)}
        >
          ➕ Create Group
        </button>
      </div>

      {/* Create Group Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1.5rem' }}>➕ Create Study Group</h2>
            <div className="form-group mb-4">
              <label className="form-label">Group Name</label>
              <input
                className="form-input"
                placeholder="e.g. DSA Masters, DBMS Squad"
                value={newGroup.name}
                onChange={e => setNewGroup(p => ({ ...p, name: e.target.value }))}
              />
            </div>
            <div className="form-group mb-6">
              <label className="form-label">Subject (Optional)</label>
              <input
                className="form-input"
                placeholder="Data Structures & Algorithms"
                value={newGroup.subject}
                onChange={e => setNewGroup(p => ({ ...p, subject: e.target.value }))}
              />
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary flex-1" onClick={createGroup}>Create Group</button>
              <button className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '1.5rem' }}>
        {/* Groups List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {groups.map(group => (
            (() => {
              const isMember = (group.members || []).some((m) => (m._id || m).toString() === user?._id)
              return (
            <div
              key={group._id}
              className="card"
              style={{
                cursor: 'pointer',
                border: activeGroup?._id === group._id ? '1px solid hsl(250,84%,62%,0.4)' : '1px solid var(--border-subtle)',
                background: activeGroup?._id === group._id ? 'hsl(250,84%,62%,0.06)' : 'var(--grad-card)',
                transition: 'all 0.15s'
              }}
              onClick={() => setActiveGroup(group)}
            >
              <div className="flex items-start justify-between mb-2">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="font-bold text-sm">{group.name}</div>
                  <div className="text-xs text-muted truncate">{group.description || group.subjectId?.name || 'General'}</div>
                </div>
                {isMember ? (
                  <span className="badge badge-accent" style={{ flexShrink: 0, marginLeft: '8px' }}>Joined</span>
                ) : (
                  <button
                    className="btn btn-outline btn-sm"
                    style={{ flexShrink: 0, marginLeft: '8px', fontSize: '0.7rem' }}
                    onClick={e => { e.stopPropagation(); joinGroup(group._id) }}
                  >
                    Join
                  </button>
                )}
              </div>
              <div className="flex items-center gap-4">
                <span className="text-xs text-muted">👥 {(group.members || []).length}/{group.maxMembers || 8}</span>
                <span className="text-xs text-muted">💬 Active</span>
              </div>
              {/* Member dots */}
              <div className="flex gap-1 mt-2">
                {(group.members || []).slice(0, 5).map((m, i) => (
                  <div
                    key={m._id || i}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: `hsl(${i * 60 + 200}, 70%, 55%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: 'white',
                      border: '2px solid var(--bg-surface)'
                    }}
                  >
                    {(m.name || m)[0]}
                  </div>
                ))}
                {(group.members || []).length > 5 && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--text-muted)', border: '2px solid var(--bg-surface)' }}>
                    +{(group.members || []).length - 5}
                  </div>
                )}
              </div>
            </div>
              )
            })()
          ))}
        </div>

        {/* Chat / Group Detail */}
        {activeGroup ? (
          <div className="chat-container">
            {/* Chat header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px' }}>
              <div>
                <div className="font-bold">{activeGroup.name}</div>
                <div className="text-xs text-muted">{(activeGroup.members || []).length} members · {activeGroup.description || activeGroup.subjectId?.name || 'General'}</div>
              </div>
              <div className="flex gap-2 ml-auto">
                <button className="btn btn-outline btn-sm">📎 Share Notes</button>
                <button className="btn btn-primary btn-sm">🎮 Revision Game</button>
              </div>
            </div>

            {/* Messages */}
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.isMe ? 'flex-end' : 'flex-start', gap: '4px' }}>
                  {!msg.isMe && (
                    <div className="flex items-center gap-2 mb-1" style={{ marginLeft: '4px' }}>
                      <div className="avatar" style={{ width: 24, height: 24, fontSize: '0.6rem', background: msg.color }}>{msg.avatar}</div>
                      <span className="text-xs text-muted">{msg.user}</span>
                    </div>
                  )}
                  <div className={`chat-bubble ${msg.isMe ? 'user' : 'ai'}`}>
                    {msg.text}
                  </div>
                  <div className="text-xs text-muted" style={{ padding: '0 4px' }}>{msg.time}</div>
                </div>
              ))}
            </div>

            {/* Chat input */}
            <form className="chat-input-area" onSubmit={sendMessage}>
              <input
                id="group-chat-input"
                type="text"
                className="chat-input"
                placeholder={`Message ${activeGroup.name}...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
              <button type="submit" className="btn btn-primary btn-icon" style={{ borderRadius: '50%' }}>➤</button>
            </form>
          </div>
        ) : (
          <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 400, textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>👥</div>
            <div className="font-bold text-lg">Select a Group to Chat</div>
            <div className="text-muted text-sm mt-2">Join a study group and collaborate with classmates</div>
          </div>
        )}
      </div>
    </div>
  )
}
