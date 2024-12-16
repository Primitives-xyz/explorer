import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const walletAddress = searchParams.get('address')

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address is required' },
      { status: 400 },
    )
  }

  try {
    const response = await fetch(process.env.RPC_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'my-id',
        method: 'searchAssets',
        params: {
          ownerAddress: walletAddress,
          tokenType: 'all',
          displayOptions: {
            showCollectionMetadata: true,
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()
    const items = data.result?.items || []

    // Filter and map fungible tokens
    const fungibleTokens = items
      .filter(
        (item: any) => item.interface === 'FungibleToken' && item.token_info,
      )
      .map((item: any) => ({
        id: item.id,
        name: item.content?.metadata?.name || 'Unknown Token',
        symbol: item.content?.metadata?.symbol || '',
        imageUrl: item.content?.links?.image || null,
        balance:
          Number(item.token_info?.balance || 0) /
          Math.pow(10, item.token_info?.decimals || 0),
        price: item.token_info?.price_info?.price_per_token || 0,
        currency: item.token_info?.price_info?.currency || 'USDC',
      }))

    return NextResponse.json(fungibleTokens)
  } catch (error) {
    console.error('Error fetching tokens:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tokens' },
      { status: 500 },
    )
  }
}
