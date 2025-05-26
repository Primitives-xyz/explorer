import { SolidScoreBadges } from '@/components/solid-score/components/solid-score-badges'
import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { formatSmartNumber } from '@/utils/formatting/format-number'

interface Props {
  id?: string
}

export function SolidScoreProfileHeader({ id }: Props) {
  const { data, loading: scoreLoading } = useSolidScore({ id })
  const solidScore = formatSmartNumber(data?.score || '0', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  if (!data || scoreLoading) {
    return null
  }

  return (
    <div className="flex items-center gap-1">
      <p className="text-primary font-bold">SOLID Score: {solidScore}</p>
      <span className="desktop">
        <SolidScoreBadges data={data} compactLimit={3} />
      </span>
    </div>
  )
}
