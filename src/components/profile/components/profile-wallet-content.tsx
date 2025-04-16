import {
  ButtonSize,
  ButtonVariant,
  CopyToClipboardButton,
  Separator,
} from '@/components/ui'
import { abbreviateWalletAddress } from '@/utils/utils'
import { CopyIcon } from 'lucide-react'
import { ProfileTableInfo } from './profile-table-info'
import { ProfileWalletInfo } from './profile-wallet-info'

interface Props {
  walletAddress: string
}

export function ProfileWalletContent({ walletAddress }: Props) {
  return (
    <div className="space-y-3">
      <CopyToClipboardButton
        textToCopy={walletAddress}
        variant={ButtonVariant.BADGE_SOCIAL}
        size={ButtonSize.SM}
      >
        <CopyIcon size={12} />
        {abbreviateWalletAddress({
          address: walletAddress,
        })}
      </CopyToClipboardButton>
      <ProfileWalletInfo walletAddress={walletAddress} />
      <Separator className="my-4" />
      <ProfileTableInfo walletAddress={walletAddress} />
    </div>
  )
}
