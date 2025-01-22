import { NextRequest, NextResponse } from 'next/server'
import { isValidTransactionSignature } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { signature } = body

    if (!signature || !isValidTransactionSignature(signature)) {
      return NextResponse.json(
        { error: 'Invalid transaction signature' },
        { status: 400 },
      )
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY
    if (!HELIUS_API_KEY) {
      return NextResponse.json(
        { error: 'Helius API key not configured' },
        { status: 500 },
      )
    }

    const response = await fetch(
      `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: [signature],
        }),
      },
    )

    const data = await response.json()

    if (!response.ok) {
      const errorMessage =
        typeof data.error === 'object'
          ? JSON.stringify(data.error)
          : data.error || `Failed to parse transaction: ${response.statusText}`

      return NextResponse.json(
        { error: errorMessage },
        { status: response.status },
      )
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error parsing transaction:', error)

    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'object'
        ? JSON.stringify(error)
        : 'Failed to parse transaction'

    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
