'use client'

import { IGetProfileResponse } from '@/components/models/profiles.models'
import {
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CopyToClipboardButton,
  Separator,
} from '@/components/ui'
import { abbreviateWalletAddress } from '@/utils/utils'
import { CopyIcon } from 'lucide-react'
import { ProfileHeader } from './profile-header'
import { ProfileInfo } from './profile-info'
import { ProfileSocial } from './profile-social'
import { ProfileTableInfo } from './profile-table-info'

interface Props {
  profileInfo: IGetProfileResponse
}

export function ProfileContent({ profileInfo }: Props) {
  return (
    <div className="flex flex-col w-full space-y-6 pb-6">
      <ProfileHeader profileInfo={profileInfo} />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Connected Wallet</CardTitle>
            <CardDescription>
              {profileInfo.walletAddress && (
                <CopyToClipboardButton
                  textToCopy={profileInfo.walletAddress}
                  variant={ButtonVariant.BADGE_SOCIAL}
                  size={ButtonSize.SM}
                >
                  <CopyIcon size={12} />
                  {abbreviateWalletAddress({
                    address: profileInfo.walletAddress,
                  })}
                </CopyToClipboardButton>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-0">
            <ProfileInfo walletAddress={profileInfo.walletAddress} />
            <Separator />
            <ProfileTableInfo walletAddress={profileInfo.walletAddress} />
          </CardContent>
        </Card>
        <ProfileSocial walletAddress={profileInfo.walletAddress} />
      </div>
    </div>
  )
}
