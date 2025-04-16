'use client'

import { INamespaceProfileInfos } from '@/components/tapestry/models/namespace.models'
import { Card, CardContent } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { abbreviateWalletAddress } from '@/utils/utils'

interface Props {
  profileData: INamespaceProfileInfos
  username: string
}

export function NamespaceProfileCardInfos({ profileData, username }: Props) {
  return (
    <Card className="w-1/2">
      <CardContent className="w-full flex flex-col space-y-6">
        <div className="flex items-center gap-4">
          <div>
            <Avatar username={username} size={72} className="w-18" />
          </div>
          <div className="space-y-1">
            <p className="font-bold">@{username}</p>

            <p className="text-muted-foreground text-sm">
              {profileData?.profile.bio || 'No description'}
            </p>
          </div>
        </div>

        <div className="w-full flex justify-between items-center">
          <p>owned by</p>

          {abbreviateWalletAddress({
            address: profileData?.walletAddress,
          })}
        </div>

        <div className="w-full flex justify-between items-center">
          <p>Created</p>
          <p>{new Date(profileData.profile?.created_at).getFullYear()}</p>
        </div>
      </CardContent>
    </Card>
  )
}
