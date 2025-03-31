'use client'

import { ProfileHeader } from '@/components-new-version/profile/profile-header'
import { useProfileInfo } from '@/components-new-version/tapestry/hooks/use-profile-info'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'

interface Props {
  id: string
}

export function ProfileContent({ id }: Props) {
  const { mainUsername } = useCurrentWallet()

  const { profileInfo } = useProfileInfo({
    username: id,
    mainUsername,
  })

  console.log(profileInfo)

  return (
    <div className="flex flex-col w-full space-y-6">
      <ProfileHeader
        profileInfo={profileInfo}
        mainUsername={mainUsername}
        username={id}
      />
      <div className="flex w-full justify-between gap-4">
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Connected Wallets</CardTitle>
            <CardContent>
              <div>
                <div></div>
              </div>
            </CardContent>
          </CardHeader>
        </Card>
        <Card className="w-1/2">
          <CardHeader>
            <CardTitle>Connected Wallets</CardTitle>
            <CardContent>{id}</CardContent>
          </CardHeader>
        </Card>
      </div>
    </div>
  )
}
