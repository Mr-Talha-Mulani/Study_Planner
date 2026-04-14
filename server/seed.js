const path = require('path')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const {
  User,
  Subject,
  Module,
  Topic,
  TopicProgress,
  ExamEvent,
  StudyPlan,
  Material,
  StudyGroup,
  ChatLog
} = require('./models')

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const MONGO_URI = process.env.MONGO_URI

if (!MONGO_URI) {
  throw new Error('MONGO_URI is required in .env for seeding')
}

const addDays = (date, offset) => {
  const d = new Date(date)
  d.setDate(d.getDate() + offset)
  return d
}

const splitIntoDays = (topicIds, startDate, dailyHours = 3) => {
  const chunkSize = Math.max(1, Math.min(4, Math.round(dailyHours)))
  const days = []

  for (let i = 0; i < topicIds.length; i += chunkSize) {
    const dayTopics = topicIds.slice(i, i + chunkSize)
    days.push({
      date: addDays(startDate, days.length),
      topicIds: dayTopics,
      totalMins: dayTopics.length * 45,
      completed: false
    })
  }

  return days
}

const buildProgressDocs = (studentId, topics, profile) => {
  const docs = []

  const completedTopics = topics.slice(0, profile.completed)
  const inProgressTopics = topics.slice(profile.completed, profile.completed + profile.inProgress)

  completedTopics.forEach((topic, idx) => {
    const updatedAt = addDays(new Date(), -Math.min(6, idx % 7))
    docs.push({
      studentId,
      topicId: topic._id,
      subjectId: topic.subjectId,
      status: 'COMPLETED',
      completedAt: updatedAt,
      notes: 'Revised and solved PYQs.',
      timeSpentMins: profile.completedMins,
      createdAt: updatedAt,
      updatedAt
    })
  })

  inProgressTopics.forEach((topic, idx) => {
    const updatedAt = addDays(new Date(), -Math.min(6, idx % 7))
    docs.push({
      studentId,
      topicId: topic._id,
      subjectId: topic.subjectId,
      status: 'IN_PROGRESS',
      notes: 'Half completed, needs revision.',
      timeSpentMins: profile.inProgressMins,
      createdAt: updatedAt,
      updatedAt
    })
  })

  return docs
}

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB Atlas...')
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 15000 })
    console.log('Connected.')

    console.log('Clearing existing data...')
    await Promise.all([
      ChatLog.deleteMany({}),
      StudyGroup.deleteMany({}),
      Material.deleteMany({}),
      StudyPlan.deleteMany({}),
      TopicProgress.deleteMany({}),
      ExamEvent.deleteMany({}),
      Topic.deleteMany({}),
      Module.deleteMany({}),
      Subject.deleteMany({}),
      User.deleteMany({})
    ])

    console.log('Creating users (2 teachers, 4 students)...')
    const hashedSeedPassword = await bcrypt.hash('demo1234', 12)
    const users = await User.insertMany([
      {
        name: 'Prof. Meera Desai',
        email: 'meera@college.in',
        passwordHash: hashedSeedPassword,
        role: 'TEACHER',
        institution: 'Global Tech University'
      },
      {
        name: 'Prof. Rohan Kulkarni',
        email: 'rohan@college.in',
        passwordHash: hashedSeedPassword,
        role: 'TEACHER',
        institution: 'Global Tech University'
      },
      {
        name: 'Aarav Patil',
        email: 'aarav@edu.in',
        passwordHash: hashedSeedPassword,
        role: 'STUDENT',
        institution: 'Global Tech University',
        xp: 3250,
        streak: 29,
        lastStudyDate: new Date(),
        badges: [
          { badge: 'Topper', xp: 1000, earnedAt: addDays(new Date(), -20) },
          { badge: '7 Day Streak', xp: 200, earnedAt: addDays(new Date(), -15) },
          { badge: 'PYQ Master', xp: 300, earnedAt: addDays(new Date(), -7) }
        ]
      },
      {
        name: 'Neha Joshi',
        email: 'neha@edu.in',
        passwordHash: hashedSeedPassword,
        role: 'STUDENT',
        institution: 'Global Tech University',
        xp: 1260,
        streak: 8,
        lastStudyDate: addDays(new Date(), -1),
        badges: [
          { badge: 'Consistent Learner', xp: 150, earnedAt: addDays(new Date(), -10) }
        ]
      },
      {
        name: 'Vikram Salunke',
        email: 'vikram@edu.in',
        passwordHash: hashedSeedPassword,
        role: 'STUDENT',
        institution: 'Global Tech University',
        xp: 180,
        streak: 1,
        lastStudyDate: addDays(new Date(), -2),
        badges: []
      },
      {
        name: 'Isha Khan',
        email: 'isha@edu.in',
        passwordHash: hashedSeedPassword,
        role: 'STUDENT',
        institution: 'Global Tech University',
        xp: 30,
        streak: 0,
        lastStudyDate: addDays(new Date(), -25),
        badges: []
      }
    ])

    const [teacher1, teacher2, topper, average, poor, leftBehind] = users

    console.log('Creating subjects (students intentionally not enrolled)...')
    const subjects = await Subject.insertMany([
      {
        name: 'Data Structures & Algorithms',
        code: 'DSA301',
        teacherId: teacher1._id,
        semester: '3rd Sem',
        examType: 'MID_END',
        description: 'Core problem solving and complexity analysis',
        color: 'hsl(250,84%,62%)',
        enrollments: []
      },
      {
        name: 'Database Management Systems',
        code: 'DBM302',
        teacherId: teacher1._id,
        semester: '3rd Sem',
        examType: 'MID_END',
        description: 'SQL, indexing, normalization and transactions',
        color: 'hsl(168,79%,48%)',
        enrollments: []
      },
      {
        name: 'Operating Systems',
        code: 'OPS303',
        teacherId: teacher2._id,
        semester: '4th Sem',
        examType: 'MID_END',
        description: 'Processes, scheduling, memory and synchronization',
        color: 'hsl(350,80%,58%)',
        enrollments: []
      },
      {
        name: 'Computer Networks',
        code: 'NET304',
        teacherId: teacher2._id,
        semester: '4th Sem',
        examType: 'MID_END',
        description: 'Network stack, routing, transport and security basics',
        color: 'hsl(38,92%,55%)',
        enrollments: []
      }
    ])

    const [dsa, dbms, os, cn] = subjects

    console.log('Creating modules and topics...')
    const modules = await Module.insertMany([
      { subjectId: dsa._id, title: 'Arrays and Linked Lists', order: 1, examScope: 'MID' },
      { subjectId: dsa._id, title: 'Trees and Graphs', order: 2, examScope: 'END' },
      { subjectId: dbms._id, title: 'Relational Model and SQL', order: 1, examScope: 'MID' },
      { subjectId: dbms._id, title: 'Transactions and Indexing', order: 2, examScope: 'END' },
      { subjectId: os._id, title: 'Process Management', order: 1, examScope: 'MID' },
      { subjectId: os._id, title: 'Memory and Deadlocks', order: 2, examScope: 'END' },
      { subjectId: cn._id, title: 'Application and Transport Layer', order: 1, examScope: 'MID' },
      { subjectId: cn._id, title: 'Network and Data Link Layer', order: 2, examScope: 'END' }
    ])

    const moduleByTitle = new Map(modules.map((m) => [`${m.subjectId.toString()}::${m.title}`, m]))

    const topics = await Topic.insertMany([
      { subjectId: dsa._id, moduleId: moduleByTitle.get(`${dsa._id}::Arrays and Linked Lists`)._id, title: 'Two Pointer Technique', difficulty: 'EASY', importanceScore: 9, estimatedMins: 45, order: 1, examScope: 'MID' },
      { subjectId: dsa._id, moduleId: moduleByTitle.get(`${dsa._id}::Arrays and Linked Lists`)._id, title: 'Sliding Window', difficulty: 'MEDIUM', importanceScore: 9, estimatedMins: 50, order: 2, examScope: 'MID' },
      { subjectId: dsa._id, moduleId: moduleByTitle.get(`${dsa._id}::Arrays and Linked Lists`)._id, title: 'Linked List Reversal', difficulty: 'MEDIUM', importanceScore: 8, estimatedMins: 40, order: 3, examScope: 'MID' },
      { subjectId: dsa._id, moduleId: moduleByTitle.get(`${dsa._id}::Trees and Graphs`)._id, title: 'Binary Tree Traversals', difficulty: 'MEDIUM', importanceScore: 10, estimatedMins: 55, order: 1, examScope: 'END' },
      { subjectId: dsa._id, moduleId: moduleByTitle.get(`${dsa._id}::Trees and Graphs`)._id, title: 'Dijkstra Algorithm', difficulty: 'HARD', importanceScore: 10, estimatedMins: 70, order: 2, examScope: 'END' },
      { subjectId: dsa._id, moduleId: moduleByTitle.get(`${dsa._id}::Trees and Graphs`)._id, title: 'Topological Sort', difficulty: 'HARD', importanceScore: 8, estimatedMins: 60, order: 3, examScope: 'END' },

      { subjectId: dbms._id, moduleId: moduleByTitle.get(`${dbms._id}::Relational Model and SQL`)._id, title: 'Normalization (1NF-BCNF)', difficulty: 'MEDIUM', importanceScore: 9, estimatedMins: 50, order: 1, examScope: 'MID' },
      { subjectId: dbms._id, moduleId: moduleByTitle.get(`${dbms._id}::Relational Model and SQL`)._id, title: 'Complex SQL Joins', difficulty: 'MEDIUM', importanceScore: 8, estimatedMins: 45, order: 2, examScope: 'MID' },
      { subjectId: dbms._id, moduleId: moduleByTitle.get(`${dbms._id}::Relational Model and SQL`)._id, title: 'ER to Relational Mapping', difficulty: 'EASY', importanceScore: 7, estimatedMins: 35, order: 3, examScope: 'MID' },
      { subjectId: dbms._id, moduleId: moduleByTitle.get(`${dbms._id}::Transactions and Indexing`)._id, title: 'ACID and Schedules', difficulty: 'MEDIUM', importanceScore: 10, estimatedMins: 55, order: 1, examScope: 'END' },
      { subjectId: dbms._id, moduleId: moduleByTitle.get(`${dbms._id}::Transactions and Indexing`)._id, title: 'B+ Tree Indexing', difficulty: 'HARD', importanceScore: 9, estimatedMins: 65, order: 2, examScope: 'END' },
      { subjectId: dbms._id, moduleId: moduleByTitle.get(`${dbms._id}::Transactions and Indexing`)._id, title: 'Recovery and Logging', difficulty: 'HARD', importanceScore: 8, estimatedMins: 60, order: 3, examScope: 'END' },

      { subjectId: os._id, moduleId: moduleByTitle.get(`${os._id}::Process Management`)._id, title: 'CPU Scheduling', difficulty: 'MEDIUM', importanceScore: 10, estimatedMins: 60, order: 1, examScope: 'MID' },
      { subjectId: os._id, moduleId: moduleByTitle.get(`${os._id}::Process Management`)._id, title: 'Threads and Concurrency', difficulty: 'MEDIUM', importanceScore: 9, estimatedMins: 50, order: 2, examScope: 'MID' },
      { subjectId: os._id, moduleId: moduleByTitle.get(`${os._id}::Process Management`)._id, title: 'IPC Mechanisms', difficulty: 'EASY', importanceScore: 7, estimatedMins: 35, order: 3, examScope: 'MID' },
      { subjectId: os._id, moduleId: moduleByTitle.get(`${os._id}::Memory and Deadlocks`)._id, title: 'Page Replacement', difficulty: 'HARD', importanceScore: 9, estimatedMins: 65, order: 1, examScope: 'END' },
      { subjectId: os._id, moduleId: moduleByTitle.get(`${os._id}::Memory and Deadlocks`)._id, title: 'Deadlock Detection', difficulty: 'HARD', importanceScore: 9, estimatedMins: 55, order: 2, examScope: 'END' },
      { subjectId: os._id, moduleId: moduleByTitle.get(`${os._id}::Memory and Deadlocks`)._id, title: 'Virtual Memory', difficulty: 'MEDIUM', importanceScore: 8, estimatedMins: 50, order: 3, examScope: 'END' },

      { subjectId: cn._id, moduleId: moduleByTitle.get(`${cn._id}::Application and Transport Layer`)._id, title: 'HTTP and DNS', difficulty: 'EASY', importanceScore: 8, estimatedMins: 40, order: 1, examScope: 'MID' },
      { subjectId: cn._id, moduleId: moduleByTitle.get(`${cn._id}::Application and Transport Layer`)._id, title: 'TCP Congestion Control', difficulty: 'HARD', importanceScore: 10, estimatedMins: 70, order: 2, examScope: 'MID' },
      { subjectId: cn._id, moduleId: moduleByTitle.get(`${cn._id}::Application and Transport Layer`)._id, title: 'UDP and Reliability', difficulty: 'MEDIUM', importanceScore: 7, estimatedMins: 35, order: 3, examScope: 'MID' },
      { subjectId: cn._id, moduleId: moduleByTitle.get(`${cn._id}::Network and Data Link Layer`)._id, title: 'IP Addressing and Subnetting', difficulty: 'MEDIUM', importanceScore: 9, estimatedMins: 60, order: 1, examScope: 'END' },
      { subjectId: cn._id, moduleId: moduleByTitle.get(`${cn._id}::Network and Data Link Layer`)._id, title: 'Routing Protocols', difficulty: 'HARD', importanceScore: 9, estimatedMins: 60, order: 2, examScope: 'END' },
      { subjectId: cn._id, moduleId: moduleByTitle.get(`${cn._id}::Network and Data Link Layer`)._id, title: 'MAC and Error Detection', difficulty: 'MEDIUM', importanceScore: 7, estimatedMins: 45, order: 3, examScope: 'END' }
    ])

    console.log('Creating exam events...')
    await ExamEvent.insertMany([
      { subjectId: dsa._id, examType: 'MID', name: 'DSA Mid-Term', examDate: addDays(new Date(), 9) },
      { subjectId: dsa._id, examType: 'END', name: 'DSA End-Term', examDate: addDays(new Date(), 33) },
      { subjectId: dbms._id, examType: 'MID', name: 'DBMS Mid-Term', examDate: addDays(new Date(), 12) },
      { subjectId: dbms._id, examType: 'END', name: 'DBMS End-Term', examDate: addDays(new Date(), 36) },
      { subjectId: os._id, examType: 'MID', name: 'OS Mid-Term', examDate: addDays(new Date(), 14) },
      { subjectId: os._id, examType: 'END', name: 'OS End-Term', examDate: addDays(new Date(), 39) },
      { subjectId: cn._id, examType: 'MID', name: 'CN Mid-Term', examDate: addDays(new Date(), 18) },
      { subjectId: cn._id, examType: 'END', name: 'CN End-Term', examDate: addDays(new Date(), 42) }
    ])

    console.log('Creating study materials...')
    const dsaTopics = topics.filter((t) => t.subjectId.toString() === dsa._id.toString())
    const dbmsTopics = topics.filter((t) => t.subjectId.toString() === dbms._id.toString())
    const osTopics = topics.filter((t) => t.subjectId.toString() === os._id.toString())
    const cnTopics = topics.filter((t) => t.subjectId.toString() === cn._id.toString())

    await Material.insertMany([
      {
        subjectId: dsa._id,
        uploadedBy: teacher1._id,
        originalName: 'DSA_Revision_Notes.pdf',
        fileUrl: '/uploads/DSA_Revision_Notes.pdf',
        fileSize: 245000,
        fileType: 'pdf',
        aiProcessed: true,
        mappedTopics: [dsaTopics[0]._id, dsaTopics[3]._id]
      },
      {
        subjectId: dbms._id,
        uploadedBy: teacher1._id,
        originalName: 'DBMS_SQL_Practice.pptx',
        fileUrl: '/uploads/DBMS_SQL_Practice.pptx',
        fileSize: 412000,
        fileType: 'pptx',
        aiProcessed: true,
        mappedTopics: [dbmsTopics[1]._id, dbmsTopics[4]._id]
      },
      {
        subjectId: os._id,
        uploadedBy: teacher2._id,
        originalName: 'OS_Scheduler_Handout.docx',
        fileUrl: '/uploads/OS_Scheduler_Handout.docx',
        fileSize: 132000,
        fileType: 'docx',
        aiProcessed: true,
        mappedTopics: [osTopics[0]._id, osTopics[3]._id]
      },
      {
        subjectId: cn._id,
        uploadedBy: teacher2._id,
        originalName: 'CN_Subnetting_Sheet.xlsx',
        fileUrl: '/uploads/CN_Subnetting_Sheet.xlsx',
        fileSize: 98000,
        fileType: 'xlsx',
        aiProcessed: true,
        mappedTopics: [cnTopics[3]._id]
      }
    ])

    console.log('Creating progress logs (topper, average, poor, left behind)...')
    const allTopics = [...topics]
    const progressDocs = [
      ...buildProgressDocs(topper._id, allTopics, { completed: 15, inProgress: 5, completedMins: 90, inProgressMins: 45 }),
      ...buildProgressDocs(average._id, allTopics, { completed: 9, inProgress: 6, completedMins: 60, inProgressMins: 35 }),
      ...buildProgressDocs(poor._id, allTopics, { completed: 2, inProgress: 4, completedMins: 35, inProgressMins: 20 }),
      ...buildProgressDocs(leftBehind._id, allTopics, { completed: 0, inProgress: 1, completedMins: 20, inProgressMins: 10 })
    ]
    if (progressDocs.length) {
      await TopicProgress.collection.insertMany(progressDocs)
    }

    console.log('Creating active study plans...')
    await StudyPlan.insertMany([
      {
        studentId: topper._id,
        subjectId: dsa._id,
        dailyHours: 4,
        days: splitIntoDays(dsaTopics.map((t) => t._id), new Date(), 4),
        isActive: true
      },
      {
        studentId: average._id,
        subjectId: dbms._id,
        dailyHours: 3,
        days: splitIntoDays(dbmsTopics.map((t) => t._id), addDays(new Date(), -1), 3),
        isActive: true
      },
      {
        studentId: poor._id,
        subjectId: os._id,
        dailyHours: 2,
        days: splitIntoDays(osTopics.map((t) => t._id), addDays(new Date(), -2), 2),
        isActive: true
      }
    ])

    console.log('Creating study groups and messages...')
    await StudyGroup.insertMany([
      {
        name: 'Placement Sprint',
        subjectId: dsa._id,
        description: 'Daily DSA revision and mock coding rounds',
        members: [topper._id, average._id, poor._id],
        maxMembers: 8,
        createdBy: topper._id,
        messages: [
          { userId: topper._id, text: 'Let us solve 3 graph questions tonight.', timestamp: addDays(new Date(), -1) },
          { userId: average._id, text: 'I will handle shortest path questions.', timestamp: new Date() }
        ]
      },
      {
        name: 'Night Owls',
        subjectId: dbms._id,
        description: 'Late-night SQL and transactions revision',
        members: [topper._id, leftBehind._id],
        maxMembers: 8,
        createdBy: topper._id,
        messages: [
          { userId: topper._id, text: 'Isha, start with normalization basics first.', timestamp: addDays(new Date(), -2) }
        ]
      }
    ])

    console.log('Seeding AI chat history...')
    await ChatLog.insertMany([
      {
        studentId: topper._id,
        subjectId: dsa._id,
        topicId: dsaTopics[4]._id,
        sessionId: `seed-${topper._id}`,
        messages: [
          { role: 'user', content: 'Explain Dijkstra in simple steps.', timestamp: addDays(new Date(), -2) },
          { role: 'assistant', content: 'Use a priority queue, relax edges, and lock shortest nodes one by one.', timestamp: addDays(new Date(), -2) },
          { role: 'user', content: 'Give me one PYQ-style question.', timestamp: addDays(new Date(), -1) },
          { role: 'assistant', content: 'Given a weighted graph with 6 nodes, find shortest path from node 1 to all nodes.', timestamp: addDays(new Date(), -1) }
        ]
      },
      {
        studentId: poor._id,
        subjectId: os._id,
        topicId: osTopics[0]._id,
        sessionId: `seed-${poor._id}`,
        messages: [
          { role: 'user', content: 'I do not understand CPU scheduling.', timestamp: addDays(new Date(), -3) },
          { role: 'assistant', content: 'Start with FCFS and SJF, then compare turnaround and waiting time.', timestamp: addDays(new Date(), -3) }
        ]
      }
    ])

    console.log('\nSeed completed successfully.')
    console.log('Student login accounts (password: demo1234):')
    console.log('- topper: aarav@edu.in')
    console.log('- average: neha@edu.in')
    console.log('- poor: vikram@edu.in')
    console.log('- left-behind: isha@edu.in')
    console.log('Teacher accounts (password: demo1234):')
    console.log('- meera@college.in')
    console.log('- rohan@college.in')
    console.log('Note: All subject enrollments are empty to showcase the Join Subject feature.')

    process.exit(0)
  } catch (err) {
    console.error('Seed failed:', err)
    process.exit(1)
  }
}

seedData()
