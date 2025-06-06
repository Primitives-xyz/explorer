import { NextResponse } from 'next/server'

interface TPSLRequest {
  owner: string
  positionPubkey: string
  tpsl: {
    requestType: string
    desiredMint: string
    triggerPrice: string
    sizeUsdDelta: string
    entirePosition: boolean
  }[]
}

export async function POST(request: Request) {
  try {
    const body: TPSLRequest = await request.json()

    console.log('body', body)

    if (!body.owner || body.owner === '') {
      return NextResponse.json({ error: 'Owner is required' }, { status: 400 })
    }

    if (!body.positionPubkey || body.positionPubkey === '') {
      return NextResponse.json(
        { error: 'Position public key is required' },
        { status: 400 }
      )
    }

    if (!body.tpsl || !Array.isArray(body.tpsl) || body.tpsl.length === 0) {
      return NextResponse.json(
        { error: 'TPSL array is required and must not be empty' },
        { status: 400 }
      )
    }

    // Validate each tpsl element
    for (const tpsl of body.tpsl) {
      if (!tpsl.requestType) {
        return NextResponse.json(
          { error: 'Request type is required for each TPSL entry' },
          { status: 400 }
        )
      }

      if (!tpsl.desiredMint || tpsl.desiredMint === '') {
        return NextResponse.json(
          { error: 'Desired mint is required for each TPSL entry' },
          { status: 400 }
        )
      }

      if (!tpsl.triggerPrice || tpsl.triggerPrice === '') {
        return NextResponse.json(
          { error: 'Trigger price is required for each TPSL entry' },
          { status: 400 }
        )
      }

      if (!tpsl.sizeUsdDelta || tpsl.sizeUsdDelta === '') {
        return NextResponse.json(
          { error: 'Size USD delta is required for each TPSL entry' },
          { status: 400 }
        )
      }

      if (typeof tpsl.entirePosition !== 'boolean') {
        return NextResponse.json(
          { error: 'Entire position must be a boolean for each TPSL entry' },
          { status: 400 }
        )
      }
    }

    const response = await fetch('https://perps-api.jup.ag/v1/tpsl', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      console.log('error', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create TPSL' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('TPSL API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
