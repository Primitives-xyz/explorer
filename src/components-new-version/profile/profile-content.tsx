'use client'

import { useProfileInfo } from '@/components-new-version/tapestry/hooks/use-profile-info'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/components-new-version/utils/utils'

interface Props {
  id: string
}

export function ProfileContent({ id }: Props) {
  const { mainUsername } = useCurrentWallet()

  const { profileData } = useProfileInfo({
    username: id,
    mainUsername,
  })

  console.log(profileData)

  const creationYear = profileData?.profile.created_at
    ? new Date(profileData?.profile.created_at).getFullYear()
    : new Date().getFullYear()

  return (
    <>
      <div>
        <div className="flex items-start space-x-3">
          <Avatar username={id} size={72} />
          <div className="flex space-x-1 items-center">
            <p className="font-bold">@{profileData?.profile.username}</p>
            {profileData?.wallet?.address && (
              <p className="text-muted-foreground">
                {abbreviateWalletAddress({
                  address: profileData.wallet.address,
                })}
              </p>
            )}
            <p className="text-muted-foreground">• since {creationYear}</p>
          </div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Connected Wallets</CardTitle>
          <CardContent>{id}</CardContent>
        </CardHeader>
      </Card>
    </>
  )
}
