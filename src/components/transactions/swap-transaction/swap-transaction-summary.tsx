'use client'

import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { Transaction } from '@/components/tapestry/models/helius.models'
import { TokenLine } from '@/components/transactions/common/token-line'
import { TransactionsHeader } from '@/components/transactions/transactions-header'
import { ButtonSize, ButtonVariant, Card, CardContent } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { CopyToClipboardButton } from '@/components/ui/button/copy-to-clipboard-button'
import { isCopiedSwap } from '@/types/content'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { getSourceIcon } from '@/utils/transactions'
import { Copy, Share } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useTransactionWithContent } from '../hooks/use-transaction-with-content'
import {
  getDisplayIncomingToken,
  getDisplayOutgoingToken,
  processSwapTransaction,
} from './swap-transaction-utils'

interface SwapTransactionSummaryProps {
  transaction: Transaction
  onCopyTrade?: () => void
}

export const SwapTransactionSummary = ({
  transaction,
  onCopyTrade,
}: SwapTransactionSummaryProps) => {
  const { t } = useTranslation()

  // Process the transaction
  const processedTx = processSwapTransaction(transaction)

  // Get profile information
  const { profiles } = useGetProfiles({
    walletAddress: processedTx.feePayer,
  })

  // Find the profile
  const profile = profiles?.profiles.find(
    (p) => p.namespace.name === EXPLORER_NAMESPACE
  )?.profile

  // Check if this is a copy trade
  const { content } = useTransactionWithContent(transaction.signature)
  const isCopiedTrade = content && isCopiedSwap(content)

  // Get the primary swap tokens or fall back to the first ones
  const outToken = getDisplayOutgoingToken(
    processedTx.outgoingTokens,
    processedTx.primaryOutgoingToken
  )
  const inToken = getDisplayIncomingToken(
    processedTx.incomingTokens,
    processedTx.primaryIncomingToken
  )

  return (
    <Card className="overflow-visible">
      <CardContent>
        {/* Header row with user info and copy trade button (replaced with TransactionsHeader) */}
        <TransactionsHeader
          transaction={transaction}
          sourceWallet={processedTx.feePayer}
          profiles={profiles}
          onClickTradeButton={onCopyTrade}
        >
          <div className="flex flex-row justify-between gap-2">
            <div className="flex items-center gap-2">
              {isCopiedTrade && (
                <Badge
                  variant="secondary"
                  className="bg-muted text-muted-foreground border border-border/50"
                >
                  <Copy size={12} className="mr-1" />
                  {t('common.copied')}
                </Badge>
              )}
              <span>
                Swap on {getSourceIcon(transaction.source)} {transaction.source}
              </span>
            </div>
            <CopyToClipboardButton
              textToCopy={
                typeof window !== 'undefined' ? window.location.href : ''
              }
              variant={ButtonVariant.OUTLINE}
              size={ButtonSize.DEFAULT}
            >
              <Share size={20} className="mr-2" />
              Share
            </CopyToClipboardButton>
          </div>
        </TransactionsHeader>

        {/* Swap details row */}
        <div className="grid grid-cols-2 gap-4 ml-[52px] overflow-visible">
          {outToken && (
            <div className="w-full p-3 bg-card-accent rounded-lg flex items-center justify-between overflow-visible">
              <TokenLine
                mint={outToken.mint}
                amount={outToken.amount}
                type="sent"
                showUsd={true}
              />
            </div>
          )}

          {inToken && (
            <div className="w-full p-3 bg-card-accent rounded-lg flex items-center justify-between overflow-visible">
              <TokenLine
                mint={inToken.mint}
                amount={inToken.amount}
                type="received"
                showUsd={true}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
