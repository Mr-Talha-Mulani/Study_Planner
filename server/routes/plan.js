const express = require('express')
const { StudyPlan, Topic, Subject, ExamEvent } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// Utility function to mock AI generating plan based on params
const generatePlanLogic = async (subjectId, dailyHours, targetExamId) => {
  const topics = await Topic.find({ subjectId })
  
  // Fake complex planning
  const days = []
  const today = new Date()
  let topicIdx = 0

  for (let i = 0; i < 7; i++) { // Let's make a 7 day plan for now
    if (topicIdx >= topics.length) break

    let dayMins = 0
    const dayTopics = []
    
    // Fill up daily hours
    while (topicIdx < topics.length && dayMins + topics[topicIdx].estimatedMins <= dailyHours * 60) {
      dayTopics.push(topics[topicIdx]._id)
      dayMins += topics[topicIdx].estimatedMins
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

    // Simple implementation for demo
    const days = await generatePlanLogic(subjectId, dailyHours, targetExamId)

    // Deactivate previous plans for this subject
    await StudyPlan.updateMany(
      { studentId: req.user.id, subjectId, isActive: true },
      { isActive: false }
    )

    const plan = new StudyPlan({
      studentId: req.user.id,
      subjectId,
      examEventId: targetExamId,
      dailyHours,
      days,
      isActive: true
    })

    await plan.save()
    res.json({ plan })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/plan
router.get('/', authMiddleware, async (req, res) => {
  try {
    const plans = await StudyPlan.find({ studentId: req.user.id, isActive: true })
      .populate('subjectId', 'name color code')
      .populate('days.topicIds', 'title difficulty estimatedMins')
    res.json({ plans })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
