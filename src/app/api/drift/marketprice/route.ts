import {
  convertToNumber,
  DriftClient,
  PerpMarkets,
  PRICE_PRECISION,
  Wallet,
} from '@drift-labs/sdk-browser'
import { Connection, Keypair } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

const env = 'mainnet-beta'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const symbol = searchParams.get('symbol')

    if (!symbol) {
      console.log('No Asset Symbol')
      return NextResponse.json(
        { error: 'Error: No Asset Symbol' },
        { status: 400 }
      )
    }

    const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    const driftClient = new DriftClient({
      connection,
      wallet: new Wallet(Keypair.generate()),
      env: env,
    })

    await driftClient.subscribe()

    const marketInfo = PerpMarkets[env].find(
      (market) => market.baseAssetSymbol === symbol
    )

    if (!marketInfo) {
      console.log('Error: Not Market')
      return NextResponse.json({ error: 'No Market' }, { status: 400 })
    }

    const oraclePriceData = driftClient.getOracleDataForPerpMarket(
      marketInfo.marketIndex
    )

    if (!oraclePriceData) {
      console.log('Error: Oracle price data not available')
      return NextResponse.json(
        { error: 'Oracle price data not available' },
        { status: 400 }
      )
    }

    const priceValue = convertToNumber(oraclePriceData.price, PRICE_PRECISION)

    return NextResponse.json({ marketPrice: priceValue }, { status: 200 })
  } catch (error) {
    console.error('Error fetching Market Price:', error)
    return NextResponse.json(
      { error: 'Error fetching Market Price:' },
      { status: 500 }
    )
  }
}