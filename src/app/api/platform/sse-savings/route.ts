import { PLATFORM_FEE_BPS } from '@/constants/jupiter'
import { NextRequest, NextResponse } from 'next/server'
import redis from '@/utils/redis'

const SSE_FEE_BPS = 1 // SSE uses 1 basis point (0.01%)
const CACHE_KEY = 'platform:sse-savings:all-time'
const CACHE_TTL = 60 * 60 // 1 hour cache

interface PlatformSSESavings {
  totalSavingsUSD: number
  totalTradesWithSSE: number
  totalTrades: number
  totalVolumeUSD: number
  averageSavingsPerTrade: number
  percentageUsingSSE: number
  potentialAdditionalSavings: number
  lastUpdated: string
  topSavers: Array<{
    profileId: string
    savingsUSD: number
    tradesWithSSE: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const cached = await redis.get(CACHE_KEY)
    if (cached) {
      console.log('Returning cached platform SSE savings')
      return NextResponse.json(cached as PlatformSSESavings)
    }

    // If not cached, calculate platform-wide savings
    console.log('Calculating platform-wide SSE savings...')
    
    const TAPESTRY_URL = process.env.TAPESTRY_URL
    const TAPESTRY_API_KEY = process.env.TAPESTRY_API_KEY

    if (!TAPESTRY_URL || !TAPESTRY_API_KEY) {
      console.error('Missing Tapestry configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    // Import utilities
    const { contentServer } = await import('@/utils/content-server')
    const { getHistoricalPrice } = await import('@/utils/historical-prices')

    // Get all swap contents from the platform
    // We'll fetch in batches to handle large amounts of data
    let allSwapContents: any[] = []
    let currentPage = 1
    const pageSize = 1000
    let hasMore = true

    while (hasMore && currentPage <= 10) { // Limit to 10 pages for now
      const contentData = await contentServer.getContents({
        pageSize,
        page: currentPage,
        orderByField: 'created_at',
        orderByDirection: 'DESC'
      })

      if (contentData.contents && contentData.contents.length > 0) {
        // Filter for swap transactions
        const swapContents = contentData.contents.filter(
          (content: any) => content.content?.type === 'swap'
        )
        allSwapContents = [...allSwapContents, ...swapContents]
        currentPage++
        hasMore = contentData.contents.length === pageSize
      } else {
        hasMore = false
      }
    }

    console.log(`Fetched ${allSwapContents.length} swap transactions`)

    // Process all transactions to calculate savings
    let totalSavingsUSD = 0
    let totalTradesWithSSE = 0
    let totalTrades = 0
    let totalVolumeUSD = 0
    let potentialAdditionalSavings = 0
    
    // Track savings by profile for top savers
    const savingsByProfile: Record<string, {
      savingsUSD: number
      tradesWithSSE: number
      profileId: string
    }> = {}

    const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

    for (const content of allSwapContents) {
      const swap = content.content
      if (!swap || swap.type !== 'swap') continue

      totalTrades++

      // Get swap USD value
      let swapValueUSD = 0
      
      if (swap.swapUsdValue && swap.swapUsdValue !== '0') {
        swapValueUSD = Number(swap.swapUsdValue)
      } else if (swap.inputAmountUsd && swap.inputAmountUsd !== '0') {
        swapValueUSD = Number(swap.inputAmountUsd)
      } else if (swap.usdcFeeAmount && swap.usdcFeeAmount !== '0') {
        // Estimate from USDC fee
        swapValueUSD = Number(swap.usdcFeeAmount) / 0.008
      } else if (swap.inputMint === USDC_MINT && swap.inputAmount) {
        swapValueUSD = Number(swap.inputAmount)
      } else if (swap.outputMint === USDC_MINT && swap.expectedOutput) {
        swapValueUSD = Number(swap.expectedOutput)
      } else if (swap.timestamp) {
        // Try historical prices
        const [inputPrice, outputPrice] = await Promise.all([
          getHistoricalPrice(swap.inputMint, swap.timestamp),
          getHistoricalPrice(swap.outputMint, swap.timestamp),
        ])

        if (inputPrice && swap.inputAmount) {
          swapValueUSD = Number(swap.inputAmount) * inputPrice
        } else if (outputPrice && swap.expectedOutput) {
          swapValueUSD = Number(swap.expectedOutput) * outputPrice
        }
      }

      if (swapValueUSD > 0) {
        totalVolumeUSD += swapValueUSD

        if (swap.sseFeeAmount && Number(swap.sseFeeAmount) > 0) {
          totalTradesWithSSE++

          // Calculate savings
          const regularFeeUSD = swapValueUSD * (PLATFORM_FEE_BPS / 10000)
          const sseFeeUSD = swapValueUSD * (SSE_FEE_BPS / 10000)
          const savedUSD = regularFeeUSD - sseFeeUSD

          totalSavingsUSD += savedUSD

          // Track by profile
          const profileId = content.profileId || 'unknown'
          if (!savingsByProfile[profileId]) {
            savingsByProfile[profileId] = {
              profileId,
              savingsUSD: 0,
              tradesWithSSE: 0
            }
          }
          savingsByProfile[profileId].savingsUSD += savedUSD
          savingsByProfile[profileId].tradesWithSSE++
        } else {
          // Calculate potential savings
          const regularFeeUSD = swapValueUSD * (PLATFORM_FEE_BPS / 10000)
          const sseFeeUSD = swapValueUSD * (SSE_FEE_BPS / 10000)
          const potentialSavedUSD = regularFeeUSD - sseFeeUSD

          potentialAdditionalSavings += potentialSavedUSD
        }
      }
    }

    // Get top 10 savers
    const topSavers = Object.values(savingsByProfile)
      .sort((a, b) => b.savingsUSD - a.savingsUSD)
      .slice(0, 10)

    const averageSavingsPerTrade = 
      totalTradesWithSSE > 0 ? totalSavingsUSD / totalTradesWithSSE : 0

    const percentageUsingSSE = 
      totalTrades > 0 ? (totalTradesWithSSE / totalTrades) * 100 : 0

    const result: PlatformSSESavings = {
      totalSavingsUSD,
      totalTradesWithSSE,
      totalTrades,
      totalVolumeUSD,
      averageSavingsPerTrade,
      percentageUsingSSE,
      potentialAdditionalSavings,
      lastUpdated: new Date().toISOString(),
      topSavers
    }

    // Cache the result
    await redis.setex(CACHE_KEY, CACHE_TTL, result)

    console.log(`Cached platform SSE savings. Total savings: $${totalSavingsUSD.toFixed(2)}`)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error calculating platform SSE savings:', error)
    return NextResponse.json(
      { error: 'Failed to calculate platform savings' },
      { status: 500 }
    )
  }
}

// POST endpoint to force refresh the cache
export async function POST(request: NextRequest) {
  try {
    // Clear the cache
    await redis.del(CACHE_KEY)
    
    // Recalculate by calling GET
    return GET(request)
  } catch (error) {
    console.error('Error refreshing platform SSE savings:', error)
    return NextResponse.json(
      { error: 'Failed to refresh platform savings' },
      { status: 500 }
    )
  }
}