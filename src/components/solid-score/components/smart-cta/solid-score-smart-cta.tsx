'use client'

import { useUpdateProfile } from '@/components/tapestry/hooks/use-update-profile'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import { Button, Spinner } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Eye } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { usePathname } from 'next/navigation'
import { useSolidScoreStore } from '../../stores/use-solid-score-store'
import { SolidScoreCard } from './solid-score-card'

interface Props {
  simpleRevealButton?: boolean
  mainProfile: IProfile
}

export function SolidScoreSmartCta({ simpleRevealButton, mainProfile }: Props) {
  const { refetch } = useCurrentWallet()
  const pathname = usePathname()
  const t = useTranslations()
  const { updateProfile, loading } = useUpdateProfile({
    profileId: mainProfile.username,
  })
  const { setOpenRevealScoreAnimation } = useSolidScoreStore()

  const isOnProfilePage = pathname === `/${mainProfile.username}`

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
    console.log('setOpenRevealScoreAnimation')
    setOpenRevealScoreAnimation(true)
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
        // buttonHref={
        //   !isOnProfilePage
        //     ? route('entity', { id: mainProfile.username })
        //     : undefined
        // }
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
