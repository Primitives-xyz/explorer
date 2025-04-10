'use client'

import {
  ExtendedTransaction,
  Transaction,
} from '@/components-new-version/models/helius.models'
import {
  IGetProfilesResponse,
  IProfile,
} from '@/components-new-version/models/profiles.models'
import { ITransactionWithProfile } from '@/components-new-version/transactions/hooks/use-following-transactions'
import { Button, ButtonSize, ButtonVariant } from '@/components-new-version/ui'
import { Avatar } from '@/components-new-version/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/components-new-version/utils/constants'
import { route } from '@/components-new-version/utils/route'
import {
  abbreviateWalletAddress,
  formatTimeAgo,
} from '@/components-new-version/utils/utils'
import { ArrowRightLeft } from 'lucide-react'
import { ReactNode } from 'react'
import { useSwapStore } from '../swap/stores/use-swap-store'

interface Props {
  transaction: ITransactionWithProfile | ExtendedTransaction
  sourceWallet: string
  profiles?: IGetProfilesResponse
  children?: ReactNode
  displayTradeButton?: boolean
}

export function TransactionsHeader({
  transaction,
  sourceWallet,
  profiles,
  children,
  displayTradeButton,
}: Props) {
  const { setOpen } = useSwapStore()

  let profile = null

  if ('profile' in transaction && transaction.profile) {
    profile = transaction.profile
  } else {
    profile = profiles?.profiles.find(
      (p) => p.namespace.name === EXPLORER_NAMESPACE
    )?.profile
  }

  return (
    <div className="flex flex-row gap-2 items-start">
      <div className="w-12">
        <Button
          variant={ButtonVariant.GHOST}
          href={route('entity', {
            id: profile?.username || sourceWallet,
          })}
          className="p-0 hover:bg-transparent"
        >
          <Avatar
            username={profile?.username || sourceWallet}
            size={40}
            className="w-10"
            imageUrl={profile?.image}
          />
        </Button>
      </div>

      <div className="flex flex-col space-y-2 w-full">
        <div className="flex items-center gap-2 justify-between w-full">
          <div className="flex items-center gap-2">
            <Username sourceProfile={profile} sourceWallet={sourceWallet} />

            <Button
              href={route('entity', { id: transaction.signature })}
              variant={ButtonVariant.BADGE}
              size={ButtonSize.SM}
            >
              {abbreviateWalletAddress({
                address: transaction.signature,
              })}
            </Button>

            <TimeAgo transaction={transaction} />
          </div>

          {displayTradeButton && (
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={() => setOpen(true)}
            >
              <ArrowRightLeft size={16} />
              Trade
            </Button>
          )}
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
