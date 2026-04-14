const express = require('express')
const { TopicProgress, StudyPlan, Topic, Subject } = require('../models')
const { authMiddleware } = require('../middleware/auth')
const router = express.Router()

// GET /api/analytics
router.get('/', authMiddleware, async (req, res) => {
  try {
    const studentId = req.user.id

    // Fetch total completed topics
    const progressList = await TopicProgress.find({ studentId })
    const completedTopics = progressList.filter(p => p.status === 'COMPLETED').length
    const totalTimeMins = progressList.reduce((acc, p) => acc + (p.timeSpentMins || 0), 0)

    // Build deterministic 7-day history from progress records
    const history = []
    const today = new Date()
    for (let i = 6; i >= 0; i--) {
       const d = new Date(today)
       d.setDate(today.getDate() - i)
       const dayStart = new Date(d)
       dayStart.setHours(0, 0, 0, 0)
       const dayEnd = new Date(d)
       dayEnd.setHours(23, 59, 59, 999)

       const dayEntries = progressList.filter((p) => {
         const created = new Date(p.updatedAt || p.createdAt || Date.now())
         return created >= dayStart && created <= dayEnd
       })

       history.push({
         day: d.toLocaleDateString('en-US', { weekday: 'short' }),
         topics: dayEntries.filter((p) => p.status === 'COMPLETED').length,
         hours: Number((dayEntries.reduce((acc, p) => acc + (p.timeSpentMins || 0), 0) / 60).toFixed(1))
       })
    }

    // Bug Fix (Critical): Calculate real Plan Adherence and Exam Readiness (FR-34)
    // 1. Plan Adherence
    const allPlans = await StudyPlan.find({ studentId, isActive: true })
    const pastDays = allPlans.flatMap(p => p.days).filter(d => new Date(d.date) < new Date())
    const planAdherencePct = pastDays.length === 0 ? 0 :
      Math.round(pastDays.filter(d => d.completed || (d.topicIds && d.topicIds.length > 0 && d.topicIds.every(tId => progressList.find(p => p.topicId.toString() === tId.toString() && p.status === 'COMPLETED')))).length / pastDays.length * 100)

    // 2. Exam Readiness
    const enrolledSubjects = await Subject.find({ enrollments: studentId }).select('_id')
    const enrolledSubjectIds = enrolledSubjects.map(s => s._id)
    const totalTopics = await Topic.countDocuments({ subjectId: { $in: enrolledSubjectIds } })
    const examReadinessPct = totalTopics === 0 ? 0 : Math.round(completedTopics / totalTopics * 100)

    res.json({
      summary: {
        completedTopics,
        totalHoursStr: (totalTimeMins / 60).toFixed(1) + 'h',
        planAdherencePct,
        examReadinessPct
      },
      history
    })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/analytics/teacher/:subjectId
router.get('/teacher/:subjectId', authMiddleware, async (req, res) => {
  try {
    const { subjectId } = req.params
    // Verification
    const subject = await Subject.findOne({ _id: subjectId, teacherId: req.user.id })
    if (!subject) return res.status(403).json({ error: 'Not authorized for this subject' })

    const students = subject.enrollments || []
    if (students.length === 0) {
      return res.json({ averageCompletion: 0, atRiskCount: 0, topStudents: [] })
    }

    // Class average completion
    const totalTopics = await Topic.countDocuments({ subjectId })
    const allProgress = await TopicProgress.find({ subjectId, status: 'COMPLETED' })
    
    const studentCompletionMap = {}
    students.forEach(sId => studentCompletionMap[sId.toString()] = 0)
    allProgress.forEach(p => {
      if (studentCompletionMap[p.studentId.toString()] !== undefined) {
        studentCompletionMap[p.studentId.toString()]++
      }
    })

    const completions = Object.values(studentCompletionMap)
    const avgCompleted = completions.length > 0 ? completions.reduce((a, b) => a + b, 0) / completions.length : 0
    const averageCompletion = totalTopics > 0 ? Math.round((avgCompleted / totalTopics) * 100) : 0

    const atRiskCount = totalTopics > 0 ? completions.filter(c => (c / totalTopics) < 0.3).length : 0

    res.json({ averageCompletion, atRiskCount, topStudents: [] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
