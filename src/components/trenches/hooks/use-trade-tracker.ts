import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { SOL_MINT } from '@/utils/constants'
import { useEffect, useRef } from 'react'
import { useInventoryStore } from '../stores/use-inventory-store'
import { MintAggregate } from '../trenches-types'

interface UseTradeTrackerProps {
  mintMap: Record<string, MintAggregate>
}

export function useTradeTracker({ mintMap }: UseTradeTrackerProps) {
  const { inputs } = useSwapStore()
  const { addTransaction } = useInventoryStore()
  const lastTxRef = useRef<string>('')

  // Listen for swap transaction confirmations
  useEffect(() => {
    const handleSwapSuccess = (event: CustomEvent) => {
      const { signature, inputMint, outputMint, inputAmount, outputAmount } =
        event.detail

      // Avoid duplicate processing
      if (signature === lastTxRef.current) return
      lastTxRef.current = signature

      // Check if this is a trenches token trade
      const isBuyingToken = inputMint === SOL_MINT && mintMap[outputMint]
      const isSellingToken = outputMint === SOL_MINT && mintMap[inputMint]

      if (isBuyingToken) {
        const token = mintMap[outputMint]
        if (token) {
          addTransaction(
            outputMint,
            {
              type: 'buy',
              amount: outputAmount,
              price: token.pricePerToken || 0,
              totalValue: inputAmount,
              timestamp: Date.now(),
              txSignature: signature,
            },
            {
              symbol: token.mintSymbol || 'Unknown',
              name: token.mintName || 'Unknown Token',
              image: token.mintImage,
              currentPrice: token.pricePerToken || 0,
            }
          )
        }
      } else if (isSellingToken) {
        const token = mintMap[inputMint]
        if (token) {
          addTransaction(
            inputMint,
            {
              type: 'sell',
              amount: inputAmount,
              price: token.pricePerToken || 0,
              totalValue: outputAmount,
              timestamp: Date.now(),
              txSignature: signature,
            },
            {
              symbol: token.mintSymbol || 'Unknown',
              name: token.mintName || 'Unknown Token',
              image: token.mintImage,
              currentPrice: token.pricePerToken || 0,
            }
          )
        }
      }
    }

    // Listen for custom swap success events
    window.addEventListener('swap-success', handleSwapSuccess as EventListener)

    return () => {
      window.removeEventListener(
        'swap-success',
        handleSwapSuccess as EventListener
      )
    }
  }, [mintMap, addTransaction])

  // Also track direct buys from trenches
  useEffect(() => {
    // When a buy is initiated from trenches, we'll track it
    if (
      inputs.inputMint === SOL_MINT &&
      inputs.outputMint &&
      mintMap[inputs.outputMint]
    ) {
      // Store the pending transaction details
      // We'll update with actual amounts when confirmed
    }
  }, [inputs, mintMap])
}
