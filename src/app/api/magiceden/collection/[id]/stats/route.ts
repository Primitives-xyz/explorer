import { LAMPORTS_PER_SOL } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { id } = params

    if (!id) {
      return NextResponse.json(
        { error: 'Token mint address is required' },
        { status: 400 }
      )
    }

    const options = { method: 'GET', headers: { accept: 'application/json' } }
    const collectionStatApiUrl = `https://api-mainnet.magiceden.us/rpc/getCollectionEscrowStats/${id}?status=all&edge_cache=true&enableFloorWithFee=true`

    const holdersStatsApiRes = await fetch(
      `https://api-mainnet.magiceden.dev/v2/collections/${id}/holder_stats`,
      options
    )
    const holdersStatsApiResData = await holdersStatsApiRes.json()

    const collectionStatsApiRes = await fetch(collectionStatApiUrl, options)
    const collectionStatsApiResData = await collectionStatsApiRes.json()

    if (collectionStatsApiResData || holdersStatsApiResData) {
      return NextResponse.json({
        floorPrice:
          Math.round(
            (collectionStatsApiResData.results?.floorPrice / LAMPORTS_PER_SOL) *
              1000
          ) / 1000,
        listedCount: collectionStatsApiResData.results.listedCount,
        volume24hr:
          Math.round(
            (collectionStatsApiResData.results.volume24hr / LAMPORTS_PER_SOL) *
              100
          ) / 100,
        txns24hr: collectionStatsApiResData.results.txns24hr,
        volumeAll:
          Math.round(
            (collectionStatsApiResData.results.volumeAll / LAMPORTS_PER_SOL) *
              100
          ) / 100,
        supply: holdersStatsApiResData.totalSupply,
        holders: holdersStatsApiResData.uniqueHolders,
      })
    } else {
      return NextResponse.json({ error: 'Invalid collection symbol' })
    }
  } catch (error: any) {
    console.error('Error fetching nft collection stats:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed nft collection stats'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
