import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const mint = searchParams.get('mint')

  if (!mint) {
    return NextResponse.json({ error: 'Missing mint address' }, { status: 400 })
  }

  try {
    // Fetch token metadata from Jupiter API
    const response = await fetch(`https://token.jup.ag/all`)
    const data = await response.json()
    
    const tokenInfo = data.tokens.find((token: any) => token.address === mint)
    
    if (!tokenInfo) {
      return NextResponse.json(
        {
          symbol: mint.slice(0, 4),
          name: `Token ${mint.slice(0, 4)}...${mint.slice(-4)}`,
          decimals: 0,
        },
        { status: 200 }
      )
    }

    return NextResponse.json({
      symbol: tokenInfo.symbol,
      name: tokenInfo.name,
      decimals: tokenInfo.decimals,
      image: tokenInfo.logoURI,
    })
  } catch (error) {
    console.error('Error fetching token info:', error)
    return NextResponse.json({ error: 'Failed to fetch token info' }, { status: 500 })
  }
} 