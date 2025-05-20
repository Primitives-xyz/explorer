'use client'

import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { ScoreArc } from '@/components/solid-score/score-arc'
import { SolidScoreBadges } from '@/components/solid-score/solid-score-badges'
import { SolidScoreValue } from '@/components/solid-score/solid-score-value'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, Dialog, DialogContent, DialogHeader } from '@/components/ui'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SolidScoreShareDialog({ open, setOpen }: Props) {
  const { mainProfile, refetch } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ id: mainProfile?.id })
  const t = useTranslations('menu.solid_score')

  const { updateProfile, loading: updateProfileLoading } = useUpdateProfile({
    username: mainProfile?.username || '',
  })

  const score = formatSmartNumber(data?.score || 1, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const handleShare = async () => {
    await updateProfile({
      properties: [
        {
          key: 'userHasClickedOnShareHisSolidScore',
          value: true,
        },
      ],
    })
    refetch()
    setOpen(false)
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(
        t('share_dialog.tweet_text', { score })
      )}`,
      '_blank',
      'noopener,noreferrer'
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl flex flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle>🚀 You're on the board, but it's locked</DialogTitle>
          <div className="mt-4 text-xs md:text-md">
            <p>
              Your score ranks you in the Top {data?.percentile}% of SSE users!
            </p>
            <p>Share your score to unlock your rank and see how you stack up</p>
          </div>
        </DialogHeader>

        <div className="md:w-[400px] md:h-[400px] relative flex items-center justify-center rounded-lg overflow-hidden">
          <Image
            src="/images/menu/solid-score-share-modal-bg.png"
            alt="Background"
            fill
            className="object-cover z-0"
            priority
          />

          <div className="flex w-[300px] h-[300px] relative z-10 rounded-lg bg-foreground/5 backdrop-blur-xl shadow-xl flex-col justify-center items-center">
            <p className="text-md">My SOLID Score is...</p>
            <div className="flex items-center gap-2 justify-center">
              {mainProfile?.image && (
                <ValidatedImage
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
                  score={Number(data?.score || 1)}
                  loading={scoreLoading}
                />
              </div>
              <SolidScoreValue loading={scoreLoading} score={data?.score} />
            </div>
            <div className="flex items-center justify-center space-y-4 flex-col pt-2">
              <SolidScoreBadges data={data} />
              <p className="self-center text-muted-foreground text-xs">
                Claim yours at SSE.gg
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <Button>Copy Image</Button>
          <p>then</p>
          <Button onClick={handleShare} disabled loading={updateProfileLoading}>
            Share on X
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
