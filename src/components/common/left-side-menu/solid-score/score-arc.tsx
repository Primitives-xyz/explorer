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
  const centerX = 150
  const centerY = 150

  const startColor = '#ff9999'
  const endColor = '#82d89c'
  const trackColor = 'hsl(var(--muted))'

  const clampedScore = Math.max(0, Math.min(1000, score))
  const t = clampedScore / 1000
  const angleDeg = 180 * t

  const describeArc = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(centerX, centerY, radius, endAngle)
    const end = polarToCartesian(centerX, centerY, radius, startAngle)

    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0

    return [
      'M',
      start.x,
      start.y,
      'A',
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      end.x,
      end.y,
    ].join(' ')
  }

  function polarToCartesian(
    cx: number,
    cy: number,
    r: number,
    angleInDegrees: number
  ) {
    const angleInRadians = ((angleInDegrees - 180) * Math.PI) / 180.0
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    }
  }

  const cursorAngle = 180 - angleDeg
  const cursorRad = (cursorAngle * Math.PI) / 180
  const cursorX = centerX + radius * Math.cos(cursorRad)
  const cursorY = centerY - radius * Math.sin(cursorRad)
  const cursorColor = interpolateColor(startColor, endColor, t)

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
        d={describeArc(0, 180)}
        fill="none"
        stroke={trackColor}
        strokeWidth="13"
        strokeLinecap="round"
      />

      <path
        d={describeArc(0, angleDeg)}
        fill="none"
        stroke="url(#scoreGradient)"
        strokeWidth="13"
        strokeLinecap="round"
      />

      {!loading && (
        <circle
          cx={cursorX}
          cy={cursorY}
          r="10"
          fill={cursorColor}
          filter="url(#glow)"
        />
      )}
    </svg>
  )
}
