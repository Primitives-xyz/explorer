import type { TransactionConfirmationStatus } from '@solana/web3.js'
import { Connection } from '@solana/web3.js'

export const LAMPORTS_PER_SOL = 1000000000

export const formatLamportsToSol = (lamports: number) => {
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL
  // For very small values, show more decimal places
  if (sol < 0.0001) {
    return sol.toFixed(7)
  }
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })
}

export const formatTokenAmount = (
  amount: string | number,
  decimals: number = 9
) => {
  const value = Number(amount) / Math.pow(10, decimals)
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  })
}

export const getTransactionTypeColor = (type: string, source: string) => {
  // First check for known marketplaces
  switch (source) {
    case 'MAGIC_EDEN':
      return 'bg-purple-900/50 text-purple-400 border-purple-800'
    case 'TENSOR':
      // For Tensor, treat UNKNOWN type as NFT transaction
      if (type === 'UNKNOWN') {
        return 'bg-blue-900/50 text-blue-400 border-blue-800'
      }
      return 'bg-blue-900/50 text-blue-400 border-blue-800'
    case 'RAYDIUM':
      return 'bg-teal-900/50 text-teal-400 border-teal-800'
    case 'JUPITER':
      return 'bg-orange-900/50 text-orange-400 border-orange-800'
  }

  // Then fall back to transaction type colors
  switch (type) {
    case 'COMPRESSED_NFT_MINT':
      return 'bg-pink-900/50 text-pink-400 border-pink-800'
    case 'TRANSFER':
      return 'bg-blue-900/50 text-blue-400 border-blue-800'
    case 'SWAP':
      return 'bg-orange-900/50 text-orange-400 border-orange-800'
    case 'DEPOSIT':
      return 'bg-green-900/50  border-green-800'
    default:
      return '/50 text-gray-400 border-gray-800'
  }
}

export const getSourceIcon = (source: string) => {
  switch (source) {
    case 'MAGIC_EDEN':
      return '🪄'
    case 'TENSOR':
      return '⚡'
    case 'RAYDIUM':
      return '💧'
    case 'JUPITER':
      return '🌌'
    case 'SYSTEM_PROGRAM':
      return '💻'
    default:
      return null
  }
}

export const getTokenSymbol = (mint: string) => {
  switch (mint) {
    case 'So11111111111111111111111111111111111111112':
      return 'SOL'
    case 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v':
      return 'USDC'
    default:
      return 'Unknown'
  }
}

export const formatAddress = (address: string | undefined | null) => {
  if (!address) return 'Unknown'
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

// Helper function to detect spam/dust transactions
export const isSpamTransaction = (tx: any) => {
  // Check if it's a multi-transfer with tiny amounts
  if (
    tx.type === 'TRANSFER' &&
    tx.nativeTransfers &&
    tx.nativeTransfers.length > 3
  ) {
    // Check if all transfers are tiny amounts (less than 0.001 SOL)
    const allTinyTransfers = tx.nativeTransfers.every(
      (transfer: any) => Math.abs(transfer.amount / LAMPORTS_PER_SOL) < 0.001
    )
    if (allTinyTransfers) return true
  }
  return false
}

// Helper to identify royalty payments in NFT transactions
export const getRoyaltyInfo = (tx: any) => {
  // Only process NFT transactions from marketplaces
  if (!tx || (tx.source !== 'TENSOR' && tx.source !== 'MAGIC_EDEN')) {
    return null
  }

  const changes = tx.balanceChanges || {}
  const totalChange = Object.values(changes).reduce(
    (sum: number, val: any) => Math.abs(sum) + Math.abs(Number(val)),
    0
  )

  // Find potential royalty payments (typically 1-10% of total transaction value)
  const royaltyPayments = Object.entries(changes)
    .filter(([_address, amount]) => {
      const absAmount = Math.abs(Number(amount))
      const percentage = (absAmount / totalChange) * 100
      // Royalties typically fall between 1-10% of total transaction value
      return Number(amount) > 0 && percentage >= 1 && percentage <= 10
    })
    .map(([address, amount]) => ({
      address,
      amount: Number(amount),
      percentage: ((Math.abs(Number(amount)) / totalChange) * 100).toFixed(2),
    }))

  if (royaltyPayments.length === 0) return null

  return {
    payments: royaltyPayments,
    totalVolume: totalChange,
  }
}

// Helper to get role in NFT transaction
export const getNFTTransactionRole = (address: string, tx: any) => {
  if (!tx.balanceChanges) return 'unknown'

  const changes = tx.balanceChanges
  const amount = changes[address]

  if (!amount) return 'unknown'

  // Get royalty info to identify royalty receivers
  const royaltyInfo = getRoyaltyInfo(tx)
  const isRoyaltyReceiver = royaltyInfo?.payments.some(
    (p) => p.address === address
  )

  if (isRoyaltyReceiver) return 'royalty'
  if (amount < 0) return 'buyer'
  if (amount > 0) return 'seller'

  return 'unknown'
}

// Helper to get role-based styling
export const getNFTTransactionRoleColor = (role: string) => {
  switch (role) {
    case 'buyer':
      return 'text-red-400'
    case 'seller':
      return ''
    case 'royalty':
      return 'text-purple-400'
    default:
      return 'text-gray-400'
  }
}

type ConfirmationStatus = TransactionConfirmationStatus

interface SignatureStatus {
  slot: number
  confirmations: number | null
  err: any
  confirmationStatus?: ConfirmationStatus
}

/**
 * Custom transaction confirmation that polls faster than the default confirmTransaction
 * @param connection - Solana connection instance
 * @param signature - Transaction signature to confirm
 * @param desiredConfirmationStatus - Desired confirmation status
 * @param timeout - Maximum time to wait for confirmation in milliseconds
 * @returns The final signature status
 */
export async function confirmTransactionFast(
  connection: Connection,
  signature: string,
  desiredConfirmationStatus: ConfirmationStatus = 'confirmed',
  timeout = 30000 // 30 seconds default timeout
): Promise<SignatureStatus> {
  const startTime = Date.now()

  while (true) {
    if (Date.now() - startTime > timeout) {
      throw new Error(`Transaction confirmation timeout after ${timeout}ms`)
    }

    const response = await connection.getSignatureStatuses([signature])
    const status = response.value[0]

    if (!status) {
      // If status is null, transaction hasn't been seen yet - wait a bit and retry
      await new Promise((resolve) => setTimeout(resolve, 300))
      continue
    }

    if (status.err) {
      const errorContext = {
        signature,
        error: status.err,
        slot: status.slot,
        confirmations: status.confirmations,
        confirmationStatus: status.confirmationStatus,
        timeElapsed: Date.now() - startTime,
        desiredConfirmationStatus,
      }
      console.error(
        'Transaction failed:',
        JSON.stringify(errorContext, null, 2)
      )
      throw new Error(`Transaction failed: ${JSON.stringify(errorContext)}`)
    }

    // Return if we've reached our desired confirmation status
    if (
      status.confirmationStatus === desiredConfirmationStatus ||
      status.confirmationStatus === 'finalized'
    ) {
      return status
    }

    // If we're here, transaction is confirmed but not at our desired status yet
    // Poll faster than the default confirmTransaction
    await new Promise((resolve) => setTimeout(resolve, 150))
  }
}
