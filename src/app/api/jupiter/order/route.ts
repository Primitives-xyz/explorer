import {
  JUPITER_REFERRAL_ACCOUNT,
  JUPITER_REFERRAL_FEE,
  JUPITER_ULTRA_API,
} from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || ''

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const inputMint = searchParams.get('inputMint')
    const outputMint = searchParams.get('outputMint')
    const amount = searchParams.get('amount')
    const taker = searchParams.get('taker')

    if (!inputMint || !outputMint || !amount) {
      return NextResponse.json(
        { error: 'Missing required parameters: inputMint, outputMint, amount' },
        { status: 400 }
      )
    }

    // Build Ultra order URL
    const orderUrl = new URL(`${JUPITER_ULTRA_API}/order`)
    orderUrl.searchParams.set('inputMint', inputMint)
    orderUrl.searchParams.set('outputMint', outputMint)
    orderUrl.searchParams.set('amount', amount)

    // Only include taker when provided (returns transaction when set)
    if (taker) {
      orderUrl.searchParams.set('taker', taker)
    }

    // Add referral params if configured
    if (JUPITER_REFERRAL_ACCOUNT) {
      orderUrl.searchParams.set('referralAccount', JUPITER_REFERRAL_ACCOUNT)
      orderUrl.searchParams.set(
        'referralFee',
        JUPITER_REFERRAL_FEE.toString()
      )
    }

    const headers: Record<string, string> = {
      Accept: 'application/json',
    }
    if (JUPITER_API_KEY) {
      headers['x-api-key'] = JUPITER_API_KEY
    }

    const response = await fetch(orderUrl.toString(), { headers })
    const data = await response.json()

    if (!response.ok) {
      console.error('Jupiter Ultra order error:', data)
      return NextResponse.json(
        { error: data.error || 'Jupiter Ultra order failed' },
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Jupiter Ultra order:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
