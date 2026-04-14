const express = require('express')
const multer = require('multer')
const { Material, Subject } = require('../models')
const { authMiddleware, teacherOnly } = require('../middleware/auth')
const router = express.Router()

// Multer memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }
})

// POST /api/materials/upload
router.post('/upload', authMiddleware, teacherOnly, upload.array('files'), async (req, res) => {
  try {
    const { subjectId } = req.body
    if (!subjectId) return res.status(400).json({ error: 'Subject ID required' })

    const subject = await Subject.findOne({ _id: subjectId, teacherId: req.user.id })
    if (!subject) return res.status(404).json({ error: 'Subject not found' })

    const uploadedMaterials = []
    
    // Process each file
    for (let file of req.files) {
      // In a real app we'd upload to S3 or similar and parse PDF for AI topic mapping
      // For now, save metadata
      const ext = file.originalname.split('.').pop().toLowerCase()
      const material = new Material({
        subjectId: subject._id,
        uploadedBy: req.user.id,
        originalName: file.originalname,
        fileUrl: `/uploads/${file.originalname}`, // mock URL
        fileSize: file.size,
        fileType: ['pdf', 'docx', 'pptx', 'xlsx'].includes(ext) ? ext : 'pdf',
        aiProcessed: true, // we mock AI process
        mappedTopics: [] // in reality, query openai with pdf text -> match topics -> save here
      })
      await material.save()
      uploadedMaterials.push(material)
    }

    res.status(201).json({ materials: uploadedMaterials })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/materials/:subjectId
router.get('/:subjectId', authMiddleware, async (req, res) => {
  try {
    const materials = await Material.find({ subjectId: req.params.subjectId })
      .populate('uploadedBy', 'name')
      .populate('mappedTopics', 'title importanceScore')
    res.json({ materials })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
