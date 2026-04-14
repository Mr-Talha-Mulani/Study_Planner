const express = require('express')
const { StudyGroup } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/groups
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Return groups the user is in
    const groups = await StudyGroup.find({ members: req.user.id })
      .populate('members', 'name avatar')
      .populate('subjectId', 'name code')
    res.json({ groups })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/groups
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, description, subjectId } = req.body
    const group = new StudyGroup({
      name, description, subjectId,
      members: [req.user.id],
      createdBy: req.user.id
    })
    await group.save()
    res.json({ group })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/groups/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
      .populate('members', 'name avatar')
      .populate('messages.userId', 'name avatar')
    res.json({ group })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/groups/:id/join
router.put('/:id/join', authMiddleware, async (req, res) => {
  try {
    const group = await StudyGroup.findById(req.params.id)
    if (!group) return res.status(404).json({ error: 'Group not found' })
    
    if (group.members.includes(req.user.id)) {
      return res.status(400).json({ error: 'Already joined' })
    }

    if (group.members.length >= group.maxMembers) {
      return res.status(400).json({ error: 'Group is full' })
    }

    group.members.push(req.user.id)
    await group.save()
    res.json({ group })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/groups/:id/message
router.post('/:id/message', authMiddleware, async (req, res) => {
  try {
    const { text } = req.body
    const group = await StudyGroup.findById(req.params.id)
    if (!group) return res.status(404).json({ error: 'Group not found' })

    const message = { userId: req.user.id, text }
    group.messages.push(message)
    await group.save()

    req.io.to(`group:${group._id}`).emit('group-message', {
      groupId: group._id,
      text,
      userId: req.user.id,
      userName: req.user.name,
      timestamp: new Date().toISOString()
    })

    res.json({ success: true, message })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
