import { InventoryPosition } from '@/components/trenches/types/inventory-types'
import { Transaction } from '@/hooks/use-tapestry-transaction-history'

interface ProcessedData {
  positions: InventoryPosition[]
  pnl: number
}

// Function to fetch current prices for unique mints
async function fetchCurrentPrices(
  mints: string[]
): Promise<Record<string, number>> {
  if (mints.length === 0) return {}

  try {
    console.log('🔄 Fetching current prices for:', mints.length, 'tokens')

    // Use Jupiter's price API for current prices
    const response = await fetch(
      `https://price.jup.ag/v6/price?ids=${mints.join(
        ','
      )}&vsToken=So11111111111111111111111111111111111111112`
    )

    if (!response.ok) {
      console.warn('Price fetch failed, using fallback')
      return {}
    }

    const data = await response.json()
    const prices: Record<string, number> = {}

    Object.entries(data.data || {}).forEach(
      ([mint, priceData]: [string, any]) => {
        if (priceData?.price) {
          prices[mint] = priceData.price
          console.log(`💰 ${mint.substring(0, 8)}: ${priceData.price} SOL`)
        }
      }
    )

    return prices
  } catch (error) {
    console.error('Error fetching prices:', error)
    return {}
  }
}

export async function processTransactions(
  transactions: Transaction[]
): Promise<ProcessedData> {
  console.log(
    '🔄 Starting transaction processing:',
    transactions.length,
    'transactions'
  )

  const positionMap = new Map<string, InventoryPosition>()
  let totalRealizedPnL = 0

  const SOL_MINT = 'So11111111111111111111111111111111111111112'
  const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'

  transactions.forEach((transaction, index) => {
    const {
      inputAmount,
      outputAmount,
      inputValueSOL,
      outputValueSOL,
      inputMint,
      outputMint,
      tradeType,
      transactionSignature,
    } = transaction

    console.log(`\n📊 Processing transaction ${index + 1}:`, {
      signature: transactionSignature?.substring(0, 8),
      tradeType,
      inputMint: inputMint?.substring(0, 8),
      outputMint: outputMint?.substring(0, 8),
      inputAmount,
      outputAmount,
      inputValueSOL,
      outputValueSOL,
    })

    // Handle BUY transactions (SOL/USDC -> Token)
    if (
      tradeType === 'buy' ||
      inputMint === SOL_MINT ||
      inputMint === USDC_MINT
    ) {
      const tokenMint = outputMint
      const tokenAmount = outputAmount
      const solSpent = inputValueSOL || 0
      const avgPrice = solSpent / tokenAmount

      console.log(
        `  💰 BUY: ${tokenAmount} tokens for ${solSpent} SOL (avg: ${avgPrice})`
      )

      let position = positionMap.get(tokenMint)
      if (position) {
        // Update existing position with weighted average
        const newTotalAmount = position.totalAmount + tokenAmount
        const newTotalInvested = position.totalInvested + solSpent

        position.totalAmount = newTotalAmount
        position.totalInvested = newTotalInvested
        position.averageBuyPrice = newTotalInvested / newTotalAmount
        position.lastUpdated = Date.now()

        console.log(`  📈 Updated position:`, {
          totalAmount: position.totalAmount,
          totalInvested: position.totalInvested,
          avgPrice: position.averageBuyPrice,
        })
      } else {
        // Create new position
        position = {
          mint: tokenMint,
          totalAmount: tokenAmount,
          totalInvested: solSpent,
          currentPrice: 0, // Will be updated with real-time price
          averageBuyPrice: avgPrice,
          symbol: tokenMint.substring(0, 8),
          name: tokenMint,
          image: '',
          transactions: [],
          lastUpdated: Date.now(),
        }
        positionMap.set(tokenMint, position)

        console.log(`  🆕 Created new position:`, {
          mint: tokenMint.substring(0, 8),
          totalAmount: position.totalAmount,
          totalInvested: position.totalInvested,
          avgPrice: position.averageBuyPrice,
        })
      }
    }

    // Handle SELL transactions (Token -> SOL/USDC)
    else if (
      tradeType === 'sell' ||
      outputMint === SOL_MINT ||
      outputMint === USDC_MINT
    ) {
      const tokenMint = inputMint
      const tokensSold = inputAmount
      const solReceived = outputValueSOL || 0

      console.log(`  📉 SELL: ${tokensSold} tokens for ${solReceived} SOL`)

      const position = positionMap.get(tokenMint)
      if (position) {
        // Calculate realized PnL for this sell
        const costBasis = tokensSold * position.averageBuyPrice
        const realizedPnL = solReceived - costBasis
        totalRealizedPnL += realizedPnL

        // Update position
        position.totalAmount -= tokensSold
        position.totalInvested -= costBasis
        position.lastUpdated = Date.now()

        console.log(`  💸 Sell PnL: ${realizedPnL.toFixed(6)} SOL`, {
          tokensSold,
          costBasis,
          solReceived,
          remainingTokens: position.totalAmount,
        })

        // Remove position if fully sold
        if (position.totalAmount <= 0.000001) {
          // Account for floating point precision
          console.log(`  🗑️ Position fully closed`)
          positionMap.delete(tokenMint)
        }
      } else {
        console.log(`  ⚠️ No position found for sell transaction`)
      }
    } else {
      console.log(`  ❓ Unknown transaction type:`, tradeType)
    }
  })

  const positions = Array.from(positionMap.values()).filter(
    (pos) => pos.totalAmount > 0.000001
  )

  // Fetch current prices for all position tokens
  const uniqueMints = positions.map((pos) => pos.mint)
  const currentPrices = await fetchCurrentPrices(uniqueMints)

  // Update positions with current prices
  positions.forEach((position) => {
    const currentPrice = currentPrices[position.mint]
    if (currentPrice) {
      position.currentPrice = currentPrice
      console.log(`  💹 Updated ${position.symbol} price: ${currentPrice} SOL`)
    } else {
      // Fallback to average buy price if no current price available
      position.currentPrice = position.averageBuyPrice
      console.log(
        `  ⚠️ No current price for ${position.symbol}, using avg buy price`
      )
    }
  })

  console.log('\n📋 Final Results:')
  console.log(`  Positions: ${positions.length}`)
  console.log(`  Realized PnL: ${totalRealizedPnL} SOL`)

  positions.forEach((pos) => {
    const unrealizedPnL =
      (pos.currentPrice - pos.averageBuyPrice) * pos.totalAmount
    console.log(
      `  📍 ${pos.symbol}: ${
        pos.totalAmount
      } tokens @ ${pos.averageBuyPrice.toFixed(
        8
      )} SOL avg, current: ${pos.currentPrice.toFixed(
        8
      )} SOL, unrealized PnL: ${unrealizedPnL.toFixed(6)} SOL`
    )
  })

  return {
    positions,
    pnl: totalRealizedPnL,
  }
}

// Function to clear processed signatures (useful for testing or reset)
export function clearProcessedTransactions() {
  console.log('🧹 Cleared processed transaction cache')
}
