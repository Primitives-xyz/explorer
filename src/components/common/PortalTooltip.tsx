import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface PortalTooltipProps {
  children: ReactNode
  isVisible: boolean
  content: ReactNode
}

export const PortalTooltip = ({ children, isVisible, content }: PortalTooltipProps) => {
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isVisible && containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top
      })
    }
  }, [isVisible])

  if (typeof document === 'undefined') return <>{children}</>

  return (
    <div className="relative inline-block" ref={containerRef}>
      {children}
      {isVisible &&
        createPortal(
          <div 
            className="fixed px-2 py-1 text-xs bg-green-900/90 text-green-100 rounded border border-green-800/50 whitespace-nowrap"
            style={{
              transform: 'translate(-50%, -100%)',
              marginBottom: '0.5rem',
              left: position.x,
              top: position.y
            }}
            role="tooltip"
          >
            {content}
          </div>,
          document.body
        )}
    </div>
  )
}
