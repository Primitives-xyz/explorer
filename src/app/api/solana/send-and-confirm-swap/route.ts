import { scoreManager } from '@/services/scoring/score-manager'
import { fetchTapestryServer } from '@/utils/api/tapestry-server'
import { getUserIdFromToken, verifyRequestAuth } from '@/utils/auth'
import { EXPLORER_NAMESPACE } from '@/utils/constants'
import { contentServer } from '@/utils/content-server'
import { fetchTokenInfo } from '@/utils/helius/das-api'
import redis from '@/utils/redis'
import {
  Connection,
  TransactionConfirmationStatus,
  VersionedTransaction,
} from '@solana/web3.js'
import { NextRequest, NextResponse } from 'next/server'

export interface SendAndConfirmSwapRequest {
  serializedTransaction: string
  walletAddress: string
  metadata?: {
    inputMint?: string
    outputMint?: string
    inputAmount?: string
    expectedOutput?: string
    priceImpact?: string
    slippageBps?: string
    usdcFeeAmount?: string
    route?: string
    swapUsdValue?: string
    sourceWallet?: string
    sourceTransactionId?: string
    sseFeeAmount?: string
  }
}

export interface TransactionStatusUpdate {
  status: 'sending' | 'sent' | 'confirming' | 'confirmed' | 'failed' | 'timeout'
  signature?: string
  error?: string
  confirmationStatus?: TransactionConfirmationStatus
  slot?: number
  contentId?: string
}

// Helper function to fetch profiles directly from Tapestry
async function fetchProfilesByWallet(walletAddress: string) {
  try {
    const data = await fetchTapestryServer<any>({
      endpoint: `profiles?walletAddress=${walletAddress}&shouldIncludeExternalProfiles=true`,
    })
    return data
  } catch (error) {
    console.error('Error fetching profiles from Tapestry:', error)
    return { profiles: [] }
  }
}

// Helper function to parse swap transaction using Helius
async function parseSwapTransaction(signature: string, walletAddress: string) {
  const HELIUS_API_KEY = process.env.HELIUS_API_KEY
  if (!HELIUS_API_KEY) {
    throw new Error('Helius API key not configured')
  }

  const response = await fetch(
    `https://api.helius.xyz/v0/transactions?api-key=${HELIUS_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transactions: [signature],
      }),
    }
  )

  const data = await response.json()
  if (!response.ok || !data || !Array.isArray(data) || data.length === 0) {
    throw new Error('Failed to parse transaction')
  }

  const transaction = data[0]

  // Verify this is actually a swap transaction
  if (transaction.type !== 'SWAP' && !transaction.tokenTransfers?.length) {
    throw new Error('Transaction is not a swap')
  }

  // Verify the wallet address matches the fee payer
  if (transaction.feePayer !== walletAddress) {
    throw new Error('Transaction fee payer does not match wallet address')
  }

  return transaction
}

// Helper function to extract swap details from parsed transaction
function extractSwapDetails(transaction: any, walletAddress: string) {
  const tokenTransfers = transaction.tokenTransfers || []

  // Find outgoing and incoming transfers for the wallet
  const outgoingTransfers = tokenTransfers.filter(
    (t: any) => t.fromUserAccount === walletAddress
  )
  const incomingTransfers = tokenTransfers.filter(
    (t: any) => t.toUserAccount === walletAddress
  )

  if (outgoingTransfers.length === 0 || incomingTransfers.length === 0) {
    throw new Error('Invalid swap transaction structure')
  }

  // Use the first outgoing and last incoming as primary swap tokens
  const primaryOutgoing = outgoingTransfers[0]
  const primaryIncoming = incomingTransfers[incomingTransfers.length - 1]

  return {
    inputMint: primaryOutgoing.mint,
    outputMint: primaryIncoming.mint,
    inputAmount: primaryOutgoing.tokenAmount.toString(),
    outputAmount: primaryIncoming.tokenAmount.toString(),
    timestamp: transaction.timestamp,
  }
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const verifiedToken = await verifyRequestAuth(req.headers)
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

    const body: SendAndConfirmSwapRequest = await req.json()
    const { serializedTransaction, walletAddress, metadata } = body

    if (!serializedTransaction || !walletAddress) {
      return NextResponse.json(
        {
          status: 'failed' as const,
          error: 'Missing required parameters',
        },
        { status: 400 }
      )
    }

    const connection = new Connection(
      process.env.RPC_URL || 'https://api.mainnet-beta.solana.com',
      'confirmed'
    )

    // Deserialize the transaction
    const transaction = VersionedTransaction.deserialize(
      Buffer.from(serializedTransaction, 'base64')
    )

    // Send the transaction
    let signature: string
    try {
      signature = await connection.sendRawTransaction(transaction.serialize(), {
        skipPreflight: true,
        maxRetries: 2,
      })
    } catch (error: any) {
      return NextResponse.json({
        status: 'failed' as const,
        error: error.message || 'Failed to send transaction',
      })
    }

    // Poll for confirmation
    const maxDuration = 30000 // 30 seconds total
    const startTime = Date.now()
    let pollInterval = 100 // Start with 100ms
    const maxPollInterval = 2000 // Max 2 seconds between polls

    while (Date.now() - startTime < maxDuration) {
      try {
        const status = await connection.getSignatureStatus(signature)

        if (status.value === null) {
          await new Promise((resolve) => setTimeout(resolve, pollInterval))
          pollInterval = Math.min(pollInterval * 1.5, maxPollInterval)
          continue
        }

        // Check if transaction failed
        if (status.value.err) {
          return NextResponse.json({
            status: 'failed' as const,
            signature,
            error: 'Transaction failed on chain',
          })
        }

        // Check if we've reached desired confirmation level
        if (
          status.value.confirmationStatus === 'confirmed' ||
          status.value.confirmationStatus === 'finalized'
        ) {
          // Transaction confirmed! Now parse it and create content
          try {
            // Parse the transaction to verify it's a real swap
            const parsedTx = await parseSwapTransaction(
              signature,
              walletAddress
            )
            const swapDetails = extractSwapDetails(parsedTx, walletAddress)

            // Fetch user profile
            const profilesResponse = await fetchProfilesByWallet(walletAddress)
            const profile = profilesResponse.profiles?.find(
              (p: any) => p.namespace.name === EXPLORER_NAMESPACE
            )?.profile

            if (!profile || profile.username !== userId) {
              throw new Error('Profile mismatch')
            }

            // Fetch token information
            const [inputTokenData, outputTokenData] = await Promise.all([
              fetchTokenInfo(swapDetails.inputMint),
              fetchTokenInfo(swapDetails.outputMint),
            ])

            // Create content properties
            const contentProperties = {
              type: 'swap',
              txSignature: signature,
              timestamp: String(Date.now()),
              walletAddress,
              walletUsername: profile.username || '',
              walletImage: profile.image || '',

              // Use verified on-chain data
              inputMint: swapDetails.inputMint,
              outputMint: swapDetails.outputMint,
              inputAmount: swapDetails.inputAmount,
              expectedOutput: swapDetails.outputAmount,

              // Use metadata for additional details (but verify critical data came from chain)
              priceImpact: metadata?.priceImpact || '0',
              slippageBps: metadata?.slippageBps || '50',
              usdcFeeAmount: metadata?.usdcFeeAmount || '0',
              route: metadata?.route || '',
              sseFeeAmount: metadata?.sseFeeAmount || '0',
              swapUsdValue: metadata?.swapUsdValue || '0',

              // Token information
              inputTokenSymbol:
                inputTokenData?.result?.content?.metadata?.symbol || '',
              inputTokenName:
                inputTokenData?.result?.content?.metadata?.name || '',
              outputTokenSymbol:
                outputTokenData?.result?.content?.metadata?.symbol || '',
              outputTokenName:
                outputTokenData?.result?.content?.metadata?.name || '',

              // Transaction type
              transactionType: metadata?.sourceWallet ? 'copied' : 'direct',
              sourceWallet: metadata?.sourceWallet || '',
              sourceTransactionId: metadata?.sourceTransactionId || '',
            }

            // Convert to properties array
            const properties = Object.entries(contentProperties).map(
              ([key, value]) => ({
                key,
                value: String(value),
              })
            )

            // Create content
            const content = await contentServer.findOrCreateContent({
              id: signature,
              profileId: profile.username,
              properties,
            })

            // Award points for the swap
            const volumeUSD = parseFloat(metadata?.swapUsdValue || '0')

            if (volumeUSD > 0) {
              // Award points for executing a trade
              await scoreManager.addScore(
                profile.username,
                metadata?.sourceWallet ? 'COPY_TRADE' : 'TRADE_EXECUTE',
                {
                  volumeUSD,
                  category: 'trading',
                  inputMint: swapDetails.inputMint,
                  outputMint: swapDetails.outputMint,
                  isCopyTrade: !!metadata?.sourceWallet,
                }
              )

              // If this was a copy trade, award points to the source
              if (metadata?.sourceWallet) {
                const sourceProfilesResponse = await fetchProfilesByWallet(
                  metadata.sourceWallet
                )
                const sourceProfile = sourceProfilesResponse.profiles?.find(
                  (p: any) => p.namespace.name === EXPLORER_NAMESPACE
                )?.profile

                if (sourceProfile?.username) {
                  // Atomically increment copier count
                  const newCopierCount = await redis.hincrby(
                    `trader:${sourceProfile.username}:stats`,
                    'copier_count',
                    1
                  )

                  // Award points to source
                  await scoreManager.addScore(
                    sourceProfile.username,
                    'COPIED_BY_OTHERS',
                    {
                      copierCount: newCopierCount,
                      category: 'influence',
                      copiedByUser: profile.username,
                    }
                  )
                }
              }

              // Check for daily bonus
              const today = new Date().toISOString().split('T')[0]
              const hasTradedToday = await redis.hget(
                `user:${profile.username}:daily:${today}`,
                'DAILY_TRADE'
              )
              if (!hasTradedToday) {
                await scoreManager.addScore(profile.username, 'DAILY_TRADE', {})
              }
            }

            return NextResponse.json({
              status: 'confirmed' as const,
              signature,
              confirmationStatus: status.value.confirmationStatus,
              slot: status.value.slot,
              contentId: signature,
            })
          } catch (parseError: any) {
            console.error('Error parsing/creating content:', parseError)
            // Still return success for the transaction, but log the error
            return NextResponse.json({
              status: 'confirmed' as const,
              signature,
              confirmationStatus: status.value.confirmationStatus,
              slot: status.value.slot,
              error: 'Transaction confirmed but content creation failed',
            })
          }
        }

        // Still processing, continue polling
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
        pollInterval = Math.min(pollInterval * 1.5, maxPollInterval)
      } catch (error: any) {
        console.error('Error polling signature status:', error)
        await new Promise((resolve) => setTimeout(resolve, pollInterval))
        pollInterval = Math.min(pollInterval * 1.5, maxPollInterval)
      }
    }

    // Timeout
    return NextResponse.json({
      status: 'timeout' as const,
      signature,
      error: 'Transaction confirmation timeout after 30 seconds',
    })
  } catch (error: any) {
    console.error('Send and confirm error:', error)
    return NextResponse.json(
      {
        status: 'failed' as const,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    )
  }
}
