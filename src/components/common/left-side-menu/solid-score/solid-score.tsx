import { useSolidScore } from '@/components/common/hooks/use-solid-score'
import { ScoreArc } from '@/components/common/left-side-menu/solid-score/score-arc'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Spinner,
} from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn } from '@/utils/utils'
import { Eye, Share } from 'lucide-react'

export function SolidScore() {
  const {
    walletAddress,
    mainProfile,
    refetch,
    loading: currentWalletLoading,
  } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ walletAddress })

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

  return (
    <SolidScoreCardWrapper displayScore={hasRevealed}>
      {currentWalletLoading ? (
        <Spinner className="m-auto" />
      ) : hasRevealed ? (
        <>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full">
            <ScoreArc
              score={Number(data?.solidUser.solidScore || 1)}
              loading={scoreLoading}
            />
          </div>
          <SolidScoreValue
            loading={scoreLoading}
            score={data?.solidUser.solidScore}
          />
        </>
      ) : (
        <SolidScoreRevealButton
          onClick={handleRevealClick}
          loading={updateProfileLoading}
        />
      )}
    </SolidScoreCardWrapper>
  )
}

function SolidScoreCardWrapper({
  children,
  displayScore,
}: {
  children: React.ReactNode
  displayScore: boolean
}) {
  return (
    <Card className="border-primary">
      <CardHeader>
        <CardTitle className="text-primary font-bold flex items-center justify-between">
          {displayScore ? 'Your SOLID Score' : 'Reveal Your SOLID Score'}
          {displayScore && <Share size={16} />}
        </CardTitle>
      </CardHeader>
      <CardContent
        className={cn(
          {
            'h-[150px]': displayScore,
            'h-auto': !displayScore,
          },
          'flex flex-col relative w-full'
        )}
      >
        {children}
      </CardContent>
    </Card>
  )
}

function SolidScoreValue({
  loading,
  score,
}: {
  loading: boolean
  score?: number
}) {
  if (loading || score === undefined) {
    return (
      <Spinner className="absolute bottom-10 left-1/2 -translate-x-1/2 h-fit" />
    )
  }

  return (
    <div className="items-center flex flex-col justify-center absolute bottom-8 left-1/2 -translate-x-1/2 h-fit">
      <p className="text-3xl">
        {formatSmartNumber(score, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  )
}

function SolidScoreRevealButton({
  onClick,
  loading,
}: {
  onClick: () => void
  loading: boolean
}) {
  return (
    <Button className="w-full" onClick={onClick} disabled={loading}>
      {loading ? (
        <Spinner className="mr-2 h-4 w-4" />
      ) : (
        <Eye size={16} className="mr-2" />
      )}
      Reveal
    </Button>
  )
}
