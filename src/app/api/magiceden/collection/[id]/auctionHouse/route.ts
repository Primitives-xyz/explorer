import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params
    const ME_API_KEY = process.env.NEXT_ME_API_KEY || ''
    if (!id) {
      return NextResponse.json(
        { error: 'collection symbol is required' },
        { status: 400 }
      )
    }

    const response = await fetch(
      `https://api-mainnet.magiceden.dev/v2/collections/${id}/listings?limit=5`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${ME_API_KEY}`,
          accept: 'application/json',
        },
      }
    )
    const datas = await response.json()
    if (datas && datas.length > 0) {
      const auctionHouse = datas.find(
        (item: any) => item.auctionHouse && item.auctionHouse !== ''
      )?.auctionHouse
      return NextResponse.json({
        auctionHouse,
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to fetch collection auctionhouse' },
        { status: 500 }
      )
    }
  } catch (error: any) {
    const errorMessage =
      error instanceof Error
        ? error.message
        : 'Failed to fetch collection auctionhouse'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
