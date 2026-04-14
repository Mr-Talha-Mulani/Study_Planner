const express = require('express')
const { TopicProgress, StudyPlan } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/analytics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id

    // Fetch total completed topics
    const progressList = await TopicProgress.find({ studentId })
    const completedTopics = progressList.filter(p => p.status === 'COMPLETED').length
    const totalTimeMins = progressList.reduce((acc, p) => acc + (p.timeSpentMins || 0), 0)

    // Generate weekly history mock
    const history = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
       const d = new Date(today)
       d.setDate(today.getDate() - i)
       history.push({
         day: d.toLocaleDateString('en-US', { weekday: 'short' }),
         topics: Math.floor(Math.random() * 5), // Mock
         hours: (Math.random() * 3).toFixed(1) // Mock
       })
    }

    res.json({
      summary: {
        completedTopics,
        totalHoursStr: (totalTimeMins / 60).toFixed(1) + 'h',
        planAdherencePct: 78,
        examReadinessPct: 82
      },
      history
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/analytics/teacher/:subjectId
router.get('/teacher/:subjectId', authMiddleware, async (req, res) => {
  try {
    // Analytics for teacher
    // Class average completion, at-risk students, etc
    res.json({ message: "Teacher analytics route active." })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
