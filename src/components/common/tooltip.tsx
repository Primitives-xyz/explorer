'use client'

import { type ReactNode, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  content: string
  children: ReactNode
}

const TooltipPortal = ({
  content,
  isHovered,
  tooltipRef,
}: {
  content: string
  isHovered: boolean
  tooltipRef: React.RefObject<HTMLDivElement | null>
}) => {
  return createPortal(
    <div
      ref={tooltipRef}
      className={`${
        isHovered ? 'opacity-100' : 'opacity-0'
      } fixed transform -translate-x-1/2 -translate-y-full mt-1 px-2 py-1 text-xs bg-green-900/90 rounded border border-green-800/50 whitespace-nowrap z-[9999] pointer-events-none transition-opacity duration-200`}
      style={{
        left: 'var(--tooltip-x)',
        top: 'var(--tooltip-y)',
      }}
      role="tooltip"
      aria-hidden={!isHovered}
    >
      {content}
    </div>,
    document.body
  )
}

export const Tooltip = ({ content, children }: TooltipProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isHovered && containerRef.current && tooltipRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const topY = rect.top - 8

      tooltipRef.current.style.setProperty('--tooltip-x', `${centerX}px`)
      tooltipRef.current.style.setProperty('--tooltip-y', `${topY}px`)
    }
  }, [isHovered])

  return (
    <>
      <div
        ref={containerRef}
        className="inline-block"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        role="tooltip"
        tabIndex={0}
        aria-label={content}
      >
        {children}
      </div>
      <TooltipPortal
        content={content}
        isHovered={isHovered}
        tooltipRef={tooltipRef}
      />
    </>
  )
}
