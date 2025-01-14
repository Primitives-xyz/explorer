import { checkSolanaBusinessFrogHolder } from '@/utils/helius/das-api'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const address = searchParams.get('address')

    if (!address) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 },
      )
    }

    const isHolder = await checkSolanaBusinessFrogHolder({
      walletAddress: address,
    })

    return NextResponse.json({
      isHolder,
      address,
    })
  } catch (error) {
    console.error('Error checking holder status:', error)
    return NextResponse.json(
      { error: 'Failed to check holder status' },
      { status: 500 },
    )
  }
}
