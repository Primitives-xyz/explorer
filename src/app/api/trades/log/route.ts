import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { NextRequest, NextResponse } from 'next/server'

export interface TradeLogData {
  transactionSignature: string
  walletAddress: string
  profileId?: string
  inputMint: string
  outputMint: string
  inputAmount: number // in tokens (actual amount)
  outputAmount: number // in tokens (actual amount)
  inputValueSOL: number // SOL value at time of trade
  outputValueSOL: number // SOL value at time of trade
  inputValueUSD?: number // USD value at time of trade (if SOL price available)
  outputValueUSD?: number // USD value at time of trade (if SOL price available)
  solPrice?: number // SOL price in USD at time of trade
  timestamp: number
  source?: string // e.g., 'JUPITER', 'RAYDIUM'
  slippage?: number // slippage in basis points
  priorityFee?: number // priority fee in lamports
  tradeType: 'buy' | 'sell' | 'swap'
  platform: 'trenches' | 'main' // where the trade was initiated
  sourceWallet?: string // for copy trades
  sourceTransactionId?: string // for copy trades
}

export async function POST(req: NextRequest) {
  try {
    const tradeData: TradeLogData = await req.json()

    // Validate required fields
    const requiredFields: (keyof TradeLogData)[] = [
      'transactionSignature',
      'walletAddress',
      'inputMint',
      'outputMint',
      'inputAmount',
      'outputAmount',
      'inputValueSOL',
      'outputValueSOL',
      'timestamp',
      'tradeType',
      'platform',
    ]

    for (const field of requiredFields) {
      if (!tradeData[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Submit to Tapestry trades endpoint
    const response = await fetchTapestryServer({
      endpoint: 'trades',
      method: FetchMethod.POST,
      data: tradeData,
    })

    return NextResponse.json({
      success: true,
      tradeId: response.id || response._id,
      message: 'Trade logged successfully',
    })
  } catch (error: any) {
    console.error('Error logging trade to Tapestry:', error)

    return NextResponse.json(
      {
        error: 'Failed to log trade',
        details: error.message,
      },
      { status: 500 }
    )
  }
}
