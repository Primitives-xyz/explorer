import { useEffect, useState } from 'react'
import { Transaction } from '@/utils/helius/types'
import { getTokenMetadata } from '@/utils/helius/token-api'
import { formatTokenAmount } from '@/utils/format'
import { formatTimeAgo } from '@/utils/date'

interface SwapActivityItemProps {
  transaction: Transaction
}

export const SwapActivityItem = ({ transaction }: SwapActivityItemProps) => {
  const [inputMetadata, setInputMetadata] = useState<TokenMetadata | null>(null)
  const [outputMetadata, setOutputMetadata] = useState<TokenMetadata | null>(null)
  
  const swap = transaction.events?.swap
  if (!swap) return null

  const inputToken = swap.tokenInputs[0]
  const outputToken = swap.tokenOutputs[0]
  const inputIsNative = !inputToken && swap.nativeInput
  const outputIsNative = !outputToken && swap.nativeOutput

  useEffect(() => {
    const fetchMetadata = async () => {
      if (inputToken?.mint) {
        setInputMetadata(await getTokenMetadata(inputToken.mint))
      }
      if (outputToken?.mint) {
        setOutputMetadata(await getTokenMetadata(outputToken.mint))
      }
    }
    fetchMetadata()
  }, [inputToken?.mint, outputToken?.mint])

  const inputAmount = inputIsNative 
    ? formatTokenAmount(swap.nativeInput?.amount || '0', 9)
    : formatTokenAmount(inputToken?.tokenAmount || '0', inputMetadata?.decimals || 6)

  const outputAmount = outputIsNative
    ? formatTokenAmount(swap.nativeOutput?.amount || '0', 9)
    : formatTokenAmount(outputToken?.tokenAmount || '0', outputMetadata?.decimals || 6)

  const getTokenDisplay = (isNative: boolean, metadata: TokenMetadata | null, mint?: string) => {
    if (isNative) {
      return {
        symbol: 'SOL',
        image: '/tokens/sol.png',
      }
    }
    return {
      symbol: metadata?.symbol || mint?.slice(0, 4) || '???',
      image: metadata?.image || '',
    }
  }

  const inputTokenDisplay = getTokenDisplay(inputIsNative, inputMetadata, inputToken?.mint)
  const outputTokenDisplay = getTokenDisplay(outputIsNative, outputMetadata, outputToken?.mint)

  return (
    <div className="flex items-center gap-2 p-3 hover:bg-green-900/10 transition-colors">
      <div className="flex items-center gap-2 flex-1">
        <span className="text-green-500 bg-green-900/20 px-2 py-1 rounded text-sm">
          {getSourceIcon(transaction.source)} SWAP
        </span>
        
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <TokenIcon image={inputTokenDisplay.image} symbol={inputTokenDisplay.symbol} />
            <span className="text-green-300 font-mono ml-1">
              {inputAmount} {inputTokenDisplay.symbol}
            </span>
          </div>
          
          <span className="text-green-500 mx-1">→</span>
          
          <div className="flex items-center">
            <TokenIcon image={outputTokenDisplay.image} symbol={outputTokenDisplay.symbol} />
            <span className="text-green-300 font-mono ml-1">
              {outputAmount} {outputTokenDisplay.symbol}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <span className="text-green-600">
          via {transaction.source}
        </span>
        <span className="text-green-500/60">
          {formatTimeAgo(transaction.timestamp * 1000)}
        </span>
      </div>
    </div>
  )
}

const TokenIcon = ({ image, symbol }: { image: string; symbol: string }) => {
  if (image) {
    return (
      <img
        src={image}
        alt={symbol}
        className="w-5 h-5 rounded-full bg-black/40 ring-1 ring-green-500/20"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
          e.currentTarget.nextElementSibling?.classList.remove('hidden')
        }}
      />
    )
  }

  return (
    <div className="w-5 h-5 rounded-full bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center">
      <span className="text-green-500 text-[10px] font-mono">
        {symbol.slice(0, 2)}
      </span>
    </div>
  )
} 