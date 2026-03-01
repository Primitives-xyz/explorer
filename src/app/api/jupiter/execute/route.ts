import type {
  UltraExecuteRequest,
  UltraExecuteResponse,
} from '@/types/jupiter-service'
import { JUPITER_ULTRA_API } from '@/utils/constants'
import { NextResponse } from 'next/server'

const JUPITER_API_KEY = process.env.JUPITER_API_KEY || ''

export async function POST(
  request: Request
): Promise<NextResponse<UltraExecuteResponse | { error: string }>> {
  try {
    const body: UltraExecuteRequest = await request.json()

    if (!body.signedTransaction || !body.requestId) {
      return NextResponse.json(
        { error: 'Missing required fields: signedTransaction, requestId' },
        { status: 400 }
      )
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }
    if (JUPITER_API_KEY) {
      headers['x-api-key'] = JUPITER_API_KEY
    }

    const response = await fetch(`${JUPITER_ULTRA_API}/execute`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        signedTransaction: body.signedTransaction,
        requestId: body.requestId,
      }),
    })

    const data: UltraExecuteResponse = await response.json()

    if (!response.ok) {
      console.error('Jupiter Ultra execute error:', data)
      return NextResponse.json(
        {
          error: data.error || 'Jupiter Ultra execute failed',
          code: data.code,
          status: data.status,
        } as any,
        { status: response.status }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error executing Jupiter Ultra swap:', error)
    return NextResponse.json(
      {
        error: 'Failed to execute swap',
        details: error instanceof Error ? error.message : String(error),
      } as any,
      { status: 500 }
    )
  }
}
