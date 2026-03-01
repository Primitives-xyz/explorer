import type { QuoteResponse } from './jupiter'

// ─── Legacy Metis Types (used by Actions/Blinks) ─────────────────────────────

export interface SwapInstructionsRequest {
  quoteResponse: QuoteResponse
  userPublicKey: string
  prioritizationFeeLamports?: number
  feeAccount?: string
  slippageBps: number | 'auto'
}

export interface SwapInstructionsResponse {
  swapInstruction: any
  setupInstructions?: any[]
  cleanupInstruction?: any
  computeBudgetInstructions?: any[]
  tokenLedgerInstruction?: any
  addressLookupTableAddresses?: string[]
  computeUnitLimit?: number
  lastValidBlockHeight?: number
  prioritizationFeeLamports?: number
}

export interface SwapRouteResponse {
  transaction: string
  lastValidBlockHeight?: number
  computeUnitLimit?: number
  prioritizationFeeLamports?: number
}

// ─── Ultra Swap Types ─────────────────────────────────────────────────────────

export interface UltraOrderResponse {
  mode: string
  inputMint: string
  outputMint: string
  inAmount: string
  outAmount: string
  inUsdValue?: number
  outUsdValue?: number
  priceImpact?: number
  swapUsdValue?: number
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  priceImpactPct: string
  routePlan: UltraRoutePlanStep[]
  referralAccount?: string
  feeMint?: string
  feeBps: number
  platformFee: {
    amount?: string
    feeBps: number
  }
  signatureFeeLamports: number
  signatureFeePayer: string | null
  prioritizationFeeLamports: number
  prioritizationFeePayer: string | null
  rentFeeLamports: number
  rentFeePayer: string | null
  swapType: string
  router: 'iris' | 'jupiterz' | 'dflow' | 'okx'
  transaction: string | null
  gasless: boolean
  requestId: string
  totalTime: number
  taker: string | null
  quoteId?: string
  maker?: string
  expireAt?: string
  errorCode?: number
  errorMessage?: string
}

export interface UltraRoutePlanStep {
  swapInfo: {
    ammKey: string
    label: string
    inputMint: string
    outputMint: string
    inAmount: string
    outAmount: string
  }
  percent: number
  bps: number
  usdValue?: number
}

export interface UltraExecuteRequest {
  signedTransaction: string
  requestId: string
}

export interface UltraExecuteResponse {
  status: 'Success' | 'Failed'
  signature?: string
  slot?: string
  error?: string
  code: number
  totalInputAmount?: string
  totalOutputAmount?: string
  inputAmountResult?: string
  outputAmountResult?: string
  swapEvents?: {
    inputMint: string
    inputAmount: string
    outputMint: string
    outputAmount: string
  }[]
}
