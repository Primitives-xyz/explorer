'use client'

import { useSolidScore } from '@/components/common/hooks/use-solid-score'
import { ScoreArc } from '@/components/common/left-side-menu/solid-score/score-arc'
import { SolidScoreBadges } from '@/components/common/left-side-menu/solid-score/solid-score-badges'
import { SolidScoreValue } from '@/components/common/left-side-menu/solid-score/solid-score-value'
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

export function SolidScoreDialog({ open, setOpen }: Props) {
  const { walletAddress, mainProfile } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ walletAddress })
  const t = useTranslations('menu.solid_score')

  const score = formatSmartNumber(data?.solidUser.solidScore || 1, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-xl flex flex-col items-center justify-center">
        <DialogHeader>
          <DialogTitle>{t('share_dialog.title')}</DialogTitle>
        </DialogHeader>
        <p>{t('share_dialog.description')}</p>
        <div className="w-[400px] h-[400px] relative flex items-center justify-center rounded-lg overflow-hidden">
          <Image
            src="/images/menu/solid-score-share-modal-bg.png"
            alt="Background"
            fill
            className="object-cover z-0"
            priority
          />

          <div className="flex w-[300px] h-[300px] relative z-10 rounded-lg bg-foreground/5 backdrop-blur-xl shadow-xl flex-col justify-center items-center">
            <p className="text-md">{t('share_dialog.my_score_is')}</p>
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
                {t('share_dialog.claim_yours')}
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setOpen(false)}
          href={`https://x.com/intent/tweet?text=${encodeURIComponent(
            t('share_dialog.tweet_text', { score })
          )}`}
          newTab
          rel="noopener noreferrer"
        >
          {t('share_dialog.share_button')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
