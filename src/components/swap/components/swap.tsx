'use client'

import { TokenSearch } from '@/components/swap/components/swap-dialog/token-search'
import { BottomSwap } from '@/components/swap/components/swap-elements/bottom-swap'
import { CenterButtonSwap } from '@/components/swap/components/swap-elements/center-button-swap'
import { TopSwap } from '@/components/swap/components/swap-elements/top-swap'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { useJupiterSwap } from '@/components/trade/hooks/use-jupiter-swap'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import { SOL_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  formatLargeNumber,
  formatRawAmount,
  formatUsdValue,
} from '@/utils/utils'
import { useEffect, useMemo, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { ESwapMode } from '../swap.models'

const isStable = (token: string) => {
  const STABLE_TOKENS = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // usdc
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // usdt
    SOL_MINT, // sol
  ]
  return STABLE_TOKENS.includes(token)
}

const getTargetToken = (tokenA: string, tokenB: string) => {
  const aStable = isStable(tokenA)
  const bStable = isStable(tokenB)

  // Rule 1: If only one is stable, return the other
  if (aStable && !bStable) return tokenB
  if (!aStable && bStable) return tokenA

  // Rule 2: If both are stable, return tokenB
  if (aStable && bStable) return tokenB

  // Rule 3: Both are alt/meme, return the buyingToken
  return tokenB
}

const validateAmount = (value: string, decimals: number = 6): boolean => {
  if (value === '') return true

  // Check if the value is a valid number
  const numericValue = Number(value)
  if (isNaN(numericValue)) {
    return false
  }

  // Check if the value is positive
  if (numericValue <= 0) {
    return false
  }

  // Check if the value has too many decimal places
  const decimalParts = value.split('.')
  if (
    decimalParts.length > 1 &&
    decimalParts[1]?.length &&
    decimalParts[1]?.length > decimals
  ) {
    return false
  }

  return true
}

interface Props {
  setTokenMint?: (value: string) => void
  autoFocus?: boolean
}

export function Swap({ setTokenMint, autoFocus }: Props) {
  // Centralized swap state from store
  const {
    inputs: { inputMint: inputTokenMint, outputMint: outputTokenMint },
    swapMode,
    inAmount,
    outAmount,
    setInputs,
    setSwapMode,
    setInAmount,
    setOutAmount,
  } = useSwapStore()

  const [useSSEForFees, setUseSSEForFees] = useState(false)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState(false)

  const {
    symbol: inputTokenSymbol,
    decimals: inputTokenDecimals,
    image: inputTokenImageUri,
  } = useTokenInfo(inputTokenMint)
  const {
    symbol: outputTokenSymbol,
    decimals: outputTokenDecimals,
    image: outputTokenImageUri,
  } = useTokenInfo(outputTokenMint)

  const {
    isLoggedIn,
    sdkHasLoaded,
    walletAddress,
    primaryWallet,
    setShowAuthFlow,
  } = useCurrentWallet()
  const { balance: inputBalance, rawBalance: inputRawBalance } =
    useTokenBalance(walletAddress, inputTokenMint)
  const { price: inputTokenUsdPrice, loading: inputTokenUsdPriceLoading } =
    useTokenUSDCPrice({
      tokenMint: inputTokenMint,
      decimals: inputTokenDecimals,
    })
  const { price: outputTokenUsdPrice, loading: outputTokenUsdPriceLoading } =
    useTokenUSDCPrice({
      tokenMint: outputTokenMint,
      decimals: outputTokenDecimals,
    })

  const {
    loading,
    quoteResponse,
    expectedOutput,
    isQuoteRefreshing,
    sseFeeAmount,
    handleSwap,
  } = useJupiterSwap({
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    inputAmount: swapMode === ESwapMode.EXACT_IN ? inAmount : outAmount,
    inputDecimals:
      swapMode === ESwapMode.EXACT_IN
        ? inputTokenDecimals
        : outputTokenDecimals,
    outputDecimals:
      swapMode === ESwapMode.EXACT_OUT
        ? inputTokenDecimals
        : outputTokenDecimals,
    platformFeeBps: useSSEForFees ? 1 : undefined,
    primaryWallet: primaryWallet,
    walletAddress: walletAddress,
    swapMode: swapMode,
  })

  const displayInAmount = useMemo(() => {
    if (isQuoteRefreshing && swapMode === ESwapMode.EXACT_OUT) {
      return '...'
    }
    if (inAmount == '') {
      return ''
    } else {
      if (swapMode === ESwapMode.EXACT_IN) {
        return inAmount
      } else {
        return formatLargeNumber(parseFloat(inAmount), inputTokenDecimals)
      }
    }
  }, [inAmount, inputTokenDecimals, isQuoteRefreshing, swapMode])

  const displayOutAmount = useMemo(() => {
    if (isQuoteRefreshing && swapMode === ESwapMode.EXACT_IN) {
      return '...'
    }
    if (outAmount == '') {
      return ''
    } else {
      if (swapMode === ESwapMode.EXACT_OUT) {
        return outAmount
      } else {
        return formatLargeNumber(parseFloat(outAmount), outputTokenDecimals)
      }
    }
  }, [isQuoteRefreshing, swapMode, outAmount, outputTokenDecimals])

  const displayInAmountInUsd = useMemo(() => {
    if (
      isQuoteRefreshing ||
      !inputTokenUsdPrice ||
      isNaN(parseFloat(inAmount))
    ) {
      return '...'
    }
    return formatUsdValue(inputTokenUsdPrice * parseFloat(inAmount))
  }, [isQuoteRefreshing, inputTokenUsdPrice, inAmount])

  const displayOutAmountInUsd = useMemo(() => {
    if (
      isQuoteRefreshing ||
      !outputTokenUsdPrice ||
      isNaN(parseFloat(outAmount))
    ) {
      return '...'
    }
    return formatUsdValue(outputTokenUsdPrice * parseFloat(outAmount))
  }, [isQuoteRefreshing, outputTokenUsdPrice, outAmount])

  const displaySseFeeAmount = useMemo(() => {
    const fee = (Number(sseFeeAmount) / Math.pow(10, 6)).toString()

    return formatLargeNumber(parseFloat(fee), 6)
  }, [sseFeeAmount])

  const handleInputAmountByPercentage = (percent: number) => {
    if (
      !inputBalance ||
      typeof inputRawBalance !== 'bigint' ||
      !inputTokenDecimals
    )
      return

    try {
      const quarterAmount = inputRawBalance / BigInt(100 / percent)
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(inputTokenDecimals)
      )

      if (validateAmount(formattedQuarter, inputTokenDecimals)) {
        setInAmount(formattedQuarter)
      }
    } catch (err) {
      console.error('Error calculating amount:', err)
    }
  }

  const handleInputTokenSelect = (token: { address: string }) => {
    if (!token || !token.address) {
      console.error('Invalid token selected')
      return
    }

    // Update store with new tokens & amounts
    setInputs({
      inputMint: token.address,
      outputMint: outputTokenMint,
      inputAmount: parseFloat(inAmount) || 0,
    })
    setShowInputTokenSearch(false)
  }

  const handleOutputTokenSelect = (token: { address: string }) => {
    if (!token || !token.address) {
      console.error('Invalid token selected')
      return
    }

    setInputs({
      inputMint: inputTokenMint,
      outputMint: token.address,
      inputAmount: parseFloat(inAmount) || 0,
    })
    setShowOutputTokenSearch(false)
  }

  const handleInAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setInAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleOutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setOutAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleSwapDirection = () => {
    // Swap input/output tokens & amounts in store
    const tempIn = inputTokenMint
    const tempOut = outputTokenMint
    const tempAmtIn = inAmount
    const tempAmtOut = outAmount

    setInputs({
      inputMint: tempOut,
      outputMint: tempIn,
      inputAmount: parseFloat(tempAmtOut) || 0,
    })
    setInAmount(tempAmtOut)
    setOutAmount(tempAmtIn)
  }

  // Update amounts when quote changes
  useEffect(() => {
    if (swapMode === ESwapMode.EXACT_IN) {
      setOutAmount(isNaN(parseFloat(expectedOutput)) ? '' : expectedOutput)
    } else {
      setInAmount(isNaN(parseFloat(expectedOutput)) ? '' : expectedOutput)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedOutput])

  // Inform parent (chart) of token for display
  useEffect(() => {
    if (setTokenMint) {
      setTokenMint(getTargetToken(inputTokenMint, outputTokenMint))
    }
  }, [inputTokenMint, outputTokenMint, setTokenMint])

  return (
    <div className="space-y-4">
      <TopSwap
        walletAddress={walletAddress}
        setShowInputTokenSearch={setShowInputTokenSearch}
        handleInputAmountByPercentage={handleInputAmountByPercentage}
        setShowOutputTokenSearch={setShowOutputTokenSearch}
        handleSwapDirection={handleSwapDirection}
        autoFocus={autoFocus}
      />

      <CenterButtonSwap
        sdkHasLoaded={sdkHasLoaded}
        loading={loading}
        isLoggedIn={isLoggedIn}
        setShowAuthFlow={setShowAuthFlow}
        handleSwap={async () => {
          await handleSwap()
          setShowInputTokenSearch(false)
          setShowOutputTokenSearch(false)
          setInAmount('')
          setOutAmount('')
        }}
      />

      <BottomSwap
        useSSEForFees={useSSEForFees}
        displaySseFeeAmount={displaySseFeeAmount}
        quoteResponse={quoteResponse}
        outputTokenSymbol={outputTokenSymbol}
        outputTokenDecimals={outputTokenDecimals}
        expectedOutput={expectedOutput}
        isQuoteRefreshing={isQuoteRefreshing}
        setUseSSEForFees={setUseSSEForFees}
      />

      {(showInputTokenSearch || showOutputTokenSearch) && (
        <TokenSearch
          openModal={showInputTokenSearch || showOutputTokenSearch}
          onSelect={
            showInputTokenSearch
              ? handleInputTokenSelect
              : handleOutputTokenSelect
          }
          onClose={() => {
            if (showInputTokenSearch) {
              setShowInputTokenSearch(false)
            } else {
              setShowOutputTokenSearch(false)
            }
          }}
        />
      )}
    </div>
  )
}
