import { SSE_TOKEN_MINT } from '@/constants/jupiter'
import { FeedTransaction } from '@/types/transaction'
import { socialfi } from '@/utils/socialfi'
import { NextResponse } from 'next/server'

export async function GET() {
  let allBuyTransactions: FeedTransaction[] = []
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

  // Set cache control headers for 30 seconds with stale-while-revalidate
  response.headers.set(
    'Cache-Control',
    'public, max-age=30, stale-while-revalidate=59'
  )

  return response
}
