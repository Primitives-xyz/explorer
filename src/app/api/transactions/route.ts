import { HELIUS_API_KEY } from '@/utils/constants'
import redis from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Fetches transaction history for an address using Helius getTransactionsForAddress.
 * Replaces the old /v0/addresses/{address}/transactions endpoint.
 */

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
const TRANSACTIONS_PER_PAGE = 20

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const paginationToken = searchParams.get('paginationToken') || searchParams.get('before')
  const type = searchParams.get('type')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  if (!HELIUS_API_KEY) {
    return NextResponse.json(
      { error: 'Helius API key not configured' },
      { status: 500 }
    )
  }

  const cacheKey = `txs:${address}:${paginationToken || 'first'}`

  // Check cache
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      })
    }
  } catch (e) {
    // Cache miss
  }

  try {
    const params: [string, Record<string, any>] = [
      address,
      {
        transactionDetails: 'full',
        encoding: 'jsonParsed',
        maxSupportedTransactionVersion: 0,
        sortOrder: 'desc',
        limit: TRANSACTIONS_PER_PAGE,
        filters: {
          status: 'succeeded',
          tokenAccounts: 'balanceChanged',
        },
        ...(paginationToken && { paginationToken }),
      },
    ]

    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'get-transactions',
        method: 'getTransactionsForAddress',
        params,
      }),
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const json = await response.json()

    if (json.error) {
      return NextResponse.json(
        { error: json.error.message },
        { status: 400 }
      )
    }

    const result = json.result || { data: [], paginationToken: null }

    // Cache for 2 minutes
    try {
      await redis.setex(cacheKey, 120, JSON.stringify(result))
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
