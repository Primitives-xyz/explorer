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
      <CardContent className="p-4 space-y-4 overflow-visible">
        {/* Header row with user info and copy trade button */}
        <div className="flex items-center w-full justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              username={profile?.username || processedTx.feePayer}
              size={40}
              className="w-10"
              imageUrl={profile?.image}
            />
            
            <div>
              <div className="flex items-center gap-2">
                {profile?.username && profile.username !== processedTx.feePayer ? (
                  <Button
                    variant={ButtonVariant.GHOST}
                    href={route('entity', {
                      id: profile.username || processedTx.feePayer,
                    })}
                    className="p-0 hover:bg-transparent"
                  >
                    @{profile.username}
                  </Button>
                ) : (
                  <SolanaAddressDisplay
                    address={processedTx.feePayer}
                    highlightable={true}
                    showCopyButton={false}
                  />
                )}
                
                <Button
                  href={route('entity', { id: transaction.signature })}
                  variant={ButtonVariant.BADGE}
                  size={ButtonSize.SM}
                >
                  {transaction.signature.slice(0, 4)}...{transaction.signature.slice(-4)}
                </Button>
                
                <span className="text-muted-foreground text-xs">
                  • {formatTimeAgo(processedTx.timeAgo)}
                </span>
              </div>
              
              <div className="flex items-center mt-1 text-sm">
                <span>{transaction.type}</span>
                <span className="mx-2">on</span>
                <span className="font-medium flex items-center gap-1">
                  {getSourceIcon(transaction.source)}
                </span>
                <span>{transaction.source}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              variant={ButtonVariant.DEFAULT}
              onClick={onCopyTrade}
              className="min-w-[160px] px-6 text-base font-semibold"
            >
              <ArrowRightLeft size={20} className="mr-2" />
              Copy Trade
            </Button>
            <CopyToClipboardButton
              textToCopy={typeof window !== 'undefined' ? window.location.href : ''}
              variant={ButtonVariant.OUTLINE}
              className="min-w-[56px] px-4 text-base font-semibold"
            >
              <Share size={20} className="mr-2" />
              Share
            </CopyToClipboardButton>
          </div>
        </div>

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