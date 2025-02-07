export interface JupiterSwapFormProps {
  initialInputMint?: string
  initialOutputMint?: string
  initialAmount?: string
  inputTokenName?: string
  outputTokenName?: string
  inputDecimals?: number
  sourceWallet?: string
}

export type PriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'

export interface QuoteResponse {
  outAmount: string
  priceImpactPct: string
  routePlan?: {
    swapInfo: {
      label: string
    }
  }[]
}

export interface PriorityLevelOption {
  label: string
  value: PriorityLevel
  description: string
}
