'use client'

import { FullPageSpinner } from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
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

  if (loading) {
    return <FullPageSpinner />
  }

  if (!profileInfo) {
    return null
  }

  return <ProfileContent profileInfo={profileInfo} />
}
