import { ReactNode } from 'react'
import { cn } from '../../utils/utils'

interface Props {
  entries: ReactNode[]
  duration?: number // seconds
  className?: string
}

export function ScrollingTextItem({
  entries,
  duration = 10,
  className,
}: Props) {
  return (
    <div
      className={cn(
        'inline-block animate-infinite-scroll-content space-x-4',
        className
      )}
      style={{
        animationDuration: duration + 's',
      }}
    >
      {entries.map((entry, index) => (
        <div key={index} className="inline-block">
          {entry}
        </div>
      ))}
    </div>
  )
}
