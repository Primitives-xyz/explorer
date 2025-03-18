'use client'

import { TransactionsFeeSvg } from '@/components-new-version/common/transactions-fee-svg'
import { TransactionBadge } from '@/components-new-version/home/home-content/following-transactions/transaction-badge'
import { Transaction } from '@/components-new-version/models/helius.models'
import { IGetProfilesResponse } from '@/components-new-version/tapestry/models/profiles.models'
import {
  Badge,
  Button,
  ButtonSize,
  ButtonVariant,
} from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/components-new-version/utils/constants'
import {
  abbreviateWalletAddress,
  formatTimeAgo,
} from '@/components-new-version/utils/utils'
import { useToast } from '@/hooks/use-toast'
import { ClipboardIcon } from 'lucide-react'

export function SwapTransactionsViewHeader({
  transaction,
  sourceWallet,
  primaryType,
  profiles,
}: {
  transaction: Transaction
  sourceWallet: string
  primaryType: string
  profiles?: IGetProfilesResponse
}) {
  const { toast } = useToast()

  const sourceProfile = profiles?.profiles.find(
    (p) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  const formatSourceName = (source: string) => {
    switch (source) {
      case 'JUPITER':
        return 'Jupiter'
      case 'RAYDIUM':
        return 'Raydium'
      case 'ORCA':
        return 'Orca'
      default:
        return source.charAt(0).toUpperCase() + source.slice(1).toLowerCase()
    }
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(transaction.signature)
    toast({
      title: 'Signature copied to clipboard',
      description: 'You can now paste it into the explorer',
    })
  }

  return (
    <div className="flex flex-row gap-2 items-start">
      <Avatar
        username={sourceProfile?.username || sourceWallet}
        size={40}
        imageUrl={sourceProfile?.image}
      />

      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <div>
              {sourceProfile?.username &&
              sourceProfile.username !== sourceWallet ? (
                `@${sourceProfile.username}`
              ) : (
                <span>
                  {abbreviateWalletAddress({ address: sourceWallet })}
                </span>
              )}
            </div>
            <div>
              <Button
                variant={ButtonVariant.SECONDARY}
                onClick={handleCopy}
                size={ButtonSize.SM}
              >
                {abbreviateWalletAddress({ address: transaction.signature })}
                <ClipboardIcon size={12} />
              </Button>
            </div>
            <p className="muted-foreground text-xs">
              • {formatTimeAgo(new Date(transaction.timestamp))}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {transaction.fee && (
              <div className="flex items-center gap-1 text-xs">
                <TransactionsFeeSvg />
                <span>{Number(transaction.fee)} SOL</span>
              </div>
            )}
            <Badge variant="outline" className="rounded-md">
              {primaryType}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <p>swapped on </p>
          <Badge variant="outline" className="rounded-md">
            {formatSourceName(transaction.source)}
          </Badge>
          <TransactionBadge
            type={transaction.type}
            source={transaction.source}
          />
        </div>
      </div>
    </div>
  )
}
