import { SSE_TOKEN_MINT } from '@/constants/jupiter'
import { FeedTransaction } from '@/types/Transaction'
import { socialfi } from '@/utils/socialfi'
import { NextResponse } from 'next/server'

export async function GET() {
  // Make initial parallel requests for the first few pages
  const initialPagesToFetch = 3
  const pagePromises = Array.from({ length: initialPagesToFetch }, (_, i) =>
    socialfi.api.activity.swapList({
      tokenAddress: SSE_TOKEN_MINT,
      page: i.toString(),
      pageSize: '20',
    })
  )

  // Wait for all initial requests to complete
  const responses = await Promise.all(pagePromises)

  // Process the responses
  let allBuyTransactions: FeedTransaction[] = []
  for (const response of responses) {
    const buyTransactions = response.transactions.filter(
      (tx) => tx.to.token === SSE_TOKEN_MINT
    )
    allBuyTransactions = [...allBuyTransactions, ...buyTransactions]
  }

  // If we don't have enough transactions yet, fetch more pages in parallel
  let nextPage = initialPagesToFetch
  while (allBuyTransactions.length < 40 && nextPage < 10) {
    const additionalPagesToFetch = Math.min(3, 10 - nextPage)
    const additionalPagePromises = Array.from(
      { length: additionalPagesToFetch },
      (_, i) =>
        socialfi.api.activity.swapList({
          tokenAddress: SSE_TOKEN_MINT,
          page: (nextPage + i).toString(),
          pageSize: '20',
        })
    )

    const additionalResponses = await Promise.all(additionalPagePromises)
    for (const response of additionalResponses) {
      const buyTransactions = response.transactions.filter(
        (tx) => tx.to.token === SSE_TOKEN_MINT
      )
      allBuyTransactions = [...allBuyTransactions, ...buyTransactions]
    }

    nextPage += additionalPagesToFetch
  }

  // Take only the first 40 buy transactions
  const finalTransactions = allBuyTransactions.slice(0, 40)

  const response = NextResponse.json({
    transactions: finalTransactions,
    total: finalTransactions.length,
  })

  // Set cache control headers for 4 minutes with stale-while-revalidate
  response.headers.set(
    'Cache-Control',
    'public, max-age=240, stale-while-revalidate=120'
  )

  return response
}
