const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const dotenv = require('dotenv')
const { User, Subject, Module, Topic, ExamEvent } = require('./models')

dotenv.config({ path: '../.env' })

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/studyplanner'

const seedData = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(MONGO_URI)
    console.log('Connected.')

    console.log('Clearing database...')
    await User.deleteMany({})
    await Subject.deleteMany({})
    await Module.deleteMany({})
    await Topic.deleteMany({})
    await ExamEvent.deleteMany({})

    console.log('Seeding Users...')
    const pwHash = await bcrypt.hash('demo1234', 12)
    const teacher = new User({
      name: 'Prof. Meera Desai',
      email: 'meera@college.edu',
      passwordHash: pwHash,
      role: 'TEACHER',
      institution: 'Global Tech University'
    })
    await teacher.save()

    const student = new User({
      name: 'Arjun Sharma',
      email: 'arjun@college.edu',
      passwordHash: pwHash,
      role: 'STUDENT',
      institution: 'Global Tech University',
      xp: 1450,
      streak: 7
    })
    await student.save()

    console.log('Seeding Subjects...')
    const reqS = new Subject({
      name: 'Data Structures & Algorithms',
      code: 'DSA301',
      teacherId: teacher._id,
      semester: '3rd Sem',
      color: 'hsl(250,84%,62%)',
      enrollments: [student._id]
    })
    await reqS.save()

    console.log('Seeding Modules & Topics...')
    const mod1 = new Module({ subjectId: reqS._id, title: 'Arrays & Linked Lists', order: 1, examScope: 'MID' })
    await mod1.save()

    const t1 = new Topic({ moduleId: mod1._id, subjectId: reqS._id, title: 'Two Pointers Technique', difficulty: 'EASY', estimatedMins: 30 })
    const t2 = new Topic({ moduleId: mod1._id, subjectId: reqS._id, title: 'Fast & Slow Pointers (Cycle Detection)', difficulty: 'MEDIUM', estimatedMins: 45 })
    const t3 = new Topic({ moduleId: mod1._id, subjectId: reqS._id, title: 'Sliding Window', difficulty: 'HARD', estimatedMins: 60 })
    await Topic.insertMany([t1, t2, t3])

    console.log('Seeding Exams...')
    const e1 = new ExamEvent({ subjectId: reqS._id, examType: 'MID', name: 'Mid-Term Exam', examDate: new Date(Date.now() + 15 * 86400000) })
    await e1.save()

    console.log('✅ Seeding complete!')
    process.exit(0)
  } catch (err) {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  }
}

seedData()
