import { useEffect, useState } from 'react'
import { calcLevel } from '../utils/helpers'

export default function GamificationPage() {
  const [gamification, setGamification] = useState({ xp: 0, streak: 0, badges: [], rank: 0, totalStudents: 1, todayDone: false })
  const [leaderboard, setLeaderboard] = useState([])
  const [subjects, setSubjects] = useState([])
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const { gamificationAPI, subjectsAPI } = await import('../api')
        const [statusRes, boardRes, subjectsRes] = await Promise.all([
          gamificationAPI.getStats(),
          gamificationAPI.getLeaderboard(),
          subjectsAPI.getAll()
        ])

        const status = statusRes.data.status || {}
        const board = boardRes.data.leaderboard || []
        setGamification({
          xp: status.xp || 0,
          streak: status.streak || 0,
          badges: status.badges || [],
          rank: boardRes.data.myRank || 0,
          totalStudents: board.length || 1,
          todayDone: !!status.lastStudyDate && new Date(status.lastStudyDate).toDateString() === new Date().toDateString()
        })

        setLeaderboard(
          board.map((entry, index) => ({
            studentId: entry._id,
            rank: index + 1,
            name: entry.name,
            xp: entry.xp,
            streak: entry.streak,
            isMe: (index + 1) === (boardRes.data.myRank || -1),
            color: 'hsl(250,84%,62%)'
          }))
        )
        setSubjects(subjectsRes.data.subjects || [])
      } catch {
        // keep safe defaults
      }
    }
    load()
  }, [])

  const levelInfo = calcLevel(gamification.xp)

  // Achievement Definitions & Logic
  const allAchievements = [
    { id: 'first_steps', title: 'First Steps', description: 'Complete your first topic', icon: '🌱', check: () => gamification.xp >= 10 },
    { id: 'on_a_roll', title: 'On a Roll', description: 'Achieve a 3-day study streak', icon: '🔥', check: () => gamification.streak >= 3 },
    { id: 'week_warrior', title: 'Week Warrior', description: 'Achieve a 7-day study streak', icon: '⚔️', check: () => gamification.streak >= 7 },
    { id: 'module_master', title: 'Module Master', description: 'Complete an entire module', icon: '📦', check: () => subjects.some(s => (s.modules || []).some(m => (m.topics || []).every(t => t.status === 'COMPLETED'))) },
    { id: 'half_way', title: 'Half Way There', description: 'Complete 50% of a subject', icon: '🌓', check: () => subjects.some(s => {
        const topics = (s.modules || []).flatMap(m => m.topics || [])
        return topics.length > 0 && topics.filter(t => t.status === 'COMPLETED').length >= (topics.length / 2)
      })},
    { id: 'subject_champ', title: 'Subject Champion', description: 'Complete 100% of a subject', icon: '👑', check: () => subjects.some(s => {
        const topics = (s.modules || []).flatMap(m => m.topics || [])
        return topics.length > 0 && topics.every(t => t.status === 'COMPLETED')
      })},
    { id: 'night_owl', title: 'Night Owl', description: 'Study after midnight', icon: '🦉', check: () => gamification.badges.some(b => b.badge === 'Night Owl') },
    { id: 'pyq_master', title: 'PYQ Master', description: 'Complete 5 PYQ Analysis sessions', icon: '📝', check: () => gamification.badges.some(b => b.badge === 'PYQ Master') }
  ]

  const unlocked = allAchievements.filter(a => a.check())
  const locked = allAchievements.filter(a => !a.check())

  // Mock Calendar Data for visualization (Last 21 days)
  const getStreakDays = () => {
    const days = []
    for (let i = 20; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      days.push({
        num: d.getDate(),
        active: i < gamification.streak,
        isToday: i === 0
      })
    }
    return days
  }

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title" style={{ fontSize: '2.5rem' }}>Achievements</h1>
          <p className="page-subtitle">Unlock badges and compete with classmates</p>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
        
        {/* Row 1: 4-Stat Header */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
          {[
            { label: 'Current streak', value: gamification.streak, icon: '🔥', color: '#FF4500' },
            { label: 'Best streak', value: gamification.streak, icon: '🏆', color: '#FFD700' },
            { label: 'Total XP', value: gamification.xp.toLocaleString(), icon: '⭐', color: '#8A2BE2' },
            { label: `Lv.${levelInfo.level}`, value: levelInfo.title || 'Beginner', icon: '🏅', color: '#32CD32' }
          ].map((stat, i) => (
            <div key={i} className="card text-center" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
               <span style={{ fontSize: '1.5rem', marginBottom: '8px', color: stat.color }}>{stat.icon}</span>
               <div style={{ fontSize: '2.5rem', fontWeight: 900, fontFamily: 'var(--font-display)', lineHeight: 1 }}>{stat.value}</div>
               <div className="text-muted text-sm mt-2 font-semibold uppercase tracking-wider">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Row 2: Level Progress Bar */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex justify-between items-center mb-3">
            <div className="font-bold text-lg">Level {levelInfo.level} — {levelInfo.title || 'Beginner'}</div>
            <div className="text-sm text-muted">{levelInfo.xpForNext - levelInfo.xpForCurrent} XP to next level</div>
          </div>
          <div style={{ height: '14px', background: '#EEE', borderRadius: 'var(--radius-full)', border: '2px solid #000', overflow: 'hidden' }}>
            <div 
              style={{ 
                width: `${levelInfo.xpProgress}%`, 
                height: '100%', 
                background: 'var(--color-primary-light)', 
                borderRight: '2px solid #000',
                transition: 'width 1s ease-out'
              }} 
            />
          </div>
        </div>

        {/* Row 3: Study Streak Grid */}
        <div className="card" style={{ padding: '1.5rem' }}>
          <div className="flex items-center gap-2 mb-6">
            <span style={{ color: '#FF4500', fontSize: '1.2rem' }}>🔥</span>
            <div className="font-bold text-lg">Study Streak — Last 21 Days</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {getStreakDays().map((day, i) => (
              <div 
                key={i}
                style={{
                  width: '40px',
                  height: '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 'var(--radius-sm)',
                  border: '2px solid #000',
                  background: day.active ? 'rgba(138, 43, 226, 0.1)' : '#F5F5FA',
                  borderColor: day.isToday ? 'var(--color-primary-light)' : '#000',
                  boxShadow: day.isToday ? '0 0 0 2px var(--color-primary-light)' : 'none',
                  fontSize: '0.8rem',
                  fontWeight: 800,
                  color: day.active ? 'var(--color-primary-light)' : '#AAA'
                }}
              >
                {day.num}
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Locked Achievements */}
        <div>
          <div className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
             Unlocked ({unlocked.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
            {unlocked.map(ach => (
              <div key={ach.id} className="card" style={{ padding: '2rem', textAlign: 'center', opacity: 1 }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>{ach.icon}</div>
                <div className="font-bold text-xl mb-1">{ach.title}</div>
                <div className="text-sm text-muted">{ach.description}</div>
              </div>
            ))}
          </div>

          <div className="section-title" style={{ fontSize: '1.8rem', marginBottom: '1.5rem' }}>
             Locked ({locked.length})
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.5rem' }}>
            {locked.map(ach => (
              <div key={ach.id} className="card" style={{ padding: '2rem', textAlign: 'center', background: '#F9F9F9', opacity: 0.6 }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px', filter: 'grayscale(1)' }}>🔒</div>
                <div className="font-bold text-xl mb-1" style={{ textDecoration: 'none' }}>{ach.title}</div>
                <div className="text-sm text-muted">{ach.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 5: Leaderboard */}
        <div className="card" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', width: '100%' }}>
           <h2 className="section-title" style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '2rem' }}>🥇 Class Leaderboard</h2>
           <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {leaderboard.map(entry => (
                <div key={entry.studentId} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '1rem', 
                    padding: '1rem', 
                    border: '2px solid #000', 
                    borderRadius: 'var(--radius-md)',
                    background: entry.isMe ? 'rgba(138, 43, 226, 0.05)' : '#FFF'
                  }}>
                  <div style={{ width: '40px', fontWeight: 900, fontSize: '1.2rem' }}>#{entry.rank}</div>
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: entry.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontWeight: 800, border: '2px solid #000' }}>
                    {entry.name[0]}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-bold" style={{ fontSize: '1.1rem' }}>{entry.name} {entry.isMe && <span className="badge badge-primary" style={{ marginLeft: '8px' }}>YOU</span>}</div>
                    <div className="text-xs text-muted">Streak: {entry.streak} days</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 900, fontSize: '1.2rem' }}>{entry.xp.toLocaleString()}</div>
                    <div className="text-xs uppercase font-bold text-muted">XP</div>
                  </div>
                </div>
              ))}
           </div>
        </div>

      </div>
    </div>
  )
}
