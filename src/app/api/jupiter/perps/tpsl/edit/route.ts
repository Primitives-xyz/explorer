import { NextResponse } from 'next/server'

interface TPSLRequest {
  positionRequestPubkey: string
  triggerPrice: string
}

export async function POST(request: Request) {
  try {
    const body: TPSLRequest = await request.json()

    if (!body.positionRequestPubkey || body.positionRequestPubkey === '') {
      return NextResponse.json(
        { error: 'Position request public key is required' },
        { status: 400 }
      )
    }

    if (!body.triggerPrice || body.triggerPrice === '') {
      return NextResponse.json(
        { error: 'Trigger price is required' },
        { status: 400 }
      )
    }

    const response = await fetch('https://perps-api.jup.ag/v1/tpsl', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.json()
      console.log('error', error)
      return NextResponse.json(
        { error: error.message || 'Failed to edit TPSL' },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('TPSL Edit API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
