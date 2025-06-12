'use client'

import { Button, Dialog, DialogContent, DialogHeader } from '@/components/ui'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import { ReactNode, useState } from 'react'
import { toast } from 'sonner'
import { ShareImage } from './share-image'
import { ShareInstructions } from './share-instructions'
import { ShareXInstructionsDialog } from './share-x-instructions-dialog'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  imageData?: Blob
  isGeneratingImage: boolean
  tweetText: string
  imageFilename: string
  modalTitle: string
  modalDescription?: ReactNode
  instructionTitle: string
  shareXModalTitle: string
  onShare?: () => void
}

export function ShareTweetDialog({
  open,
  setOpen,
  imageData,
  isGeneratingImage,
  tweetText,
  imageFilename,
  modalTitle,
  modalDescription,
  instructionTitle,
  shareXModalTitle,
  onShare,
}: Props) {
  const t = useTranslations('menu.solid_score.leaderboard.share_dialog')
  const [isImageCopied, setIsImageCopied] = useState(false)
  const [isShared, setIsShared] = useState(false)
  const [isXInstructionsOpen, setIsXInstructionsOpen] = useState(false)

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
    a.download = imageFilename
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
    onShare?.()
    setOpen(false)
    setIsShared(true)
  }

  const handleOpenX = () => {
    setIsXInstructionsOpen(true)
  }

  const handleXShare = () => {
    window.open(
      `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}`,
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
          <DialogHeader className="w-full space-y-4">
            <DialogTitle>{modalTitle}</DialogTitle>
            {!!modalDescription && (
              <div className="text-xs md:text-sm">{modalDescription}</div>
            )}
          </DialogHeader>

          <div className="w-full flex flex-col md:flex-row items-center justify-center gap-4 md:flex-auto">
            <ShareInstructions
              isImageCopied={isImageCopied}
              isShared={isShared}
              instructionTitle={instructionTitle}
            />
            <ShareImage
              imageData={imageData}
              isGeneratingImage={isGeneratingImage}
              handleDownloadImage={handleDownloadImage}
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
            <Button onClick={handleOpenX} disabled={!isImageCopied}>
              {t('share_x')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <ShareXInstructionsDialog
        open={isXInstructionsOpen}
        setOpen={setIsXInstructionsOpen}
        onShare={handleXShare}
        modalTitle={shareXModalTitle}
      />
    </>
  )
}
