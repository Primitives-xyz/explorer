import { ScoreArc } from '@/components/solid-score/score-arc'
import { SolidScoreBadges } from '@/components/solid-score/solid-score-badges'
import { SolidScoreValue } from '@/components/solid-score/solid-score-value'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import { Button, ButtonVariant } from '@/components/ui'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { Download } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Props {
  imageData: Blob | null
  isGeneratingImage: boolean
  mainProfile?: IProfile
  data?: SolidScoreResponse
  scoreLoading: boolean
  handleDownloadImage: () => void
}

export function ShareImage({
  imageData,
  isGeneratingImage,
  mainProfile,
  handleDownloadImage,
  data,
  scoreLoading,
}: Props) {
  const t = useTranslations('menu.solid_score.leaderboard.share_dialog')

  return (
    <div className="w-[280px] md:w-[350px] aspect-square relative flex items-center justify-center rounded-lg overflow-hidden group shrink-0">
      <Image
        src="/images/menu/solid-score-share-modal-bg.png"
        alt="Background"
        fill
        className="object-cover z-0"
        priority
      />

      <Button
        onClick={handleDownloadImage}
        disabled={!imageData || isGeneratingImage}
        variant={ButtonVariant.GHOST}
        className="absolute z-20 left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/20 hover:bg-background/40"
      >
        <Download className="w-5 h-5 md:w-6 md:h-6" />
      </Button>

      <div className="w-[250px] md:w-[260px] aspect-square relative z-10 rounded-lg bg-foreground/5 backdrop-blur-xl shadow-xl flex flex-col justify-center items-center">
        <p className="text-md">{t('score_intro')}</p>
        <div className="flex items-center gap-2 justify-center">
          {mainProfile?.image && (
            <ValidatedImage
              src={mainProfile.image}
              alt="profile image"
              width={20}
              height={20}
              className="object-cover rounded-full aspect-square max-w-[20px] max-h-[20px]"
            />
          )}
          <p className="text-md pt-1">{mainProfile?.username}</p>
        </div>
        <div className="h-[115px] relative w-full">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[90%]">
            <ScoreArc score={Number(data?.score || 1)} loading={scoreLoading} />
          </div>
          <SolidScoreValue loading={scoreLoading} score={data?.score} />
        </div>
        <div className="flex items-center justify-center space-y-4 flex-col pt-2">
          <SolidScoreBadges data={data} />
          <p className="self-center text-muted-foreground text-xs">
            {t('claim_text')}
          </p>
        </div>
      </div>
    </div>
  )
}
