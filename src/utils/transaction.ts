export const LAMPORTS_PER_SOL = 1000000000

export const formatLamportsToSol = (lamports: number) => {
  const sol = Math.abs(lamports) / LAMPORTS_PER_SOL
  return sol.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatTokenAmount = (amount: number, decimals: number = 0): string => {
  if (typeof amount !== 'number') return '0'
  
  // Handle decimals
  const adjustedAmount = decimals > 0 ? amount / Math.pow(10, decimals) : amount
  
  // Format with commas for thousands
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: Math.min(decimals, 6), // Cap at 6 decimal places
  }).format(adjustedAmount)
}

export const getTransactionTypeColor = (type: string, source: string) => {
  // First check for known marketplaces
  switch (source) {
    case 'MAGIC_EDEN':
      return 'bg-purple-900/50 text-purple-400 border-purple-800'
    case 'TENSOR':
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
      return 'bg-green-900/50 text-green-400 border-green-800'
    default:
      return 'bg-gray-900/50 text-gray-400 border-gray-800'
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
      (transfer: any) => Math.abs(transfer.amount / LAMPORTS_PER_SOL) < 0.001,
    )
    if (allTinyTransfers) return true
  }
  return false
}
