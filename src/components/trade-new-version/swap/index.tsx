import { ArrowUpDown, ChevronDown, ChevronUp, CircleAlert, Loader, Loader2, Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react';
import { useTokenBalance } from '@/hooks/use-token-balance';
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet';
import { useTokenInfo } from '@/hooks/use-token-info';
import { useTokenUSDCPrice } from '@/hooks/use-token-usdc-price';
import Image from 'next/image';
import { useJupiterSwap } from '@/hooks/use-jupiter-swap';
import { SwapSettings } from '@/components/transactions/swap/swap-settings';
import { SwapQuoteDetails } from '@/components/transactions/swap/swap-quote-details';
import { Badge, Button } from '@/components-new-version/ui';
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic';
import { TokenChart } from '@/components/tokens/token-details/token-chart';
import { TokenSearch } from '@/components/transactions/swap/token-search';
import SwapDivider from './swap-divider';

const LoadingDots = () => {
  return (
    <span className="inline-flex items-center">
      <span className="animate-pulse">.</span>
      <span className="animate-pulse animation-delay-200">.</span>
      <span className="animate-pulse animation-delay-400">.</span>
    </span>
  )
}

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

const DEFAULT_INPUT_TOKEN_MINT = "So11111111111111111111111111111111111111112"
const DEFAULT_INPUT_TOKEN_SYMBOL = "SOL"
const DEFAULT_OUT_TOKEN_MINT = "H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump"
const DEFAULT_OUT_TOKEN_SYMBOL = "SSE"
const DEFAULT_INPUT_TOKEN_IMAGEURI = "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png"
const DEFAULT_OUTPUT_TOKEN_IMAGEURI = "https://ipfs.io/ipfs/QmT4fG3jhXv3dcvEVdkvAqi8RjXEmEcLS48PsUA5zSb1RY"

const SwapView = () => {
  const t = useTranslations()
  const [inputTokenMint, setInputTokenMint] = useState<string>(DEFAULT_INPUT_TOKEN_MINT)
  const [outputTokenMint, setOutTokenMint] = useState<string>(DEFAULT_OUT_TOKEN_MINT)
  const [inputTokenAmount, setInputTokenAmount] = useState<string>("")
  console.log("inputTokenAmount", inputTokenAmount)
  const [showInputTokenSearch, setShowInputTokenSearch] = useState<boolean>(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState<boolean>(false)
  const { symbol: inputTokenSymbol, decimals: inputTokenDecimals, image: inputTokenImageUri } = useTokenInfo(inputTokenMint)
  const { symbol: outputTokenSymbol, decimals: outputTokenDecimals, image: outputTokenImageUri } = useTokenInfo(outputTokenMint)
  const { price: inputTokenUsdPrice, loading: inputTokenUsdPriceLoading } = useTokenUSDCPrice(inputTokenMint, inputTokenDecimals)
  const { price: outputTokenUsdPrice, loading: outputTokenUsdPriceLoading } = useTokenUSDCPrice(outputTokenMint, outputTokenDecimals)
  const [useSSEForFees, setUseSSEForFees] = useState<boolean>(false)
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState<boolean>(false)
  const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, inputTokenMint)

  const {
    loading,
    error,
    txSignature,
    priorityLevel,
    setPriorityLevel,
    quoteResponse,
    expectedOutput,
    priceImpact,
    slippageBps,
    setSlippageBps,
    showTradeLink,
    isFullyConfirmed,
    handleSwap,
    resetQuoteState,
    isQuoteRefreshing,
    sseFeeAmount,
    refreshQuote,
  } = useJupiterSwap({
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    inputAmount: inputTokenAmount,
    inputDecimals: inputTokenDecimals!,
    sourceWallet: walletAddress,
    platformFeeBps: useSSEForFees ? 1 : undefined,
  })

  console.log("expectedOutput:", expectedOutput)

  const handleSwapDirection = () => {
    const tempInputTokenMint = inputTokenMint
    setInputTokenAmount('')
    setInputTokenMint(outputTokenMint)
    setOutTokenMint(tempInputTokenMint)
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
    setOutTokenMint(token.address)
  }

  const formatUsdValue = (value: number | null) => {
    if (value === null || isNaN(value)) return '$0.00'

    // For very small values, show more precision
    if (value !== 0 && Math.abs(value) < 0.01) {
      return `$${value.toFixed(6)}`
    }

    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value)
  }

  const formatLargeNumber = (num: number) => {
    if (num !== 0 && Math.abs(num) < 0.0001) {
      return num.toExponential(4)
    }
    const decimals = outputTokenDecimals ?? 6
    return num.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: decimals,
    })
  }

  const formatRawAmount = (rawAmount: bigint, decimals: bigint): string => {
    try {
      if (rawAmount === 0n) return '0'

      const divisor = 10n ** decimals
      const integerPart = rawAmount / divisor
      const fractionPart = rawAmount % divisor

      if (fractionPart === 0n) {
        return integerPart.toString()
      }

      // Convert to string and pad with zeros
      let fractionStr = fractionPart.toString()
      while (fractionStr.length < Number(decimals)) {
        fractionStr = '0' + fractionStr
      }

      // Remove trailing zeros
      fractionStr = fractionStr.replace(/0+$/, '')

      return fractionStr
        ? `${integerPart}.${fractionStr}`
        : integerPart.toString()
    } catch (err) {
      console.error('Error formatting amount:', err)
      return '0'
    }
  }

  const validateAmount = (value: string): boolean => {
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
      decimalParts[1]?.length > inputTokenDecimals!
    ) {
      return false
    }

    return true
  }

  const handleQuarterAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint' || !inputTokenDecimals) return

    try {
      // Calculate quarter of the raw balance using bigint arithmetic
      const quarterAmount = inputRawBalance / 4n
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(inputTokenDecimals)
      )

      if (validateAmount(formattedQuarter)) {
        setInputTokenAmount(formattedQuarter)
      }
    } catch (err) {
      console.error('Error calculating quarter amount:', err)
    }
  }

  const handleHalfAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint' || !inputTokenDecimals) return

    try {
      // Calculate half of the raw balance using bigint arithmetic
      const halfAmount = inputRawBalance / 2n
      const formattedHalf = formatRawAmount(
        halfAmount,
        BigInt(inputTokenDecimals)
      )

      if (validateAmount(formattedHalf)) {
        setInputTokenAmount(formattedHalf)
      }
    } catch (err) {
      console.error('Error calculating half amount:', err)
    }
  }

  const handleMaxAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint' || !inputTokenDecimals) return

    try {
      const formattedMax = formatRawAmount(
        inputRawBalance,
        BigInt(inputTokenDecimals)
      )

      if (validateAmount(formattedMax)) {
        setInputTokenAmount(formattedMax)
      }
    } catch (err) {
      console.error('Error calculating max amount:', err)
    }
  }

  return (
    <div>
      <div className='flex flex-row gap-4 justify-between'>
        <div className='flex flex-col gap-4 w-[600px]'>
          <div className='border border-white/20 bg-white/5 rounded-[20px] flex flex-col gap-2 p-4'>
            <div className='flex flex-row justify-between items-center'>
              <p className='text-[#F5F8FD] text-[14px] font-normal leading-[150%]'>Pay</p>
              <p className='text-[#F5F8FD] text-[12px] font-normal leading-[150%]'>Balance: {inputBalance}</p>
            </div>
            <div className='flex flex-row justify-between items-center'>
              <input
                inputMode="decimal"
                placeholder="0.00"
                className="text-[#97EF83] text-[24px] bg-transparent w-full font-normal outline-none"
                type="text"
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
              <p className='text-[14px] text-[#97EF83] font-normal leading-[150%]'>
                {
                  (inputTokenUsdPriceLoading || !inputTokenUsdPrice) ? (
                    <span className="flex items-center" aria-label="Loading price information">
                      <Loader2 className="w-[14px] h-[14px] animate-spin" />
                    </span>
                  ) : (
                    <>
                      {isNaN(Number.parseFloat(inputTokenAmount))
                        ? formatUsdValue(0)
                        : formatUsdValue(inputTokenUsdPrice * Number.parseFloat(inputTokenAmount))}
                    </>
                  )
                }
              </p>
            </div>
            <div className='bg-white/10 rounded-[6px]'>
              <button
                className='w-full px-3 py-2 flex flex-row justify-between items-center'
                onClick={() => setShowInputTokenSearch(true)}
              >
                <div className='flex flex-row justify-center items-center gap-3'>
                  <div>
                    <Image
                      src={inputTokenImageUri ? inputTokenImageUri : DEFAULT_INPUT_TOKEN_IMAGEURI}
                      alt='input token image'
                      width={24}
                      height={24}
                      className='rounded-full'
                    />
                  </div>
                  <p className='text-[14px] font-bold leading-[150%]'>{inputTokenSymbol ? inputTokenSymbol : DEFAULT_INPUT_TOKEN_SYMBOL}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className='flex flex-row gap-2 justify-end py-2'>
              <Badge
                className='cursor-pointer hover:scale-105'
                onClick={handleQuarterAmount}
              >
                25%
              </Badge>
              <Badge
                className='cursor-pointer hover:scale-105'
                onClick={handleHalfAmount}
              >
                50%
              </Badge>
              <Badge
                className='cursor-pointer hover:scale-105'
                onClick={handleMaxAmount}
              >
                Max
              </Badge>
            </div>
            <SwapDivider
              onSwap={handleSwapDirection}
            // disabled={isLoading}
            />
            <div className='flex flex-row justify-between items-center'>
              <p className='text-[#F5F8FD] text-[14px] font-normal leading-[150%]'>Receive</p>
            </div>
            <div className='flex flex-row justify-between items-center text-[#97EF83] h-[30px]'>
              {
                (isQuoteRefreshing || loading) ? (
                  <Loader2 className='w-[14px] h-[14px] animate-spin' />
                ) : (
                  <input
                    inputMode="decimal"
                    placeholder="0.00"
                    className="text-[24px] bg-transparent w-full font-normal outline-none"
                    type="text"
                    disabled={true}
                    value={(quoteResponse && !isNaN(parseFloat(expectedOutput))) ? formatLargeNumber(parseFloat(expectedOutput)) : ''}
                  />
                )
              }
              < p className='text-[14px]  font-normal leading-[150%]'>
                {
                  (isQuoteRefreshing || outputTokenUsdPriceLoading || !outputTokenUsdPrice) ? (
                    <Loader2 className='w-[14px] h-[14px] animate-spin' />
                  ) : (
                    formatUsdValue(outputTokenUsdPrice * parseFloat(expectedOutput))
                  )
                }
              </p>
            </div>
            <div className='bg-white/10 rounded-[6px]'>
              <button
                className='w-full px-3 py-2 flex flex-row justify-between items-center'>
                <div className='flex flex-row justify-center items-center gap-3'>
                  <div>
                    <Image
                      src={outputTokenImageUri ? outputTokenImageUri : DEFAULT_OUTPUT_TOKEN_IMAGEURI}
                      alt='out token image'
                      width={24}
                      height={24}
                      className='rounded-full'
                    />
                  </div>
                  <p className='text-[14px] font-bold leading-[150%]'>{outputTokenSymbol ? outputTokenSymbol : DEFAULT_OUT_TOKEN_SYMBOL}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className='w-full'>
            {!isFullyConfirmed && (
              <>
                {!sdkHasLoaded ? (
                  <div className="w-full p-3 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] cursor-pointer text-center hover:bg-[#64e947]">
                    {t('trade.checking_wallet_status')}
                    <LoadingDots />
                  </div>
                ) : !isLoggedIn ? (
                  <div className='w-full'>
                    <DynamicConnectButton buttonClassName='w-full'>
                      <div className="p-3 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] cursor-pointer text-center hover:bg-[#64e947]">
                        {t('trade.connect_wallet_to_swap')}
                      </div>
                    </DynamicConnectButton>
                  </div>
                ) : (
                  <button
                    onClick={handleSwap}
                    disabled={loading}
                    className="w-full p-3 bg-[#97EF83] rounded-[6px] text-[#292C31] font-bold leading-[150%] cursor-pointer hover:bg-[#64e947]"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>
                          {txSignature
                            ? `${t('trade.confirming_transaction')}...`
                            : `${t('trade.executing_swap')}...`}
                        </span>
                      </div>
                    ) : (
                      t('trade.execute_swap')
                    )}
                  </button>
                )}
              </>
            )}
          </div>
          <div className='border border-white/20 bg-white/5 rounded-[12px] p-4 flex flex-col gap-4'>
            <div className='flex flex-row justify-between items-center'>
              <p className='text-[#97EF83] font-bold text-[16px]'>Route Information & Fees</p>
              <CircleAlert className='text-[#97EF83]' />
            </div>
            <div className='border border-[#97EF83] bg-white/10 rounded-[12px] px-3 py-2 flex items-center gap-2'>
              <div className='w-4 h-4 bg-white rounded-full flex justify-center items-center cursor-pointer border'
                onClick={() => setUseSSEForFees(!useSSEForFees)}>
                {useSSEForFees && <div className='w-3 h-3 bg-[#5da04e] rounded-full'>
                </div>}
              </div>
              <div className='flex flex-col text-[#F5F8FD] font-normal text-[14px]'>
                <p>Pay fee with SSE</p>
                <p>Get 50% off on transaction fees</p>
              </div>
            </div>
            <div className='w-full h-[1px] bg-white/10'></div>
            <div className='flex justify-between items-center text-[14px]'>
              <p className='font-normal leading-[150%]'>RATE</p>
              <div className="flex flex-col sm:flex-row sm:items-center">
                <div className="font-medium whitespace-nowrap">
                  1 {inputTokenSymbol}
                </div>
                <div className="flex items-center">
                  <span className="mx-0.5 sm:mx-1">≈</span>
                  <span className="font-medium truncate max-w-[100px]">
                    {
                      (inputTokenUsdPriceLoading || outputTokenUsdPriceLoading || !inputTokenUsdPrice || !outputTokenUsdPrice) ? (
                        <Loader2 className='w-3 h-3' />
                      ) : (
                        (inputTokenUsdPrice / outputTokenUsdPrice).toFixed(4)
                      )
                    }
                  </span>
                  <span className="whitespace-nowrap">
                    {outputTokenSymbol}
                  </span>
                </div>
              </div>
            </div>
            <button
              className='flex justify-between items-center cursor-pointer text-[14px] font-normal leading-[150%] text-start'
              onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}
              disabled={quoteResponse ? false : true}
            >
              <span>SSE offers the cheapest fee across all current platforms.</span>
              {isRouteInfoOpen ? (<ChevronDown className="h-8 w-8" />) : (<ChevronUp className="h-8 w-8" />)}
            </button>
            {isRouteInfoOpen && (
              <div className="p-2 text-[12px] border border-white/20 rounded-[12px]">
                {
                  isQuoteRefreshing ? (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span>Platform Fees</span>
                        <span>
                          updating
                          <LoadingDots />
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>minium received</span>
                        <span>
                          updating
                          <LoadingDots />
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      {
                        quoteResponse ? (
                          <>
                            <SwapQuoteDetails
                              quoteResponse={quoteResponse}
                              priceImpact={priceImpact}
                              slippageBps={slippageBps}
                              useSSEForFees={useSSEForFees}
                              sseFeeAmount={
                                useSSEForFees ? sseFeeAmount : undefined
                              }
                            />
                            <div className="mt-2 pt-2">
                              <SwapSettings
                                slippageBps={slippageBps}
                                onSlippageChange={setSlippageBps}
                                priorityLevel={priorityLevel}
                                onPriorityChange={setPriorityLevel}
                              // disabled={showLoadingState}
                              />
                            </div>
                          </>
                        ) : (null)
                      }
                    </>
                  )
                }
              </div>
            )}

          </div>
        </div>
        <div className='w-full'>
          <div className='bg-white/10 rounded-[20px] w-full h-[400px] p-4'>
            <iframe
              width="100%"
              height="100%"
              src={`https://birdeye.so/tv-widget/${outputTokenMint}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`}
              frameBorder="0"
              allowFullScreen
            />
          </div>
        </div>
        {showInputTokenSearch && (
          <TokenSearch
            onSelect={handleInputTokenSelect}
            onClose={() => setShowInputTokenSearch(false)}
            hideWhenGlobalSearch={false}
          />
        )}
        {showOutputTokenSearch && (
          <TokenSearch
            onSelect={handleOutputTokenSelect}
            onClose={() => setShowOutputTokenSearch(false)}
            hideWhenGlobalSearch={false}
          />
        )}
      </div>
      <div className="h-[20px]"></div>
    </div >
  )
}

export default SwapView;