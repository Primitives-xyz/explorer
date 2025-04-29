'use client'

import { FullPageSpinner } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useGetProfileInfo } from '../hooks/use-get-profile-info'
import { ProfileContent } from './profile-content'

interface Props {
  username: string
}

export function ProfileWithUsername({ username }: Props) {
  const { mainProfile } = useCurrentWallet()
  const { profileInfo, loading } = useGetProfileInfo({
    username,
    mainUsername: mainProfile?.username,
  })
  const { isMobile } = useIsMobile()
  const { push } = useRouter()

  useEffect(() => {
    if (isMobile) {
      push('/trade')
    }
  }, [isMobile, push])

  if (isMobile) {
    return <FullPageSpinner />
  }

  if (loading) {
    return <FullPageSpinner />
  }

  if (!profileInfo) {
    return null
  }

  return <ProfileContent profileInfo={profileInfo} />
}
