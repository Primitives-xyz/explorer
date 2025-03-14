import { cn, mapEmpty } from '../../utils/utils'
import { ScrollingTextItem } from './scrolling-text-item'

export interface Props {
  copies: string[]
  duration?: number
  className?: string
  rowClassName?: string
}

export function ScrollingText({
  copies,
  duration,
  className,
  rowClassName,
}: Props) {
  return (
    <div
      className={cn(
        'overflow-hidden whitespace-nowrap relative fade-out-text',
        className,
      )}
    >
      {mapEmpty(4, (index) => (
        <ScrollingTextItem
          key={index}
          copies={copies}
          duration={duration}
          className={rowClassName}
        />
      ))}
    </div>
  )
}
