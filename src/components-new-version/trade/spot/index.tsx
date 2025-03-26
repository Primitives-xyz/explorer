import { useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { AnimatePresence, motion } from "framer-motion"

// Icons
import { ChevronDown, ChevronUp, CircleAlert, ExternalLink, Loader, Loader2, Search } from 'lucide-react';

// Hooks
import { useTokenBalance } from '@/hooks/use-token-balance';
import { useTokenInfo } from '@/hooks/use-token-info';
import { useTokenUSDCPrice } from '@/hooks/use-token-usdc-price';
import { useJupiterSwap } from '@/hooks/use-jupiter-swap';
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet';

// UI Components
import { Badge, Button } from '@/components-new-version/ui';
import { TokenSearch } from '@/components/transactions/swap/token-search';

// Utilities
import { formatLargeNumber, formatRawAmount, formatUsdValue } from "@/utils/format"

// Local Components
import SwapDivider from './swap-divider';
// import { ChartDemo } from './light-chart';
import PlatformComparison from './platform-comparison';
// import DynamicConnectButton from ''
import { DEFAULT_INPUT_TOKEN_IMAGEURI, DEFAULT_INPUT_TOKEN_MINT, DEFAULT_INPUT_TOKEN_SYMBOL, DEFAULT_OUT_TOKEN_MINT, DEFAULT_OUTPUT_TOKEN_IMAGEURI, DEFAULT_OUTPUT_TOKEN_SYMBOL } from './constants';

import DynamicConnectButton from '@/components-new-version/common/dynamic-button';
import LoadingDots from '@/components-new-version/common/loading-dots';
import Details from '../common/details';
import isFungibleToken from '@/utils/helper';

const SpotView = () => {
  const t = useTranslations()
  const [inputTokenMint, setInputTokenMint] = useState<string>(DEFAULT_INPUT_TOKEN_MINT)
  const [outputTokenMint, setOutTokenMint] = useState<string>(DEFAULT_OUT_TOKEN_MINT)
  const [inputTokenAmount, setInputTokenAmount] = useState<string>("")
  const [showInputTokenSearch, setShowInputTokenSearch] = useState<boolean>(false)
  const [showOutputTokenSearch, setShowOutputTokenSearch] = useState<boolean>(false)
  const { symbol: inputTokenSymbol, decimals: inputTokenDecimals, image: inputTokenImageUri } = useTokenInfo(inputTokenMint)
  const { symbol: outputTokenSymbol, decimals: outputTokenDecimals, image: outputTokenImageUri, data: outputTokenData } = useTokenInfo(outputTokenMint)
  const { price: inputTokenUsdPrice, loading: inputTokenUsdPriceLoading } = useTokenUSDCPrice(inputTokenMint, inputTokenDecimals)
  const { price: outputTokenUsdPrice, loading: outputTokenUsdPriceLoading } = useTokenUSDCPrice(outputTokenMint, outputTokenDecimals)
  const [useSSEForFees, setUseSSEForFees] = useState<boolean>(false)
  const [isRouteInfoOpen, setIsRouteInfoOpen] = useState<boolean>(false)
  const { isLoggedIn, sdkHasLoaded, walletAddress } = useCurrentWallet()
  const [showPriceLightWeightChart, setShowPriceLightWeightChart] = useState<boolean>(false)
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
    showTradeLink,
    isFullyConfirmed,
    handleSwap,
    resetQuoteState,
    isQuoteRefreshing,
  } = useJupiterSwap({
    inputMint: inputTokenMint,
    outputMint: outputTokenMint,
    inputAmount: inputTokenAmount,
    inputDecimals: inputTokenDecimals!,
    sourceWallet: walletAddress,
    platformFeeBps: useSSEForFees ? 1 : undefined,
  })

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
                    value={(quoteResponse && !isNaN(parseFloat(expectedOutput)) && inputTokenAmount.length) ? formatLargeNumber(parseFloat(expectedOutput), outputTokenDecimals) : ''}
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
                className='w-full px-3 py-2 flex flex-row justify-between items-center'
                onClick={() => setShowOutputTokenSearch(true)}
              >
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
                  <p className='text-[14px] font-bold leading-[150%]'>{outputTokenSymbol ? outputTokenSymbol : DEFAULT_OUTPUT_TOKEN_SYMBOL}</p>
                </div>
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>
            <div className='w-full flex justify-center items-center p-2'>
              <button
                className='cursor-pointer'
                onClick={() => setShowPriceLightWeightChart(!showPriceLightWeightChart)}
              >
                {!showPriceLightWeightChart && <ChevronDown className="h-4 w-4" />}
                {showPriceLightWeightChart && <ChevronUp className="h-4 w-4" />}
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
              <p className='text-[#97EF83] font-bold text-[14px]'>Route Information & Fees</p>
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
              <div className="flex flex-col sm:flex-row sm:items-center text-[#97EF83]">
                <div className="font-normal whitespace-nowrap">
                  1 {inputTokenSymbol}
                </div>
                <div className="flex items-center">
                  <span className="mx-0.5 sm:mx-1">≈</span>
                  <span className="font-normal truncate max-w-[100px]">
                    {
                      (inputTokenUsdPriceLoading || outputTokenUsdPriceLoading || !inputTokenUsdPrice || !outputTokenUsdPrice) ? (
                        <Loader2 className='w-3 h-3 animate-spin' />
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
            <motion.div
              className='flex justify-between items-center cursor-pointer text-[12px] font-normal leading-[150%] text-start transition-all duration-300'
              transition={{ duration: 0.3 }}
              onClick={() => setIsRouteInfoOpen(!isRouteInfoOpen)}
            >
              <span>SSE offers the cheapest fee across all current platforms.</span>
              {isRouteInfoOpen ? (<ChevronDown className="h-8 w-8" />) : (<ChevronUp className="h-8 w-8" />)}
            </motion.div>
            <AnimatePresence>
              {isRouteInfoOpen && (
                <motion.div
                  className="p-2 border border-white/20 rounded-[12px]"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="flex justify-between items-center mb-4 px-2">
                    <div className="text-[#97EF83] font-medium text-[12px]">PLATFORMS</div>
                    <div className="text-[#97EF83] font-medium text-[12px]">You'll get</div>
                  </div>
                  <div className='h-[200px] overflow-y-auto'>
                    {
                      isQuoteRefreshing ? (
                        <div className='h-full flex justify-center items-center'>
                          <Loader2 className='w-8 h-8 animate-spin text-[#97EF83]' />
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
                </motion.div>
              )}
            </AnimatePresence>

          </div>
        </div>
        <div className='w-full flex flex-col gap-4'>
          <div className='bg-white/5 border border-white/10 rounded-[20px] w-full h-[400px] p-4'>
            <iframe
              width="100%"
              height="100%"
              src={`https://birdeye.so/tv-widget/${outputTokenMint}?chain=solana&viewMode=pair&chartInterval=15&chartType=CANDLE&theme=dark&defaultMetric=mcap`}
              frameBorder="0"
              allowFullScreen
            />
          </div>

          <Details
            id={outputTokenMint}
            description={outputTokenData? outputTokenData.result.content.metadata.description : "NONE"}
            decimals={outputTokenDecimals? outputTokenDecimals : 0 }
            tokenProgram={isFungibleToken(outputTokenData)? outputTokenData.result.token_info.token_program : "NONE"}
          />
        </div>
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
      </div>
      <div className="h-[20px]"></div>
    </div >
  )
}

export default SpotView;