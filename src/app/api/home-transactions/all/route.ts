import { IExtendedHeliusTransaction } from '@/components/home-transactions/home-transactions.models'
import { fetchWrapper } from '@/utils/api'
import { listCache, transactionCache } from '@/utils/redis'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    // Get pagination parameters from query string
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1', 10)
    const pageSize = parseInt(searchParams.get('pageSize') || '20', 10)
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Check if we have this page cached (skip cache if force refresh)
    const cacheKey = `home-all:${page}:${pageSize}`

    if (!forceRefresh) {
      const cachedPage = await listCache.get(cacheKey)

      if (cachedPage) {
        // Check if there's new content by comparing the first transaction
        const contentData = await fetchWrapper<{
          contents: any[]
          totalCount: number
          page: number
          pageSize: number
        }>({
          endpoint: `contents`,
          queryParams: {
            orderByDirection: 'DESC',
            orderByField: 'created_at',
            page: '1',
            pageSize: '1', // Just get the latest one to check
          },
        })

        const latestSignature = contentData?.contents?.[0]?.content?.txSignature
        const cachedLatestSignature = (cachedPage as any)?.data?.[0]?.signature

        // If the latest transaction is different, invalidate cache
        if (latestSignature && latestSignature !== cachedLatestSignature) {
          console.log('New content detected, invalidating cache')
          await listCache.invalidate('home-all:*')
        } else {
          console.log(`Cache hit for page ${page}`)
          return NextResponse.json(cachedPage)
        }
      }
    }

    const contentData = await fetchWrapper<{
      contents: any[]
      totalCount: number
      page: number
      pageSize: number
    }>({
      endpoint: `contents`,
      queryParams: {
        orderByDirection: 'DESC',
        orderByField: 'created_at',
        page: page.toString(),
        pageSize: pageSize.toString(),
      },
    })

    // Get transaction signatures
    const transactionSignatures = contentData?.contents
      .map((content: any) => {
        return content.content.txSignature
      })
      .filter(Boolean)

    // Check cache for existing transactions
    const cachedTransactions = await transactionCache.getMany(
      transactionSignatures
    )

    // Identify which transactions we need to fetch
    const missingSignatures = transactionSignatures.filter(
      (sig) => !cachedTransactions[sig]
    )

    console.log(
      `Found ${
        Object.keys(cachedTransactions).length
      } cached transactions, need to fetch ${missingSignatures.length}`
    )

    // Fetch only missing transactions
    const newTransactions: Record<string, IExtendedHeliusTransaction> = {}

    if (missingSignatures.length > 0) {
      const transactionPromises = missingSignatures.map(async (signature) => {
        try {
          const transaction = await fetchWrapper<IExtendedHeliusTransaction>({
            endpoint: `transactions/${signature}`,
          })
          return { signature, transaction }
        } catch (error) {
          console.error(`Failed to fetch transaction ${signature}:`, error)
          return null
        }
      })

      const transactionsSettled = await Promise.allSettled(transactionPromises)

      // Process fetched transactions
      for (const result of transactionsSettled) {
        if (result.status === 'fulfilled' && result.value) {
          const { signature, transaction } = result.value
          newTransactions[signature] = transaction
        }
      }

      // Cache the newly fetched transactions
      if (Object.keys(newTransactions).length > 0) {
        await transactionCache.setMany(newTransactions)
      }
    }

    // Combine cached and new transactions
    const allTransactionsMap = { ...cachedTransactions, ...newTransactions }

    // Build the final response
    const allTransactions = transactionSignatures
      .map((signature) => {
        const transaction = allTransactionsMap[signature]
        if (!transaction) return null

        const content = contentData?.contents.find(
          (content) => content.content.txSignature === signature
        )

        return {
          ...transaction,
          profile: content?.authorProfile,
          content: content?.content,
        }
      })
      .filter(Boolean)

    // Prepare response
    const response = {
      data: allTransactions,
      pagination: {
        page: contentData?.page || page,
        pageSize: contentData?.pageSize || pageSize,
        totalCount: contentData?.totalCount || 0,
        totalPages: Math.ceil((contentData?.totalCount || 0) / pageSize),
      },
    }

    // Cache the page result (with shorter TTL for first page)
    const ttl = page === 1 ? 60 : 300 // 1 minute for first page, 5 minutes for others
    await listCache.set(cacheKey, response, ttl)

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching all transactions:', error)

    return NextResponse.json(
      { error: 'Failed to fetch all transactions' },
      { status: 500 }
    )
  }
}

// POST endpoint to invalidate cache
export async function POST(request: NextRequest) {
  try {
    // Invalidate all home transaction caches
    await listCache.invalidate('home-all:*')

    return NextResponse.json({
      success: true,
      message: 'Cache invalidated successfully',
    })
  } catch (error) {
    console.error('Error invalidating cache:', error)
    return NextResponse.json(
      { error: 'Failed to invalidate cache' },
      { status: 500 }
    )
  }
}
