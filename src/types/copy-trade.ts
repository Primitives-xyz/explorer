// Copy Trade Tracking Types

export interface CopyTradeRecord {
  id: string
  sourceTransactionId: string // Original trade signature
  copiedTransactionId: string // Copy trade signature
  sourceWallet: string
  copierWallet: string
  sourceUsername?: string
  copierUsername?: string

  // Trade details
  inputMint: string
  outputMint: string
  inputAmount: string
  outputAmount: string
  inputTokenSymbol: string
  outputTokenSymbol: string

  // Financial metrics
  inputAmountUsd: number
  outputAmountUsd: number
  profitUsd: number
  profitPercentage: number

  // Copy trade specific
  copyDelay: number // Time between original and copy in seconds
  slippageDifference: number // Difference in slippage settings
  priceImpactDifference: number // Difference in price impact

  // Payment tracking
  paymentStatus: 'pending' | 'calculated' | 'paid' | 'disputed'
  paymentAmount?: number // Amount to pay source trader
  paymentPercentage?: number // Percentage of profit to share
  paymentTransactionId?: string

  // Timestamps
  sourceTimestamp: Date
  copiedTimestamp: Date
  createdAt: Date
  updatedAt: Date
}

export interface CopyTradeStats {
  walletAddress: string
  username?: string

  // As source (being copied)
  totalTradesCopied: number
  uniqueCopiers: number
  totalVolumeGeneratedUsd: number
  totalProfitGeneratedUsd: number
  totalEarnedUsd: number
  pendingPaymentsUsd: number

  // As copier (copying others)
  totalTradesCopiedFrom: number
  uniqueSourceTraders: number
  totalVolumeCopiedUsd: number
  totalProfitFromCopiesUsd: number
  totalPaidUsd: number
  totalOwedUsd: number

  // Performance metrics
  averageCopyDelay: number
  successRate: number // Percentage of profitable copies
  averageProfitPerCopy: number

  // Time-based stats
  last24h: {
    tradesCopied: number
    volumeGeneratedUsd: number
    profitGeneratedUsd: number
  }
  last7d: {
    tradesCopied: number
    volumeGeneratedUsd: number
    profitGeneratedUsd: number
  }
  last30d: {
    tradesCopied: number
    volumeGeneratedUsd: number
    profitGeneratedUsd: number
  }
}

export interface PaymentConfiguration {
  id: string
  walletAddress: string

  // Payment settings
  profitSharePercentage: number // Default percentage to share with copiers
  minimumPaymentUsd: number // Minimum payment threshold
  paymentFrequency: 'immediate' | 'daily' | 'weekly' | 'monthly'
  preferredPaymentToken: string // Token mint address for payments

  // Copier settings
  allowedCopiers: 'all' | 'whitelist' | 'holders' // Who can copy trades
  whitelistedWallets?: string[]
  requiredTokenMint?: string // Token that copiers must hold
  requiredTokenAmount?: number

  // Trade settings
  allowedTokens: 'all' | 'whitelist' // Which tokens can be copied
  whitelistedTokens?: string[]
  minimumTradeSize?: number // Minimum trade size in USD to be copyable

  // Status
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface PaymentRecord {
  id: string
  fromWallet: string // Copier
  toWallet: string // Source trader
  amount: number
  tokenMint: string
  tokenSymbol: string

  // Related trades
  copyTradeIds: string[] // Array of copy trade records this payment covers
  totalTradesCount: number
  totalVolumeUsd: number
  totalProfitUsd: number

  // Payment details
  paymentPercentage: number
  transactionSignature?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  failureReason?: string

  // Timestamps
  periodStart: Date
  periodEnd: Date
  createdAt: Date
  processedAt?: Date
}

export interface CopyTradeLeaderboard {
  period: 'daily' | 'weekly' | 'monthly' | 'all-time'
  entries: CopyTradeLeaderboardEntry[]
  updatedAt: Date
}

export interface CopyTradeLeaderboardEntry {
  rank: number
  walletAddress: string
  username?: string
  profileImage?: string

  // Metrics
  totalCopiers: number
  totalTradesCopied: number
  totalVolumeGeneratedUsd: number
  totalProfitGeneratedUsd: number
  totalEarnedUsd: number
  successRate: number

  // Recent performance
  last24hChange: number // Percentage change in copiers
  trending: boolean
}

// Helper types for API responses
export interface CopyTradeAnalytics {
  overview: {
    totalCopyTrades: number
    totalVolumeUsd: number
    totalProfitGeneratedUsd: number
    totalPaymentsUsd: number
    activeSourceTraders: number
    activeCopiers: number
  }

  topSourceTraders: CopyTradeLeaderboardEntry[]
  topCopiers: {
    walletAddress: string
    username?: string
    totalProfitUsd: number
    totalPaidUsd: number
    favoriteTraders: string[]
  }[]

  recentCopyTrades: CopyTradeRecord[]
  pendingPayments: PaymentRecord[]
}

export interface CopyTradeNotification {
  id: string
  type: 'trade_copied' | 'payment_received' | 'payment_sent' | 'new_copier'
  recipientWallet: string

  // Notification content
  title: string
  message: string
  data: {
    transactionId?: string
    copierWallet?: string
    sourceWallet?: string
    amount?: number
    tokenSymbol?: string
  }

  // Status
  read: boolean
  createdAt: Date
}
