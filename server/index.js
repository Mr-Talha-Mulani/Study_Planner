const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
const mongoose = require('mongoose')
const http = require('http')
const { Server } = require('socket.io')

dotenv.config({ path: '../.env' })

const app = express()
const server = http.createServer(app)

// Socket.io setup
const io = new Server(server, {
  cors: { origin: 'http://localhost:5173', methods: ['GET', 'POST'] }
})

// Middleware
app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

// Attach socket.io to request
app.use((req, res, next) => { req.io = io; next() })

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/subjects', require('./routes/subjects'))
app.use('/api/topics', require('./routes/topics'))
app.use('/api/plan', require('./routes/plan'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/gamification', require('./routes/gamification'))
app.use('/api/groups', require('./routes/groups'))
app.use('/api/materials', require('./routes/materials'))
app.use('/api/analytics', require('./routes/analytics'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Socket.io — Study Groups & Real-time
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`)

  socket.on('join-group', (groupId) => {
    socket.join(`group:${groupId}`)
    console.log(`User joined group ${groupId}`)
  })

  socket.on('group-message', (data) => {
    io.to(`group:${data.groupId}`).emit('group-message', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })

  socket.on('topic-completed', (data) => {
    io.to(`group:${data.groupId}`).emit('peer-progress', {
      ...data,
      timestamp: new Date().toISOString()
    })
  })

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`)
  })
})

// MongoDB connection & server start
const PORT = process.env.PORT || 5000
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyplanner'

mongoose.connect(MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB connected')
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`)
    })
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:', err.message)
    console.log('💡 Make sure MongoDB is running or update MONGO_URI in .env')
    // Start server anyway for development without DB
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT} (no DB connection)`)
    })
  })

module.exports = { app, io }
