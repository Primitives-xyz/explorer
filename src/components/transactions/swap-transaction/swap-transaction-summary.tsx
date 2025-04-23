'use client'

import { Transaction } from '@/components/tapestry/models/helius.models'
import { 
  ProcessedTransaction, 
  getDisplayIncomingToken, 
  getDisplayOutgoingToken, 
  processSwapTransaction 
} from './swap-transaction-utils'
import { 
  Button, 
  ButtonSize, 
  ButtonVariant, 
  Card, 
  CardContent 
} from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { abbreviateWalletAddress, formatNumber, formatTimeAgo } from '@/utils/utils'
import { route } from '@/utils/route'
import { ArrowRight, ArrowRightLeft, Share } from 'lucide-react'
import Image from 'next/image'
import { useGetProfiles } from '@/components/tapestry/hooks/use-get-profiles'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { TokenLine } from '@/components/transactions/common/token-line'
import { getSourceIcon } from '@/utils/transactions'
import { CopyToClipboardButton } from '@/components/ui/button/copy-to-clipboard-button'
import { TransactionsHeader } from '@/components/transactions/transactions-header'

interface SwapTransactionSummaryProps {
  transaction: Transaction
  onCopyTrade?: () => void
}

export const SwapTransactionSummary = ({ 
  transaction, 
  onCopyTrade 
}: SwapTransactionSummaryProps) => {
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

  // Get the primary swap tokens or fall back to the first ones
  const outToken = getDisplayOutgoingToken(processedTx.outgoingTokens, processedTx.primaryOutgoingToken)
  const inToken = getDisplayIncomingToken(processedTx.incomingTokens, processedTx.primaryIncomingToken)
  
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
          <span>Swap on {getSourceIcon(transaction.source)} {transaction.source}</span>
            <CopyToClipboardButton
              textToCopy={typeof window !== 'undefined' ? window.location.href : ''}
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