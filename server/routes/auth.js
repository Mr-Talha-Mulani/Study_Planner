const express = require('express')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_prod'
const JWT_EXPIRES = process.env.JWT_EXPIRES_IN || '7d'

const signToken = (user) => jwt.sign(
  { id: user._id, email: user.email, role: user.role, name: user.name },
  JWT_SECRET,
  { expiresIn: JWT_EXPIRES }
)

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, institution } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required' })
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' })

    const existing = await User.findOne({ email: email.toLowerCase() })
    if (existing) return res.status(409).json({ error: 'User already exists' })

    const user = new User({ name, email, passwordHash: password, role: role || 'STUDENT', institution })
    await user.save()

    const token = signToken(user)
    res.status(201).json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, institution: user.institution }
    })
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'User already exists' })
    }
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })

    const user = await User.findOne({ email: email.toLowerCase() })
    if (!user) return res.status(401).json({ error: 'Invalid credentials' })

    const valid = await user.comparePassword(password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })

    const token = signToken(user)
    res.json({
      token,
      user: { _id: user._id, name: user.name, email: user.email, role: user.role, institution: user.institution }
    })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// POST /api/auth/refresh
router.post('/refresh', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    const token = signToken(user)
    res.json({ token, user })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// GET /api/auth/me
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash')
    if (!user) return res.status(404).json({ error: 'User not found' })
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

// PUT /api/auth/profile
router.put('/profile', authMiddleware, async (req, res) => {
  try {
    const { name, institution, avatar } = req.body
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, institution, avatar },
      { new: true, select: '-passwordHash' }
    )
    res.json({ user })
  } catch (err) {
    res.status(500).json({ error: 'Server error' })
  }
})

module.exports = router
