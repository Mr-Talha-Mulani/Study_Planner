const express = require('express')
const { Topic, TopicProgress, User, StudyGroup } = require('../models')
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

    let progress;
    if (status === 'NOT_STARTED') {
      await TopicProgress.findOneAndDelete({ studentId: req.user.id, topicId: topic._id })
      progress = { status: 'NOT_STARTED', topicId: topic._id }
    } else {
      progress = await TopicProgress.findOneAndUpdate(
        { studentId: req.user.id, topicId: topic._id },
        { ...update, subjectId: topic.subjectId },
        { new: true, upsert: true }
      )
    }

    // Bug Fix (Critical): Use atomic $inc and conditional $set to prevent race conditions on XP/streak
    if (status === 'COMPLETED') {
      // Read user once to compute streak logic
      const user = await User.findById(req.user.id)
      const lastStudy = user.lastStudyDate ? new Date(user.lastStudyDate).toDateString() : null
      const today = new Date().toDateString()

      let shouldIncrementStreak = false
      if (lastStudy !== today) {
        // Increment streak if last studied within 48h (consecutive day), else reset to 1
        if (user.lastStudyDate && (new Date() - new Date(user.lastStudyDate)) <= 86400000 * 2) {
          shouldIncrementStreak = true
        }
      }

      // Atomic update — avoids race condition from concurrent completions
      const xpIncrement = 10
      const atomicUpdate = {
        $inc: { xp: xpIncrement },
        $set: { lastStudyDate: new Date() }
      }
      if (shouldIncrementStreak) {
        atomicUpdate.$inc.streak = 1
      } else if (lastStudy !== today) {
        // Reset streak if not a consecutive day
        atomicUpdate.$set.streak = 1
      }

      await User.findByIdAndUpdate(req.user.id, atomicUpdate)

      // Find study groups the student belongs to for this subject and notify members
      // Bug Fix (High): Emit to study group rooms the student belongs to, not subjectId
      try {
        const groups = await StudyGroup.find({
          subjectId: topic.subjectId,
          members: req.user.id
        }).select('_id')

        for (const group of groups) {
          req.io.to(`group:${group._id}`).emit('peer-progress', {
            userId: user._id,
            userName: user.name,
            topicId: topic._id,
            topicTitle: topic.title,
            message: 'completed a topic!'
          })
        }
      } catch (socketErr) {
        // Non-critical: socket emission failure shouldn't break the response
        console.error('Socket emit error:', socketErr.message)
      }
    }

    res.json({ progress })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
