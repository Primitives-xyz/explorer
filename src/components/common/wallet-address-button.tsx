import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { abbreviateWalletAddress, handleCopy } from '@/utils/utils'
import { ClipboardIcon } from 'lucide-react'

interface Props {
  walletAddress: string
}

export function WalletAddressButton({ walletAddress }: Props) {
  return (
    <Button
      className="w-fit"
      variant={ButtonVariant.SECONDARY}
      onClick={() => handleCopy({ copyText: walletAddress })}
      size={ButtonSize.SM}
    >
      {abbreviateWalletAddress({ address: walletAddress })}
      <ClipboardIcon size={12} />
    </Button>
  )
}
