import { HELIUS_API_KEY } from '@/utils/constants'
import redis from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Get wallet summary info: SOL balance, token accounts, basic stats.
 * Uses standard Solana RPC calls via Helius.
 */

const HELIUS_RPC_URL = `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
const CACHE_TTL_WALLET = 60 // 1 minute

async function rpcCall(method: string, params: any[]) {
  const response = await fetch(HELIUS_RPC_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: method,
      method,
      params,
    }),
  })
  const json = await response.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

export async function GET(request: NextRequest) {
  const address = request.nextUrl.searchParams.get('address')

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

  const cacheKey = `wallet-summary:${address}`

  // Check cache
  try {
    const cached = await redis.get(cacheKey)
    if (cached) {
      return NextResponse.json(cached, {
        headers: { 'X-Cache': 'HIT' },
      })
    }
  } catch (e) {
    console.warn('Redis cache error:', e)
  }

  try {
    // Fetch balance and token accounts in parallel
    const [balanceResult, tokenAccountsResult] = await Promise.all([
      rpcCall('getBalance', [address]),
      rpcCall('getTokenAccountsByOwner', [
        address,
        { programId: 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA' },
        { encoding: 'jsonParsed' },
      ]),
    ])

    const solBalance = (balanceResult?.value || 0) / 1e9
    const tokenAccounts = tokenAccountsResult?.value || []

    // Filter to tokens with non-zero balance
    const activeTokens = tokenAccounts.filter((account: any) => {
      const amount =
        account?.account?.data?.parsed?.info?.tokenAmount?.uiAmount
      return amount && amount > 0
    })

    const summary = {
      address,
      solBalance,
      tokenCount: activeTokens.length,
      tokens: activeTokens.slice(0, 20).map((account: any) => {
        const info = account.account.data.parsed.info
        return {
          mint: info.mint,
          balance: info.tokenAmount.uiAmount,
          decimals: info.tokenAmount.decimals,
        }
      }),
    }

    // Cache
    try {
      await redis.setex(cacheKey, CACHE_TTL_WALLET, JSON.stringify(summary))
    } catch (e) {
      console.warn('Redis write error:', e)
    }

    return NextResponse.json(summary, {
      headers: {
        'X-Cache': 'MISS',
        'Cache-Control': 'public, s-maxage=60',
      },
    })
  } catch (error) {
    console.error('Error fetching wallet summary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch wallet info' },
      { status: 500 }
    )
  }
}
