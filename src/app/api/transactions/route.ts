import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')
  const beforeSignature = searchParams.get('before')
  const limit = searchParams.get('limit') || '10'

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 },
    )
  }

  try {
    // Extract API key from the RPC URL string
    const apiKey = process.env.RPC_URL?.split('api-key=')[1]
    if (!apiKey) {
      throw new Error('API key not found in RPC URL')
    }

    let url = `https://api.helius.xyz/v0/addresses/${walletAddress}/transactions?api-key=${apiKey}&limit=${limit}`

    if (beforeSignature) {
      url += `&before=${beforeSignature}`
    }

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    if (!Array.isArray(data)) {
      throw new Error('Invalid response format')
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}
