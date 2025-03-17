import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const seller = searchParams.get('seller')
    const auctionHouseAddress = searchParams.get('auctionHouseAddress')
    const tokenMint = searchParams.get('tokenMint')
    const tokenAccount = searchParams.get('tokenAccount')
    const price = searchParams.get('price')
    const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''

    if (
      !seller ||
      !auctionHouseAddress ||
      !tokenMint ||
      !price ||
      !tokenAccount
    ) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    if (!ME_API_KEY.length) {
      return NextResponse.json({ error: 'No Bearer token' }, { status: 400 })
    }

    const reqUrl = `https://api-mainnet.magiceden.dev/v2/instructions/sell_cancel?seller=${seller}&auctionHouseAddress=${auctionHouseAddress}&tokenMint=${tokenMint}&tokenAccount=${tokenAccount}&price=${price}`

    const response = await fetch(reqUrl, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ME_API_KEY}`,
      },
    })
    console.log({ response })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('Magic Eden API error:', errorData)
      return NextResponse.json(
        {
          error: 'Failed to fetch NFT cancel listing transaction data',
          details: errorData,
        },
        { status: 400 }
      )
    }

    const txData = await response.json()
    const serializedTxData = new Uint8Array(txData.txSigned.data)
    const buffer = Buffer.from(serializedTxData).toString('base64')

    return NextResponse.json({ cancelTx: buffer })
  } catch (error) {
    console.error('Error in cancel listing API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch NFT cancel listing transaction data' },
      { status: 400 }
    )
  }
}
