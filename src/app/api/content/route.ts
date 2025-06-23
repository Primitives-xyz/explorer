import { scoreManager } from '@/services/scoring/score-manager'
import { getUserIdFromToken, verifyRequestAuth } from '@/utils/auth'
import { contentServer } from '@/utils/content-server'
import { sendNotification } from '@/utils/notification'
import redis from '@/utils/redis'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const orderByField = searchParams.get('orderByField')
  const orderByDirection = searchParams.get('orderByDirection') as
    | 'ASC'
    | 'DESC'
  const page = searchParams.get('page')
  const pageSize = searchParams.get('pageSize')
  const profileId = searchParams.get('profileId')
  const requestingProfileId = searchParams.get('requestingProfileId')
  const namespace = searchParams.get('namespace')

  try {
    const contents = await contentServer.getContents({
      ...(orderByField && { orderByField }),
      ...(orderByDirection && { orderByDirection }),
      ...(page && { page: parseInt(page) }),
      ...(pageSize && { pageSize: parseInt(pageSize) }),
      ...(profileId && { profileId }),
      ...(requestingProfileId && { requestingProfileId }),
      ...(namespace && { namespace }),
    })

    return NextResponse.json(contents)
  } catch (error: any) {
    console.error('Error fetching contents:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch contents' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    // Verify authentication
    const verifiedToken = await verifyRequestAuth(request.headers)
    if (!verifiedToken) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const userId = getUserIdFromToken(verifiedToken)
    if (!userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      id,
      profileId,
      relatedContentId,
      properties,
      sourceWallet,
      inputTokenName,
      outputTokenName,
      route,
    } = body

    if (!id || !profileId) {
      return NextResponse.json(
        { error: 'Missing required fields: id and profileId' },
        { status: 400 }
      )
    }

    // SECURITY: Ensure the authenticated user can only create content for their own profile
    if (userId !== profileId) {
      return NextResponse.json(
        { error: 'You can only create content for your own profile' },
        { status: 403 }
      )
    }

    // Extract trade data from properties for scoring
    const propsMap = properties.reduce((acc: any, prop: any) => {
      acc[prop.key] = prop.value
      return acc
    }, {})

    // Award points for the trade if it's a swap transaction
    if (propsMap.type === 'swap' && profileId) {
      try {
        console.log('Awarding points for trade, profile:', profileId)

        // Test Redis connection
        try {
          await redis.ping()
          console.log('Redis connection successful')
        } catch (error) {
          console.error('Redis connection failed:', error)
        }

        const inputAmountUsd = parseFloat(propsMap.inputAmountUsd || '0')
        const profitPercentage = parseFloat(propsMap.profitPercentage || '0')
        const profitUsd = parseFloat(propsMap.profitUsd || '0')

        const scoreMetadata = {
          volumeUSD: inputAmountUsd,
          profitPercent: profitPercentage,
          category: 'trading' as const,
          inputMint: propsMap.inputMint,
          outputMint: propsMap.outputMint,
          isCopyTrade: !!sourceWallet,
          profitable: profitUsd > 0,
          speedBonus: parseInt(propsMap.copyDelay || '0'),
          profitUsd,
        }

        // Award points for executing a trade
        const earnedScore = await scoreManager.addScore(
          profileId,
          sourceWallet ? 'COPY_TRADE' : 'TRADE_EXECUTE',
          scoreMetadata
        )

        console.log(`Earned ${earnedScore} points for trade`)

        // If this trade was copied, award points to the source
        if (sourceWallet && propsMap.sourceWalletUsername) {
          // Validate sourceWalletUsername to prevent malformed Redis keys
          const sourceUsername = propsMap.sourceWalletUsername.trim()
          if (!sourceUsername) {
            console.error(
              'Invalid sourceWalletUsername: empty or whitespace only'
            )
            return
          }

          // Atomically increment and get the new copier count
          const newCopierCount = await redis.hincrby(
            `trader:${sourceUsername}:stats`,
            'copier_count',
            1
          )

          // Award points with the current copier count (including this new copy)
          await scoreManager.addScore(sourceUsername, 'COPIED_BY_OTHERS', {
            copierCount: newCopierCount,
            category: 'influence' as const,
            copiedByUser: profileId,
            profitableForCopier: profitUsd > 0,
          })

          // Update profitable copies if needed
          if (profitUsd > 0) {
            await redis.hincrby(
              `trader:${sourceUsername}:stats`,
              'profitable_copies',
              1
            )
          }
        }

        // Check for first trade daily bonus
        const today = new Date().toISOString().split('T')[0]
        const hasTradedToday = await redis.hget(
          `user:${profileId}:daily:${today}`,
          'DAILY_TRADE'
        )
        if (!hasTradedToday) {
          await scoreManager.addScore(profileId, 'DAILY_TRADE', {})
        }
      } catch (scoringError) {
        // Log scoring errors but don't fail the content creation
        console.error('Error awarding points:', scoringError)
      }
    }

    // Create content using the contentServer utility
    const content = await contentServer.findOrCreateContent({
      id,
      profileId,
      relatedContentId,
      properties,
    })

    // Send notification for copy trades
    if (propsMap.transactionType === 'copied' && sourceWallet) {
      const tokenPair = `${inputTokenName} -> ${outputTokenName}`
      await sendNotification({
        notificationType: 'TRANSACTION_COPIED',
        recipientWalletAddress: sourceWallet,
        authorUsername: profileId,
        tokenPair,
      })
    }

    // Add headers to signal that scores were updated
    const headers = new Headers()
    if (propsMap.type === 'swap' && profileId) {
      headers.set('X-Score-Updated', 'true')
      headers.set('X-Score-User', profileId)
    }

    return NextResponse.json(content, { headers })
  } catch (error: any) {
    console.error('Error creating content:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create content' },
      { status: 500 }
    )
  }
}
