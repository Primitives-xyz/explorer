'use client'

import {
  ExtendedTransaction,
  Transaction,
} from '@/components/tapestry/models/helius.models'
import {
  IGetProfilesResponse,
  IProfile,
} from '@/components/tapestry/models/profiles.models'
import { ITransactionWithProfile } from '@/components/transactions/hooks/use-following-transactions'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, formatTimeAgo } from '@/utils/utils'
import { ArrowRightLeft } from 'lucide-react'
import { ReactNode } from 'react'

interface Props {
  transaction: ITransactionWithProfile | ExtendedTransaction
  sourceWallet: string
  profiles?: IGetProfilesResponse
  children?: ReactNode
  onClickTradeButton?: () => void
}

export function TransactionsHeader({
  transaction,
  sourceWallet,
  profiles,
  children,
  onClickTradeButton,
}: Props) {
  let profile = null

  if ('profile' in transaction && transaction.profile) {
    profile = transaction.profile
  } else {
    profile = profiles?.profiles.find(
      (p) => p.namespace.name === EXPLORER_NAMESPACE
    )?.profile
  }

  return (
    <div className="flex flex-row gap-2 items-start overflow-visible">
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
                desiredLength: 8,
              })}
            </Button>

            <TimeAgo transaction={transaction} />
          </div>

          {!!onClickTradeButton && (
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={onClickTradeButton}
              size={ButtonSize.SM}
            >
              <ArrowRightLeft size={16} />
              Copy Trade
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
      href={route('entity', {
        id: sourceProfile?.username || sourceWallet,
      })}
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
      • {formatTimeAgo(new Date(transaction.timestamp * 1000))}
    </p>
  )
}
