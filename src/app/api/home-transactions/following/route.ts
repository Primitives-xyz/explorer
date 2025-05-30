import {
  ETransactionType,
  IExtendedHeliusTransaction,
  IHomeTransaction,
} from '@/components/home-transactions/home-transactions.models'
import { IGetSocialResponse } from '@/components/tapestry/models/profiles.models'
import { fetchWrapper } from '@/utils/api'
import { listCache } from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const username = searchParams.get('username')

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      )
    }

    // Check cache first
    const cacheKey = `following-txs:${username}`
    const cachedData = await listCache.get(cacheKey)

    if (cachedData) {
      console.log(`Cache hit for following transactions: ${username}`)
      return NextResponse.json(cachedData)
    }

    // 1. Get all following profiles
    const profilesData = await fetchWrapper<IGetSocialResponse>({
      endpoint: `profiles/${username}/following`,
    })

    const walletIds = profilesData?.profiles
      ?.map((profile) => profile.wallet?.id)
      .filter(Boolean)

    console.log(
      `Processing ${walletIds.length} following wallets for ${username}`
    )

    // 2. Getting transactions for each wallet
    let allTransactions: IHomeTransaction[] = []

    // Process in batches to avoid overwhelming the API
    const batchSize = 5
    for (let i = 0; i < walletIds.length; i += batchSize) {
      const batch = walletIds.slice(i, i + batchSize)

      const batchPromises = batch.map(async (walletId) => {
        try {
          // Check if we have cached transactions for this wallet
          const walletCacheKey = `wallet-txs:${walletId}`
          let heliusTransactions = await listCache.get(walletCacheKey)

          if (!heliusTransactions) {
            // Fetch from API if not cached
            heliusTransactions = await fetchWrapper<
              IExtendedHeliusTransaction[]
            >({
              endpoint: 'helius-transactions',
              queryParams: {
                walletAddress: walletId as string,
                limit: 10,
              },
            })

            // Cache wallet transactions for 5 minutes
            if (heliusTransactions) {
              await listCache.set(walletCacheKey, heliusTransactions, 300)
            }
          }

          // Add profile information to each transaction
          const profile = profilesData.profiles.find(
            (profile) => profile.wallet?.id === walletId
          )

          const transactionsWithProfile: IHomeTransaction[] = (
            heliusTransactions as IExtendedHeliusTransaction[]
          ).map((transaction) => ({
            ...transaction,
            profile,
          }))

          return transactionsWithProfile
        } catch (error) {
          console.error(
            `Error fetching transactions for wallet ${walletId}:`,
            error
          )
          return []
        }
      })

      const batchResults = await Promise.all(batchPromises)
      allTransactions.push(...batchResults.flat())
    }

    // Filter and sort transactions
    const filteredTransactions = allTransactions
      .filter((transaction) => transaction.type === ETransactionType.SWAP)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      )

    // Cache the result for 2 minutes
    await listCache.set(cacheKey, filteredTransactions, 120)

    return NextResponse.json(filteredTransactions)
  } catch (error) {
    console.error('Error fetching following transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}
