import { Button, Dialog, DialogContent, DialogHeader } from '@/components/ui'
import { useIsMobile } from '@/utils/use-is-mobile'
import { DialogTitle } from '@radix-ui/react-dialog'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Props {
  open: boolean
  setOpen: (open: boolean) => void
  onShare: () => void
  modalTitle: string
}

export function ShareXInstructionsDialog({
  open,
  setOpen,
  onShare,
  modalTitle,
}: Props) {
  const t = useTranslations(
    'menu.solid_score.leaderboard.share_dialog.share_x_instructions'
  )
  const { isMobile } = useIsMobile()

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-[500px] flex flex-col items-center justify-start gap-6 p-6">
        <DialogHeader className="w-full">
          <DialogTitle>{modalTitle}</DialogTitle>
        </DialogHeader>

        <div className="w-full flex flex-col items-center gap-6">
          <Image
            src="/images/solid-score/solid-score-tweet.png"
            width={300}
            height={150}
            alt="How to paste on X"
            className="rounded-lg"
          />

          <div className="text-center space-y-2">
            {isMobile ? (
              <>
                <p className="text-sm">{t('mobile.step_1')}</p>
                <p className="text-sm">{t('mobile.step_2')}</p>
                <p className="text-sm">{t('mobile.step_3')}</p>
              </>
            ) : (
              <p className="text-lg">
                {t('desktop.instruction', {
                  shortcut: navigator.userAgent.toLowerCase().includes('mac')
                    ? '⌘ + V'
                    : 'Ctrl + V',
                })}
              </p>
            )}
          </div>
        </div>

        <Button onClick={onShare} className="w-full">
          {t('ready_button')}
        </Button>
      </DialogContent>
    </Dialog>
  )
}
