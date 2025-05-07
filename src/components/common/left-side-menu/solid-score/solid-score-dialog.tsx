'use client'

import { useSolidScore } from '@/components/common/hooks/use-solid-score'
import { ScoreArc } from '@/components/common/left-side-menu/solid-score/score-arc'
import { SolidScoreBadges } from '@/components/common/left-side-menu/solid-score/solid-score-badges'
import { SolidScoreValue } from '@/components/common/left-side-menu/solid-score/solid-score-value'
import {
  Button,
  ButtonVariant,
  Dialog,
  DialogContent,
  DialogHeader,
} from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { DialogTitle } from '@radix-ui/react-dialog'
import { UserRoundPlus } from 'lucide-react'
import Image from 'next/image'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SolidScoreDialog({ open, setOpen }: Props) {
  const { walletAddress, mainProfile } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ walletAddress })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl flex flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle>Share Your [solID] Score</DialogTitle>
        </DialogHeader>
        <p>Your [solID] Score was updated. Share with others!</p>
        <div className="w-[400px] h-[400px] relative flex items-center justify-center rounded-lg overflow-hidden">
          <Image
            src="/images/scan.png"
            alt="Background"
            fill
            className="object-cover z-0"
            priority
          />

          <div className="flex w-[300px] h-[300px] relative z-10 rounded-lg bg-background/90 backdrop-blur-xl shadow-xl flex-col justify-center items-center">
            <p className="text-md">My SOLID Score is...</p>
            <div className="flex items-center gap-2 justify-center">
              {mainProfile?.image && (
                <Image
                  src={mainProfile?.image}
                  alt="profile image"
                  width={20}
                  height={20}
                  className="object-cover rounded-full aspect-square"
                />
              )}
              <p className="text-md pt-1">{mainProfile?.username}</p>
            </div>
            <div className="h-[115px] relative w-full">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%]">
                <ScoreArc
                  score={Number(data?.solidUser.solidScore || 1)}
                  loading={scoreLoading}
                />
              </div>
              <SolidScoreValue
                loading={scoreLoading}
                score={data?.solidUser.solidScore}
              />
            </div>
            <div className="flex items-center justify-center space-y-4 flex-col pt-2">
              <SolidScoreBadges data={data} />
              <p className="self-center text-muted-foreground text-xs">
                Claim yours at SSE.gg
              </p>
            </div>
          </div>
        </div>

        <Button variant={ButtonVariant.OUTLINE_SOCIAL}>
          <UserRoundPlus />
          Share
        </Button>
      </DialogContent>
    </Dialog>
  )
}
