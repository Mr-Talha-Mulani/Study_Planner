const express = require('express')
const { Topic, TopicProgress, User } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/topics/progress/:subjectId
router.get('/progress/:subjectId', authMiddleware, async (req, res) => {
  try {
    const progress = await TopicProgress.find({
      studentId: req.user.id,
      subjectId: req.params.subjectId
    })
    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/topics/:id/progress
router.put('/:id/progress', authMiddleware, async (req, res) => {
  try {
    const { status, notes, timeSpentMins } = req.body
    const topic = await Topic.findById(req.params.id)
    if (!topic) return res.status(404).json({ error: 'Topic not found' })

    const update = { status, notes }
    if (status === 'COMPLETED') update.completedAt = new Date()
    if (timeSpentMins) update.$inc = { timeSpentMins: Number(timeSpentMins) }

    const progress = await TopicProgress.findOneAndUpdate(
      { studentId: req.user.id, topicId: topic._id },
      { ...update, subjectId: topic.subjectId },
      { new: true, upsert: true }
    )

    // Gamification hook (add XP if completed for the first time)
    if (status === 'COMPLETED') {
      const user = await User.findById(req.user.id)
      user.xp += 10
      // simple streak logic
      const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null
      const today = new Date().toDateString()
      if (lastStudy !== today) {
         if (user.lastStudyDate && (new Date() - new Date(user.lastStudyDate)) <= 86400000 * 2) {
            user.streak += 1
         } else {
            user.streak = 1
         }
         user.lastStudyDate = new Date()
      }
      await user.save()

      // Notify study group via socket
      req.io.to(`group:${topic.subjectId}`).emit('peer-progress', {
        userId: user._id,
        userName: user.name,
        topicId: topic._id,
        topicTitle: topic.title,
        message: 'completed a topic!'
      })
    }

    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
