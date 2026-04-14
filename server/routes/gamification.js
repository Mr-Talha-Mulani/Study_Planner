const express = require('express')
const { User, TopicProgress } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/gamification/status
router.get('/status', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('xp streak badges lastStudyDate')
    
    // Find rank of cur user
    const allUsers = await User.find({ role: 'STUDENT' }).sort({ xp: -1 }).select('_id')
    const userRank = allUsers.findIndex(u => u._id.toString() === req.user.id) + 1
    const totalStudents = allUsers.length

    res.json({ status: user, myRank: userRank, totalStudents })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/gamification/leaderboard
router.get('/leaderboard', authMiddleware, async (req, res) => {
  try {
    const topUsers = await User.find({ role: 'STUDENT' })
      .sort({ xp: -1 })
      .select('name xp streak avatar')
      .limit(10)
    
    // Find rank of cur user
    let userRank = null
    const allUsers = await User.find({ role: 'STUDENT' }).sort({ xp: -1 }).select('_id')
    userRank = allUsers.findIndex(u => u._id.toString() === req.user.id) + 1

    res.json({ leaderboard: topUsers, myRank: userRank })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
