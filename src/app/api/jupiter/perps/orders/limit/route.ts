import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('walletAddress')

    if (!walletAddress) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://perps-api.jup.ag/v1/orders/limit?walletAddress=${walletAddress}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch limit orders')
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching Jupiter limit orders:', error)
    return NextResponse.json(
      { error: 'Failed to fetch limit orders' },
      { status: 500 }
    )
  }
} 