import { NextRequest, NextResponse } from 'next/server'
import { isValidTransactionSignature } from '@/utils/validation'

export async function GET(
  request: NextRequest,
  context: { params: { signature: string } },
) {
  try {
    const signature = context.params.signature

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
      `https://api.helius.xyz/v0/transactions/?api-key=${HELIUS_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transactions: [signature],
        }),
      },
    )

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to fetch transaction: ${response.status}`,
      )
    }

    const data = await response.json()
    if (!data || !Array.isArray(data) || data.length === 0) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 },
      )
    }

    // Return the first transaction from the array since we only requested one
    return NextResponse.json(data[0])
  } catch (error) {
    console.error('Error fetching transaction:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch transaction details',
      },
      { status: 500 },
    )
  }
}
