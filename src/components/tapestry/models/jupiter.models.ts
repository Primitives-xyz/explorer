export interface JupiterSwapFormProps {
  initialInputMint?: string
  initialOutputMint?: string
  initialAmount?: string
  inputTokenName?: string
  outputTokenName?: string
  inputDecimals?: number
  sourceWallet?: string
  disableUrlUpdates?: boolean
}

export type PriorityLevel =
  | 'Min'
  | 'Low'
  | 'Medium'
  | 'High'
  | 'VeryHigh'
  | 'UnsafeMax'

export interface QuoteResponse {
  inputMint: string
  inAmount: string
  outputMint: string
  outAmount: string
  otherAmountThreshold: string
  swapMode: string
  slippageBps: number
  platformFee?: {
    amount: string
    feeBps: number
  }
  priceImpactPct: string
  routePlan: {
    swapInfo: {
      ammKey: string
      label: string
      inputMint: string
      outputMint: string
      inAmount: string
      outAmount: string
      feeAmount: string
      feeMint: string
    }
    percent: number
  }[]
  contextSlot: number
  timeTaken: number
  swapUsdValue?: string
  simplerRouteUsed?: boolean
}

export interface PriorityLevelOption {
  label: string
  value: PriorityLevel
  description: string
}

export type SlippageValue = number | 'auto'

export interface IncreasePositionResponse {
  quote: {
    collateralLessThanFees: boolean
    entryPriceUsd: string
    leverage: string
    liquidationPriceUsd: string
    openFeeUsd: string
    outstandingBorrowFeeUsd: string
    priceImpactFeeUsd: string
    priceImpactFeeBps: string
    positionCollateralSizeUsd: string
    positionSizeUsd: string
    positionSizeTokenAmount: string
    quoteOutAmount: string | null
    quotePriceSlippagePct: string | null
    quoteSlippageBps: string | null
    side: 'long' | 'short'
    sizeUsdDelta: string
    sizeTokenDelta: string
  }
  serializedTxBase64: string
  positionPubkey: string
  positionRequestPubkey: string | null
  txMetadata: {
    blockhash: string
    lastValidBlockHeight: string
    transactionFeeLamports: string
    accountRentLamports: string
  }
  requireKeeperSignature: boolean
}

export interface LimitOrderResponse {
  quote: {
    entryPriceUsd: string
    leverage: string
    liquidationPriceUsd: string
    openFeeUsd: string
    outstandingBorrowFeeUsd: string
    priceImpactFeeUsd: string
    priceImpactFeeBps: string
    positionCollateralSizeUsdAfterFees: string
    positionCollateralSizeUsdBeforeFees: string
    positionSizeUsd: string
    positionSizeTokenAmount: string
    sizeUsdDelta: string
    sizeTokenDelta: string
    triggerToLiquidationPercent: string
  }
  serializedTxBase64: string
  txMetadata: {
    blockhash: string
    lastValidBlockHeight: string
    transactionFeeLamports: string
    accountRentLamports: string
  }
  positionPubkey: string
  positionRequestPubkey: string
  requireKeeperSignature: boolean
}

export interface TPSLRequest {
  collateralUsdDelta: string
  desiredMint: string
  entirePosition: boolean
  positionRequestPubkey: string
  positionSizeUsd: string
  positionSizeUsdFormatted: string
  sizeUsd: string
  sizeUsdFormatted: string
  sizePercentage: string
  triggerPrice: string
  triggerPriceUsd: string
  openTime: string
  requestType: string
}

export interface Position {
  borrowFees: string
  borrowFeesUsd: string
  closeFees: string
  closeFeesUsd: string
  collateral: string
  collateralUsd: string
  collateralMint: string
  createdTime: number
  entryPrice: string
  leverage: string
  liquidationPrice: string
  marketMint: string
  markPrice: string
  openFees: string
  openFeesUsd: string
  pnlAfterFees: string
  pnlAfterFeesUsd: string
  pnlBeforeFees: string
  pnlBeforeFeesUsd: string
  pnlChangePctAfterFees: string
  pnlChangePctBeforeFees: string
  positionPubkey: string
  side: 'long' | 'short'
  size: string
  sizeUsdDelta: string
  sizeTokenAmount: string
  totalFees: string
  totalFeesUsd: string
  tpslRequests: TPSLRequest[]
  updatedTime: number
  value: string
}