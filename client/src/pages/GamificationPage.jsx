import { useState } from 'react'
import { MOCK_GAMIFICATION, MOCK_LEADERBOARD, MOCK_SUBJECTS } from '../utils/mockData'
import { calcLevel } from '../utils/helpers'
import { useAuthStore } from '../store'

export default function GamificationPage() {
  const { user } = useAuthStore()
  const gamification = MOCK_GAMIFICATION
  const leaderboard = MOCK_LEADERBOARD
  const subjects = MOCK_SUBJECTS
  const [activeTab, setActiveTab] = useState('overview')

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
          <div className="section-title mb-4">🏅 Recently Earned</div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
            {gamification.badges.filter(b => b.earned).map(badge => (
              <div key={badge.id} className="card card-accent flex items-center gap-3" style={{ padding: '12px 16px', minWidth: 0 }}>
                <span style={{ fontSize: '1.8rem' }}>{badge.icon}</span>
                <div>
                  <div className="text-sm font-bold">{badge.name}</div>
                  <div className="text-xs text-muted">{badge.description}</div>
                  <div className="text-xs mt-1" style={{ color: 'hsl(38,92%,65%)' }}>+{badge.xp} XP</div>
                </div>
              </div>
            ))}
          </div>

          {/* Subject Progress */}
          <div className="section-title mb-4">📚 Progress by Subject</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {subjects.map(sub => {
              const topics = sub.modules.flatMap(m => m.topics)
              const done = topics.filter(t => t.status === 'COMPLETED').length
              const pct = Math.round((done / topics.length) * 100)
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
                key={badge.id}
                className={`card badge-card ${badge.earned ? 'card-accent' : ''}`}
                style={{ opacity: badge.earned ? 1 : 0.5 }}
              >
                <div style={{ position: 'relative', display: 'inline-block' }}>
                  <span className="badge-icon">{badge.icon}</span>
                  {!badge.earned && (
                    <span style={{ position: 'absolute', top: -4, right: -4, fontSize: '1rem' }}>🔒</span>
                  )}
                </div>
                <div className="font-bold text-sm">{badge.name}</div>
                <div className="text-xs text-muted text-center">{badge.description}</div>
                {badge.earned ? (
                  <span className="badge badge-success">+{badge.xp} XP earned</span>
                ) : (
                  <span className="badge badge-primary">{badge.xp} XP reward</span>
                )}
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
