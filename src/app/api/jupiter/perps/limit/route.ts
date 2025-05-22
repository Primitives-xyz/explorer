import { NextResponse } from 'next/server';

interface IncreasePositionRequest {
  collateralMint: string;
  collateralTokenDelta: string;
  includeSerializedTx: boolean;
  inputMint: string;
  leverage: string;
  marketMint: string;
  maxSlippageBps: string;
  side: 'long' | 'short';
  walletAddress: string;
}

interface IncreasePositionResponse {
  quote: {
    collateralLessThanFees: boolean;
    entryPriceUsd: string;
    leverage: string;
    liquidationPriceUsd: string;
    openFeeUsd: string;
    outstandingBorrowFeeUsd: string;
    priceImpactFeeUsd: string;
    priceImpactFeeBps: string;
    positionCollateralSizeUsd: string;
    positionSizeUsd: string;
    positionSizeTokenAmount: string;
    quoteOutAmount: string | null;
    quotePriceSlippagePct: string | null;
    quoteSlippageBps: string | null;
    side: 'long' | 'short';
    sizeUsdDelta: string;
    sizeTokenDelta: string;
  };
  serializedTxBase64: string;
  positionPubkey: string;
  positionRequestPubkey: string | null;
  txMetadata: {
    blockhash: string;
    lastValidBlockHeight: string;
    transactionFeeLamports: string;
    accountRentLamports: string;
  };
  requireKeeperSignature: boolean;
}

export async function POST(request: Request) {
  try {
    const body: IncreasePositionRequest = await request.json();

    // Validate required fields
    const requiredFields = [
      'collateralMint',
      'collateralTokenDelta',
      'includeSerializedTx',
      'inputMint',
      'leverage',
      'marketMint',
      'maxSlippageBps',
      'side',
      'walletAddress'
    ];

    for (const field of requiredFields) {
      if (!body[field as keyof IncreasePositionRequest]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    console.log('body', body)

    // Forward request to Jupiter API
    const response = await fetch('https://perps-api.jup.ag/v1/positions-gasless/increase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });


    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(
        { error: errorData.message || 'Failed to increase position' },
        { status: response.status }
      );
    }

    const data: IncreasePositionResponse = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in increase position route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
