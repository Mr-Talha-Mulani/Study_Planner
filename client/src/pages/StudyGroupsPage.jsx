import { useState } from 'react'
import { MOCK_STUDY_GROUPS } from '../utils/mockData'
import { useAuthStore } from '../store'
import toast from 'react-hot-toast'

const MOCK_MESSAGES = [
  { id: 1, user: 'Priya Nair', avatar: 'PN', color: 'hsl(250,84%,62%)', text: 'Hey everyone! Can anyone explain Fast & Slow Pointer?', time: '2:30 PM' },
  { id: 2, user: 'Rohit Verma', avatar: 'RV', color: 'hsl(168,79%,48%)', text: 'Sure! It\'s used for cycle detection in linked lists. Floyd\'s algorithm!', time: '2:32 PM' },
  { id: 3, user: 'Arjun Sharma', avatar: 'AS', color: 'hsl(38,92%,55%)', text: 'I just completed Sliding Window — it took 90 mins but worth it!', time: '2:45 PM', isMe: true },
  { id: 4, user: 'Sneha Patel', avatar: 'SP', color: 'hsl(200,85%,55%)', text: 'Nice! I\'m still on Two Pointer. That problem about finding pairs is tricky.', time: '3:00 PM' },
]

export default function StudyGroupsPage() {
  const { user } = useAuthStore()
  const [groups, setGroups] = useState(MOCK_STUDY_GROUPS)
  const [activeGroup, setActiveGroup] = useState(null)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState(MOCK_MESSAGES)
  const [showCreate, setShowCreate] = useState(false)
  const [newGroup, setNewGroup] = useState({ name: '', subject: '' })

  const joinGroup = (groupId) => {
    setGroups(prev => prev.map(g =>
      g._id === groupId ? { ...g, isMember: true, memberCount: g.memberCount + 1 } : g
    ))
    toast.success('🎉 Joined the study group!')
  }

  const sendMessage = (e) => {
    e.preventDefault()
    if (!message.trim()) return
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
  }

  const createGroup = () => {
    if (!newGroup.name) { toast.error('Enter a group name'); return }
    const group = {
      _id: 'g' + Date.now(),
      name: newGroup.name,
      subject: newGroup.subject || 'General',
      memberCount: 1,
      maxMembers: 8,
      members: [user?.name],
      lastActivity: 'Just now',
      description: 'New study group',
      isMember: true
    }
    setGroups(prev => [...prev, group])
    setShowCreate(false)
    setNewGroup({ name: '', subject: '' })
    toast.success('🎊 Study group created!')
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
                  <div className="text-xs text-muted truncate">{group.subject}</div>
                </div>
                {group.isMember ? (
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
                <span className="text-xs text-muted">👥 {group.memberCount}/{group.maxMembers}</span>
                <span className="text-xs text-muted">💬 {group.lastActivity}</span>
              </div>
              {/* Member dots */}
              <div className="flex gap-1 mt-2">
                {group.members.slice(0, 5).map((m, i) => (
                  <div
                    key={i}
                    style={{
                      width: 24, height: 24, borderRadius: '50%',
                      background: `hsl(${i * 60 + 200}, 70%, 55%)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.6rem', fontWeight: 700, color: 'white',
                      border: '2px solid var(--bg-surface)'
                    }}
                  >
                    {m[0]}
                  </div>
                ))}
                {group.memberCount > 5 && (
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--bg-surface3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', color: 'var(--text-muted)', border: '2px solid var(--bg-surface)' }}>
                    +{group.memberCount - 5}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Chat / Group Detail */}
        {activeGroup ? (
          <div className="chat-container">
            {/* Chat header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justify: 'space-between', gap: '12px' }}>
              <div>
                <div className="font-bold">{activeGroup.name}</div>
                <div className="text-xs text-muted">{activeGroup.memberCount} members · {activeGroup.subject}</div>
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
