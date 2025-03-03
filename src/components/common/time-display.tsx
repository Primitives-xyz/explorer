import { TimeTooltip } from '@/components/common/time-tooltip'
import { formatTimeAgo } from '@/utils/format-time'
import { normalizeTimestamp } from '@/utils/time'
import { useState } from 'react'

interface TimeDisplayProps {
  timestamp: number
  textColor?: string
  showBackground?: boolean
  className?: string
}

export const TimeDisplay = ({
  timestamp,
  textColor = '',
  showBackground = true,
  className = '',
}: TimeDisplayProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const formattedTime = formatTimeAgo(new Date(normalizeTimestamp(timestamp)))
  const containerClasses = showBackground
    ? 'flex items-center gap-1 px-1.5 py-0.5 bg-green-900/20 rounded border border-green-800/30'
    : 'flex items-center gap-1'

  return (
    <div
      className={`${containerClasses} ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
    >
      <svg
        className="w-3 h-3 "
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <TimeTooltip
        timestamp={normalizeTimestamp(timestamp)}
        isHovered={isHovered}
      >
        <span className={`${textColor} whitespace-nowrap`}>
          {formattedTime}
        </span>
      </TimeTooltip>
    </div>
  )
}
