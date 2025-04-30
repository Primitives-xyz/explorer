import { Transaction } from '@/components/tapestry/models/helius.models'
import { SOL_MINT, SSE_MINT } from '@/utils/constants'
import { abbreviateWalletAddress } from '@/utils/utils'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { IHomeTransaction } from '../home-transactions.models'

export interface ProcessedTokenTransfer {
  mint: string
  amount: number
  symbol: string
}

export interface ProcessedTransaction {
  feePayer: string
  fee: number
  outgoingTokens: { [mint: string]: ProcessedTokenTransfer }
  incomingTokens: { [mint: string]: ProcessedTokenTransfer }
  solTransfers: { from: string; to: string; amount: number }[]
  circularTokens: Set<string>
  formattedDate: string
  formattedTime: string
  timeAgo: Date
  primaryOutgoingToken: ProcessedTokenTransfer | null
  primaryIncomingToken: ProcessedTokenTransfer | null
}

export function processSwapTransaction(
  transaction: IHomeTransaction
): ProcessedTransaction {
  // Extract basic transaction info
  const feePayer = transaction.feePayer
  const fee = transaction.fee ? transaction.fee / LAMPORTS_PER_SOL : 0

  // Process token transfers
  const outgoingTokens: { [mint: string]: ProcessedTokenTransfer } = {}
  const incomingTokens: { [mint: string]: ProcessedTokenTransfer } = {}

  // Track SOL transfers separately (from nativeTransfers)
  const solTransfers: { from: string; to: string; amount: number }[] = []

  // Track primary outgoing and incoming tokens
  let primaryOutgoingToken: ProcessedTokenTransfer | null = null
  let primaryIncomingToken: ProcessedTokenTransfer | null = null

  // First, collect all native SOL transfers
  if (transaction.nativeTransfers && transaction.nativeTransfers.length > 0) {
    transaction.nativeTransfers.forEach((transfer) => {
      const amount = transfer.amount / LAMPORTS_PER_SOL

      // Track for display
      solTransfers.push({
        from: transfer.fromUserAccount || '',
        to: transfer.toUserAccount || '',
        amount: amount,
      })

      // Also include in outgoing/incoming tracking
      if (transfer.fromUserAccount === feePayer) {
        if (!outgoingTokens[SOL_MINT]) {
          outgoingTokens[SOL_MINT] = {
            mint: SOL_MINT,
            amount: amount,
            symbol: 'SOL',
          }
        } else {
          outgoingTokens[SOL_MINT].amount += amount
        }
      }

      if (transfer.toUserAccount === feePayer) {
        if (!incomingTokens[SOL_MINT]) {
          incomingTokens[SOL_MINT] = {
            mint: SOL_MINT,
            amount: amount,
            symbol: 'SOL',
          }
        } else {
          incomingTokens[SOL_MINT].amount += amount
        }
      }
    })
  }

  // Process token transfers
  if (transaction.tokenTransfers && transaction.tokenTransfers.length > 0) {
    // Track if a token transfer is also in native transfers to avoid duplication
    const processedSolTransfers = new Set()

    // Find the first outgoing transfer (fromUserAccount matching feePayer)
    const firstOutgoingTransfer = transaction.tokenTransfers.find(
      (transfer) => transfer.fromUserAccount === feePayer && transfer.mint
    )

    // Find the last incoming transfer (toUserAccount matching feePayer)
    const lastIncomingTransfer = [...transaction.tokenTransfers]
      .reverse()
      .find((transfer) => transfer.toUserAccount === feePayer && transfer.mint)

    // Process all transfers to build the full picture
    transaction.tokenTransfers.forEach((transfer) => {
      if (!transfer.mint) return

      // Skip SOL transfers that were already processed in nativeTransfers
      if (transfer.mint === SOL_MINT) {
        const transferKey = `${transfer.fromUserAccount}-${transfer.toUserAccount}`
        if (processedSolTransfers.has(transferKey)) return
        processedSolTransfers.add(transferKey)
      }

      // Get token symbol
      const tokenSymbol = getTokenSymbol(transfer.mint)

      // Outgoing tokens (from fee payer)
      if (transfer.fromUserAccount === feePayer) {
        if (!outgoingTokens[transfer.mint]) {
          outgoingTokens[transfer.mint] = {
            mint: transfer.mint,
            amount: transfer.tokenAmount,
            symbol: tokenSymbol,
          }
        } else {
          outgoingTokens[transfer.mint].amount += transfer.tokenAmount
        }
      }

      // Incoming tokens (to fee payer)
      if (transfer.toUserAccount === feePayer) {
        if (!incomingTokens[transfer.mint]) {
          incomingTokens[transfer.mint] = {
            mint: transfer.mint,
            amount: transfer.tokenAmount,
            symbol: tokenSymbol,
          }
        } else {
          incomingTokens[transfer.mint].amount += transfer.tokenAmount
        }
      }
    })

    // Set primary outgoing token from first outgoing transfer
    if (firstOutgoingTransfer && firstOutgoingTransfer.mint) {
      const symbol = getTokenSymbol(firstOutgoingTransfer.mint)
      primaryOutgoingToken = {
        mint: firstOutgoingTransfer.mint,
        amount: firstOutgoingTransfer.tokenAmount,
        symbol,
      }
    }

    // Set primary incoming token from last incoming transfer
    if (lastIncomingTransfer && lastIncomingTransfer.mint) {
      const symbol = getTokenSymbol(lastIncomingTransfer.mint)
      primaryIncomingToken = {
        mint: lastIncomingTransfer.mint,
        amount: lastIncomingTransfer.tokenAmount,
        symbol,
      }
    }
  }

  // Detect circular transfers (same token going both ways)
  const circularTokens = new Set<string>()
  Object.keys(outgoingTokens).forEach((mint) => {
    if (incomingTokens[mint]) {
      circularTokens.add(mint)
    }
  })

  // Format date/time
  const formattedDate = new Date(
    transaction.timestamp * 1000
  ).toLocaleDateString()
  const formattedTime = new Date(
    transaction.timestamp * 1000
  ).toLocaleTimeString()

  // If we didn't find primary tokens in token transfers, use the first from outgoingTokens/incomingTokens
  if (!primaryOutgoingToken && Object.keys(outgoingTokens).length > 0) {
    const mint = Object.keys(outgoingTokens)[0]
    primaryOutgoingToken = outgoingTokens[mint]
  }

  if (!primaryIncomingToken && Object.keys(incomingTokens).length > 0) {
    const mint = Object.keys(incomingTokens)[0]
    primaryIncomingToken = incomingTokens[mint]
  }

  return {
    feePayer,
    fee,
    outgoingTokens,
    incomingTokens,
    solTransfers,
    circularTokens,
    formattedDate,
    formattedTime,
    timeAgo: new Date(transaction.timestamp * 1000),
    primaryOutgoingToken,
    primaryIncomingToken,
  }
}

// Helper function to get a token symbol
export function getTokenSymbol(mint: string): string {
  if (mint === SOL_MINT) return 'SOL'
  if (mint === SSE_MINT) return 'SSE'

  // For other tokens, try to find a symbol, or use a short address
  return abbreviateWalletAddress({ address: mint })
}

// Get a sample outgoing token for display (for now just pick the first one)
export function getDisplayOutgoingToken(
  outgoingTokens: { [mint: string]: ProcessedTokenTransfer },
  primaryToken: ProcessedTokenTransfer | null = null
): ProcessedTokenTransfer | null {
  // If there's a primary token, use that
  if (primaryToken) return primaryToken

  // Otherwise fallback to the first one
  const mints = Object.keys(outgoingTokens)
  if (mints.length === 0) return null
  return outgoingTokens[mints[0]]
}

// Get a sample incoming token for display (for now just pick the first one)
export function getDisplayIncomingToken(
  incomingTokens: { [mint: string]: ProcessedTokenTransfer },
  primaryToken: ProcessedTokenTransfer | null = null
): ProcessedTokenTransfer | null {
  // If there's a primary token, use that
  if (primaryToken) return primaryToken

  // Otherwise fallback to the first one
  const mints = Object.keys(incomingTokens)
  if (mints.length === 0) return null
  return incomingTokens[mints[0]]
}

// Returns an array of swap pairs for the less details view
export function getSwapPairsFromTokenTransfers(
  transaction: Transaction
): Array<{
  signer: string
  amountA: number
  symbolA: string
  mintA: string
  amountB: number
  symbolB: string
  mintB: string
  intermediary: string
}> {
  const feePayer = transaction.feePayer
  const transfers =
    transaction.tokenTransfers?.map((tt) => ({
      from: tt.fromUserAccount,
      to: tt.toUserAccount,
      mint: tt.mint || tt.tokenMint,
      amount: tt.tokenAmount,
    })) || []

  // Build a list of swaps: outgoing from signer, then incoming to signer or intermediary
  const swaps: Array<{
    signer: string
    amountA: number
    symbolA: string
    mintA: string
    amountB: number
    symbolB: string
    mintB: string
    intermediary: string
  }> = []

  // Track which transfers have been used
  const used = new Set<number>()

  for (let i = 0; i < transfers.length; i++) {
    const out = transfers[i]
    if (out.from !== feePayer || used.has(i)) continue
    // Find the next transfer that is not from the signer, and is not the same mint
    for (let j = 0; j < transfers.length; j++) {
      if (i === j || used.has(j)) continue
      const inc = transfers[j]
      // Must be a different mint, and either to the signer or to an intermediary
      if (
        inc.mint !== out.mint &&
        (inc.to === feePayer || inc.from === out.to)
      ) {
        swaps.push({
          signer: feePayer,
          amountA: out.amount,
          symbolA: getTokenSymbol(out.mint),
          mintA: out.mint,
          amountB: inc.amount,
          symbolB: getTokenSymbol(inc.mint),
          mintB: inc.mint,
          intermediary: inc.to === feePayer ? inc.from : inc.to,
        })
        used.add(i)
        used.add(j)
        break
      }
    }
  }

  return swaps
}

// Returns an array of token fee transfers: transfers where the feePayer sends tokens to an address that never sends anything back to the feePayer in this transaction
export function getTokenFeeTransfers(transaction: Transaction) {
  if (!transaction.tokenTransfers || transaction.tokenTransfers.length === 0)
    return []

  const feePayer = transaction.feePayer
  // Build a set of all (from, to) pairs where to === feePayer
  const sentBackToFeePayer = new Set<string>()
  transaction.tokenTransfers.forEach((tt) => {
    if (tt.toUserAccount === feePayer && tt.fromUserAccount) {
      sentBackToFeePayer.add(tt.fromUserAccount)
    }
  })

  // A fee transfer is one where feePayer sends to an address that never sends anything back to feePayer
  return transaction.tokenTransfers.filter((tt) => {
    if (tt.fromUserAccount !== feePayer || !tt.toUserAccount) return false
    // If recipient never sends anything to feePayer, it's a fee
    return !sentBackToFeePayer.has(tt.toUserAccount)
  })
}
