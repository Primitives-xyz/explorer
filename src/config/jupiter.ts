export const JUPITER_CONFIG = {
  // Platform fee configuration (legacy, for Metis/Actions)
  PLATFORM_FEE_BPS: 100, // 1%
  MIN_PLATFORM_FEE_BPS: 1, // Minimum fee when using SSE
  FEE_WALLET: '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz',

  // SSE token configuration
  SSE_TOKEN_MINT: 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump',

  // Transaction configuration
  DEFAULT_SLIPPAGE_BPS: 50, // 0.5%
  DEFAULT_PRIORITY_LEVEL: 'Medium' as const,
} as const

export type PriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'
