'use client'

import { DataCard } from '@/components/ui/data-card'
import { formatNumber } from '@/utils/format'
import type { VirtualItem } from '@tanstack/react-virtual'
import { useVirtualizer } from '@tanstack/react-virtual'
import { memo, useEffect, useRef, useState } from 'react'
import { TokenAddress } from '@/components/tokens/token-address'

// Define interface for leaderboard entries
interface ProfileWithStats {
  profile: {
    username: string
    image?: string
    bio?: string
  }
  wallet?: {
    address: string
  }
  namespace?: {
    name: string
    readableName?: string
    faviconURL?: string
  }
  socialCounts: {
    followers: number
    following: number
  }
}

// Define interface for transaction data
interface Transaction {
  signature: string
  timestamp: string
  type: string
  description: string
  fee: number
  tokenTransfers: {
    tokenMint: string
    from: string
    to: string
    amount: number
    symbol?: string
  }[]
  success: boolean
}

// Define interface for trader with their transactions
interface TraderWithActivity {
  position: number
  address: string
  username: string
  image?: string
  followers: number
  transactions: Transaction[]
}

// Memoized swap transaction card component
const SwapCard = memo(
  ({
    transaction,
    trader,
    className,
  }: {
    transaction: Transaction
    trader: TraderWithActivity
    className?: string
  }) => {
    // Skip if no token transfers or less than 2 (need at least input and output tokens)
    if (!transaction.tokenTransfers || transaction.tokenTransfers.length < 2) {
      return null
    }
    
    let inputToken = transaction.tokenTransfers.find(
      t => t.from === trader.address
    )
    
    let outputToken = transaction.tokenTransfers.find(
      t => t.to === trader.address
    )
    
    if (!inputToken || !outputToken) {
      // For mock data testing purposes, if we can't identify in/out tokens by trader address,
      // just use the first and second token transfer
      if (transaction.tokenTransfers.length >= 2) {
        inputToken = transaction.tokenTransfers[0];
        outputToken = transaction.tokenTransfers[1];
      } else {
        return null;
      }
    }
    
    // Format token symbols or use short addresses
    const formatTokenSymbol = (mint: string) => {
      // In a real implementation, you'd have a token lookup service
      const symbols: Record<string, string> = {
        'So11111111111111111111111111111111111111112': 'SOL',
        'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v': 'USDC',
        'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263': 'BONK',
        'JUPyiwrYJFskUPiHa7hkeR8VUtAeFoSYbKedZNsDvCN': 'JUP',
        // Add more mappings as needed
      }
      
      if (symbols[mint]) {
        return symbols[mint]
      }
      
      // Try to extract token symbol from the transaction data if available
      // Since we don't have this info directly, we return a shortened address
      return mint.substring(0, 4) + '...' + mint.substring(mint.length - 4)
    }
    
    const inputSymbol = inputToken.symbol || formatTokenSymbol(inputToken.tokenMint)
    const outputSymbol = outputToken.symbol || formatTokenSymbol(outputToken.tokenMint)
    
    return (
      <div
        className={`bg-black/30 p-2 sm:p-3 rounded-lg border border-indigo-800/30 hover:border-indigo-500/50 transition-all ${
          className || ''
        }`}
      >
        {/* Trader info */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="font-medium text-sm">
              {trader.username ? (
                <span className="text-indigo-300">@{trader.username}</span>
              ) : (
                <TokenAddress address={trader.address} />
              )}
            </div>
            <div className="text-xs text-indigo-400">
              {formatNumber(trader.followers)} followers
            </div>
          </div>
          <div className="text-xs text-indigo-400">
            {new Date(transaction.timestamp).toLocaleTimeString()}
          </div>
        </div>
        
        {/* Swap details */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-indigo-900/30 rounded-lg p-2 flex items-center justify-between">
            <span className="font-mono text-xs sm:text-sm text-indigo-200">
              {formatNumber(inputToken.amount)} {inputSymbol}
            </span>
            <span className="text-indigo-500">→</span>
            <span className="font-mono text-xs sm:text-sm text-indigo-200">
              {formatNumber(outputToken.amount)} {outputSymbol}
            </span>
          </div>
        </div>
      </div>
    )
  }
)

SwapCard.displayName = 'SwapCard'

export const MostFollowedFeed = () => {
  const [swapActivities, setSwapActivities] = useState<{trader: TraderWithActivity, transaction: Transaction}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const scrollContainerRef = useRef<HTMLDivElement>(null)

  // Set up virtualization
  const rowVirtualizer = useVirtualizer({
    count: swapActivities.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => 100, // Estimated height for each swap card
    overscan: 3, // Number of items to render outside the visible area
  })

  useEffect(() => {
    const fetchTopFollowedUsersAndSwaps = async () => {
      try {
        setIsLoading(true)

        // Fetch top 10 profiles sorted by followers
        const profilesResponse = await fetch('/api/profiles?pageSize=10&sortBy=followers')
        
        if (!profilesResponse.ok) {
          throw new Error(`Failed to fetch profiles: ${profilesResponse.status}`)
        }
        
        const profilesData = await profilesResponse.json()
        console.log(profilesData)
        
        // Process profiles data and fetch transactions for each user
        const allSwapActivities: {trader: TraderWithActivity, transaction: Transaction}[] = []
        
        await Promise.all(
          profilesData.profiles.map(async (profile: ProfileWithStats, index: number) => {
            if (!profile.wallet?.address) {
              return // Skip if no wallet
            }

            try {
              // Fetch transactions for this wallet address
              const txResponse = await fetch(`/api/transactions?address=${profile.wallet.address}`)
              
              if (!txResponse.ok) {
                return
              }
              
              const txData = await txResponse.json()
              
              const trader: TraderWithActivity = {
                position: index + 1,
                address: profile.wallet.address,
                username: profile.profile.username || '',
                image: profile.profile.image,
                followers: profile.socialCounts.followers,
                transactions: txData
              }
              
              // Filter for transactions that look like swaps
              // A swap usually has at least two token transfers involving the trader's address
              const swapTransactions = txData.filter((tx: Transaction) => {
                if (!tx.tokenTransfers || tx.tokenTransfers.length < 2) {
                  return false
                }
                
                // Check if the trader is both sending and receiving tokens
                const isTraderSending = tx.tokenTransfers.some(tt => tt.from === trader.address)
                const isTraderReceiving = tx.tokenTransfers.some(tt => tt.to === trader.address)
                
                return isTraderSending && isTraderReceiving
              })
              
              // Add each swap as a separate activity item
              swapTransactions.forEach((tx: Transaction) => {
                allSwapActivities.push({
                  trader,
                  transaction: tx
                })
              })
            } catch (err) {
              console.error(`Error fetching transactions for ${profile.wallet.address}`, err)
            }
          })
        )
        
        // Sort all swap activities by timestamp (newest first)
        const sortedActivities = allSwapActivities.sort((a, b) => 
          new Date(b.transaction.timestamp).getTime() - new Date(a.transaction.timestamp).getTime()
        )
        
        setSwapActivities(sortedActivities)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError(
          err instanceof Error
            ? err.message
            : 'Failed to fetch data'
        )
      } finally {
        if (swapActivities.length === 0) {
          setMockData() // Use mock data if we didn't get real data
        }
        setIsLoading(false)
      }
    }

    // Mock data for development/demo
    const setMockData = () => {
      // Create a set of mock traders
      const mockTraders = Array.from({ length: 10 }, (_, i) => ({
        position: i + 1,
        address: `${i}FaKeAddReSs0000000000000000000000000000${i}`,
        username: i % 2 === 0 ? `trader${i}` : '',
        image: i % 3 === 0 ? `https://api.dicebear.com/7.x/identicon/svg?seed=${i}` : undefined,
        followers: Math.floor(10000 - i * 600 + Math.random() * 200),
        transactions: [] // We'll populate actual transactions in the activities array
      }))
      
      // Create an array to hold all swap activities
      const mockActivities: {trader: TraderWithActivity, transaction: Transaction}[] = []
      
      // Define some realistic token pairs
      const tokenPairs = [
        { in: 'SOL', out: 'USDC', inMint: 'So11111111111111111111111111111111111111112', outMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' },
        { in: 'USDC', out: 'BONK', inMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', outMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263' },
        { in: 'SOL', out: 'JUP', inMint: 'So11111111111111111111111111111111111111112', outMint: 'JUPtxMeP5rUYYmYRG3AwXKKAJ3JKCPn5qbQr5kaAGJB' },
        { in: 'BONK', out: 'SOL', inMint: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263', outMint: 'So11111111111111111111111111111111111111112' },
      ]
      
      // Generate more swaps for popular traders, fewer for less popular ones
      for (let i = 0; i < mockTraders.length; i++) {
        const trader = mockTraders[i]
        // More popular traders (lower index) get more swaps
        const numSwaps = Math.max(1, Math.floor((10 - i) / 2))
        
        for (let j = 0; j < numSwaps; j++) {
          // Pick a random token pair
          const pair = tokenPairs[Math.floor(Math.random() * tokenPairs.length)]
          
          // Create realistic amounts based on token type
          const inAmount = pair.in === 'SOL' 
            ? Math.random() * 10 + 0.1 // SOL amount between 0.1 and 10.1
            : pair.in === 'USDC' 
              ? Math.random() * 500 + 10 // USDC amount between 10 and 510
              : Math.random() * 1000000 + 10000 // BONK or other tokens (larger amounts)
          
          const outAmount = pair.out === 'SOL'
            ? Math.random() * 5 + 0.05 // SOL amount
            : pair.out === 'USDC'
              ? Math.random() * 250 + 5 // USDC amount
              : Math.random() * 500000 + 5000 // BONK or other tokens
          
          // Create a timestamp within the last 24 hours
          // More recent for more popular traders
          const hoursAgo = Math.random() * 24 * (1 + i / 5)
          const timestamp = new Date(Date.now() - hoursAgo * 3600000).toISOString()
          
          // Create the transaction object
          const transaction: Transaction = {
            signature: `sig_${i}_${j}_${Date.now()}`,
            timestamp: timestamp,
            type: 'SWAP',
            description: `Swap ${pair.in} for ${pair.out}`,
            fee: 0.000005 + Math.random() * 0.0001, // Small SOL fee
            tokenTransfers: [
              {
                tokenMint: pair.inMint,
                from: trader.address,
                to: 'SwapProgram123456789',
                amount: inAmount,
                symbol: pair.in
              },
              {
                tokenMint: pair.outMint,
                from: 'SwapProgram123456789',
                to: trader.address,
                amount: outAmount,
                symbol: pair.out
              }
            ],
            success: Math.random() > 0.05 // 95% success rate
          }
          
          // Add this activity to our list
          mockActivities.push({ trader, transaction })
        }
      }
      
      // Sort by timestamp (newest first)
      mockActivities.sort((a, b) => 
        new Date(b.transaction.timestamp).getTime() - new Date(a.transaction.timestamp).getTime()
      )
      
      // Update the state with our mock activities
      setSwapActivities(mockActivities)
    }

    fetchTopFollowedUsersAndSwaps()
  }, [])

  return (
    <DataCard
      className="h-[600px]"
      borderColor="indigo"
      title="Top Followed Users' Swaps"
      titleRight={null}
      error={error}
      loading={isLoading}
      loadingText="Fetching swap activity from top users"
    >
      {/* Content */}
      <div
        ref={scrollContainerRef}
        className="overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-indigo-900/50 p-3"
      >
        {swapActivities.length === 0 && !isLoading && (
          <div className="text-center py-8 text-indigo-400">
            No swap activities found. Try refreshing or check back later.
          </div>
        )}
        
        <div
          style={{
            height: `${rowVirtualizer.getTotalSize()}px`,
            width: '100%',
            position: 'relative',
          }}
        >
          {rowVirtualizer.getVirtualItems().map((virtualRow: VirtualItem) => {
            const activity = swapActivities[virtualRow.index]
            if (!activity) return null
            
            return (
              <div
                key={`${activity.transaction.signature}`}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                  padding: '4px 0',
                }}
              >
                <SwapCard
                  transaction={activity.transaction}
                  trader={activity.trader}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Scroll Progress Indicator */}
      <div className="absolute right-2 top-[48px] bottom-2 w-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div className="h-full bg-indigo-500/5 rounded-full">
          <div className="h-24 w-full bg-indigo-500/20 rounded-full animate-pulse" />
        </div>
      </div>
    </DataCard>
  )
}