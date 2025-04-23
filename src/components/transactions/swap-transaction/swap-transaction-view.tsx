'use client'

import { Transaction } from '@/components/tapestry/models/helius.models'
import { Badge, Card, CardContent, CardHeader, CardTitle, Separator } from '@/components/ui'
import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { Fuel } from 'lucide-react'
import { processSwapTransaction } from './swap-transaction-utils'
import { SwapTransactionSummary } from './swap-transaction-summary'
import TokenTransferGraph from "@/components/transactions/common/token-transfer-graph"
import { useState } from 'react'
import { TransferLine } from '@/components/transactions/common/transfer-line'
import { getSwapPairsFromTokenTransfers, getTokenFeeTransfers } from './swap-transaction-utils'
import { SwapLine } from '@/components/transactions/common/swap-line'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'

interface SwapTransactionViewProps {
  transaction: Transaction;
}

export const SwapTransactionView = ({ transaction }: SwapTransactionViewProps) => {
  // Process transaction using utility function
  const processedTx = processSwapTransaction(transaction)
  const { setOpen, setInputs } = useSwapStore()
  const [showDetails, setShowDetails] = useState(false)

  // Get the primary swap tokens
  const fromToken = processedTx.primaryOutgoingToken
  const toToken = processedTx.primaryIncomingToken

  return (
    <div className="space-y-4">
      {/* Transaction Summary */}
      <SwapTransactionSummary 
        transaction={transaction} 
        onCopyTrade={() => {
          if (fromToken && toToken) {
            setOpen(true)
            setInputs({
              inputMint: fromToken.mint,
              outputMint: toToken.mint,
              inputAmount: fromToken.amount,
            })
          }
        }} 
      />

      {/* Signer and Fee Payer Section */}
      <div className="flex justify-between overflow-visible">
        {/* Signer Card */}
        <Card className="overflow-visible w-[45%]">
          <CardContent className="p-4 overflow-visible flex flex-row justify-between">
            <p className="text-sm font-medium text-muted-foreground">Signer</p>
            <div className="text-sm overflow-visible">
              <SolanaAddressDisplay
                address={processedTx.feePayer}
                highlightable={true}
                showCopyButton={true}
                displayAbbreviatedAddress={true}
                className="text-xs"
              />
            </div>
          </CardContent>
        </Card>
        
        {/* Fee Payer Card */}
        <Card className="overflow-visible w-[45%]">
          <CardContent className="p-4 overflow-visible flex flex-row justify-between">
            <p className="text-sm font-medium text-muted-foreground">Fee Payer</p>
            <div className="text-sm overflow-visible">
              <SolanaAddressDisplay
                address={processedTx.feePayer}
                highlightable={true}
                showCopyButton={true}
                displayAbbreviatedAddress={true}
                className="text-xs"
              />
            </div>
            {/* <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Fuel size={14} />
              <span>{processedTx.fee.toString()} SOL</span>
            </div> */}
          </CardContent>
        </Card>
      </div>
      {/* Summary Title and Details Toggle */}
      <div className="flex items-center justify-between mb-2">
        <CardTitle>Summary</CardTitle>
        <button
          className="text-xs px-2 py-1 rounded bg-muted hover:bg-muted-foreground/10 border border-muted-foreground"
          onClick={() => setShowDetails((v) => !v)}
        >
          {showDetails ? 'Less details' : 'More details'}
        </button>
      </div>
      {/* Token Transfer Graph */}
      <Card className="overflow-visible;">
        <CardContent className="overflow-visible p-0">
          <TokenTransferGraph transaction={transaction} />
        </CardContent>
      </Card>

      {/* Transaction Lines Section (replaces Token Transfers Card) */}
      <div className="overflow-visible">
        <div className="space-y-2">
          {showDetails ? (
            // More details: show each token transfer
            transaction.tokenTransfers && transaction.tokenTransfers.length > 0 ? (
              transaction.tokenTransfers.map((tt, i) => (
                <TransferLine
                  key={i}
                  from={tt.fromUserAccount}
                  to={tt.toUserAccount}
                  mint={tt.mint || tt.tokenMint}
                  amount={tt.tokenAmount}
                  timestamp={transaction.timestamp}
                  direction={tt.fromUserAccount === transaction.feePayer ? 'out' : tt.toUserAccount === transaction.feePayer ? 'in' : undefined}
                  className="bg-[#97EF830D] rounded"
                />
              ))
            ) : (
              <div className="text-center text-muted-foreground p-3">No token transfers found for this transaction</div>
            )
          ) : (
            // Less details: show swap pairs and fee payments
            <>
              {getSwapPairsFromTokenTransfers(transaction).map((swap, i) => (
                <SwapLine
                  key={`swap-pair-${i}`}
                  signer={swap.signer}
                  amountA={swap.amountA}
                  mintA={swap.mintA}
                  amountB={swap.amountB}
                  mintB={swap.mintB}
                  intermediary={swap.intermediary}
                  timestamp={transaction.timestamp}
                  className="bg-[#97EF830D] rounded"
                />
              ))}
              {/* Show token fee payments if present */}
              {getTokenFeeTransfers(transaction).map((tt, i) => (
                <TransferLine
                  key={`token-fee-${i}`}
                  from={tt.fromUserAccount}
                  to={tt.toUserAccount}
                  mint={tt.mint || tt.tokenMint}
                  amount={tt.tokenAmount}
                  timestamp={transaction.timestamp}
                  direction="fee"
                  className="bg-[#97EF830D] rounded"
                />
              ))}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
