import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div
      className={`bg-black/40 backdrop-blur-sm border border-green-900/50 rounded-lg shadow-lg shadow-green-900/10 ${className}`}
    >
      {children}
    </div>
  )
}
