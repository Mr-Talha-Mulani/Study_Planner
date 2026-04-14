import { useState, useEffect } from 'react'
import { getCountdown } from '../utils/helpers'

export default function CountdownTimer({ targetDate, label = 'Exam', size = 'md' }) {
  const [countdown, setCountdown] = useState(getCountdown(targetDate))

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(getCountdown(targetDate))
    }, 1000)
    return () => clearInterval(interval)
  }, [targetDate])

  if (countdown.expired && countdown.invalid) {
    return (
      <div className="text-center" style={{ color: 'var(--text-muted)' }}>
        <div style={{ fontSize: '0.85rem' }}>📅 No exam date set</div>
      </div>
    )
  }

  if (countdown.expired) {
    return (
      <div className="text-center">
        <div className="text-danger font-bold" style={{ fontSize: size === 'lg' ? '1.5rem' : '1rem' }}>
          🔴 {label} is Today!
        </div>
      </div>
    )
  }

  const units = [
    { value: countdown.days, label: 'Days' },
    { value: countdown.hours, label: 'Hrs' },
    { value: countdown.minutes, label: 'Min' },
    { value: countdown.seconds, label: 'Sec' },
  ]

  return (
    <div>
      {label && (
        <div className="text-xs font-semibold text-muted mb-2" style={{ textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          ⏰ {label} Countdown
        </div>
      )}
      <div className="countdown-grid">
        {units.map((unit) => (
          <div key={unit.label} className="countdown-unit">
            <span className="countdown-digit" style={{
              fontSize: size === 'lg' ? '3rem' : size === 'sm' ? '1.5rem' : '2.5rem'
            }}>
              {String(unit.value).padStart(2, '0')}
            </span>
            <div className="countdown-label">{unit.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
