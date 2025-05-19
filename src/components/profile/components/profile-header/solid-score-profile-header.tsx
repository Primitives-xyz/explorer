import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { SolidScoreLeaderboardDialog } from '@/components/solid-score/leaderboard-dialog'
import { SolidScoreBadges } from '@/components/solid-score/solid-score-badges'
import { SolidScoreRevealButton } from '@/components/solid-score/solid-score-reveal-button'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, ButtonVariant } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useState } from 'react'

interface Props {
  id?: string
}

export function SolidScoreProfileHeader({ id }: Props) {
  const { isLoggedIn, mainProfile, refetch } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ id })
  const [open, setOpen] = useState(false)
  const solidScore = formatSmartNumber(data?.score || 1, {
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
    id === mainProfile?.id
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
      <Button variant={ButtonVariant.BADGE} onClick={() => setOpen(true)}>
        leaderboard
      </Button>
      <SolidScoreLeaderboardDialog
        open={open}
        setOpen={setOpen}
        solidScore={data}
      />
    </div>
  )
}
