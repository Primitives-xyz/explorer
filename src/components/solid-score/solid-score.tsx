import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { ScoreArc } from '@/components/solid-score/score-arc'
import { SolidScoreSmartCta } from '@/components/solid-score/smart-cta/solid-score-smart-cta'
import { SolidScoreBadges } from '@/components/solid-score/solid-score-badges'
import { SolidScoreCardWrapper } from '@/components/solid-score/solid-score-card-wrapper'
import { SolidScoreValue } from '@/components/solid-score/solid-score-value'
import { Button, ButtonVariant, Spinner } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'

export function SolidScore() {
  const {
    mainProfile,
    refetch,
    loading: currentWalletLoading,
  } = useCurrentWallet()

  const t = useTranslations('menu')

  const {
    data,
    loading: scoreLoading,
    error,
  } = useSolidScore({ id: mainProfile?.id })

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
          <Button
            variant={ButtonVariant.BADGE}
            href={route('leaderboard')}
            className="mt-4"
          >
            {t('solid_score.see_your_rank')}
          </Button>
        </div>
      ) : (
        <SolidScoreSmartCta simpleRevealButton />
      )}
    </SolidScoreCardWrapper>
  )
}
