'use client'

import { SolidScoreCard } from '@/components/solid-score/smart-cta/solid-score-card'
import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { Button, Spinner } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'

interface Props {
  simpleRevealButton?: boolean
}

export function SolidScoreSmartCta({ simpleRevealButton }: Props) {
  const { mainProfile, refetch } = useCurrentWallet()
  const pathname = usePathname()
  const isOnProfilePage = mainProfile?.username
    ? pathname === `/${mainProfile.username}`
    : false
  const t = useTranslations()

  const { updateProfile, loading } = useUpdateProfile({
    username: mainProfile?.username || '',
  })

  const handleRevealClick = async () => {
    await updateProfile({
      properties: [
        {
          key: 'userRevealedTheSolidScore',
          value: true,
        },
      ],
    })
    await refetch()
  }

  if (!mainProfile?.username) {
    return null
  }

  if (simpleRevealButton) {
    return (
      <Button className="w-full" onClick={handleRevealClick} disabled={loading}>
        {loading ? <Spinner size={16} /> : <Eye size={16} />}
        {t('menu.solid_score.reveal_button')}
      </Button>
    )
  }

  if (!mainProfile.userRevealedTheSolidScore) {
    return (
      <SolidScoreCard
        title={t('menu.solid_score.smart_cta.reveal.title')}
        description={t('menu.solid_score.smart_cta.reveal.description')}
        buttonText={t('menu.solid_score.smart_cta.reveal.button')}
        buttonAction={handleRevealClick}
        buttonHref={
          !isOnProfilePage
            ? route('entity', { id: mainProfile.username })
            : undefined
        }
        loading={loading}
        isOnProfilePage={isOnProfilePage}
      />
    )
  }

  if (!mainProfile?.userHasClickedOnShareHisSolidScore) {
    return (
      <SolidScoreCard
        title={t('menu.solid_score.smart_cta.unlock.title')}
        description={t('menu.solid_score.smart_cta.unlock.description')}
        buttonText={t('menu.solid_score.smart_cta.unlock.button')}
        buttonAction={() => {}}
        buttonHref={route('leaderboard')}
        isOnProfilePage={isOnProfilePage}
      />
    )
  }

  return null
}
