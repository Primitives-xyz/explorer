'use client'

import { useIsMobile } from '@/utils/use-is-mobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { FullPageSpinner } from '../ui'
import { AmbiguousTransactionView } from './ambiguous-transaction/ambiguous-transaction-view'
import { useTransactionWithContent } from './hooks/use-transaction-with-content'
import { SwapTransactionView } from './swap-transaction/swap-transaction-view'
import { TransactionError } from './transaction-error'
import { TransactionLoading } from './transaction-loading'
import { TransactionNotFound } from './transaction-not-found'
import { TransferTransactionView } from './transfer-transaction/transfer-transaction-view'

interface TransactionDetailsProps {
  signature: string
}

// Helper function to detect if a transaction is a swap based on token transfers
function isSwapTransaction(transaction: any, content: any): boolean {
  // If we have content with type 'swap', it's definitely a swap
  if (content?.type === 'swap') return true

  // Check if Helius already identified it as a swap
  if (transaction.type === 'SWAP') return true

  // TOKEN_MINT transactions are often swaps (especially with multiple transfers)
  if (
    transaction.type === 'TOKEN_MINT' &&
    transaction.tokenTransfers?.length >= 2
  ) {
    return true
  }

  // Check for swap patterns in token transfers
  if (transaction.tokenTransfers && transaction.tokenTransfers.length >= 2) {
    const feePayer = transaction.feePayer

    // Look for pattern: feePayer sends token A and receives token B
    const outgoingTransfers = transaction.tokenTransfers.filter(
      (tt: any) => tt.fromUserAccount === feePayer
    )
    const incomingTransfers = transaction.tokenTransfers.filter(
      (tt: any) => tt.toUserAccount === feePayer
    )

    // If we have both outgoing and incoming transfers, it's likely a swap
    if (outgoingTransfers.length > 0 && incomingTransfers.length > 0) {
      return true // More aggressive - any in/out pattern is considered a swap
    }

    // Also check for intermediary patterns (A->B->C where A is feePayer)
    const hasIntermediaryPattern = transaction.tokenTransfers.some(
      (tt1: any, idx1: number) => {
        if (tt1.fromUserAccount !== feePayer) return false

        // Look for a subsequent transfer from the recipient
        return transaction.tokenTransfers.some((tt2: any, idx2: number) => {
          return idx2 > idx1 && tt2.fromUserAccount === tt1.toUserAccount
        })
      }
    )

    if (hasIntermediaryPattern) return true
  }

  // Check for swap events
  if (transaction.events?.swap) return true

  // Check source for known DEXs
  const swapSources = [
    'JUPITER',
    'RAYDIUM',
    'ORCA',
    'METEORA',
    'PHOENIX',
    'UNKNOWN',
  ]
  if (
    transaction.source &&
    swapSources.includes(transaction.source.toUpperCase())
  )
    return true

  // Check description for swap keywords
  if (transaction.description?.toLowerCase().includes('swap')) return true

  // If there are multiple different token types being transferred, assume it's a swap
  if (transaction.tokenTransfers?.length >= 2) {
    const uniqueMints = new Set(
      transaction.tokenTransfers.map((tt: any) => tt.mint).filter(Boolean)
    )
    if (uniqueMints.size >= 2) return true
  }

  return false
}

export default function TransactionDetails({
  signature,
}: TransactionDetailsProps) {
  const { isMobile } = useIsMobile()
  const { push } = useRouter()
  const { transaction, content, isLoading, error } =
    useTransactionWithContent(signature)

  useEffect(() => {
    if (isMobile) {
      push('/trade')
    }
  }, [isMobile, push])

  if (isMobile) {
    return <FullPageSpinner />
  }

  if (isLoading) {
    return <TransactionLoading />
  }

  if (error) {
    return <TransactionError errorMessage={error.toString()} />
  }

  if (!transaction) {
    return <TransactionNotFound />
  }

  const renderTransactionContent = () => {
    // Debug logging
    const isSwap = isSwapTransaction(transaction, content)

    // Use our improved swap detection
    if (isSwap) {
      console.log(
        '✅ Rendering as SWAP transaction (content type:',
        content?.type,
        ')'
      )
      return (
        <SwapTransactionView transaction={transaction} signature={signature} />
      )
    }

    if (transaction.type === 'TRANSFER') {
      console.log('📤 Rendering as TRANSFER transaction')
      return <TransferTransactionView transaction={transaction} />
    }

    console.log('❓ Falling back to AmbiguousTransactionView')
    return <AmbiguousTransactionView transaction={transaction} />
  }

  return (
    <div className="overflow-visible mb-10">{renderTransactionContent()}</div>
  )
}
