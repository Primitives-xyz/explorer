import { SSE_TOKEN_MINT } from '@/constants/jupiter'
import { socialfi } from '@/utils/socialfi'
import { NextResponse } from 'next/server'

type Transaction = {
  type: string
  source: string
  description: string
  fee: number
  timestamp: string
  signature: string
  success: boolean
  walletAddress: string
  username: string
  from: { amount: number; token: string }
  to: { amount: number; token: string }
  accountsInvolved: string[]
}

// Set cache revalidation time to 30 seconds
export const revalidate = 30

export async function GET() {
  let allBuyTransactions: Transaction[] = []
  let page = 0

  // Keep fetching until we have at least 40 buy transactions or we've made too many attempts
  while (allBuyTransactions.length < 40 && page < 10) {
    const response = await socialfi.api.activity.swapList({
      tokenAddress: SSE_TOKEN_MINT,
      page: page.toString(),
      pageSize: '20',
    })

    // Filter for buy transactions (where to.token matches our target)
    const buyTransactions = response.transactions.filter(
      (tx) => tx.to.token === SSE_TOKEN_MINT
    )

    allBuyTransactions = [...allBuyTransactions, ...buyTransactions]
    page++
  }

  // Take only the first 40 buy transactions
  const finalTransactions = allBuyTransactions.slice(0, 40)

  const response = NextResponse.json({
    transactions: finalTransactions,
    total: finalTransactions.length,
  })

  // Set cache control headers
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=30, stale-while-revalidate=59'
  )

  return response
}
