import { calcPanicLevel } from '../utils/helpers'

export default function PanicMeter({ daysUntilExam, completionPercent, examName = 'Exam' }) {
  // Guard against invalid inputs
  const safeDays = (daysUntilExam === null || daysUntilExam === undefined || isNaN(daysUntilExam)) ? 999 : daysUntilExam
  const safePct = (completionPercent === null || completionPercent === undefined || isNaN(completionPercent)) ? 0 : completionPercent
  const panic = calcPanicLevel(safeDays, safePct)
  const noExamSet = daysUntilExam === null || daysUntilExam === undefined
  const arcRadius = 80
  const arcStroke = 12
  const circumference = Math.PI * arcRadius // Half circle
  const offset = circumference - (panic.score / 100) * circumference

  const getColor = () => {
    if (panic.level === 'safe') return '#22c55e'
    if (panic.level === 'caution') return '#eab308'
    if (panic.level === 'warning') return '#f97316'
    if (panic.level === 'danger') return '#ef4444'
    return '#dc2626'
  }

  const color = getColor()

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Arc Gauge */}
      <div style={{ position: 'relative', width: 200, height: 110 }}>
        <svg width="200" height="110" viewBox="0 0 200 110">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke="var(--bg-surface3)"
            strokeWidth={arcStroke}
            strokeLinecap="round"
          />
          {/* Progress arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={color}
            strokeWidth={arcStroke}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{
              transition: 'stroke-dashoffset 0.8s ease, stroke 0.5s ease',
              filter: `drop-shadow(0 0 8px ${color}88)`
            }}
          />
          {/* Center value */}
          <text x="100" y="90" textAnchor="middle" fill={color} fontSize="28" fontWeight="800" fontFamily="Outfit, Inter, sans-serif">
            {panic.score}
          </text>
          <text x="100" y="108" textAnchor="middle" fill="var(--text-muted)" fontSize="10" fontWeight="600">
            PANIC SCORE
          </text>
        </svg>
      </div>

      {/* Status label */}
      <div style={{
        fontSize: '0.9rem',
        fontWeight: 700,
        color,
        textAlign: 'center',
        padding: '6px 16px',
        borderRadius: '999px',
        background: `${color}18`,
        border: `1px solid ${color}33`,
        animation: panic.level === 'critical' ? 'pulse 1.5s infinite' : 'none'
      }}>
        {panic.label}
      </div>

      {/* Details */}
      <div className="text-center">
        <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          {noExamSet ? (
            <span style={{ color: 'var(--text-muted)' }}>No exam date set</span>
          ) : (
            <>
              <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{daysUntilExam}</span> days to {examName}
            </>
          )}
          <span style={{ margin: '0 8px', color: 'var(--text-muted)' }}>•</span>
          <span style={{ color: 'var(--color-accent-light)', fontWeight: 600 }}>{safePct}%</span> done
        </div>
      </div>
    </div>
  )
}
