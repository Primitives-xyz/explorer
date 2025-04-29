'use client'

import { TokenSearch } from '@/components/swap/components/swap-dialog/token-search'
import { BottomSwap } from '@/components/swap/components/swap-elements/bottom-swap'
import { CenterButtonSwap } from '@/components/swap/components/swap-elements/center-button-swap'
import { TopSwap } from '@/components/swap/components/swap-elements/top-swap'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { useJupiterSwap } from '@/components/trade/hooks/use-jupiter-swap'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import { SOL_MINT, SSE_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import {
  formatLargeNumber,
  formatRawAmount,
  formatUsdValue,
} from '@/utils/utils'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSwapStore } from '../stores/use-swap-store'
import { ESwapMode } from '../swap.models'

const isStable = (token: string) => {
  const STABLE_TOKENS = [
    'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v', // usdc
    'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB', // usdt
    'So11111111111111111111111111111111111111112', // sol
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
}

export function Swap({ setTokenMint }: Props) {
  const searchParams = useSearchParams()
  const { replace } = useRouter()
  const pathname = usePathname()
  const [inputTokenMint, setInputTokenMint] = useState<string>(SOL_MINT)
  const [outputTokenMint, setOutputTokenMint] = useState<string>(SSE_MINT)
  const [inAmount, setInAmount] = useState('1')
  const [outAmount, setOutAmount] = useState('')
  const [swapMode, setSwapMode] = useState(ESwapMode.EXACT_IN)
  const [useSSEForFees, setUseSSEForFees] = useState(false)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState(false)
  const { inputs, setOpen, setInputs } = useSwapStore()

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
    isLoggedIn,
    sdkHasLoaded,
    walletAddress,
    primaryWallet,
    setShowAuthFlow,
  } = useCurrentWallet()
  const { balance: inputBalance, rawBalance: inputRawBalance } =
    useTokenBalance(walletAddress, inputTokenMint)

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

  const handleInputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setInputTokenMint(token.address)
    setInputs({
      inputMint: token.address,
      outputMint: outputTokenMint,
      inputAmount: parseFloat(inAmount) || 0,
    })
    updateTokensInURL(token.address, outputTokenMint)
    setShowInputTokenSearch(false)

    // Force refresh token info after selection
    setTimeout(() => {
      // This will trigger a re-render with the new token info
      setInputTokenMint((prevMint) => {
        if (prevMint === token.address) {
          return token.address // Return same value but will trigger state update
        }
        return token.address
      })
    }, 0)
  }

  const handleOutputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setOutputTokenMint(token.address)
    setInputs({
      inputMint: inputTokenMint,
      outputMint: token.address,
      inputAmount: parseFloat(inAmount) || 0,
    })
    updateTokensInURL(inputTokenMint, token.address)
    setShowOutputTokenSearch(false)

    // Force refresh token info after selection
    setTimeout(() => {
      // This will trigger a re-render with the new token info
      setOutputTokenMint((prevMint) => {
        if (prevMint === token.address) {
          return token.address // Return same value but will trigger state update
        }
        return token.address
      })
    }, 0)
  }

  const updateTokensInURL = useCallback(
    (input: string, output: string) => {
      const params = new URLSearchParams(searchParams.toString())

      params.set('inputMint', input)
      params.set('outputMint', output)

      replace(`${pathname}?${params.toString()}`)
    },

    [searchParams, pathname, replace]
  )

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
    const tempInputMint = inputTokenMint
    const tempOutputMint = outputTokenMint

    // Update state directly for immediate effect
    setInputTokenMint(tempOutputMint)
    setOutputTokenMint(tempInputMint)

    // Then update the store to keep everything in sync
    setInputs({
      inputMint: tempOutputMint,
      outputMint: tempInputMint,
      inputAmount: parseFloat(outAmount) || 0,
    })

    // Update URL to match new state
    updateTokensInURL(tempOutputMint, tempInputMint)
  }

  useEffect(() => {
    if (swapMode === ESwapMode.EXACT_IN) {
      if (inAmount == '' || isNaN(parseFloat(expectedOutput))) {
        setOutAmount('')
      } else {
        setOutAmount(expectedOutput)
      }
    } else {
      if (outAmount == '' || isNaN(parseFloat(expectedOutput))) {
        setInAmount('')
      } else {
        setInAmount(expectedOutput)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expectedOutput])

  useEffect(() => {
    if (setTokenMint) {
      const tokenForChart = getTargetToken(inputTokenMint, outputTokenMint)
      setTokenMint(tokenForChart)
    }
  }, [inputTokenMint, outputTokenMint, setTokenMint])

  useEffect(() => {
    if (inputs) {
      // Only update if values actually changed to avoid infinite loops
      if (inputs.inputMint !== inputTokenMint) {
        setInputTokenMint(inputs.inputMint)
      }

      if (inputs.outputMint !== outputTokenMint) {
        setOutputTokenMint(inputs.outputMint)
      }

      if (
        inputs.inputAmount.toString() !== inAmount &&
        inputs.inputAmount > 0
      ) {
        setInAmount(inputs.inputAmount.toString())
      }
    }
  }, [inputs, inputTokenMint, outputTokenMint, inAmount])

  // Read URL parameters on initial load
  useEffect(() => {
    const inputMintParam = searchParams.get('inputMint')
    const outputMintParam = searchParams.get('outputMint')

    if (inputMintParam || outputMintParam) {
      // Update local state directly for immediate UI effect
      if (inputMintParam && inputMintParam !== inputTokenMint) {
        setInputTokenMint(inputMintParam)
      }

      if (outputMintParam && outputMintParam !== outputTokenMint) {
        setOutputTokenMint(outputMintParam)
      }

      // Then update the store to keep everything in sync
      // Only update if we actually have parameters
      setInputs({
        inputMint: inputMintParam || inputTokenMint,
        outputMint: outputMintParam || outputTokenMint,
        inputAmount: parseFloat(inAmount) || 0,
      })
    }
  }, [searchParams, setInputs, inputTokenMint, outputTokenMint, inAmount])

  // Update URL when tokens change
  useEffect(() => {
    // Only update URL when tokens change
    if (inputTokenMint && outputTokenMint) {
      updateTokensInURL(inputTokenMint, outputTokenMint)
    }
  }, [inputTokenMint, outputTokenMint, updateTokensInURL])

  return (
    <div className="space-y-4">
      <TopSwap
        walletAddress={walletAddress}
        inputTokenMint={inputTokenMint}
        outputTokenMint={outputTokenMint}
        displayInAmount={displayInAmount}
        displayInAmountInUsd={displayInAmountInUsd}
        inputTokenImageUri={inputTokenImageUri}
        inputTokenSymbol={inputTokenSymbol}
        displayOutAmount={displayOutAmount}
        displayOutAmountInUsd={displayOutAmountInUsd}
        outputTokenImageUri={outputTokenImageUri}
        outputTokenSymbol={outputTokenSymbol}
        setSwapMode={setSwapMode}
        handleInAmountChange={handleInAmountChange}
        setShowInputTokenSearch={setShowInputTokenSearch}
        handleInputAmountByPercentage={handleInputAmountByPercentage}
        handleOutAmountChange={handleOutAmountChange}
        setShowOutputTokenSearch={setShowOutputTokenSearch}
        handleSwapDirection={handleSwapDirection}
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
