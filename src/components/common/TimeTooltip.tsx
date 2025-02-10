import { type ReactNode } from 'react'

interface TimeTooltipProps {
  timestamp: number
  children: ReactNode
  isHovered: boolean
}

export const TimeTooltip = ({
  timestamp,
  children,
  isHovered,
}: TimeTooltipProps) => {
  const date = new Date(timestamp)
  const fullDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  })

  return (
    <div
      className="relative inline-block"
      role="tooltip"
      tabIndex={0}
      aria-label={`Full timestamp: ${fullDate}`}
    >
      {children}
      <div
        className={`${
          isHovered ? 'opacity-100' : 'opacity-0'
        } absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs bg-green-900/90 text-green-100 rounded border border-green-800/50 whitespace-nowrap z-[999999] pointer-events-none transition-opacity duration-200`}
        role="tooltip"
        aria-hidden={!isHovered}
      >
        {fullDate}
      </div>
    </div>
  )
}
