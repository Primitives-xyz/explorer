import {
  BN,
  convertToNumber,
  DriftClient,
  PerpMarkets,
  PerpPosition,
  PRICE_PRECISION,
  QUOTE_PRECISION,
  Wallet,
} from '@drift-labs/sdk-browser'
import { Connection, Keypair, PublicKey } from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

interface PerpsPositionInfoProps {
  market: string
  marketIndex: number
  direction: string
  baseAssetAmountInToken: number
  baseAssetAmountInUsd: number
  entryPrice: number
  markPrice: number
  pnlInUsd: number
  pnlInPercentage: number
  liqPrice: number
}

const env = 'mainnet-beta'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const subAccountId = searchParams.get('subAccountId')

    if (!walletAddress) {
      console.log('Error: Not Wallet Address')
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    if (!subAccountId) {
      console.log('Error: Not Sub Account ID')
      return NextResponse.json(
        { error: 'SubAccountId is required' },
        { status: 400 }
      )
    }

    const rpcUrl = process.env.RPC_URL || 'https://api.mainnet-beta.solana.com'
    const connection = new Connection(rpcUrl, 'confirmed')

    const driftClient = new DriftClient({
      connection,
      wallet: new Wallet(Keypair.generate()),
      env: env,
      authority: new PublicKey(walletAddress),
      subAccountIds: [Number(subAccountId)],
      activeSubAccountId: Number(subAccountId),
    })

    await driftClient.subscribe()

    const user = driftClient.getUser()

    if (!user) {
      console.log(`Error: No user for Wallet ${walletAddress} `)
      return NextResponse.json(
        { error: 'No Drift User for Wallet Address' },
        { status: 400 }
      )
    }

    await user.subscribe()

    const perpPositions = user.getActivePerpPositions()

    let perpsPositionsInfo: PerpsPositionInfoProps[] = []

    perpPositions.forEach((position: PerpPosition) => {
      const oraclePriceData = driftClient.getOracleDataForPerpMarket(
        position.marketIndex
      )
      const marketPrice = convertToNumber(
        oraclePriceData.price,
        PRICE_PRECISION
      )
      const baseAssetAmount = convertToNumber(
        position.baseAssetAmount,
        new BN(10).pow(new BN(9))
      )
      const quoteEntryAmount = convertToNumber(
        position.quoteEntryAmount,
        QUOTE_PRECISION
      )

      const entryPrice = Math.abs(quoteEntryAmount / baseAssetAmount)
      const unrealizedPnL = (Number(marketPrice) - entryPrice) * baseAssetAmount
      const unrealizedPnlPercentage =
        (unrealizedPnL / (baseAssetAmount * Number(marketPrice))) * 100

      const marketInfo = PerpMarkets[env].find(
        (market) => market.marketIndex === position.marketIndex
      )

      if (baseAssetAmount && marketInfo) {
        perpsPositionsInfo.push({
          market: marketInfo.symbol,
          marketIndex: marketInfo.marketIndex,
          direction: baseAssetAmount > 0 ? 'LONG' : 'SHORT',
          baseAssetAmountInToken: Math.abs(baseAssetAmount),
          baseAssetAmountInUsd: Math.abs(baseAssetAmount * Number(marketPrice)),
          entryPrice: entryPrice,
          markPrice: Number(marketPrice),
          pnlInUsd: unrealizedPnL,
          pnlInPercentage: unrealizedPnlPercentage,
          liqPrice: convertToNumber(
            user.liquidationPrice(position.marketIndex),
            PRICE_PRECISION
          ),
        })
      }
    })

    return NextResponse.json(
      { perpPositions: perpsPositionsInfo },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error fetching Perps Positions:', error)
    return NextResponse.json(
      { error: 'Error fetching Perps Positions' },
      { status: 500 }
    )
  }
}