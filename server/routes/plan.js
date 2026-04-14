const express = require('express')
const { StudyPlan, Topic, Subject, ExamEvent, TopicProgress } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// Utility function to generate plan based on params
// Bug Fix (Critical): Filter out completed topics and respect exam scope (FR-21, FR-22)
const generatePlanLogic = async (subjectId, dailyHours, targetExamId, studentId) => {
  // Get the target exam to know scope and duration
  const exam = targetExamId ? await ExamEvent.findById(targetExamId) : null

  // Bug Fix (High): Use exam date to determine plan length, default to 14-day plan
  const daysUntilExam = exam
    ? Math.max(1, Math.ceil((new Date(exam.examDate) - new Date()) / 86400000))
    : 14

  // Build exam scope filter
  const scopeFilter = exam ? { $in: [exam.examType, 'BOTH'] } : undefined

  // Get already-completed topic IDs for this student in this subject
  const done = await TopicProgress.find({ studentId, subjectId, status: 'COMPLETED' }).select('topicId')
  const doneIds = done.map(p => p.topicId.toString())

  const query = { subjectId }
  if (scopeFilter) query.examScope = scopeFilter

  // Sort by importance descending, exclude completed topics
  const allTopics = await Topic.find(query).sort({ importanceScore: -1, difficulty: -1 })
  const topics = allTopics.filter(t => !doneIds.includes(t._id.toString()))

  const days = []
  const today = new Date()
  let topicIdx = 0

  for (let i = 0; i < daysUntilExam; i++) {
    if (topicIdx >= topics.length) break

    let dayMins = 0
    const dayTopics = []

    // Fill up daily hours
    while (topicIdx < topics.length && dayMins + topics[topicIdx].estimatedMins <= dailyHours * 60) {
      dayTopics.push(topics[topicIdx]._id)
      dayMins += topics[topicIdx].estimatedMins
      topicIdx++
    }

    // If a single topic exceeds daily hours, add it anyway to avoid infinite loop
    if (dayTopics.length === 0 && topicIdx < topics.length) {
      dayTopics.push(topics[topicIdx]._id)
      dayMins = topics[topicIdx].estimatedMins
      topicIdx++
    }

    const d = new Date(today)
    d.setDate(today.getDate() + i)
    days.push({
      date: d,
      topicIds: dayTopics,
      totalMins: dayMins,
      completed: false
    })
  }

  return days
}

// POST /api/plan/generate
router.post('/generate', authMiddleware, async (req, res) => {
  try {
    const { subjectId, dailyHours, targetExamId, isLastNightMode } = req.body

    // Pass studentId to filter completed topics
    const days = await generatePlanLogic(subjectId, dailyHours, targetExamId, req.user.id)

    // Deactivate previous plans for this subject
    await StudyPlan.updateMany(
      { studentId: req.user.id, subjectId, isActive: true },
      { isActive: false }
    )

    const plan = new StudyPlan({
      studentId: req.user.id,
      subjectId,
      examEventId: targetExamId,
      name: `Plan - ${new Date().toLocaleDateString('en-US')}`,
      dailyHours,
      days,
      isActive: true
    })

    const saved = await plan.save()

    // Bug Fix (Critical): Re-fetch with populated topic data so frontend gets titles (FR-23)
    const populated = await StudyPlan.findById(saved._id)
      .populate('days.topicIds', 'title difficulty estimatedMins')

    res.json({ plan: populated })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/plan
router.get('/', authMiddleware, async (req, res) => {
  try {
    // Fetch active or pinned plans
    const plans = await StudyPlan.find({ 
      studentId: req.user.id, 
      $or: [{ isActive: true }, { isPinned: true }] 
    })
      .sort({ createdAt: -1 })
      .populate('subjectId', 'name color code')
      .populate('days.topicIds', 'title difficulty estimatedMins')
    res.json({ plans })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/plan/:id/pin
router.put('/:id/pin', authMiddleware, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ _id: req.params.id, studentId: req.user.id })
    if (!plan) return res.status(404).json({ error: 'Plan not found' })
    plan.isPinned = !plan.isPinned
    await plan.save()
    res.json({ plan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
