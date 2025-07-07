import { PLATFORM_FEE_BPS } from '@/constants/jupiter'
import { NextRequest, NextResponse } from 'next/server'

const SSE_FEE_BPS = 1 // SSE uses 1 basis point (0.01%)

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const walletAddress = searchParams.get('wallet')

  if (!walletAddress) {
    return NextResponse.json(
      { error: 'Wallet address required' },
      { status: 400 }
    )
  }

  try {
    // First, get the profile ID for this wallet by calling Tapestry directly
    const TAPESTRY_URL = process.env.TAPESTRY_URL
    const TAPESTRY_API_KEY = process.env.TAPESTRY_API_KEY

    if (!TAPESTRY_URL || !TAPESTRY_API_KEY) {
      console.error('Missing Tapestry configuration')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const profileResponse = await fetch(
      `${TAPESTRY_URL}/profiles?apiKey=${TAPESTRY_API_KEY}&walletAddress=${walletAddress}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    )

    if (!profileResponse.ok) {
      // Return empty savings if profile fetch fails
      return NextResponse.json({
        totalSavingsUSD: 0,
        tradesWithSSE: 0,
        averageSavingsPerTrade: 0,
        totalTrades: 0,
        percentageUsingSSE: 0,
        potentialAdditionalSavings: 0,
      })
    }

    const profileData = await profileResponse.json()
    const profile = profileData.profiles?.[0]?.profile

    if (!profile) {
      // No profile found, return empty savings
      return NextResponse.json({
        totalSavingsUSD: 0,
        tradesWithSSE: 0,
        averageSavingsPerTrade: 0,
        totalTrades: 0,
        percentageUsingSSE: 0,
        potentialAdditionalSavings: 0,
      })
    }

    // Import utilities
    const { contentServer } = await import('@/utils/content-server')
    const { getHistoricalPrice } = await import('@/utils/historical-prices')

    const contentData = await contentServer.getContents({
      profileId: profile.username,
      pageSize: 1000,
    })

    const allContents = contentData.contents || []

    // Filter for swap transactions - type is directly on content object
    const swapTransactions = allContents
      .filter((content: any) => content.content?.type === 'swap')
      .map((content: any) => ({
        properties: content.content, // Content fields are directly accessible
      }))

    // Analyze field availability
    const fieldAnalysis = {
      withSSEFee: 0,
      withUSDCFee: 0,
      withInputAmountUSD: 0,
      withSwapUSDValue: 0,
      withNoUSDData: 0,
      sampleWithoutUSD: [] as any[],
    }

    swapTransactions.forEach((tx: any, index: number) => {
      const content = tx.properties
      if (content?.sseFeeAmount) fieldAnalysis.withSSEFee++
      if (content?.usdcFeeAmount) fieldAnalysis.withUSDCFee++
      if (content?.inputAmountUsd) fieldAnalysis.withInputAmountUSD++
      if (content?.swapUsdValue) fieldAnalysis.withSwapUSDValue++

      // Check if this transaction has no USD data
      if (
        !content?.sseFeeAmount &&
        !content?.usdcFeeAmount &&
        !content?.inputAmountUsd &&
        !content?.swapUsdValue
      ) {
        fieldAnalysis.withNoUSDData++

        // Collect sample of first 3 transactions without USD data
        if (fieldAnalysis.sampleWithoutUSD.length < 3) {
          fieldAnalysis.sampleWithoutUSD.push({
            index,
            signature: content?.txSignature,
            timestamp: content?.timestamp,
            inputMint: content?.inputMint,
            outputMint: content?.outputMint,
            inputAmount: content?.inputAmount,
            expectedOutput: content?.expectedOutput,
            availableFields: Object.keys(content || {}),
          })
        }
      }
    })

    // Calculate savings
    let totalSavingsUSD = 0
    let tradesWithSSE = 0
    let tradesWithoutSSE = 0
    let potentialAdditionalSavings = 0
    let tradesWithoutUsdData = 0

    for (const tx of swapTransactions) {
      const content = tx.properties
      const sseFeeAmount = content?.sseFeeAmount
      const inputAmountUsd = content?.inputAmountUsd
      const swapUsdValue = content?.swapUsdValue
      const usdcFeeAmount = content?.usdcFeeAmount

      // Try to get USD value from various fields
      let swapValueUSD = 0
      if (swapUsdValue && swapUsdValue !== '0') {
        swapValueUSD = Number(swapUsdValue)
      } else if (inputAmountUsd && inputAmountUsd !== '0') {
        swapValueUSD = Number(inputAmountUsd)
      } else if (usdcFeeAmount && usdcFeeAmount !== '0') {
        // If we only have USDC fee amount, estimate swap value
        // Assuming regular fee is 0.8%, so swap value = fee / 0.008
        swapValueUSD = Number(usdcFeeAmount) / 0.008
      } else {
        // For legacy transactions, try to calculate USD value using historical prices
        const inputMint = content?.inputMint
        const outputMint = content?.outputMint
        const inputAmount = content?.inputAmount
        const expectedOutput = content?.expectedOutput
        const timestamp = content?.timestamp

        const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

        // If either input or output is USDC, we can get exact USD value
        if (inputMint === USDC_MINT && inputAmount) {
          swapValueUSD = Number(inputAmount)
        } else if (outputMint === USDC_MINT && expectedOutput) {
          swapValueUSD = Number(expectedOutput)
        } else if (timestamp) {
          // Try to get historical prices for both tokens
          const [inputPrice, outputPrice] = await Promise.all([
            getHistoricalPrice(inputMint, timestamp),
            getHistoricalPrice(outputMint, timestamp),
          ])

          // Calculate USD value based on whichever token we have a price for
          if (inputPrice && inputAmount) {
            swapValueUSD = Number(inputAmount) * inputPrice
          } else if (outputPrice && expectedOutput) {
            swapValueUSD = Number(expectedOutput) * outputPrice
          }
        }
      }

      if (swapValueUSD > 0) {
        if (sseFeeAmount && Number(sseFeeAmount) > 0) {
          tradesWithSSE++

          // Calculate what the fee would have been without SSE
          const regularFeeUSD = swapValueUSD * (PLATFORM_FEE_BPS / 10000) // 0.8%
          const sseFeeUSD = swapValueUSD * (SSE_FEE_BPS / 10000) // 0.01%
          const savedUSD = regularFeeUSD - sseFeeUSD

          totalSavingsUSD += savedUSD
        } else {
          tradesWithoutSSE++

          // Calculate potential savings if SSE was used
          const regularFeeUSD = swapValueUSD * (PLATFORM_FEE_BPS / 10000) // 0.8%
          const sseFeeUSD = swapValueUSD * (SSE_FEE_BPS / 10000) // 0.01%
          const potentialSavedUSD = regularFeeUSD - sseFeeUSD

          potentialAdditionalSavings += potentialSavedUSD
        }
      } else {
        tradesWithoutUsdData++
      }
    }

    const averageSavingsPerTrade =
      tradesWithSSE > 0 ? totalSavingsUSD / tradesWithSSE : 0

    return NextResponse.json({
      totalSavingsUSD,
      tradesWithSSE,
      averageSavingsPerTrade,
      totalTrades: swapTransactions.length,
      percentageUsingSSE:
        swapTransactions.length > 0
          ? (tradesWithSSE / swapTransactions.length) * 100
          : 0,
      potentialAdditionalSavings,
    })
  } catch (error) {
    console.error('Error calculating SSE savings:', error)
    return NextResponse.json(
      { error: 'Failed to calculate savings' },
      { status: 500 }
    )
  }
}
