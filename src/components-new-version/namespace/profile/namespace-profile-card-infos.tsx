'use client'

import { INamespaceProfileInfos } from '@/components-new-version/models/namespace.models'
import { Card, CardContent } from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import {
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/components-new-version/ui/button'
import { route } from '@/components-new-version/utils/route'
import { abbreviateWalletAddress } from '@/components-new-version/utils/utils'

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
          <Button
            href={route('entity', {
              id: profileData?.walletAddress,
            })}
            variant={ButtonVariant.BADGE}
            size={ButtonSize.SM}
          >
            {abbreviateWalletAddress({
              address: profileData?.walletAddress,
            })}
          </Button>
        </div>

        <div className="w-full flex justify-between items-center">
          <p>Created</p>
          <p>{new Date(profileData.profile?.created_at).getFullYear()}</p>
        </div>

        <div className="w-full flex justify-between items-center">
          <p>Network</p>
          <p>...</p>
        </div>

        <div className="w-full flex justify-between items-center">
          <p>Status</p>
          <p>...</p>
        </div>
      </CardContent>
    </Card>
  )
}
