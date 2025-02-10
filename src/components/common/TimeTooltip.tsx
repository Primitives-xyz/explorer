import { type ReactNode } from 'react'
import { PortalTooltip } from './PortalTooltip'

interface TimeTooltipProps {
  timestamp: number
  children: ReactNode
  isHovered: boolean
}

export const TimeTooltip = ({ timestamp, children, isHovered }: TimeTooltipProps) => {
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
    <PortalTooltip isVisible={isHovered} content={fullDate}>
      {children}
    </PortalTooltip>
  )
}
