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

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="page-title">🏆 Achievements & Gamification</h1>
          <p className="page-subtitle">Track your streaks, earn badges, and compete on the leaderboard</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs mb-6">
        {['overview', 'badges', 'leaderboard'].map(tab => (
          <button
            key={tab}
            className={`tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ fontFamily: 'var(--font-display)', fontWeight: activeTab === tab ? 800 : 600, fontSize: '1.05rem', padding: '12px 24px' }}
          >
            {tab === 'overview' ? '📊 Overview' : tab === 'badges' ? '🏅 Badges' : '🥇 Leaderboard'}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          {/* Hero Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {/* Streak */}
            <div className="card card-primary text-center" style={{ padding: '2rem' }}>
              <div className="streak-flame">🔥</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', fontWeight: 900, background: 'linear-gradient(135deg, hsl(38,92%,55%), hsl(350,80%,58%))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1.1 }}>
                {gamification.streak}
              </div>
              <div className="font-bold" style={{ fontSize: '1.1rem', marginTop: '4px' }}>Day Streak</div>
              <div className="text-xs text-muted mt-1">{gamification.todayDone ? '✅ Studied today' : '⏰ Study today to keep streak!'}</div>
            </div>

            {/* XP / Level */}
            <div className="card text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>⭐</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900, background: 'var(--grad-primary)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                {gamification.xp.toLocaleString()}
              </div>
              <div className="font-bold text-lg mt-1">Total XP</div>
              <div className="badge badge-primary mt-2" style={{ margin: '8px auto 0', display: 'inline-flex' }}>
                Level {levelInfo.level}
              </div>
              <div className="mt-3">
                <div className="flex justify-between text-xs text-muted mb-1">
                  <span>{levelInfo.xpForCurrent} XP</span>
                  <span>{levelInfo.xpForNext} XP</span>
                </div>
                <div className="xp-bar" style={{ height: 8, background: 'var(--bg-surface3)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div className="xp-fill" style={{ width: `${levelInfo.xpProgress}%`, height: '100%' }} />
                </div>
                <div className="text-xs text-muted mt-1">{Math.round(levelInfo.xpProgress)}% to Level {levelInfo.level + 1}</div>
              </div>
            </div>

            {/* Rank */}
            <div className="card text-center" style={{ padding: '2rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>🏆</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', fontWeight: 900, background: 'var(--grad-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                #{gamification.rank}
              </div>
              <div className="font-bold text-lg mt-1">Class Rank</div>
              <div className="text-muted text-sm mt-1">of {gamification.totalStudents} students</div>
              <div className="badge badge-accent mt-2" style={{ margin: '8px auto 0', display: 'inline-flex' }}>
                Top {Math.round((gamification.rank / gamification.totalStudents) * 100)}%
              </div>
            </div>
          </div>

          {/* Recent Badges */}
          <div className="section-title mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>🏅 Recently Earned</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '2rem' }}>
            {gamification.badges.map((badge, idx) => (
              <div key={badge.id} className="card card-accent flex items-center gap-3" style={{ padding: '14px 20px', minWidth: 0, border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
                <span style={{ fontSize: '2.2rem' }}>{badge.badge || '🏅'}</span>
                <div>
                  <div className="text-sm" style={{ fontFamily: 'var(--font-display)', fontWeight: 800 }}>Achievement {idx + 1}</div>
                  <div className="text-xs text-muted mb-1">Badge unlocked</div>
                  <div className="badge badge-accent" style={{ fontSize: '0.65rem' }}>+{badge.xp || 0} XP</div>
                </div>
              </div>
            ))}
          </div>

          {/* Subject Progress */}
          <div className="section-title mb-4" style={{ fontFamily: 'var(--font-display)', fontSize: '1.5rem', fontWeight: 800 }}>📚 Progress by Subject</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjects.map(sub => {
              const topics = (sub.modules || []).flatMap(m => m.topics || [])
              const done = topics.filter(t => (t.status || 'NOT_STARTED') === 'COMPLETED').length
              const pct = topics.length ? Math.round((done / topics.length) * 100) : 0
              return (
                <div key={sub._id} className="card" style={{ padding: '14px 16px' }}>
                  <div className="flex items-center gap-4">
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: sub.color, flexShrink: 0, boxShadow: `0 0 8px ${sub.color}88` }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-semibold truncate">{sub.name}</span>
                        <span className="text-xs font-bold ml-3" style={{ color: sub.color, flexShrink: 0 }}>{done}/{topics.length} · {pct}%</span>
                      </div>
                      <div className="progress-bar-container" style={{ height: 6 }}>
                        <div className="progress-bar" style={{ width: `${pct}%`, background: sub.color }} />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {activeTab === 'badges' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
            {gamification.badges.map(badge => (
              <div
                key={`${badge.badge}-${badge.earnedAt}`}
                className="card badge-card card-accent"
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span className="badge-icon">{badge.badge || '🏅'}</span>
                </div>
                <div className="font-bold text-sm">Achievement</div>
                <div className="text-xs text-muted text-center">Earned at {new Date(badge.earnedAt).toLocaleDateString()}</div>
                <span className="badge badge-success">+{badge.xp || 0} XP earned</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <div className="card">
            <div className="section-title mb-4">🥇 Class Leaderboard</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {leaderboard.map(entry => (
                <div
                  key={entry.studentId}
                  className="leaderboard-item"
                  style={{
                    background: entry.isMe ? 'hsl(250,84%,62%,0.08)' : 'transparent',
                    border: entry.isMe ? '1px solid hsl(250,84%,62%,0.2)' : '1px solid transparent',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div className={`leaderboard-rank ${entry.rank <= 3 ? `rank-${entry.rank}` : 'rank-other'}`}>
                    {entry.rank <= 3 ? (entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : '🥉') : `#${entry.rank}`}
                  </div>
                  <div className="avatar" style={{ background: entry.color }}>
                    {entry.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div className="font-semibold text-sm">{entry.name} {entry.isMe && <span className="badge badge-primary" style={{ fontSize: '0.6rem' }}>YOU</span>}</div>
                    <div className="text-xs text-muted">🔥 {entry.streak} day streak</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold" style={{ color: 'hsl(38,92%,65%)' }}>{entry.xp.toLocaleString()}</div>
                    <div className="text-xs text-muted">XP</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
