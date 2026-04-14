const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

// ============================================================
// USER SCHEMA
// ============================================================
const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['STUDENT', 'TEACHER', 'ADMIN'], default: 'STUDENT' },
  institution: { type: String, trim: true },
  avatar: String,
  xp: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastStudyDate: Date,
  badges: [{ badge: String, xp: Number, earnedAt: { type: Date, default: Date.now } }],
  pushSubscription: mongoose.Schema.Types.Mixed,
}, { timestamps: true })

userSchema.pre('save', async function(next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12)
  }
  next()
})

userSchema.methods.comparePassword = async function(password) {
  return bcrypt.compare(password, this.passwordHash)
}

const User = mongoose.model('User', userSchema)

// ============================================================
// SUBJECT SCHEMA
// ============================================================
const subjectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true, uppercase: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  semester: String,
  examType: { type: String, default: 'MID_END' },
  description: String,
  color: String,
  enrollments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true })

const Subject = mongoose.model('Subject', subjectSchema)

// ============================================================
// MODULE SCHEMA
// ============================================================
const moduleSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  order: { type: Number, default: 1 },
  examScope: { type: String, enum: ['MID', 'END', 'BOTH'], default: 'BOTH' },
}, { timestamps: true })

const Module = mongoose.model('Module', moduleSchema)

// ============================================================
// TOPIC SCHEMA
// ============================================================
const topicSchema = new mongoose.Schema({
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  title: { type: String, required: true },
  difficulty: { type: String, enum: ['EASY', 'MEDIUM', 'HARD'], default: 'MEDIUM' },
  importanceScore: { type: Number, default: 5, min: 1, max: 10 },
  estimatedMins: { type: Number, default: 30 },
  pageReference: String,
  order: { type: Number, default: 1 },
  examScope: { type: String, enum: ['MID', 'END', 'BOTH'], default: 'BOTH' },
  teacherNotes: String,
}, { timestamps: true })

const Topic = mongoose.model('Topic', topicSchema)

// ============================================================
// TOPIC PROGRESS SCHEMA
// ============================================================
const topicProgressSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  status: { type: String, enum: ['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED'], default: 'NOT_STARTED' },
  completedAt: Date,
  notes: String,
  timeSpentMins: { type: Number, default: 0 },
}, { timestamps: true })

topicProgressSchema.index({ studentId: 1, topicId: 1 }, { unique: true })

const TopicProgress = mongoose.model('TopicProgress', topicProgressSchema)

// ============================================================
// EXAM EVENT SCHEMA
// ============================================================
const examEventSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examType: { type: String, required: true },
  examDate: { type: Date, required: true },
  name: String,
  description: String,
}, { timestamps: true })

const ExamEvent = mongoose.model('ExamEvent', examEventSchema)

// ============================================================
// STUDY PLAN SCHEMA
// ============================================================
const studyPlanSchema = new mongoose.Schema({
  name: { type: String, default: 'My Study Plan' },
  isPinned: { type: Boolean, default: false },
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  examEventId: { type: mongoose.Schema.Types.ObjectId, ref: 'ExamEvent' },
  days: [{
    date: Date,
    topicIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
    totalMins: Number,
    completed: { type: Boolean, default: false }
  }],
  dailyHours: Number,
  generatedAt: { type: Date, default: Date.now },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

const StudyPlan = mongoose.model('StudyPlan', studyPlanSchema)

// ============================================================
// MATERIAL SCHEMA
// ============================================================
const materialSchema = new mongoose.Schema({
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  originalName: String,
  fileUrl: String,
  fileSize: Number,
  fileType: { type: String, enum: ['pdf', 'docx', 'pptx', 'xlsx'] },
  mappedTopics: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
  aiProcessed: { type: Boolean, default: false },
}, { timestamps: true })

const Material = mongoose.model('Material', materialSchema)

// ============================================================
// STUDY GROUP SCHEMA
// ============================================================
const studyGroupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  description: String,
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  maxMembers: { type: Number, default: 8 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: String,
    timestamp: { type: Date, default: Date.now }
  }],
}, { timestamps: true })

const StudyGroup = mongoose.model('StudyGroup', studyGroupSchema)

// ============================================================
// AI CHAT LOG SCHEMA
// ============================================================
const chatLogSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  topicId: { type: mongoose.Schema.Types.ObjectId, ref: 'Topic' },
  subjectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject' },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  sessionId: String,
}, { timestamps: true })

const ChatLog = mongoose.model('ChatLog', chatLogSchema)

// ============================================================
// GOAL SCHEMA
// ============================================================
const goalSchema = new mongoose.Schema({
  studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  targetDate: { type: Date },
  status: { type: String, enum: ['PENDING', 'ACHIEVED', 'FAILED'], default: 'PENDING' },
}, { timestamps: true })

const Goal = mongoose.model('Goal', goalSchema)

module.exports = { User, Subject, Module, Topic, TopicProgress, ExamEvent, StudyPlan, Material, StudyGroup, ChatLog, Goal }
