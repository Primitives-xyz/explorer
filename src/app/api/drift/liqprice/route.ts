import { Connection, PublicKey } from '@solana/web3.js'
import { BN, convertToBN, convertToNumber, DriftClient, PerpMarkets, PRICE_PRECISION, Wallet } from '@drift-labs/sdk-browser'
import { NextRequest, NextResponse } from 'next/server'
import { Keypair } from '@solana/web3.js'

const env = 'mainnet-beta'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const subAccountId = searchParams.get('subAccountId')
    const symbol = searchParams.get('symbol')
    const direction = searchParams.get('direction')
    const amount = searchParams.get('amount')

    if (!walletAddress) {
      console.log("Error: Not Wallet Address")
      return NextResponse.json(
        { error: 'Wallet address is required' },
        { status: 400 }
      )
    }

    if (!subAccountId) {
      console.log("Error: Not Sub Account ID")
      return NextResponse.json(
        { error: 'SubAccountId is required' },
        { status: 400 }
      )
    }

    if (!amount) {
      console.log("Error: No Trade Amount")
      return NextResponse.json(
        { error: 'Error: No Trade Amount' },
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
      activeSubAccountId: Number(subAccountId)
    })

    await driftClient.subscribe()

    const marketInfo = PerpMarkets[env].find(
      (market) => market.baseAssetSymbol === symbol
    )

    if (!marketInfo) {
      console.log("Error: Not Market")
      return NextResponse.json(
        { error: 'No Market' },
        { status: 400 }
      )
    }

    const user = driftClient.getUser()

    if (!user) {
      console.log(`Error: No user for Wallet ${walletAddress} `)
      return NextResponse.json(
        { error: 'No Drift User for Wallet Address' },
        { status: 400 }
      )
    }

    await user.subscribe()

    const baseAssetAmount = convertToBN(Number(amount), new BN(10).pow(new BN(9)))
    const signedBaseAssetAmount = direction === 'long' ? baseAssetAmount : baseAssetAmount.neg()

    if (!Number(amount)) {
      const liqPrice = convertToNumber(user.liquidationPrice(marketInfo.marketIndex), PRICE_PRECISION)
      return NextResponse.json(
        { liqPrice: liqPrice },
        { status: 200 }
      )
    } else {
      const liqPrice = user.liquidationPrice(
        marketInfo.marketIndex,
        signedBaseAssetAmount,
      )
      return NextResponse.json(
        { liqPrice: convertToNumber(liqPrice, PRICE_PRECISION) },
        { status: 200 }
      )
    }

  } catch (error) {
    console.error('Error fetching Liq Price:', error)
    return NextResponse.json(
      { error: 'Error fetching Liq Price' },
      { status: 500 }
    )
  }
}
