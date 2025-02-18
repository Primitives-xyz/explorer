import { SwapService } from '@/services/swap'
import type { SwapRouteResponse } from '@/types/jupiter-service'
import { Connection } from '@solana/web3.js'
import { NextResponse } from 'next/server'

const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
const swapService = new SwapService(connection)

export async function POST(
  request: Request
): Promise<NextResponse<SwapRouteResponse | { error: string }>> {
  try {
    const requestData = await request.json()
    const response = await swapService.createSwapTransaction(requestData)
    return NextResponse.json(response)
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Failed to build swap transaction' },
      { status: 500 }
    )
  }
}
