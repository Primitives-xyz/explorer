'use client'

import { ProfileHeader } from '@/components-new-version/profile/profile-header'
import { ProfileInfo } from '@/components-new-version/profile/profile-info'
import { ProfileTableInfo } from '@/components-new-version/profile/profile-table-info'
import { useProfileInfo } from '@/components-new-version/tapestry/hooks/use-profile-info'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

interface Props {
  username?: string
  walletAddress?: string
}

export function ProfileContent({ username, walletAddress }: Props) {
  const { mainProfile } = useCurrentWallet()

  const { profileInfo } = useProfileInfo({
    username,
    mainUsername: mainProfile?.username,
    walletAddress,
  })

  const targetWalletAddress =
    walletAddress || profileInfo?.wallet?.address || ''

  const displayUsername = username || profileInfo?.profile?.username || ''

  return (
    <div className="flex flex-col w-full space-y-6">
      <ProfileHeader
        profileInfo={profileInfo}
        mainUsername={mainProfile?.username}
        username={displayUsername}
      />
      <div className="flex w-full justify-between gap-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardContent>
              <ProfileInfo walletAddress={targetWalletAddress} />
              {targetWalletAddress && (
                <ProfileTableInfo walletAddress={targetWalletAddress} />
              )}
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Social</CardTitle>
            <CardContent></CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
