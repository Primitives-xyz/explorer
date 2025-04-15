import { cn, randomIntInRange } from '@/utils/utils'

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  randomWidthRange?: {
    min: number
    max: number
  }
  randomHeightRange?: {
    min: number
    max: number
  }
}

function Skeleton({
  className,
  randomWidthRange,
  randomHeightRange,
  ...props
}: Props) {
  let calculatedWidth = 0
  let calculatedHeight = 0

  if (randomWidthRange) {
    calculatedWidth = randomIntInRange(
      randomWidthRange.min,
      randomWidthRange.max
    )
  }

  if (randomHeightRange) {
    calculatedHeight = randomIntInRange(
      randomHeightRange.min,
      randomHeightRange.max
    )
  }

  return (
    <div
      className={cn('animate-pulse rounded bg-muted', className)}
      style={{
        width: calculatedWidth ? `${calculatedWidth}px` : undefined,
        height: calculatedHeight ? `${calculatedHeight}px` : undefined,
      }}
      {...props}
    />
  )
}

export { Skeleton }
