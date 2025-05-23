import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Props {
  isImageCopied: boolean
  isShared: boolean
}

export function ShareInstructions({ isImageCopied, isShared }: Props) {
  const t = useTranslations('menu.solid_score.leaderboard.share_dialog')

  return (
    <div className="w-[280px] md:w-[350px] md:h-[350px] bg-muted rounded-lg p-4 md:p-6 flex flex-col shrink-0">
      <div className="flex flex-col h-full justify-center gap-4 md:gap-8">
        <h3 className="md:text-lg">{t('instructions.title')}</h3>
        <div className="flex flex-col gap-3 md:gap-4">
          <p className="flex items-center gap-2 text-sm md:text-base">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm">
              1
            </span>
            <span className={isImageCopied ? 'line-through' : ''}>
              {t('instructions.copy_image')}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm md:text-base">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm">
              2
            </span>
            <span className={isShared ? 'line-through' : ''}>
              {t('instructions.share_x')}
            </span>
          </p>
          <p className="flex items-center gap-2 text-sm md:text-base">
            <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center text-xs md:text-sm">
              3
            </span>
            <span className="font-bold">{t('instructions.paste_image')}</span>
          </p>
          <Image
            src="/images/solid-score/solid-score-tweet.png"
            alt="Copy the image below"
            width={200}
            height={50}
            className="w-[50%] md:w-[60%] self-center rounded-lg desktop"
          />
        </div>
      </div>
    </div>
  )
}
