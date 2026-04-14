import { useState, useEffect } from 'react'

export default function PomodoroTimer({ topicId, topicTitle }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [isActive, setIsActive] = useState(false)
  const [isBreak, setIsBreak] = useState(false)

  useEffect(() => {
    let interval = null
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(t => t - 1), 1000)
    } else if (timeLeft === 0) {
      // Switch modes
      if (!isBreak) {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{})
        setIsBreak(true)
        setTimeLeft(5 * 60)
      } else {
        new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3').play().catch(()=>{})
        setIsBreak(false)
        setTimeLeft(25 * 60)
        setIsActive(false)
      }
    }
    return () => clearInterval(interval)
  }, [isActive, timeLeft, isBreak])

  const toggle = () => setIsActive(!isActive)
  
  const reset = () => {
    setIsActive(false)
    setIsBreak(false)
    setTimeLeft(25 * 60)
  }

  const mins = Math.floor(timeLeft / 60).toString().padStart(2, '0')
  const secs = (timeLeft % 60).toString().padStart(2, '0')

  const isRunning = isActive || isBreak || timeLeft !== 25 * 60; // if it's started or paused but not fully reset

  const widgetContent = (
    <div className={`card ${isRunning ? 'floating-timer' : ''}`} style={isRunning ? { 
      background: isBreak ? 'var(--grad-accent)' : 'var(--grad-primary)', 
      color: 'white', 
      border: 'none', 
      padding: '32px',
      width: '320px',
      boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
      zIndex: 10000,
      position: 'relative'
    } : { background: 'var(--bg-surface2)', padding: '16px', border: '1px solid var(--border-subtle)' }}>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-sm" style={{ color: isRunning ? 'white' : 'var(--text-primary)' }}>🍅 Pomodoro {isBreak ? 'Break' : 'Focus'}</span>
        {isRunning && <button onClick={reset} style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '4px', fontSize: '0.75rem', color: 'white', border: 'none', cursor: 'pointer' }}>Kill</button>}
      </div>
      <div style={{ fontSize: isRunning ? '4rem' : '2.5rem', fontWeight: 800, textAlign: 'center', margin: '10px 0', fontFamily: 'monospace', color: isRunning ? 'white' : 'var(--text-primary)' }}>
        {mins}:{secs}
      </div>
      {topicTitle && (
        <div className="text-center text-xs opacity-90 mb-4 truncate" style={{ color: isRunning ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)' }}>
          Focusing on: {topicTitle}
        </div>
      )}
      <button 
        onClick={toggle}
        className="btn"
        style={isRunning ? { width: '100%', padding: '12px', background: 'white', color: isBreak ? 'var(--color-accent)' : 'var(--color-primary)', fontWeight: 800, borderRadius: '8px', border: 'none', cursor: 'pointer', fontSize: '1.1rem' } : { width: '100%' }}
      >
        {isActive ? 'Pause' : 'Start Focus Session'}
      </button>
    </div>
  )

  return (
    <>
      {!isRunning && widgetContent}
      {isRunning && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fade-in 0.2s ease-out'
        }}>
          {widgetContent}
        </div>
      )}
    </>
  )
}
