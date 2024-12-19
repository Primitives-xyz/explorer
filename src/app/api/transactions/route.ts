import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const before = searchParams.get('before')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  // Extract API key from the RPC URL string
  const apiKey = process.env.RPC_URL?.split('api-key=')[1]
  if (!apiKey) {
    return NextResponse.json(
      { error: 'API key not found in RPC URL' },
      { status: 500 },
    )
  }

  const url = before
    ? `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&before=${before}&limit=10`
    : `https://api.helius.xyz/v0/addresses/${address}/transactions?api-key=${apiKey}&limit=10`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 },
    )
  }
}
