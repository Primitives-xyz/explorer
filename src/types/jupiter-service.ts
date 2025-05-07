import type { QuoteResponse } from './jupiter'

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
