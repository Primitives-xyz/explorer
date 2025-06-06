import { SolidScoreBadges } from '@/components/solid-score/components/solid-score-badges'
import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  profileId: string
}

export function SolidScoreProfileHeader({ profileId }: Props) {
  const { mainProfile, loading: currentWalletLoading } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({
    profileId,
  })
  const solidScore = formatSmartNumber(data?.score || '0', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const loading = currentWalletLoading || scoreLoading

  if (!data || loading || !mainProfile?.userRevealedTheSolidScore) {
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
