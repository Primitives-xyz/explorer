import { NextResponse } from 'next/server'

interface Payload {
  action: string
  serializedTxBase64: string
}

interface ResponseData {
  action: string
  txid: string
}

export async function POST(request: Request) {
  try {
    const body: Payload = await request.json()

    if (!body.serializedTxBase64) {
      return NextResponse.json(
        { error: 'Missing required field: serializedTxBase64' },
        { status: 400 }
      )
    }

    // Forward request to Jupiter API
    const response = await fetch(
      'https://perps-api.jup.ag/v1/transaction/execute',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: body.action,
          serializedTxBase64: body.serializedTxBase64,
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.message || 'Failed to increase position' },
        { status: response.status }
      )
    }

    const data: ResponseData = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in transaction route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
