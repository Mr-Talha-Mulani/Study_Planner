const express = require('express')
const { ChatLog, Topic } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const OpenAI = require('openai')
const router = express.Router()

// Setup OpenAI safely
let openai = null
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
}

// POST /api/ai/chat
router.post('/chat', authMiddleware, async (req, res) => {
  try {
    const { message, topicId, subjectId } = req.body

    if (!openai) {
      // Mock mode
      return res.json({
        response: `[MOCK AI] You asked about "${message.substring(0, 30)}...". I am a mock tutor since no OPENAI_API_KEY is configured. Continue studying!`,
        usage: { prompt_tokens: 10, completion_tokens: 20 }
      })
    }

    // Context gathering
    let sysPrompt = "You are an expert AI tutor for computer science and engineering students. Provide clear, concise, and accurate explanations."
    if (topicId) {
       const topic = await Topic.findById(topicId)
       if (topic) sysPrompt += ` We are discussing the topic: ${topic.title}. Difficulty is ${topic.difficulty}.`
    }

    // Call LLM
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: sysPrompt },
        { role: 'user', content: message }
      ]
    })

    const aiRes = completion.choices[0].message.content

    // Log chat statically
    let chatLog = await ChatLog.findOne({ studentId: req.user.id, subjectId })
    if (!chatLog) {
       chatLog = new ChatLog({ studentId: req.user.id, subjectId, messages: [] })
    }
    
    chatLog.messages.push({ role: 'user', content: message })
    chatLog.messages.push({ role: 'assistant', content: aiRes })
    await chatLog.save()

    res.json({ response: aiRes })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/ai/history
router.get('/history/:subjectId', authMiddleware, async (req, res) => {
  try {
    const chatLog = await ChatLog.findOne({ studentId: req.user.id, subjectId: req.params.subjectId })
    res.json({ history: chatLog ? chatLog.messages : [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
