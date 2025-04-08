/**
 * Configuration for the Vertigo AMM SDK
 */
export const VERTIGO_CONFIG = {
  // Fee wallet for platform fees
  FEE_WALLET: process.env.FEE_WALLET || '',

  // Default fee in basis points (1% = 100 basis points)
  DEFAULT_ROYALTIES_BPS: 100,

  // Default settings for a new pool
  DEFAULT_POOL_SETTINGS: {
    SHIFT: 100, // 100 virtual SOL
    INITIAL_TOKEN_RESERVES: 1_000_000_000, // 1 billion tokens
    DECIMALS: 9, // 9 decimals
    NORMALIZATION_PERIOD: 20, // 20 slots
    DECAY: 10,
    FEE_EXEMPT_BUYS: 1,
  },

  // Default slippage tolerance in basis points (0.5% = 50 basis points)
  DEFAULT_SLIPPAGE_BPS: 50,
}
