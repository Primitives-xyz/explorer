'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { IProfile } from '@/components/tapestry/models/profiles.models'
import { Button, ButtonSize, ButtonVariant } from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, formatTimeAgo } from '@/utils/utils'
import { ArrowRightLeft } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ReactNode } from 'react'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  transaction: IHomeTransaction
  sourceWallet: string
  children?: ReactNode
  onClickTradeButton?: () => void
  tradeButtonText?: string
}

export function TransactionsHeader({
  transaction,
  sourceWallet,
  children,
  onClickTradeButton,
  tradeButtonText,
}: Props) {
  const t = useTranslations()
  const { profiles } = useGetProfiles({
    walletAddress: sourceWallet,
    skip: !!transaction.profile,
  })

  let profile = null

  if (transaction.profile) {
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
            id: sourceWallet || profile?.username || '',
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
          <div className="flex items-center gap-2 desktop">
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

          <div className="flex w-full flex-col mobile">
            <div className="flex justify-between w-full items-center gap-2">
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
              </div>
              {/* {!!onClickTradeButton && (
                <Button
                  variant={ButtonVariant.OUTLINE}
                  onClick={onClickTradeButton}
                  size={ButtonSize.ICON_SM}
                >
                  <ArrowRightLeft size={14} />
                </Button>
              )} */}
            </div>

            <div className="flex items-center gap-2">
              <TimeAgo transaction={transaction} />
            </div>
          </div>

          {!!onClickTradeButton && (
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={onClickTradeButton}
              size={ButtonSize.SM}
              className="desktop"
            >
              <ArrowRightLeft size={16} />
              {tradeButtonText || t('home.transactions.trade_button')}
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
        id: sourceWallet || sourceProfile?.username || '',
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

function TimeAgo({ transaction }: { transaction: IHomeTransaction }) {
  return (
    <p className="text-muted-foreground text-xs gap-1 flex items-center">
      <span className="desktop">•</span>
      {formatTimeAgo(new Date(transaction.timestamp * 1000))}
    </p>
  )
}
