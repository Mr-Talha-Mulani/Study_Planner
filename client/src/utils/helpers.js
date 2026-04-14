// Date utilities
export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric'
  })
}

export const formatTime = (date) => {
  return new Date(date).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })
}

export const getDaysUntil = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diff = target - now
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const getCountdown = (date) => {
  const now = new Date()
  const target = new Date(date)
  const diff = target - now

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((diff % (1000 * 60)) / 1000)

  return { days, hours, minutes, seconds, expired: false }
}

export const isToday = (date) => {
  const d = new Date(date)
  const today = new Date()
  return d.toDateString() === today.toDateString()
}

export const isPast = (date) => new Date(date) < new Date()

// Progress utilities
export const calcProgress = (topics) => {
  if (!topics || topics.length === 0) return 0
  const completed = topics.filter(t => t.status === 'COMPLETED').length
  return Math.round((completed / topics.length) * 100)
}

export const allTopicsFlat = (subject) => {
  if (!subject?.modules) return []
  return subject.modules.flatMap(m => m.topics)
}

export const calcSubjectProgress = (subject) => {
  const topics = allTopicsFlat(subject)
  return calcProgress(topics)
}

export const getTopicsForExam = (subject, examScope) => {
  if (!subject?.modules) return []
  return subject.modules
    .filter(m => m.examScope === examScope || m.examScope === 'BOTH')
    .flatMap(m => m.topics)
}

// Panic Meter
export const calcPanicLevel = (daysUntilExam, completionPercent) => {
  if (daysUntilExam <= 0) return { level: 'critical', score: 100, label: '🔴 EXAM DAY' }

  // Panic formula: higher score = more panic
  const urgency = 1 - (completionPercent / 100) // 0 = done, 1 = nothing done
  const timeRatio = Math.max(0, Math.min(1, 1 - (daysUntilExam / 60))) // 0 = lots of time, 1 = no time

  const score = Math.round((urgency * 0.6 + timeRatio * 0.4) * 100)

  if (score < 25) return { level: 'safe', score, label: '🟢 On Track', color: 'var(--panic-safe)' }
  if (score < 45) return { level: 'caution', score, label: '🟡 Stay Focused', color: 'var(--panic-caution)' }
  if (score < 65) return { level: 'warning', score, label: '🟠 Pick Up Speed', color: 'var(--panic-warning)' }
  if (score < 80) return { level: 'danger', score, label: '🔴 Danger Zone', color: 'var(--panic-danger)' }
  return { level: 'critical', score, label: '🆘 CRITICAL', color: 'var(--panic-critical)' }
}

// XP / Level
export const calcLevel = (xp) => {
  const levels = [0, 500, 1000, 2000, 3000, 4500, 6000, 8000, 10000, 15000]
  let level = 1
  for (let i = 0; i < levels.length; i++) {
    if (xp >= levels[i]) level = i + 1
    else break
  }
  const xpForCurrent = levels[level - 1] || 0
  const xpForNext = levels[level] || levels[levels.length - 1]
  const xpProgress = ((xp - xpForCurrent) / (xpForNext - xpForCurrent)) * 100
  return { level, xpForCurrent, xpForNext, xpProgress }
}

// Difficulty helpers
export const difficultyLabel = (d) => ({ EASY: 'Easy', MEDIUM: 'Medium', HARD: 'Hard' }[d] || d)
export const difficultyClass = (d) => ({ EASY: 'diff-easy', MEDIUM: 'diff-medium', HARD: 'diff-hard' }[d] || '')

// Format minutes
export const formatMins = (mins) => {
  if (mins < 60) return `${mins}m`
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// Avatar initials
export const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

// Color from string (deterministic)
export const stringToColor = (str) => {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 70%, 55%)`
}

// Debounce
export const debounce = (fn, delay) => {
  let timer
  return (...args) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// Last Night Mode — select top priority topics
export const getLastNightTopics = (subjects, availableHours) => {
  const availableMins = availableHours * 60
  let allTopics = []

  for (const sub of subjects) {
    for (const mod of (sub.modules || [])) {
      for (const topic of (mod.topics || [])) {
        if (topic.status !== 'COMPLETED') {
          allTopics.push({
            ...topic,
            subjectName: sub.name,
            subjectId: sub._id,
            priorityScore: topic.importanceScore * 10 + (topic.difficulty === 'HARD' ? 5 : topic.difficulty === 'EASY' ? -5 : 0)
          })
        }
      }
    }
  }

  // Sort by priority desc
  allTopics.sort((a, b) => b.priorityScore - a.priorityScore)

  // Greedy fill within time budget
  let remainingMins = availableMins
  const selected = []

  for (const topic of allTopics) {
    const timeNeeded = topic.difficulty === 'HARD' ? topic.estimatedMins * 1.2 : topic.estimatedMins * 0.8
    if (timeNeeded <= remainingMins) {
      selected.push({ ...topic, allocatedMins: Math.round(timeNeeded) })
      remainingMins -= timeNeeded
    }
  }

  return selected
}
