import { Spinner } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { cn } from '@/utils/utils'

interface Props {
  loading: boolean
  score?: number
  smallView?: boolean
}

export function SolidScoreValue({ loading, score, smallView }: Props) {
  if (loading || score === undefined) {
    return (
      <Spinner className="absolute top-20 left-1/2 -translate-x-1/2 h-fit" />
    )
  }

  return (
    <div
      className={cn(
        {
          'top-17': !smallView,
          'top-18': smallView,
        },
        'items-center flex flex-col justify-center absolute left-1/2 -translate-x-1/2 h-fit'
      )}
    >
      <p
        className={cn({
          'text-5xl': !smallView,
          'text-3xl': smallView,
        })}
      >
        {formatSmartNumber(score, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  )
}
