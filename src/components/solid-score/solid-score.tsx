import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { ScoreArc } from '@/components/solid-score/score-arc'
import { SolidScoreBadges } from '@/components/solid-score/solid-score-badges'
import { SolidScoreCardWrapper } from '@/components/solid-score/solid-score-card-wrapper'
import { SolidScoreRevealButton } from '@/components/solid-score/solid-score-reveal-button'
import { SolidScoreValue } from '@/components/solid-score/solid-score-value'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Spinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'

export function SolidScore() {
  const {
    mainProfile,
    refetch,
    loading: currentWalletLoading,
  } = useCurrentWallet()

  const {
    data,
    loading: scoreLoading,
    error,
  } = useSolidScore({ id: mainProfile?.id })

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

  const hasRevealed = !!mainProfile?.userRevealedTheSolidScore

  if (error) {
    return null
  }

  return (
    <SolidScoreCardWrapper displayScore={hasRevealed}>
      {currentWalletLoading ? (
        <Spinner className="m-auto" />
      ) : hasRevealed ? (
        <div className="flex flex-col justify-center">
          <div className="h-[100px] w-full">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full">
              {!scoreLoading && (
                <ScoreArc
                  score={Number(data?.score || 1)}
                  loading={scoreLoading}
                />
              )}
            </div>
            <SolidScoreValue
              loading={scoreLoading}
              score={data?.score}
              smallView
            />
          </div>
          <SolidScoreBadges data={data} smallView />
        </div>
      ) : (
        <SolidScoreRevealButton
          onClick={handleRevealClick}
          loading={updateProfileLoading}
        />
      )}
    </SolidScoreCardWrapper>
  )
}
