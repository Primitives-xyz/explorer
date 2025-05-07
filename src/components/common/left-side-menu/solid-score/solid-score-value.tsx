import { Spinner } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'

export function SolidScoreValue({
  loading,
  score,
}: {
  loading: boolean
  score?: number
}) {
  if (loading || score === undefined) {
    return (
      <Spinner className="absolute top-20 left-1/2 -translate-x-1/2 h-fit" />
    )
  }

  return (
    <div className="items-center flex flex-col justify-center absolute top-18 left-1/2 -translate-x-1/2 h-fit">
      <p className="text-3xl">
        {formatSmartNumber(score, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  )
}
