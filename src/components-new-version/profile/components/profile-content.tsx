'use client'

import { useProfileInfo } from '@/components-new-version/tapestry/hooks/use-profile-info'
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
} from '@/components-new-version/ui'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/components/common/tools'
import { CopyIcon } from 'lucide-react'
import { ProfileHeader } from './profile-header'
import { ProfileInfo } from './profile-info'
import { ProfileTableInfo } from './profile-table-info'

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

  if (!profileInfo) {
    return null
  }

  const targetWalletAddress = walletAddress || profileInfo.wallet.address
  const displayUsername = username || profileInfo.profile.username

  return (
    <div className="flex flex-col w-full space-y-6">
      <ProfileHeader
        profileInfo={profileInfo}
        displayUsername={displayUsername}
        mainUsername={mainProfile?.username}
      />
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Connected Wallet</CardTitle>
            <CardDescription>
              {profileInfo?.wallet?.address && (
                <CopyToClipboardButton
                  textToCopy={profileInfo.wallet.address}
                  variant={ButtonVariant.BADGE_SOCIAL}
                  size={ButtonSize.SM}
                >
                  <CopyIcon size={12} />
                  {abbreviateWalletAddress({
                    address: profileInfo.wallet.address,
                  })}
                </CopyToClipboardButton>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pb-0">
            <ProfileInfo walletAddress={targetWalletAddress} />
            <Separator />
            <ProfileTableInfo walletAddress={targetWalletAddress} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social</CardTitle>
          </CardHeader>
          <CardContent></CardContent>
        </Card>
      </div>
    </div>
  )
}
