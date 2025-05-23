'use client'

import { useGenerateSolidScoreImage } from '@/components/solid-score/hooks/use-generate-solid-score-image'
import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, Dialog, DialogContent, DialogHeader } from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { toast } from 'sonner'
import { ShareImage } from './share-image'
import { ShareInstructions } from './share-instructions'
import { ShareXInstructionsDialog } from './share-x-instructions-dialog'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function SolidScoreShareDialog({ open, setOpen }: Props) {
  const { mainProfile, refetch } = useCurrentWallet()
  const { data, loading: scoreLoading } = useSolidScore({ id: mainProfile?.id })
  const t = useTranslations('menu.solid_score.leaderboard.share_dialog')
  const [isImageCopied, setIsImageCopied] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isXInstructionsOpen, setIsXInstructionsOpen] = useState(false)

  const { updateProfile, loading: updateProfileLoading } = useUpdateProfile({
    username: mainProfile?.username || '',
  })

  const params = {
    username: mainProfile?.username || '',
    score: data?.score || 0,
    profileImage: mainProfile?.image || '',
    badges: data?.badges || [],
  }

  const { data: imageData, loading: isGeneratingImage } =
    useGenerateSolidScoreImage(params)

  const handleCopyImage = async () => {
    if (!imageData) return

    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          'image/png': imageData,
        }),
      ])
      setIsImageCopied(true)
      toast.success(t('copy_success.title'), {
        description: t('copy_success.description'),
        duration: 3000,
      })
    } catch (err) {
      handleDownloadImage()
    }
  }

  const handleDownloadImage = () => {
    if (!imageData) return

    const url = URL.createObjectURL(imageData)
    const a = document.createElement('a')
    a.href = url
    a.download = 'solid-score.png'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    setIsImageCopied(true)
    toast.success(t('download_success.title'), {
      description: t('download_success.description'),
      duration: 3000,
    })
  }

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
    setIsShared(true)
  }

  const handleOpenX = () => {
    setIsXInstructionsOpen(true)
  }

  const handleXShare = () => {
    const formattedScore = formatSmartNumber(data?.score || 0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    const formattedPercentile = formatSmartNumber(data?.percentile || 0, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(
        t('tweet_text', {
          score: formattedScore,
          percentile: formattedPercentile,
        })
      )}`,
      '_blank',
      'noopener,noreferrer'
    )
    setIsXInstructionsOpen(false)
    handleShare()
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[750px] max-h-[90dvh] md:h-auto flex flex-col items-center justify-start md:justify-center gap-4 md:gap-6 overflow-y-auto md:overflow-visible p-4 md:p-6">
          <DialogHeader className="w-full">
            <DialogTitle>{t('title')}</DialogTitle>
            <div className="mt-4 text-xs md:text-sm">
              <p>
                {t('percentile_text', {
                  percentile: data?.percentile.toFixed(0),
                })}
              </p>
              <p>{t('unlock_text')}</p>
            </div>
          </DialogHeader>

          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:flex-auto">
            <ShareInstructions
              isImageCopied={isImageCopied}
              isShared={isShared}
            />
            <ShareImage
              imageData={imageData}
              isGeneratingImage={isGeneratingImage}
              mainProfile={mainProfile}
              handleDownloadImage={handleDownloadImage}
              data={data}
              scoreLoading={scoreLoading}
            />
          </div>

          <div className="w-full flex items-center justify-center gap-4">
            <Button
              onClick={handleCopyImage}
              disabled={!imageData || isGeneratingImage}
            >
              {isGeneratingImage
                ? t('copy_image.generating')
                : !imageData
                ? t('copy_image.no_image')
                : isImageCopied
                ? t('copy_image.copy_again')
                : t('copy_image.default')}
            </Button>
            <p>{t('then')}</p>
            <Button
              onClick={handleOpenX}
              disabled={updateProfileLoading || !isImageCopied}
            >
              {t('share_x')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <ShareXInstructionsDialog
        open={isXInstructionsOpen}
        setOpen={setIsXInstructionsOpen}
        onShare={handleXShare}
      />
    </>
  )
}
