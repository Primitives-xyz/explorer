'use client'

import { WalletAddressButton } from '@/components-new-version/common/wallet-address-button'
import {
  ExtendedTransaction,
  Transaction,
} from '@/components-new-version/models/helius.models'
import {
  IGetProfilesResponse,
  IProfile,
} from '@/components-new-version/tapestry/models/profiles.models'
import { Button, ButtonVariant } from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/components-new-version/utils/constants'
import {
  abbreviateWalletAddress,
  formatTimeAgo,
} from '@/components-new-version/utils/utils'
import { ArrowRightLeft } from 'lucide-react'
import { ReactNode } from 'react'

export function TransactionsHeader({
  transaction,
  sourceWallet,
  profiles,
  children,
}: {
  transaction: Transaction | ExtendedTransaction
  sourceWallet: string
  profiles?: IGetProfilesResponse
  children?: ReactNode
}) {
  const sourceProfile = profiles?.profiles.find(
    (p) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  return (
    <div className="flex flex-row gap-2 items-start">
      <div className="w-12">
        <Button
          variant={ButtonVariant.GHOST}
          href={`/${sourceProfile?.username || sourceWallet}`}
          className="p-0 hover:bg-transparent"
        >
          <Avatar
            username={sourceProfile?.username || sourceWallet}
            size={40}
            imageUrl={sourceProfile?.image}
          />
        </Button>
      </div>

      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <Username
              sourceProfile={sourceProfile}
              sourceWallet={sourceWallet}
            />

            <WalletAddressButton walletAddress={transaction.signature} />

            <TimeAgo transaction={transaction} />
          </div>

          <Button variant={ButtonVariant.OUTLINE} disabled>
            <ArrowRightLeft />
            Copy Trade
          </Button>
        </div>
        {children}
      </div>
    </div>
  )
}

function Username({
  sourceProfile,
  sourceWallet,
}: {
  sourceProfile?: IProfile
  sourceWallet: string
}) {
  return (
    <Button
      variant={ButtonVariant.GHOST}
      href={`/${sourceProfile?.username || sourceWallet}`}
      className="p-0 hover:bg-transparent"
    >
      {sourceProfile?.username && sourceProfile.username !== sourceWallet ? (
        `@${sourceProfile.username}`
      ) : (
        <span>{abbreviateWalletAddress({ address: sourceWallet })}</span>
      )}
    </Button>
  )
}

function TimeAgo({
  transaction,
}: {
  transaction: Transaction | ExtendedTransaction
}) {
  return (
    <p className="text-muted-foreground text-xs">
      • {formatTimeAgo(new Date(transaction.timestamp))}
    </p>
  )
}
