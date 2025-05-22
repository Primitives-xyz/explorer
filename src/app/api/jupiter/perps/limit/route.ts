import { NextResponse } from 'next/server'

interface LimitOrderRequest {
  collateralMint: string
  collateralTokenDelta: string
  counter: string
  includeSerializedTx: boolean
  inputMint: string
  leverage: string
  marketMint: string
  side: string
  triggerPrice: string
  walletAddress: string
}

interface LimitOrderResponse {
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

export async function POST(request: Request) {
  try {
    const body: LimitOrderRequest = await request.json()

    // Validate required fields
    const requiredFields = [
      'collateralMint',
      'collateralTokenDelta',
      'counter',
      'includeSerializedTx',
      'inputMint',
      'leverage',
      'marketMint',
      'side',
      'triggerPrice',
      'walletAddress',
    ]

    for (const field of requiredFields) {
      if (!body[field as keyof LimitOrderRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Forward request to Jupiter API
    const response = await fetch(
      'https://perps-api.jup.ag/v1/orders/limit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to create limit order' },
        { status: response.status }
      )
    }

    const data: LimitOrderResponse = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in create limit order route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
