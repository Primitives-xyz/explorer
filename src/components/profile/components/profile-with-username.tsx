'use client'

import { Button, ButtonVariant, FullPageSpinner } from '@/components/ui'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useGetProfileInfo } from '../hooks/use-get-profile-info'
import { ProfileContent } from './profile-content'

interface Props {
  username: string
  namespace?: string
}

export function ProfileWithUsername({ username, namespace }: Props) {
  const { mainProfile } = useCurrentWallet()
  const { profileInfo, loading, error } = useGetProfileInfo({
    username,
    mainUsername: mainProfile?.username,
  })

  if (loading) {
    return <FullPageSpinner />
  }

  if (error || !profileInfo) {
    return (
      <div className="w-full flex items-center justify-center pt-[200px] text-lg flex-col gap-4">
        Profile not found
        <Button variant={ButtonVariant.OUTLINE} href={route('home')}>
          go back home
        </Button>
      </div>
    )
  }

  return (
    <ProfileContent
      profileInfo={profileInfo}
      walletAddress={profileInfo.walletAddress}
      namespace={namespace}
    />
  )
}
