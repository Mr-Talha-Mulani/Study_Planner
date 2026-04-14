const express = require('express')
const { Subject, Module, Topic, ExamEvent, TopicProgress } = require('../models')
const { authMiddleware, teacherOnly } = require('../middleware/auth')
const multer = require('multer')
const router = express.Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// GET /api/subjects — Get all subjects for user
router.get('/', authMiddleware, async (req, res) => {
  try {
    let subjects
    if (req.user.role === 'TEACHER') {
      subjects = await Subject.find({ teacherId: req.user.id })
    } else {
      subjects = await Subject.find({ enrollments: req.user.id })
        .populate('teacherId', 'name')
    }

    // Get all progress for this user once to avoid N+1 queries
    const userProgress = req.user.role === 'STUDENT' ? 
      await TopicProgress.find({ studentId: req.user.id }) : []
    
    const progressMap = {}
    userProgress.forEach(p => {
      progressMap[p.topicId.toString()] = p.status
    })

    // Attach modules and topics for each subject
    const enriched = await Promise.all(subjects.map(async (sub) => {
      const modules = await Module.find({ subjectId: sub._id }).sort('order')
      const modulesWithTopics = await Promise.all(modules.map(async (mod) => {
        const topics = await Topic.find({ moduleId: mod._id }).sort('order')
        const topicsWithStatus = topics.map(t => {
          const status = progressMap[t._id.toString()] || 'NOT_STARTED'
          return { ...t.toObject(), status }
        })
        return { ...mod.toObject(), topics: topicsWithStatus }
      }))
      const examEvents = await ExamEvent.find({ subjectId: sub._id }).sort('examDate')
      return { ...sub.toObject(), modules: modulesWithTopics, examEvents }
    }))

    res.json({ subjects: enriched })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/subjects/join
router.post('/join', authMiddleware, async (req, res) => {
  try {
    const { code } = req.body
    const subject = await Subject.findOne({ code: code.toUpperCase() })
    if (!subject) return res.status(404).json({ error: 'Subject code not found' })
    if (subject.enrollments.includes(req.user.id)) return res.status(409).json({ error: 'Already enrolled' })
    subject.enrollments.push(req.user.id)
    await subject.save()
    res.json({ message: 'Joined successfully', subject })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/subjects — Teacher creates subject
router.post('/', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { name, semester, examType, description, color } = req.body
    let isUnique = false;
    let code = '';
    while (!isUnique) {
      code = name.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3) + Math.floor(100 + Math.random() * 900)
      const existing = await Subject.findOne({ code })
      if (!existing) isUnique = true;
    }
    const subject = new Subject({ name, code, teacherId: req.user.id, semester, examType, description, color })
    await subject.save()
    res.status(201).json({ subject })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/subjects/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const subject = await Subject.findById(req.params.id).populate('teacherId', 'name email')
    if (!subject) return res.status(404).json({ error: 'Subject not found' })
    
    // Get user progress
    const userProgress = req.user.role === 'STUDENT' ? 
      await TopicProgress.find({ studentId: req.user.id, subjectId: subject._id }) : []
    
    const progressMap = {}
    userProgress.forEach(p => {
      progressMap[p.topicId.toString()] = p.status
    })

    const modules = await Module.find({ subjectId: subject._id }).sort('order')
    const modulesWithTopics = await Promise.all(modules.map(async (mod) => {
      const topics = await Topic.find({ moduleId: mod._id }).sort('order')
      const topicsWithStatus = topics.map(t => ({
        ...t.toObject(),
        status: progressMap[t._id.toString()] || 'NOT_STARTED'
      }))
      return { ...mod.toObject(), topics: topicsWithStatus }
    }))

    const examEvents = await ExamEvent.find({ subjectId: subject._id }).sort('examDate')
    res.json({ subject: { ...subject.toObject(), modules: modulesWithTopics, examEvents } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/subjects/:id
router.put('/:id', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, teacherId: req.user.id },
      req.body,
      { new: true }
    )
    if (!subject) return res.status(404).json({ error: 'Subject not found or unauthorized' })
    res.json({ subject })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/subjects/:id/topics — Add topic to subject
router.post('/:id/topics', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { title, difficulty, estimatedMins, examScope, importanceScore, pageReference, moduleTitle, moduleOrder } = req.body
    const subject = await Subject.findOne({ _id: req.params.id, teacherId: req.user.id })
    if (!subject) return res.status(404).json({ error: 'Subject not found or unauthorized' })

    // Find or create module
    let mod = await Module.findOne({ subjectId: subject._id, title: moduleTitle || 'Default Module' })
    if (!mod) {
      mod = new Module({ subjectId: subject._id, title: moduleTitle || 'Default Module', order: moduleOrder || 1, examScope: examScope || 'BOTH' })
      await mod.save()
    }

    const topicsCount = await Topic.countDocuments({ moduleId: mod._id })
    const topic = new Topic({
      moduleId: mod._id,
      subjectId: subject._id,
      title, difficulty, estimatedMins, examScope: examScope || 'BOTH',
      importanceScore: importanceScore || 5,
      pageReference,
      order: topicsCount + 1
    })
    await topic.save()
    res.status(201).json({ topic })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/subjects/:id/exam-events — Set exam dates
router.post('/:id/exam-events', authMiddleware, teacherOnly, async (req, res) => {
  try {
    const { events } = req.body // Array of { examType, examDate, name }
    await ExamEvent.deleteMany({ subjectId: req.params.id })
    const created = await ExamEvent.insertMany(
      events.map(e => ({ ...e, subjectId: req.params.id }))
    )
    res.json({ examEvents: created })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
