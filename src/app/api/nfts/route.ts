import { Helius } from 'helius-sdk'
import { NextRequest, NextResponse } from 'next/server'

// Initialize Helius SDK with your API key
// Replace with your actual API key from environment variables
const helius = new Helius(process.env.HELIUS_API_KEY || '')

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const wallet = searchParams.get('wallet')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    if (!wallet) {
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    // Fetch NFTs for the wallet using Helius SDK
    const assets = await helius.rpc.getAssetsByOwner({
      ownerAddress: wallet,
      page: page,
      limit: limit,
    })

    return NextResponse.json(
      {
        nfts: assets.items,
        total: assets.total,
        hasMore: assets.items.length === limit,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching NFTs:', error)
    return NextResponse.json({ error: 'Failed to fetch NFTs' }, { status: 500 })
  }
}
