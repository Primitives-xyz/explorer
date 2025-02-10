import { type ReactNode, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

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

  useEffect(() => {
    if (isHovered && containerRef.current && tooltipRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const topY = rect.top - 8 // Add extra offset to ensure it's above the navigation

      tooltipRef.current.style.setProperty('--tooltip-x', `${centerX}px`)
      tooltipRef.current.style.setProperty('--tooltip-y', `${topY}px`)
    }
  }, [isHovered])

  return (
    <>
      <div
        ref={containerRef}
        className="inline-block"
        role="tooltip"
        tabIndex={0}
        aria-label={`Full timestamp: ${fullDate}`}
      >
        {children}
      </div>
      {typeof document !== 'undefined' &&
        createPortal(
          <div
            ref={tooltipRef}
            className={`${
              isHovered ? 'opacity-100' : 'opacity-0'
            } fixed transform -translate-x-1/2 -translate-y-full mt-1 px-2 py-1 text-xs bg-green-900/90 text-green-100 rounded border border-green-800/50 whitespace-nowrap z-[99999999] pointer-events-none transition-opacity duration-200`}
            style={{
              left: 'var(--tooltip-x)',
              top: 'var(--tooltip-y)',
            }}
            role="tooltip"
            aria-hidden={!isHovered}
          >
            {fullDate}
          </div>,
          document.body,
        )}
    </>
  )
}
