import { NextResponse } from 'next/server'

const JUPITER_API_BASE_URL = 'https://perps-api.jup.ag/v1'

interface DecreasePositionRequest {
  collateralUsdDelta: string
  desiredMint: string
  entirePosition: boolean
  positionPubkey: string
  sizeUsdDelta: string
}

export async function POST(request: Request) {
  try {
    const body: DecreasePositionRequest = await request.json()

    // Validate required fields
    if (!body.positionPubkey || body.positionPubkey === '') {
      return NextResponse.json(
        { error: 'Position public key is required' },
        { status: 400 }
      )
    }

    if (!body.desiredMint || body.desiredMint === '') {
      return NextResponse.json(
        { error: 'Desired mint is required' },
        { status: 400 }
      )
    }

    if (typeof body.entirePosition !== 'boolean') {
      return NextResponse.json(
        { error: 'Entire position must be a boolean' },
        { status: 400 }
      )
    }

    if (!body.sizeUsdDelta || body.sizeUsdDelta === '') {
      return NextResponse.json(
        { error: 'Size USD delta is required' },
        { status: 400 }
      )
    }

    if (!body.collateralUsdDelta || body.collateralUsdDelta === '') {
      return NextResponse.json(
        { error: 'Collateral USD delta is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`${JUPITER_API_BASE_URL}/positions-gasless/decrease`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      return NextResponse.json(
        { error: error.message || 'Failed to decrease position' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Decrease Position API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 