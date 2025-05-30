import { NextResponse } from 'next/server'

interface DeleteLimitOrderRequest {
  positionRequestPubkey: string
}

interface DeleteLimitOrderResponse {
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

export async function DELETE(request: Request) {
  try {
    const body: DeleteLimitOrderRequest = await request.json()
    const positionRequestPubkey = body.positionRequestPubkey

    if (!positionRequestPubkey) {
      return NextResponse.json(
        { error: 'positionRequestPubkey parameter is required' },
        { status: 400 }
      )
    }

    const response = await fetch(`https://perps-api.jup.ag/v1/orders/limit`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      throw new Error(`Jupiter API responded with status: ${response.status}`)
    }

    const data: DeleteLimitOrderResponse = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error deleting limit order:', error)
    return NextResponse.json(
      { error: 'Failed to delete limit order' },
      { status: 500 }
    )
  }
}
