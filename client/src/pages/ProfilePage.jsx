import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store'
import { getInitials, stringToColor } from '../utils/helpers'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  
  const [stats, setStats] = useState(null)
  const [materials, setMaterials] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const [gamRes, matRes, anRes] = await Promise.allSettled([
          user?.role === 'STUDENT' ? import('../api').then(m => m.gamificationAPI.getStats()) : Promise.resolve(null),
          import('../api').then(m => m.materialsAPI.getMyUploads()),
          user?.role === 'STUDENT' ? import('../api').then(m => m.analyticsAPI.getStudentDashboard()) : Promise.resolve(null)
        ])

        if (gamRes.status === 'fulfilled' && gamRes.value) {
          setStats(gamRes.value.data.status)
        }
        if (matRes.status === 'fulfilled' && matRes.value) {
          setMaterials(matRes.value.data.materials || [])
        }
        if (anRes.status === 'fulfilled' && anRes.value) {
          setAnalytics(anRes.value.data.summary)
        }
      } catch (err) {
        console.error("Profile fetch error:", err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProfileData()
  }, [user])

  const handleLogout = () => {
    toast.success('Signed out successfully')
    logout()
    navigate('/login')
  }

  if (loading) {
    return <div className="page-container"><div className="text-center mt-20 fade-in">Loading profile...</div></div>
  }

  const avatarColor = stringToColor(user?.name || 'User')
  const initials = getInitials(user?.name || 'User')

  return (
    <div className="page-container fade-in">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="page-title">👤 My Profile</h1>
          <p className="page-subtitle">Manage your account and view your overall records</p>
        </div>
        <button className="btn btn-danger" onClick={handleLogout}>
          🚪 Sign Out
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
        {/* Left Column - User Info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card text-center" style={{ padding: '2rem' }}>
            <div 
              className="mx-auto" 
              style={{
                width: 100, 
                height: 100, 
                borderRadius: '50%', 
                background: avatarColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2.5rem',
                fontWeight: 'bold',
                color: '#fff',
                marginBottom: '1rem',
                boxShadow: `0 8px 24px ${avatarColor}66`
              }}
            >
              {initials}
            </div>
            <h2 className="text-xl font-bold mb-1">{user?.name}</h2>
            <div className="text-sm text-muted mb-4">{user?.email}</div>
            
            <span className="badge badge-primary mb-2 mx-auto uppercase">
               {user?.role}
            </span>
            {user?.institution && (
              <div className="text-sm mt-3 border-t border-subtle pt-3 text-secondary">
                🏛️ {user.institution}
              </div>
            )}
          </div>

          {user?.role === 'STUDENT' && stats && (
            <div className="card">
              <div className="section-title mb-4">⭐ Quick Stats</div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted">Total XP</span>
                <span className="font-bold text-accent">{stats.xp}</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted">Current Streak</span>
                <span className="font-bold" style={{ color: 'hsl(38,92%,55%)' }}>{stats.streak} days 🔥</span>
              </div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm text-muted">Topics Completed</span>
                <span className="font-bold text-success">{analytics?.completedTopics || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted">Hours Studied</span>
                <span className="font-bold text-primary">{analytics?.totalHoursStr || '0h'}</span>
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Badges & Uploads */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          {/* Badges Section */}
          {user?.role === 'STUDENT' && (
            <div className="card">
              <div className="section-title mb-4">🏆 My Achievements</div>
              <div className="flex flex-wrap gap-6" style={{ justifyContent: 'center' }}>
                {(stats?.badges || []).length > 0 ? (
                  (stats?.badges || []).map((badge, idx) => (
                    <div key={idx} className="text-center" style={{ width: 100 }}>
                      <div className="card" style={{ 
                        padding: '1rem', 
                        marginBottom: '8px', 
                        fontSize: '2rem', 
                        background: 'var(--bg-surface)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        aspectRatio: '1/1'
                      }}>
                        {badge.badge === 'Topper' ? '👑' : 
                         badge.badge === '7 Day Streak' ? '🔥' : 
                         badge.badge === 'PYQ Master' ? '📝' : 
                         badge.badge === 'Consistent Learner' ? '📅' : '🏅'}
                      </div>
                      <div className="text-xs font-bold" style={{ lineHeight: 1.2 }}>{badge.badge}</div>
                      <div className="text-[10px] text-muted">+{badge.xp} XP</div>
                    </div>
                  ))
                ) : (
                  <div className="text-muted text-sm w-full text-center p-4">No achievements earned yet. Start studying to unlock them!</div>
                )}
              </div>
            </div>
          )}

          {/* Uploads Section (Teachers Only) */}
          {user?.role === 'TEACHER' && (
            <div className="card">
              <div className="section-title mb-4">📁 Your Uploaded Materials</div>
              {materials.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {materials.map(mat => (
                    <div 
                      key={mat._id} 
                      className="flex justify-between items-center"
                      style={{ 
                        padding: '12px', 
                        background: 'var(--bg-surface2)', 
                        borderRadius: 'var(--radius-md)',
                        border: '2px solid #000'
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {mat.fileType === 'pdf' ? '📄' : mat.fileType === 'pptx' ? '📊' : '📃'}
                        </span>
                        <div>
                          <div className="text-sm font-semibold">{mat.originalName}</div>
                          <div className="text-xs text-muted">
                            {mat.subjectId?.name || 'Unknown Subject'} • {(mat.fileSize / 1024 / 1024).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <div className="text-xs text-muted">
                        {new Date(mat.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-muted text-sm w-full text-center p-6 bg-surface2 rounded-lg border-2 border-dashed border-black">
                  You haven't uploaded any materials yet.
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
