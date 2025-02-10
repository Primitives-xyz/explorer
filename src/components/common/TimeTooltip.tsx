import type { ReactNode } from 'react'

interface TimeTooltipProps {
  timestamp: number
  children: ReactNode
}

export const TimeTooltip = ({ timestamp, children }: TimeTooltipProps) => {
  const date = new Date(timestamp)
  const fullDate = date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short'
  })

  return (
    <div className="group relative inline-block">
      {children}
      <div className="invisible group-hover:visible absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs bg-green-900/90 text-green-100 rounded border border-green-800/50 whitespace-nowrap">
        {fullDate}
      </div>
    </div>
  )
}
