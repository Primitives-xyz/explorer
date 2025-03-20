// app/api/signatures/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { isValidSolanaAddress as isValidAddress } from '@/utils/validation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, limit = 20, before, until } = body

    if (!address || !isValidAddress(address)) {
      return NextResponse.json(
        { error: 'Invalid address provided' },
        { status: 400 }
      )
    }

    const HELIUS_API_KEY = process.env.HELIUS_API_KEY
    if (!HELIUS_API_KEY) {
      return NextResponse.json(
        { error: 'Helius API key not configured' },
        { status: 500 }
      )
    }

    // Build the parameters for the getSignaturesForAddress RPC request
    const params: any[] = [address]
    
    // Add optional config parameter if any options are specified
    const options: Record<string, any> = {}
    if (limit) options.limit = limit
    if (before) options.before = before
    if (until) options.until = until
    
    if (Object.keys(options).length > 0) {
      params.push(options)
    }

    // Call the Helius RPC endpoint
    const response = await fetch(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: '1',
        method: 'getSignaturesForAddress',
        params
      })
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error || `Failed to fetch signatures: ${response.status}`
      )
    }

    // Return the signature data
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching signatures:', error)
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : 'Failed to fetch transaction signatures',
      },
      { status: 500 }
    )
  }
}