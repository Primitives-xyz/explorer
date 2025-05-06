// SolidScore.tsx
import { useSolidScore } from '@/components/common/hooks/use-solid-score'
import { ScoreArc } from '@/components/common/left-side-menu/solid-score/score-arc'
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
import { Eye, Share } from 'lucide-react'
import { useState } from 'react'

export function SolidScore() {
  const [displayScore, setDisplayScore] = useState(true)
  const { walletAddress } = useCurrentWallet()
  const { data, loading } = useSolidScore({ walletAddress })

  return (
    <SolidScoreCardWrapper displayScore={displayScore}>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full">
        <ScoreArc
          score={Number(data?.solidUser.solidScore || 1)}
          loading={loading}
        />
      </div>

      {displayScore ? (
        <SolidScoreValue loading={loading} score={data?.solidUser.solidScore} />
      ) : (
        <SolidScoreRevealButton onClick={() => setDisplayScore(true)} />
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
      <CardContent className="flex flex-col relative w-full h-[150px]">
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
      <p className="font-bold text-2xl">
        {formatSmartNumber(score, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        })}
      </p>
    </div>
  )
}

function SolidScoreRevealButton({ onClick }: { onClick: () => void }) {
  return (
    <Button className="w-full" onClick={onClick}>
      <Eye size={16} />
      Reveal
    </Button>
  )
}
