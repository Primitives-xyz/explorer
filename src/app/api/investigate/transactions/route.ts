import redis, { CACHE_TTL } from '@/utils/redis'
import { HELIUS_API_KEY } from '@/utils/constants'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

/**
 * Investigate API: Fetches complete transaction history for any Solana wallet
 * using the Helius getTransactionsForAddress RPC method.
 *
 * Caching strategy:
 * - First page (no pagination token): 2 min TTL (latest data changes)
 * - Subsequent pages: 24h TTL (historical data is immutable)
 * - Full filter hash included in cache key for uniqueness
 */

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`

// Cache TTLs
const CACHE_TTL_FIRST_PAGE = 120 // 2 minutes
const CACHE_TTL_HISTORICAL = 60 * 60 * 24 // 24 hours

function hashFilters(filters: Record<string, any>): string {
  const str = JSON.stringify(filters, Object.keys(filters).sort())
  return crypto.createHash('md5').update(str).digest('hex').slice(0, 12)
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')
  const paginationToken = searchParams.get('paginationToken')
  const sortOrder = searchParams.get('sortOrder') || 'desc'
  const limit = Math.min(Number(searchParams.get('limit') || '100'), 100)
  const status = searchParams.get('status') // 'succeeded' | 'failed' | 'any'
  const tokenAccounts = searchParams.get('tokenAccounts') || 'balanceChanged'
  const blockTimeGte = searchParams.get('blockTimeGte')
  const blockTimeLte = searchParams.get('blockTimeLte')
  const transactionDetails = searchParams.get('transactionDetails') || 'full'

  if (!address) {
    return NextResponse.json(
      { error: 'Address is required' },
      { status: 400 }
    )
  }

  if (!HELIUS_API_KEY) {
    return NextResponse.json(
      { error: 'Helius API key not configured' },
      { status: 500 }
    )
  }

  // Build filters object
  const filters: Record<string, any> = {}

  if (tokenAccounts && tokenAccounts !== 'none') {
    filters.tokenAccounts = tokenAccounts
  }

  if (status && status !== 'any') {
    filters.status = status
  }

  if (blockTimeGte || blockTimeLte) {
    filters.blockTime = {}
    if (blockTimeGte) filters.blockTime.gte = Number(blockTimeGte)
    if (blockTimeLte) filters.blockTime.lte = Number(blockTimeLte)
  }

  // Build cache key
  const filterHash = hashFilters({
    sortOrder,
    limit,
    transactionDetails,
    ...filters,
  })
  const pageKey = paginationToken || 'first'
  const cacheKey = `investigate:${address}:${filterHash}:${pageKey}`

  // Check Redis cache
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'Cache-Control': 'public, s-maxage=60',
        },
      })
    }
  } catch (e) {
    console.warn('Redis cache read error:', e)
  }

  // Build RPC request params
  const rpcParams: [string, Record<string, any>] = [
    address,
    {
      transactionDetails,
      sortOrder,
      limit,
      encoding: 'jsonParsed',
      maxSupportedTransactionVersion: 0,
      ...(Object.keys(filters).length > 0 && { filters }),
      ...(paginationToken && { paginationToken }),
    },
  ]

  try {
    const response = await fetch(HELIUS_RPC_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 'investigate',
        method: 'getTransactionsForAddress',
        params: rpcParams,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Helius RPC error:', response.status, errorText)
      return NextResponse.json(
        { error: 'Failed to fetch transactions from Helius' },
        { status: response.status }
      )
    }

    const json = await response.json()

    if (json.error) {
      console.error('Helius RPC error:', json.error)
      return NextResponse.json(
        { error: json.error.message || 'RPC error' },
        { status: 400 }
      )
    }

    const result = json.result || { data: [], paginationToken: null }

    // Cache the result
    try {
      const ttl = paginationToken
        ? CACHE_TTL_HISTORICAL
        : CACHE_TTL_FIRST_PAGE
      await redis.setex(cacheKey, ttl, JSON.stringify(result))
    } catch (e) {
      console.warn('Redis cache write error:', e)
    }

    return NextResponse.json(result, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': paginationToken
          ? 'public, s-maxage=3600'
          : 'public, s-maxage=60',
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
