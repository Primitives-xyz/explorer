function interpolateColor(
  color1: string,
  color2: string,
  factor: number
): string {
  const c1 = parseInt(color1.slice(1), 16)
  const c2 = parseInt(color2.slice(1), 16)

  const r1 = (c1 >> 16) & 0xff
  const g1 = (c1 >> 8) & 0xff
  const b1 = c1 & 0xff

  const r2 = (c2 >> 16) & 0xff
  const g2 = (c2 >> 8) & 0xff
  const b2 = c2 & 0xff

  const r = Math.round(r1 + (r2 - r1) * factor)
  const g = Math.round(g1 + (g2 - g1) * factor)
  const b = Math.round(b1 + (b2 - b1) * factor)

  return `rgb(${r}, ${g}, ${b})`
}

export function ScoreArc({
  score,
  loading,
}: {
  score: number
  loading: boolean
}) {
  const radius = 100

  const startColor = '#a75a51'
  const endColor = '#49d77c'

  return (
    <svg viewBox="0 0 300 160">
      <defs>
        <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={startColor} />
          <stop offset="100%" stopColor={endColor} />
        </linearGradient>

        <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <path
        d="M 50 150 A 100 100 0 0 1 250 150"
        fill="none"
        stroke="url(#scoreGradient)"
        strokeWidth="8"
      />

      {!loading &&
        (() => {
          const clampedScore = Math.max(0, Math.min(1000, score))
          const t = clampedScore / 1000
          const angleDeg = 180 - t * 180
          const angleRad = (angleDeg * Math.PI) / 180

          const cursorX = 150 + radius * Math.cos(angleRad)
          const cursorY = 150 - radius * Math.sin(angleRad)

          const cursorColor = interpolateColor(startColor, endColor, t)

          return (
            <circle
              cx={cursorX}
              cy={cursorY}
              r="8"
              fill={cursorColor}
              filter="url(#glow)"
            />
          )
        })()}
    </svg>
  )
}
