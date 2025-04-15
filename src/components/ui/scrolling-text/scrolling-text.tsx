import { cn, mapEmpty } from '@/utils/utils'
import { ReactNode } from 'react'
import { ScrollingTextItem } from './scrolling-text-item'

export interface Props {
  entries: ReactNode[]
  duration?: number
  className?: string
  rowClassName?: string
}

export function ScrollingText({
  entries,
  duration,
  className,
  rowClassName,
}: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden whitespace-nowrap relative fade-out-text-small',
        className
      )}
    >
      {mapEmpty(2, (index) => (
        <ScrollingTextItem
          key={index}
          entries={entries}
          duration={duration}
          className={rowClassName}
        />
      ))}
    </div>
  )
}
