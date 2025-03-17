import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seller = searchParams.get('seller')
    const auctionHouseAddress = searchParams.get('auctionHouseAddress')
    const tokenMint = searchParams.get('tokenMint')
    const tokenAccount = searchParams.get('tokenAccount')
    const price = searchParams.get('price')
    const newPrice = searchParams.get('newPrice')
    const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''

    // Validate required parameters
    const missingParams = []
    if (!seller) missingParams.push('seller')
    if (!auctionHouseAddress) missingParams.push('auctionHouseAddress')
    if (!tokenMint) missingParams.push('tokenMint')
    if (!tokenAccount) missingParams.push('tokenAccount')
    if (!price) missingParams.push('price')
    if (!newPrice) missingParams.push('newPrice')

    if (missingParams.length > 0) {
      return NextResponse.json(
        {
          error: 'Missing required parameters',
          missingParams,
        },
        { status: 400 }
      )
    }

    if (!ME_API_KEY.length) {
      return NextResponse.json(
        { error: 'No Magic Eden API key configured' },
        { status: 400 }
      )
    }

    const reqUrl = `https://api-mainnet.magiceden.dev/v2/instructions/sell_change_price?seller=${seller}&auctionHouseAddress=${auctionHouseAddress}&tokenMint=${tokenMint}&tokenAccount=${tokenAccount}&price=${price}&newPrice=${newPrice}`

    const response = await fetch(reqUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ME_API_KEY}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Failed to fetch NFT change price transaction data', {
        status: response.status,
        statusText: response.statusText,
        url: reqUrl,
        error: errorText,
      })

      return NextResponse.json(
        {
          error: 'Failed to fetch NFT change price transaction data',
          details: {
            status: response.status,
            statusText: response.statusText,
            message: errorText,
          },
        },
        { status: response.status }
      )
    }

    const txData = await response.json()

    if (!txData.txSigned || !txData.txSigned.data) {
      return NextResponse.json(
        { error: 'Invalid transaction data received from Magic Eden API' },
        { status: 400 }
      )
    }

    const serializedTxData = new Uint8Array(txData.txSigned.data)
    const buffer = Buffer.from(serializedTxData).toString('base64')

    return NextResponse.json({ changePriceTx: buffer })
  } catch (error) {
    console.error('Error in change-price API route:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch NFT change price transaction data',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
