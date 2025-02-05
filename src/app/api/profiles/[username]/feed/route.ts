import { fetchTapestryServer } from '@/lib/tapestry-server'
import { FetchMethod } from '@/utils/api'
import { NextRequest, NextResponse } from 'next/server'
import type { Transaction } from '@/utils/helius/types'
import fs from 'fs/promises'
import path from 'path'

type RouteContext = {
  params: Promise<{ username: string }>
}

interface TransactionStats {
  totalVolume: number
  transactionCount: number
  uniqueInteractions: string[]
  marketplaceActivity: {
    [marketplace: string]: number
  }
  transactionTypes: {
    [type: string]: number
  }
}

// Helper to fetch transactions for a single wallet
async function fetchWalletTransactions(
  walletId: string,
): Promise<Transaction[]> {
  const apiKey = process.env.RPC_URL?.split('api-key=')[1]
  if (!apiKey) {
    throw new Error('Helius API key not configured')
  }

  const url = `https://api.helius.xyz/v0/addresses/${walletId}/transactions?api-key=${apiKey}&limit=14`

  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const data = await response.json()
    return data.map((tx: Transaction) => ({
      ...tx,
      sourceWallet: walletId,
    }))
  } catch (error) {
    console.error(`Error fetching transactions for ${walletId}:`, error)
    return []
  }
}

function calculateTransactionStats(
  transactions: Transaction[],
  walletIds: string[],
): TransactionStats {
  const stats: TransactionStats = {
    totalVolume: 0,
    transactionCount: transactions.length,
    uniqueInteractions: [],
    marketplaceActivity: {},
    transactionTypes: {},
  }

  transactions.forEach((tx) => {
    // Track transaction types
    stats.transactionTypes[tx.type] = (stats.transactionTypes[tx.type] || 0) + 1

    // Track marketplace activity
    if (tx.source) {
      stats.marketplaceActivity[tx.source] =
        (stats.marketplaceActivity[tx.source] || 0) + 1
    }

    // Calculate total volume from native transfers
    tx.nativeTransfers?.forEach((transfer) => {
      // Only count transfers between following wallets and external addresses
      if (
        (walletIds.includes(transfer.fromUserAccount) &&
          !walletIds.includes(transfer.toUserAccount)) ||
        (!walletIds.includes(transfer.fromUserAccount) &&
          walletIds.includes(transfer.toUserAccount))
      ) {
        stats.totalVolume += transfer.amount / 1e9 // Convert lamports to SOL
      }

      // Track unique interactions (external addresses)
      const externalAddress = walletIds.includes(transfer.fromUserAccount)
        ? transfer.toUserAccount
        : transfer.fromUserAccount
      if (!walletIds.includes(externalAddress)) {
        if (!stats.uniqueInteractions.includes(externalAddress)) {
          stats.uniqueInteractions.push(externalAddress)
        }
      }
    })
  })

  return stats
}

export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const params = await context.params
    const { username } = params

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 },
      )
    }

    // First, fetch the following list
    const followingResponse = await fetchTapestryServer({
      endpoint: `profiles/${username}/following`,
      method: FetchMethod.GET,
    })

    if (!followingResponse.profiles?.length) {
      return NextResponse.json({
        profiles: [],
        transactions: [],
        stats: null,
      })
    }

    // Get wallet IDs, filtering out undefined/null values
    const walletIds = followingResponse.profiles
      .map((profile: any) => profile.wallet?.id)
      .filter((id: string | undefined): id is string => !!id)

    // Fetch transactions for all wallets concurrently
    const transactionArrays = await Promise.all(
      walletIds.map(fetchWalletTransactions),
    )

    // Flatten and sort by timestamp
    const allTransactions = transactionArrays
      .flat()
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime()
        const timeB = new Date(b.timestamp).getTime()
        return timeB - timeA
      })
      .slice(0, 50) // Limit to most recent 50 transactions

    // Calculate transaction statistics
    const stats = calculateTransactionStats(allTransactions, walletIds)

    const responseData = {
      meta: {
        username,
        timestamp: new Date().toISOString(),
        followingCount: followingResponse.profiles.length,
        walletsTracked: walletIds.length,
      },
      stats,
      profiles: followingResponse.profiles.map((profile: any) => ({
        username: profile.username,
        wallet: profile.wallet?.id,
        image: profile.image,
        bio: profile.bio,
      })),
      transactions: allTransactions.map((tx) => ({
        signature: tx.signature,
        type: tx.type,
        source: tx.source,
        timestamp: tx.timestamp,
        sourceWallet: tx.sourceWallet,
        fee: tx.fee / 1e9,
        nativeTransfers: tx.nativeTransfers,
        tokenTransfers: tx.tokenTransfers,
        description: tx.description,
      })),
    }

    // Create data directory if it doesn't exist
    const dataDir = path.join(process.cwd(), 'data')
    await fs.mkdir(dataDir, { recursive: true })

    // Save to JSON file
    const filePath = path.join(dataDir, `${username}-feed.json`)
    await fs.writeFile(filePath, JSON.stringify(responseData, null, 2))

    return NextResponse.json(responseData)
  } catch (error: any) {
    console.error('Error fetching feed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feed' },
      { status: 500 },
    )
  }
}

export const dynamic = 'force-dynamic'
