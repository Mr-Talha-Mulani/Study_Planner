import { useState, useRef, useEffect } from 'react'
import { useAuthStore } from '../store'
import { MOCK_SUBJECTS, MOCK_AI_MESSAGES } from '../utils/mockData'
import toast from 'react-hot-toast'

const AI_RESPONSES = {
  default: [
    "Great question! Let me explain that concept clearly...",
    "Based on your syllabus, here's what you need to know:",
    "This is a commonly tested topic. Here's a concise explanation:",
    "Let me break this down into simple steps for you:",
  ],
  summary: "Here's a quick summary of the topic. The key points to remember are: (1) Core concept definition, (2) How it's applied in practice, (3) Common exam questions around this topic. Would you like me to go deeper on any of these?",
  quiz: "Let's test your understanding! Here's a quick question: Which of the following best describes the concept? (A) Option A, (B) Option B, (C) Option C, (D) Option D. Type the letter of your answer!",
  explain: "Sure! Think of it like this — imagine you're organizing files in a folder. The data structure works similarly by... The formal definition is: a collection of elements where each element has a value and a pointer to the next. Does that make sense?",
}

function mockAIResponse(message) {
  const lower = message.toLowerCase()
  if (lower.includes('summar') || lower.includes('brief')) return AI_RESPONSES.summary
  if (lower.includes('quiz') || lower.includes('test me') || lower.includes('question')) return AI_RESPONSES.quiz
  if (lower.includes('explain') || lower.includes('what is') || lower.includes('how does')) return AI_RESPONSES.explain
  return AI_RESPONSES.default[Math.floor(Math.random() * AI_RESPONSES.default.length)] +
    ` "${message.slice(0, 50)}..." is indeed important for your mid-term. Focus on the core principles and practice with examples from your notes.`
}

export default function AITutorPage() {
  const { user } = useAuthStore()
  const [messages, setMessages] = useState(MOCK_AI_MESSAGES)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')
  const messagesEndRef = useRef(null)

  const subjects = MOCK_SUBJECTS
  const allTopics = subjects.flatMap(s =>
    s.modules.flatMap(m => m.topics.map(t => ({ ...t, subjectName: s.name, subjectId: s._id })))
  )

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (e) => {
    e?.preventDefault()
    if (!input.trim() && !selectedTopic) return

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: input || `Explain: ${allTopics.find(t => t._id === selectedTopic)?.title}`,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    // Simulate AI response delay
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))

    const aiMsg = {
      id: Date.now() + 1,
      role: 'ai',
      content: mockAIResponse(userMsg.content),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, aiMsg])
    setLoading(false)
  }

  const quickPrompts = [
    { label: '📝 Summarize this topic', msg: 'Give me a brief summary of this topic' },
    { label: '🎯 Quiz me', msg: 'Quiz me with a practice question on this topic' },
    { label: '🔢 Formula/Key points', msg: 'What are the key formulas and points I need to remember?' },
    { label: '📚 Example problem', msg: 'Give me a worked example problem for this topic' },
  ]

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">🤖 AI Tutor Chat</h1>
          <p className="page-subtitle">Ask anything about your syllabus — I have full context of your subjects</p>
        </div>
        <div className="flex gap-2">
          <select
            className="form-select"
            style={{ width: 200 }}
            value={selectedSubject}
            onChange={e => setSelectedSubject(e.target.value)}
          >
            <option value="">📚 All Subjects</option>
            {subjects.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 220 }}
            value={selectedTopic}
            onChange={e => setSelectedTopic(e.target.value)}
          >
            <option value="">🎯 Select Topic...</option>
            {allTopics
              .filter(t => !selectedSubject || t.subjectId === selectedSubject)
              .map(t => <option key={t._id} value={t._id}>{t.title}</option>)}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '1.5rem', height: 'calc(100vh - 200px)' }}>
        {/* Chat */}
        <div className="chat-container">
          {/* Messages */}
          <div className="chat-messages">
            {messages.map(msg => (
              <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start', gap: '4px' }}>
                {msg.role === 'ai' && (
                  <div className="flex items-center gap-2 mb-1" style={{ marginLeft: '4px' }}>
                    <div style={{
                      width: 28, height: 28,
                      background: 'var(--grad-primary)',
                      borderRadius: '50%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '0.85rem'
                    }}>🤖</div>
                    <span className="text-xs text-muted">AI Study Assistant</span>
                  </div>
                )}
                <div className={`chat-bubble ${msg.role}`}>
                  {msg.content}
                </div>
                <div className="text-xs text-muted" style={{ padding: '0 4px' }}>
                  {new Date(msg.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2">
                <div style={{ width: 28, height: 28, background: 'var(--grad-primary)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>🤖</div>
                <div className="chat-bubble ai" style={{ padding: '12px 16px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                  <span style={{ animation: 'bounce 0.6s infinite', display: 'inline-block' }}>●</span>
                  <span style={{ animation: 'bounce 0.6s 0.2s infinite', display: 'inline-block' }}>●</span>
                  <span style={{ animation: 'bounce 0.6s 0.4s infinite', display: 'inline-block' }}>●</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="chat-input-area">
            <input
              id="ai-chat-input"
              type="text"
              className="chat-input"
              placeholder="Ask me anything about your syllabus..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage(e)}
              disabled={loading}
            />
            <button
              id="ai-chat-send"
              className="btn btn-primary btn-icon"
              onClick={sendMessage}
              disabled={loading || (!input.trim() && !selectedTopic)}
              style={{ borderRadius: '50%', fontSize: '1rem' }}
            >
              ➤
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'auto' }}>
          {/* Quick Prompts */}
          <div className="card">
            <div className="section-title mb-3">⚡ Quick Prompts</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  className="btn btn-outline btn-sm"
                  style={{ textAlign: 'left', justifyContent: 'flex-start', fontSize: '0.8rem' }}
                  onClick={() => { setInput(prompt.msg); sendMessage() }}
                >
                  {prompt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Context */}
          <div className="card">
            <div className="section-title mb-3">🧠 AI Context</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <div className="text-xs text-muted">I know about:</div>
              {subjects.map(s => (
                <div key={s._id} className="flex items-center gap-2">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, flexShrink: 0 }} />
                  <span className="text-xs">{s.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="card">
            <div className="section-title mb-3">💡 I Can Help With</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                ['📝', 'Topic summaries'],
                ['🎯', 'Practice questions'],
                ['🔍', 'Concept explanations'],
                ['📊', 'Exam tips & strategy'],
                ['🔢', 'Formulas & key points'],
                ['📖', 'Page references'],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="text-xs text-secondary">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Clear chat */}
          <button
            className="btn btn-outline btn-sm"
            onClick={() => { setMessages(MOCK_AI_MESSAGES); toast.success('Chat cleared') }}
          >
            🗑️ Clear Chat
          </button>
        </div>
      </div>
    </div>
  )
}
