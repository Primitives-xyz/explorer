'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowDownUp, ChevronDown, ChevronUp, CircleAlert, Loader2 } from 'lucide-react'
import { Button, ButtonSize, ButtonVariant, Input } from '@/components-new-version/ui'
import { Card, CardContent } from '@/components-new-version/ui/card'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { TokenBalance } from '@/components-new-version/common/left-side-menu/balance'
import { SOL_MINT, SSE_MINT } from '@/components-new-version/utils/constants'
import { useTokenInfo } from '@/components-new-version/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components-new-version/token/hooks/use-token-usdc-price'
import { formatUsdValue, formatRawAmount, formatLargeNumber } from '@/components-new-version/utils/format'
import Image from 'next/image'
import { DEFAULT_INPUT_TOKEN_IMAGEURI, DEFAULT_INPUT_TOKEN_SYMBOL, DEFAULT_OUTPUT_TOKEN_IMAGEURI, DEFAULT_OUTPUT_TOKEN_SYMBOL } from './constants'
import { useTokenBalance } from '@/components-new-version/tapestry/hooks/use-token-balance'
import { useJupiterSwap } from '@/components-new-version/tapestry/hooks/use-jupiter-swap'
import LoadingDots from '@/components-new-version/ui/loading-dots'
import { useTranslations } from 'next-intl'
import PlatformComparison from './platform-comparison'
import { TokenSearch } from '@/components-new-version/transaction/swap/token-search'
import { useRouter, useSearchParams } from 'next/navigation'

interface SwapProps {
  mint: string
  setTokenMint: (value: string) => void
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

export function Swap({ mint, setTokenMint }: SwapProps) {
  const t = useTranslations()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [inputTokenMint, setInputTokenMint] = useState<string>(SOL_MINT)
  const [outputTokenMint, setoutputTokenMint] = useState<string>(SSE_MINT)
  const [inputTokenAmount, setInputTokenAmount] = useState<string>("")
  const [useSSEForFees, setUseSSEForFees] = useState<boolean>(false)
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState<boolean>(false)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState<boolean>(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState<boolean>(false)
  const { symbol: inputTokenSymbol, decimals: inputTokenDecimals, image: inputTokenImageUri } = useTokenInfo(inputTokenMint)
  const { symbol: outputTokenSymbol, decimals: outputTokenDecimals, image: outputTokenImageUri } = useTokenInfo(outputTokenMint)
  const { price: inputTokenUsdPrice, loading: inputTokenUsdPriceLoading } = useTokenUSDCPrice({ tokenMint: inputTokenMint, decimals: inputTokenDecimals })
  const { price: outputTokenUsdPrice, loading: outputTokenUsdPriceLoading } = useTokenUSDCPrice({ tokenMint: outputTokenMint, decimals: outputTokenDecimals })
  const { isLoggedIn, sdkHasLoaded, walletAddress, primaryWallet, setShowAuthFlow } = useCurrentWallet()
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, inputTokenMint)

  const {
    loading,
    error,
    txSignature,
    quoteResponse,
    expectedOutput,
    priceImpact,
    isFullyConfirmed,
    handleSwap,
    isQuoteRefreshing,
    refreshQuote,
  } = useJupiterSwap({
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    inputAmount: inputTokenAmount,
    inputDecimals: inputTokenDecimals,
    outputDecimals: outputTokenDecimals,
    platformFeeBps: useSSEForFees ? 1 : undefined,
    primaryWallet: primaryWallet,
    walletAddress: walletAddress
  })

  const handleInputAmountByPercentage = (percent: number) => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint' || !inputTokenDecimals) return

    try {
      const quarterAmount = inputRawBalance / BigInt(100 / percent)
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(inputTokenDecimals)
      )

      if (validateAmount(formattedQuarter, inputTokenDecimals)) {
        setInputTokenAmount(formattedQuarter)
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
  }

  const handleOutputTokenSelect = (token: {
    address: string
    symbol: string
    name: string
    decimals: number
  }) => {
    setoutputTokenMint(token.address)
  }

  const updateTokensInURL = useCallback((input: string, output: string) => {

    const params = new URLSearchParams(searchParams.toString())

    params.set('inputMint', input)
    params.set('outputMint', output)
    params.set('mode', 'swap')

    router.push(`/new-trade?${params.toString()}`, { scroll: false })
  }, [searchParams])

  useEffect(() => {
    setTokenMint(outputTokenMint)
  }, [outputTokenMint])

  useEffect(() => {
    if (inputTokenMint && outputTokenMint) {
      updateTokensInURL(inputTokenMint, outputTokenMint)
    }
  }, [inputTokenMint, outputTokenMint, updateTokensInURL])

  return (
    <>
      <Card>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Pay</p>
              <p className="text-xs text-muted">Balance: <TokenBalance walletAddress={walletAddress} tokenMint={inputTokenMint} /></p>
            </div>

            <div className="flex justify-between items-center">
              <Input
                placeholder='0.00'
                className='text-primary text-xl'
                type='text'
                onChange={(e) => {
                  const val = e.target.value
                  if (
                    val === '' ||
                    val === '.' ||
                    /^[0]?\.[0-9]*$/.test(val) ||
                    /^[0-9]*\.?[0-9]*$/.test(val)
                  ) {
                    const cursorPosition = e.target.selectionStart
                    setInputTokenAmount(val)
                    window.setTimeout(() => {
                      e.target.focus()
                      e.target.setSelectionRange(
                        cursorPosition,
                        cursorPosition
                      )
                    }, 0)
                  }
                }}
                value={inputTokenAmount}
              />
              <p className="text-xs text-muted">
                {
                  (inputTokenUsdPriceLoading || !inputTokenUsdPrice) ? (
                    <span className="flex items-center" aria-label="Loading price information">...</span>
                  ) : (
                    <span>
                      {isNaN(Number.parseFloat(inputTokenAmount)) ? formatUsdValue(0) : formatUsdValue(inputTokenUsdPrice * Number.parseFloat(inputTokenAmount))}
                    </span>
                  )
                }
              </p>
            </div>

            <Button
              variant={ButtonVariant.GHOST}
              className='w-full border'
              onClick={() => setShowInputTokenSearch(true)}
            >
              <div className='flex gap-3'>
                <div>
                  <Image
                    src={inputTokenImageUri ? inputTokenImageUri : DEFAULT_INPUT_TOKEN_IMAGEURI}
                    alt='ITokeImg'
                    width={24}
                    height={24}
                    className='rounded-full'
                  />
                </div>
                <span>{inputTokenSymbol ? inputTokenSymbol : DEFAULT_INPUT_TOKEN_SYMBOL}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-end space-x-2">
              <Button
                variant={ButtonVariant.OUTLINE}
                className="rounded-full"
                size={ButtonSize.SM}
                onClick={() => handleInputAmountByPercentage(25)}
              >
                25%
              </Button>
              <Button
                variant={ButtonVariant.OUTLINE}
                className="rounded-full"
                size={ButtonSize.SM}
                onClick={() => handleInputAmountByPercentage(50)}
              >
                50%
              </Button>
              <Button
                variant={ButtonVariant.OUTLINE}
                className="rounded-full"
                size={ButtonSize.SM}
                onClick={() => handleInputAmountByPercentage(100)}
              >
                max
              </Button>
            </div>
          </div>

          <div className="flex items-center w-full justify-between text-muted space-x-2">
            <div className="bg-muted w-full h-[1px]" />
            <ArrowDownUp size={40} />
            <div className="bg-muted w-full h-[1px]" />
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Receive</p>
            </div>

            <div className="flex justify-between items-center">
              {
                (isQuoteRefreshing || loading) ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <Input
                    inputMode="decimal"
                    placeholder="0.00"
                    className="text-primary text-xl"
                    type="text"
                    disabled={true}
                    value={(quoteResponse && !isNaN(parseFloat(expectedOutput)) && inputTokenAmount.length) ? formatLargeNumber(parseFloat(expectedOutput), outputTokenDecimals) : ''}
                  />
                )
              }
              <p className="text-xs text-muted">
                {
                  (isQuoteRefreshing || outputTokenUsdPriceLoading || !outputTokenUsdPrice) ? (
                    <Loader2 className='animate-spin' />
                  ) : (
                    formatUsdValue(outputTokenUsdPrice * parseFloat(expectedOutput))
                  )
                }
              </p>
            </div>

            <Button
              variant={ButtonVariant.GHOST}
              className='w-full border'
              onClick={() => setShowOutputTokenSearch(true)}
            >
              <div className='flex gap-3'>
                <div>
                  <Image
                    src={outputTokenImageUri ? outputTokenImageUri : DEFAULT_OUTPUT_TOKEN_IMAGEURI}
                    alt='ITokeImg'
                    width={24}
                    height={24}
                    className='rounded-full'
                  />
                </div>
                <span>{outputTokenSymbol ? outputTokenSymbol : DEFAULT_OUTPUT_TOKEN_SYMBOL}</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div>
        {
          !sdkHasLoaded && (
            <Button variant={ButtonVariant.DEFAULT} className="w-full">
              {t('trade.checking_wallet_status')}<LoadingDots />
            </Button>
          )
        }

        {
          !isLoggedIn ? (
            <Button
              expand
              variant={ButtonVariant.DEFAULT}
              onClick={() => setShowAuthFlow(true)}
            >
              connect wallet
            </Button>
          ) : (
            <Button variant={ButtonVariant.DEFAULT} className="w-full" onClick={handleSwap} disabled={loading} >
              {
                loading ? (
                  <Loader2 className='animate-spin' />
                ) : (
                  <span>Execute Swap</span>
                )
              }
            </Button>
          )
        }
      </div>

      <Card>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <p>Route Information $ Fees</p>
              <CircleAlert />
            </div>

            <Card className="background-gradient-card">
              <CardContent className='px-3 py-2'>
                <div className='flex items-center'>
                  <div className="w-5 h-5 rounded-full border border-gray-400 flex items-center justify-center cursor-pointer" onClick={() => setUseSSEForFees(!useSSEForFees)}>
                    {useSSEForFees && <div className="w-3 h-3 rounded-full bg-white"></div>}
                  </div>
                  <div>
                    <p>Pay fee with SSE</p>
                    <p>Get 50% off on transaction fees</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-between items-center">
              <p>Rate</p>
              <CircleAlert />
            </div>

            <div className="flex justify-between items-center cursor-pointer" onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}>
              <p>SSE offers the cheapest fee across all current platforms.</p>
              {isRouteInfoOpen ? (<ChevronDown className="h-8 w-8" />) : (<ChevronUp className="h-8 w-8" />)}
            </div>

            {
              isRouteInfoOpen && (
                <Card>
                  <CardContent className='px-3 py-2 space-y-2'>
                    <div className="flex justify-between items-center">
                      <p className='uppercase'>platforms</p>
                      <p>You'll get</p>
                    </div>

                    <div>
                      {
                        isQuoteRefreshing ? (
                          <div className='h-full flex justify-center items-center'>
                            <Loader2 className='w-8 h-8 animate-spin' />
                          </div>
                        ) : (
                          <PlatformComparison
                            jupiterSwapResponse={quoteResponse}
                            outputTokenSymbol={outputTokenSymbol}
                            outputTokenDecimals={outputTokenDecimals}
                            platformExpectedOutAmount={expectedOutput}
                          />
                        )
                      }
                    </div>
                  </CardContent>
                </Card>
              )
            }
          </div>
        </CardContent>
      </Card>

      {showInputTokenSearch && (
        <TokenSearch
          onSelect={handleInputTokenSelect}
          onClose={() => {
            setShowInputTokenSearch(false)
            setInputTokenAmount("")
          }}
        />
      )}
      {showOutputTokenSearch && (
        <TokenSearch
          onSelect={handleOutputTokenSelect}
          onClose={() => {
            setShowOutputTokenSearch(false)
            setInputTokenAmount("")
          }}
        />
      )}
    </>
  )
}
