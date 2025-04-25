import { Connection, PublicKey } from '@solana/web3.js'
import { BN, convertToNumber, DriftClient, PerpMarkets, PerpPosition, PRICE_PRECISION, QUOTE_PRECISION, Wallet } from '@drift-labs/sdk-browser'
import { NextRequest, NextResponse } from 'next/server'
import { Keypair } from '@solana/web3.js'

interface LimitOrderProps {
  market: string,
  direction: string,
  price: number,
  baseAssetAmount: number
  triggerPrice: number,
  orderId: number
}

const env = 'mainnet-beta'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const walletAddress = searchParams.get('wallet')
    const subAccountId = searchParams.get('subAccountId')
    const symbol = searchParams.get('symbol')

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

    const orders = user.getOpenOrders()
    let limitOrders: LimitOrderProps[] = []

    orders.forEach((order) => {
      const direction = "long" in order.direction ? "LONG" : "SHORT"
      const price = convertToNumber(order.price, QUOTE_PRECISION)
      const triggerPrice = convertToNumber(order.triggerPrice, QUOTE_PRECISION)
      const baseAssetAmount = convertToNumber(order.baseAssetAmount, new BN(10).pow(new BN(9)))
      const orderId = order.orderId

      limitOrders.push({
        market: marketInfo.symbol,
        direction,
        baseAssetAmount,
        orderId,
        price,
        triggerPrice
      })
    })

    return NextResponse.json(
      { limitOrders: limitOrders },
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
