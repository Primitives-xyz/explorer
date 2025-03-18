import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ token_mint: string }>
}
const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { token_mint } = params

    if (!token_mint) {
      return NextResponse.json(
        { error: 'token mint address is required' },
        { status: 400 }
      )
    }
    const response = await fetch(
      `https://api-mainnet.magiceden.dev/v2/tokens/${token_mint}/offers_received?sort=bidAmount&sort_direction=desc`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${ME_API_KEY}`,
        },
      }
    )
    const offers = await response.json()

    if (!offers.length) {
      return NextResponse.json({
        bestOffer: null,
      })
    }

    const [bestOffer] = offers

    return NextResponse.json({
      bestOffer: {
        pdaAddress: bestOffer.pdaAddress,
        tokenMint: bestOffer.tokenMint,
        auctionHouse: bestOffer.auctionHouse,
        buyer: bestOffer.buyer,
        buyerReferral: bestOffer.buyerReferral,
        tokenSize: bestOffer.tokenSize,
        price: bestOffer.price,
        expiry: bestOffer.expiry,
      },
    })
  } catch (error: any) {
    const errorMessage =
      error instanceof Error ? error.message : 'Failed buy offers for a token'
    return NextResponse.json({
      error: errorMessage,
      status: 500,
    })
  }
}
