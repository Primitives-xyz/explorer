// Base properties that all transactions share
interface BaseTransactionContent {
  type: 'swap'
  inputMint: string
  outputMint: string
  inputAmount: string
  expectedOutput: string
  priceImpact: string
  slippageBps: string
  priorityLevel: string
  txSignature: string
  timestamp: string

  // Token information
  inputTokenSymbol: string
  inputTokenImage: string
  inputTokenDecimals: string
  inputTokenName: string
  inputTokenDescription: string

  outputTokenSymbol: string
  outputTokenImage: string
  outputTokenDecimals: string
  outputTokenName: string
  outputTokenDescription: string

  // Wallet that executed the transaction
  walletAddress: string
  walletUsername?: string
  walletImage?: string
}

// Direct swap transaction (user trading directly)
export interface DirectSwapContent extends BaseTransactionContent {
  transactionType: 'direct'
  sourceWallet: '' // Empty string for direct swaps
  sourceWalletUsername: '' // Empty string for direct swaps
  sourceWalletImage: '' // Empty string for direct swaps
}

// Copied swap transaction (user copying another user's trade)
export interface CopiedSwapContent extends BaseTransactionContent {
  transactionType: 'copied'
  sourceWallet: string // Original trader's wallet
  sourceWalletUsername?: string // Original trader's username if available
  sourceWalletImage?: string // Original trader's profile image if available
}

// Union type for all transaction content types
export type TransactionContent = DirectSwapContent | CopiedSwapContent

// Type guard to check if a transaction is a copied swap
export function isCopiedSwap(
  content: TransactionContent
): content is CopiedSwapContent {
  return content.transactionType === 'copied'
}

// Type guard to check if a transaction is a direct swap
export function isDirectSwap(
  content: TransactionContent
): content is DirectSwapContent {
  return content.transactionType === 'direct'
}

// Base display data that all transactions share
interface BaseDisplayData {
  amount: string
  output: string
  timestamp: Date
  priceImpact: string
  slippage: string
}

// Display data for direct swaps
interface DirectSwapDisplayData extends BaseDisplayData {
  type: 'direct'
  trader: string
  traderImage?: string
}

// Display data for copied swaps
interface CopiedSwapDisplayData extends BaseDisplayData {
  type: 'copied'
  sourceUser: string
  sourceImage?: string
  copier: string
  copierImage?: string
}

// Union type for all display data
export type TransactionDisplayData =
  | DirectSwapDisplayData
  | CopiedSwapDisplayData

// Helper function to format transaction content for display
export function getTransactionDisplayData(
  content: TransactionContent
): TransactionDisplayData {
  const base = {
    amount: `${content.inputAmount} ${content.inputTokenSymbol}`,
    output: `${content.expectedOutput} ${content.outputTokenSymbol}`,
    timestamp: new Date(Number(content.timestamp)),
    priceImpact: Number(content.priceImpact).toFixed(2),
    slippage: (Number(content.slippageBps) / 100).toFixed(1),
  }

  if (isCopiedSwap(content)) {
    return {
      ...base,
      type: 'copied' as const,
      sourceUser: content.sourceWalletUsername || content.sourceWallet,
      sourceImage: content.sourceWalletImage,
      copier: content.walletUsername || content.walletAddress,
      copierImage: content.walletImage,
    }
  }

  return {
    ...base,
    type: 'direct' as const,
    trader: content.walletUsername || content.walletAddress,
    traderImage: content.walletImage,
  }
}
