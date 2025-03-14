import { cn } from '../../utils/utils'

interface Props {
  copies: string[]
  duration?: number // seconds
  className?: string
}

export function ScrollingTextItem({ copies, duration = 10, className }: Props) {
  return (
    <div
      className={cn(
        'inline-block animate-infinite-scroll-content space-x-4',
        className,
      )}
      style={{
        animationDuration: duration + 's',
      }}
    >
      {copies.map((text, index) => (
        <span key={index} className="inline-block">
          {text}
        </span>
      ))}
    </div>
  )
}
