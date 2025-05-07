// API Endpoints
export const HELIUS_API_BASE = 'https://api.helius.xyz/v0'
export const BIRDEYE_API_BASE = 'https://public-api.birdeye.so'
export const JUPITER_API_BASE = 'https://quote-api.jup.ag/v6'
export const DICEBEAR_API_BASE = 'https://api.dicebear.com/7.x'

// DiceBear Avatar Styles
export const DICEBEAR_AVATAR_STYLES = [
  'shapes',
  'pixel-art',
  'lorelei',
  'initials',
  'bottts',
  'avataaars',
  'adventurer',
  'micah',
  'thumbs',
  'personas',
]

// External URLs
export const SOLSCAN_BASE = 'https://solscan.io'
export const TENSOR_BASE = 'https://www.tensor.trade'
export const BIRDEYE_BASE = 'https://birdeye.so'

// App Configuration
export const APP_NAME =
  process.env.NEXT_PUBLIC_APP_NAME || 'Social Graph Explorer'
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  'Explore social connections, NFTs, and token holdings on Solana'
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://explorer.usetapestry.dev'
export const APP_TWITTER_HANDLE =
  process.env.NEXT_PUBLIC_APP_TWITTER_HANDLE || '@TapestryProto'

// Tapestry Configuration
export const TAPESTRY_API_URL =
  process.env.TAPESTRY_URL || 'https://api.usetapestry.dev/api/v1'
export const TAPESTRY_ASSETS_URL =
  process.env.NEXT_PUBLIC_TAPESTRY_ASSETS_URL ||
  'https://assets.usetapestry.dev'
export const EXPLORER_NAMESPACE =
  process.env.NEXT_PUBLIC_EXPLORER_NAMESPACE || 'nemoapp'

export const X_NAMESPACE = process.env.X_NAMESPACE || 'x'

// Solana Configuration
export const SOLANA_PUBLIC_RPC_URL =
  process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'

// API Keys (these should be kept in environment variables)
export const HELIUS_API_KEY = process.env.HELIUS_API_KEY
export const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY
export const TAPESTRY_API_KEY = process.env.TAPESTRY_API_KEY

// Feature Flags
export const ENABLE_ANALYTICS =
  process.env.NEXT_PUBLIC_ENABLE_ANALYTICS === 'true'
export const IS_PRODUCTION = process.env.NODE_ENV === 'production'

// Utility Functions
export const getHeliusEndpoint = (path: string) =>
  `${HELIUS_API_BASE}${path}?api-key=${HELIUS_API_KEY}`
export const getBirdeyeEndpoint = (path: string) => `${BIRDEYE_API_BASE}${path}`
export const getJupiterEndpoint = (path: string) => `${JUPITER_API_BASE}${path}`
export const getSolscanTxUrl = (signature: string) =>
  `${SOLSCAN_BASE}/tx/${signature}`
export const getSolscanAddressUrl = (address: string) =>
  `${SOLSCAN_BASE}/account/${address}`
export const getTensorTradeUrl = (collection: string) =>
  `${TENSOR_BASE}/trade/${collection}`
export const getDicebearUrl = (seed: string) =>
  `${DICEBEAR_API_BASE}/shapes/svg?seed=${seed}`

export const SOL_MINT = 'So11111111111111111111111111111111111111112'
export const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
export const SSE_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'
export const SSE_TOKEN_DECIMAL = 6

// Platform fee configuration
export const PLATFORM_FEE_BPS = 80 // 0.8% = 80 basis points
export const PLATFORM_FEE_ACCOUNT =
  '8jTiTDW9ZbMHvAD9SZWvhPfRx5gUgK7HACMdgbFp2tUz'
export const SSE_TOKEN_MINT = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'

export const DEFAULT_SLIPPAGE_BPS = 'auto' // Default to auto slippage
export const DEFAULT_SLIPPAGE_VALUE = 25 // 0.5% as base value when needed
export const DEFAULT_PRIORITY_LEVEL = 'Medium'

export const TWITTER_REDIRECT_URL = '/x/callback'
