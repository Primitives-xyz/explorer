import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const buyer = searchParams.get('buyer')
    const seller = searchParams.get('seller')
    const auctionHouse = searchParams.get('auctionHouseAddress')
    const tokenMint = searchParams.get('tokenMint')
    const tokenATA = searchParams.get('tokenATA')
    const price = searchParams.get('price')
    const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''

    if (
      !buyer ||
      !seller ||
      !auctionHouse ||
      !tokenMint ||
      !tokenATA ||
      !price
    ) {
      return NextResponse.json(
        { error: 'endpoint query requested' },
        { status: 400 }
      )
    }

    const requestURL = `https://api-mainnet.magiceden.dev/v2/instructions/buy_now?buyer=${buyer}&seller=${seller}&auctionHouseAddress=${auctionHouse}&tokenMint=${tokenMint}&tokenATA=${tokenATA}&price=${price}`

    const response = await fetch(requestURL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${ME_API_KEY}`,
        accept: 'application/json',
      },
    })

    const data = await response.json()

    if (data) {
      const buffer = Buffer.from(data.v0.txSigned.data).toString('base64')
      return NextResponse.json({ buyTx: buffer })
    } else {
      return NextResponse.json(
        { error: 'Error NFT Buy Transaction' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    console.error('Error NFT Buy Transaction:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Error NFT Buy Transaction:'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
