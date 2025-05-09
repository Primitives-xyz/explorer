import { useSolidScore } from '@/components/common/hooks/use-solid-score'
import { SolidScoreBadges } from '@/components/common/left-side-menu/solid-score/solid-score-badges'
import { SolidScoreRevealButton } from '@/components/common/left-side-menu/solid-score/solid-score-reveal-button'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'

interface Props {
  walletAddress?: string
}

export function SolidScoreProfileHeader({ walletAddress }: Props) {
  const {
    isLoggedIn,
    mainProfile,
    walletAddress: mainWalletAddress,
    refetch,
  } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ walletAddress })

  const solidScore = formatSmartNumber(data?.solidUser.solidScore || 1, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const { updateProfile, loading: updateProfileLoading } = useUpdateProfile({
    username: mainProfile?.username || '',
  })

  const handleRevealClick = async () => {
    await updateProfile({
      properties: [
        {
          key: 'userRevealedTheSolidScore',
          value: true,
        },
      ],
    })
    refetch()
  }

  if (!data || scoreLoading) {
    return null
  }

  if (
    isLoggedIn &&
    !mainProfile?.userRevealedTheSolidScore &&
    walletAddress === mainWalletAddress
  ) {
    return (
      <SolidScoreRevealButton
        onClick={handleRevealClick}
        loading={updateProfileLoading}
        smallView
      />
    )
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
