'use client'

import { useGenerateSolidScoreImage } from '@/components/solid-score/hooks/use-generate-solid-score-image'
import { useSolidScore } from '@/components/solid-score/hooks/use-solid-score'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { ShareTweetDialog } from './share-tweet-dialog'

export interface Props {
  open: boolean
  setOpen: (open: boolean) => void
}

export function ShareSolidScoreDialog({ open, setOpen }: Props) {
  const t = useTranslations('menu.solid_score.leaderboard.share_dialog')
  const t2 = useTranslations(
    'menu.solid_score.leaderboard.share_dialog.share_x_instructions'
  )
  const { mainProfile, refetch } = useCurrentWallet()
  const { data } = useSolidScore({
    profileId: mainProfile?.id,
  })
  const { updateProfile } = useUpdateProfile({
    profileId: mainProfile?.username || '',
  })

  const { data: imageData, loading } = useGenerateSolidScoreImage({
    username: mainProfile?.username || '',
    score: data?.score || 0,
    profileImage: mainProfile?.image || '',
    badges: data?.badges || [],
  })

  const onShare = async () => {
    await updateProfile({
      properties: [
        {
          key: 'userHasClickedOnShareHisSolidScore',
          value: true,
        },
      ],
    })
    refetch()
  }

  const formattedScore = formatSmartNumber(data?.score || 0, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  const formattedPercentile = formatSmartNumber(data?.percentile || 0, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return (
    <ShareTweetDialog
      open={open}
      setOpen={setOpen}
      imageData={imageData}
      isGeneratingImage={loading}
      tweetText={t('tweet_text', {
        score: formattedScore,
        percentile: formattedPercentile,
      })}
      imageFilename="solid-score.png"
      modalTitle={t('title')}
      modalDescription={
        <>
          <p>
            {t('percentile_text', {
              percentile: data?.percentile.toFixed(0),
            })}
          </p>
          <p>{t('unlock_text')}</p>
        </>
      }
      instructionTitle={t('instructions.title')}
      shareXModalTitle={t2('title')}
      onShare={onShare}
    />
  )
}
