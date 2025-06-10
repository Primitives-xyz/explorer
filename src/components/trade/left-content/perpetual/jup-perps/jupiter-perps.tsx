'use client'

import { TokenBalance } from '@/components/common/left-side-menu/balance'
import {
  DirectionFilterType,
  OrderType,
} from '@/components/tapestry/models/drift.model'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTrade } from '@/components/trade/context/trade-context'
import { useIncrease } from '@/components/trade/hooks/jup-perps/use-increase'
import { useLimitOrders } from '@/components/trade/hooks/jup-perps/use-limit-orders'
import { useMarketStats } from '@/components/trade/hooks/jup-perps/use-market-stats'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
} from '@/components/ui'
import Slider from '@/components/ui/slider/slider'
import { SOL_MINT, USDC_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { formatRawAmount } from '@/utils/utils'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useState } from 'react'

// Extracted validation functions
const validateNumericInput = (value: string): boolean => {
  return (
    value === '' ||
    value === '.' ||
    /^[0]?\.[0-9]*$/.test(value) ||
    /^[0-9]*\.?[0-9]*$/.test(value)
  )
}

const validateAmount = (value: string, decimals: number = 6): boolean => {
  if (value === '') return true

  const numericValue = Number(value)
  if (isNaN(numericValue) || numericValue <= 0) return false

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

export function JupiterPerps() {
  // Individual state variables
  const { setTokenMint } = useTrade()
  const [direction, setDirection] = useState<DirectionFilterType>(
    DirectionFilterType.LONG
  )
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [limitPrice, setLimitPrice] = useState<string>('')
  const [amount, setAmount] = useState<string>('')
  const [assetMint, setAssetMint] = useState<string>(SOL_MINT)
  const { marketStats } = useMarketStats(assetMint)
  const [leverageValue, setLeverageValue] = useState<number>(1.1)
  const [slippageOption, setSlippageOption] = useState<string>('1')
  const [slippageExpanded, setSlippageExpanded] = useState<boolean>(false)
  const [isLimitOrderTxLoading, setIsLimitOrderTxLoading] =
    useState<boolean>(false)

  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow, walletAddress } =
    useCurrentWallet()
  const { balance: inputBalance, rawBalance: inputRawBalance } =
    useTokenBalance(walletAddress, SOL_MINT)
  const {
    symbol: assetTokenSymbol,
    decimals: assetTokenDecimals,
    image: assetTokenImg,
  } = useTokenInfo(assetMint)

  const {
    isIncreaseLoading,
    isTxExecuteLoading,
    response: increaseResponse,
    error: increaseError,
    placeIncreasePosition,
  } = useIncrease({
    collateralMint:
      direction === DirectionFilterType.SHORT ? USDC_MINT : SOL_MINT,
    collateralTokenDelta: amount
      ? (Number(amount) * Math.pow(10, assetTokenDecimals || 9)).toString()
      : '0',
    includeSerializedTx: true,
    inputMint: SOL_MINT,
    leverage: leverageValue.toString(),
    marketMint: SOL_MINT,
    maxSlippageBps: (Number(slippageOption) * 100).toString(),
    side: direction.toLowerCase() as 'long' | 'short',
    walletAddress: walletAddress || '',
  })

  const {
    isLoading: isLimitLoading,
    response: limitResponse,
    error: limitError,
    placeLimitOrder,
  } = useLimitOrders({
    collateralMint:
      direction === DirectionFilterType.SHORT ? USDC_MINT : SOL_MINT,
    collateralTokenDelta: amount
      ? (Number(amount) * Math.pow(10, assetTokenDecimals || 9)).toString()
      : '0',
    includeSerializedTx: true,
    inputMint: SOL_MINT,
    leverage: leverageValue.toString(),
    marketMint: SOL_MINT,
    side: direction.toLowerCase() as 'long' | 'short',
    triggerPrice: (Number(limitPrice) * Math.pow(10, 6)).toString(),
    walletAddress: walletAddress || '',
  })

  const orderAmountForMarketOrder = useMemo(() => {
    if (increaseResponse) {
      const sizeTokenDelta =
        Number(increaseResponse.quote.sizeTokenDelta) /
        Math.pow(10, assetTokenDecimals || 9)

      return sizeTokenDelta
    }
  }, [increaseResponse])

  const orderAmountForLimitOrder = useMemo(() => {
    if (limitResponse) {
      const sizeTokenDelta =
        Number(limitResponse.quote.sizeTokenDelta) /
        Math.pow(10, assetTokenDecimals || 9)

      return sizeTokenDelta
    }
  }, [limitResponse])

  // Memoized handlers
  const handleAmountChange = useCallback(
    (
      e: React.ChangeEvent<HTMLInputElement>,
      changeType: 'amount' | 'limit' | 'slippage'
    ) => {
      const val = e.target.value
      if (validateNumericInput(val)) {
        if (changeType === 'amount') {
          setAmount(val)
        } else if (changeType === 'limit') {
          setLimitPrice(val)
        } else if (changeType === 'slippage') {
          setSlippageOption(Number(val) < 100 ? val : '99')
        }

        const cursorPosition = e.target.selectionStart
        window.setTimeout(() => {
          e.target.focus()
          e.target.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
      }
    },
    []
  )

  const handleInputAmountByPercentage = useCallback(
    (percent: number) => {
      if (
        !inputBalance ||
        typeof inputRawBalance !== 'bigint' ||
        !assetTokenDecimals
      )
        return

      try {
        const quarterAmount = inputRawBalance / BigInt(100 / percent)
        const formattedQuarter = formatRawAmount(
          quarterAmount,
          BigInt(assetTokenDecimals)
        )

        if (validateAmount(formattedQuarter, assetTokenDecimals)) {
          setAmount(formattedQuarter)
        }
      } catch (err) {
        console.error('Error calculating amount:', err)
      }
    },
    [inputBalance, inputRawBalance, assetTokenDecimals]
  )

  const handlePlaceOrder = useCallback(async () => {
    if (!isLoggedIn || !sdkHasLoaded) return

    try {
      await placeIncreasePosition()
    } catch (err) {
      console.error('Failed to place order:', err)
    }
  }, [isLoggedIn, sdkHasLoaded, placeIncreasePosition])

  const handleLimitOrder = useCallback(async () => {
    if (!isLoggedIn || !sdkHasLoaded || isLimitOrderTxLoading) return

    try {
      setIsLimitOrderTxLoading(true)
      await placeLimitOrder()
    } catch (err) {
      console.error('Failed to place order:', err)
    } finally {
      setIsLimitOrderTxLoading(false)
    }
  }, [isLoggedIn, sdkHasLoaded, isLimitOrderTxLoading, placeLimitOrder])

  useEffect(() => {
    if (marketStats && orderType === OrderType.MARKET) {
      setLimitPrice(
        Number(marketStats.price)
          .toFixed(4)
          .replace(/\.?0+$/, '')
      )
    }
  }, [marketStats, orderType])

  useEffect(() => {
    if (assetMint.length > 0) {
      setAssetMint(assetMint)
    }
  }, [assetMint])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="w-full grid grid-cols-2 gap-2">
            <Button
              variant={
                direction === DirectionFilterType.LONG
                  ? ButtonVariant.DEFAULT
                  : ButtonVariant.GHOST
              }
              onClick={() => setDirection(DirectionFilterType.LONG)}
            >
              Long/Buy
            </Button>
            <Button
              variant={
                direction === DirectionFilterType.SHORT
                  ? ButtonVariant.DEFAULT
                  : ButtonVariant.GHOST
              }
              onClick={() => setDirection(DirectionFilterType.SHORT)}
            >
              Short/Sell
            </Button>
          </div>

          <div className="flex items-center justify-between gap-1">
            <div className="p-1 space-x-2">
              <Button
                variant={
                  orderType === OrderType.MARKET
                    ? ButtonVariant.DEFAULT
                    : ButtonVariant.GHOST
                }
                className="w-[50px] p-1"
                onClick={() => setOrderType(OrderType.MARKET)}
              >
                Market
              </Button>
              <Button
                variant={
                  orderType === OrderType.LIMIT
                    ? ButtonVariant.DEFAULT
                    : ButtonVariant.GHOST
                }
                className="w-[50px] p-1"
                onClick={() => setOrderType(OrderType.LIMIT)}
              >
                Limit
              </Button>
            </div>
            <Input
              placeholder="Amount"
              value={limitPrice}
              disabled={orderType !== OrderType.LIMIT}
              className="w-[150px] text-primary text-right bg-primary/10 border-primary/20"
              onChange={(e) => handleAmountChange(e, 'limit')}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="text-sm">You're paying</div>
              <div className="text-sm">
                Balance:{' '}
                <TokenBalance
                  walletAddress={walletAddress}
                  tokenMint={SOL_MINT}
                />
              </div>
            </div>

            <div className="flex space-x-1 justify-end">
              <Button
                variant={ButtonVariant.BADGE}
                className="px-2 py-1 text-xs"
                size={ButtonSize.SM}
                onClick={() => handleInputAmountByPercentage(50)}
              >
                HALF
              </Button>
              <Button
                variant={ButtonVariant.BADGE}
                className="px-2 py-1 text-xs"
                size={ButtonSize.SM}
                onClick={() => handleInputAmountByPercentage(100)}
              >
                MAX
              </Button>
            </div>

            <div className="flex justify-between items-center gap-2">
              <div className="flex items-center">
                <Select value={assetMint} onValueChange={setAssetMint}>
                  <SelectTrigger className="bg-transparent h-12 rounded-input">
                    <SelectValue placeholder="Symbol">
                      <div className="flex items-center gap-2 w-[70px]">
                        <Image
                          src={assetTokenImg || ''}
                          alt="SOL"
                          width={20}
                          height={20}
                          className="rounded-full"
                        />
                        {assetTokenSymbol}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border border-primary text-primary">
                    <SelectItem value={SOL_MINT}>SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e, 'amount')}
                  className="w-full text-primary text-right bg-primary/10 border-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p>Leverage</p>
              <p>{leverageValue.toFixed(2)}x</p>
            </div>

            <Slider
              min={1.1}
              max={100}
              step={0.1}
              value={[leverageValue]}
              onValueChange={(value) => setLeverageValue(value[0])}
            />
          </div>

          {/* <Slippage
            handleDynamicSlippage={(e) => handleAmountChange(e, 'slippage')}
            setSlippageExpanded={setSlippageExpanded}
            setSlippageOption={setSlippageOption}
            slippageExpanded={slippageExpanded}
            slippageOption={slippageOption}
          /> */}

          <div className="space-y-4">
            <div className="grid grid-cols-6 gap-2">
              <Button
                variant={
                  slippageOption === '1'
                    ? ButtonVariant.DEFAULT
                    : ButtonVariant.BADGE
                }
                className="px-0"
                onClick={() => setSlippageOption('1')}
              >
                1%
              </Button>
              <Button
                variant={
                  slippageOption === '2'
                    ? ButtonVariant.DEFAULT
                    : ButtonVariant.BADGE
                }
                className="px-0"
                onClick={() => setSlippageOption('2')}
              >
                2%
              </Button>
              <Button
                variant={
                  slippageOption === '3'
                    ? ButtonVariant.DEFAULT
                    : ButtonVariant.BADGE
                }
                className="px-0"
                onClick={() => setSlippageOption('3')}
              >
                3%
              </Button>

              <div className="relative w-full col-span-3 flex items-center border border-primary/20 bg-primary/10 rounded-button h-9 p-1">
                <span className="text-primary text-sm">Custom</span>
                <Input
                  type="text"
                  className="text-primary h-full border-none bg-transparent"
                  onChange={(e) => handleAmountChange(e, 'slippage')}
                  value={
                    isNaN(Number(slippageOption)) ? '' : `${slippageOption}`
                  }
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary">
                  %
                </span>
              </div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-sm">Entry Price</span>
              <span className="text-sm">Liquidation Price</span>
            </div>

            <div className="flex flex-col space-y-1 text-right">
              <span className="text-sm">
                {increaseResponse && increaseError === null
                  ? `$${increaseResponse.quote.entryPriceUsd}`
                  : '...'}
              </span>
              <span className="text-sm">
                {increaseResponse && increaseError === null
                  ? `$${increaseResponse.quote.liquidationPriceUsd}`
                  : '...'}
              </span>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1 text-left">
              <span className="text-sm">Open Fee</span>
              <span className="text-sm">Price Impact</span>
              <span className="text-sm">Borrow Fee</span>
              <span className="text-sm">Transaction Fee</span>
              <span className="text-sm">Account Rent</span>
            </div>

            <div className="flex flex-col space-y-1 text-right">
              {orderType === OrderType.MARKET && (
                <>
                  <span className="text-sm">
                    {increaseResponse && increaseError === null
                      ? `$${increaseResponse.quote.openFeeUsd}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {increaseResponse && increaseError === null
                      ? `$${increaseResponse.quote.priceImpactFeeUsd}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {increaseResponse && increaseError === null
                      ? `$${increaseResponse.quote.outstandingBorrowFeeUsd}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {increaseResponse && increaseError === null
                      ? `$${
                          Number(
                            increaseResponse.txMetadata.transactionFeeLamports
                          ) / Math.pow(10, assetTokenDecimals || 9)
                        } ${assetTokenSymbol}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {increaseResponse && increaseError === null
                      ? `$${
                          Number(
                            increaseResponse.txMetadata.accountRentLamports
                          ) / Math.pow(10, assetTokenDecimals || 9)
                        } ${assetTokenSymbol}`
                      : '...'}
                  </span>
                </>
              )}

              {orderType === OrderType.LIMIT && (
                <>
                  <span className="text-sm">
                    {limitResponse && limitError === null
                      ? `$${limitResponse.quote.openFeeUsd}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {limitResponse && limitError === null
                      ? `$${limitResponse.quote.priceImpactFeeUsd}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {limitResponse && limitError === null
                      ? `$${limitResponse.quote.outstandingBorrowFeeUsd}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {limitResponse && limitError === null
                      ? `$${
                          Number(
                            limitResponse.txMetadata.transactionFeeLamports
                          ) / Math.pow(10, assetTokenDecimals || 9)
                        } ${assetTokenSymbol}`
                      : '...'}
                  </span>
                  <span className="text-sm">
                    {limitResponse && limitError === null
                      ? `$${
                          Number(limitResponse.txMetadata.accountRentLamports) /
                          Math.pow(10, assetTokenDecimals || 9)
                        } ${assetTokenSymbol}`
                      : '...'}
                  </span>
                </>
              )}
            </div>
          </div>

          <div>
            {(() => {
              if (!sdkHasLoaded) {
                return (
                  <Button
                    variant={ButtonVariant.OUTLINE_WHITE}
                    className="capitalize font-bold w-full text-lg"
                  >
                    <Spinner />
                  </Button>
                )
              }

              if (!isLoggedIn) {
                return (
                  <Button
                    variant={ButtonVariant.OUTLINE_WHITE}
                    className="capitalize font-bold w-full text-lg"
                    onClick={() => setShowAuthFlow(true)}
                  >
                    Connect Wallet
                  </Button>
                )
              }

              return (
                <div>
                  {orderType === OrderType.MARKET && (
                    <>
                      <Button
                        onClick={() => handlePlaceOrder()}
                        className="capitalize font-bold w-full text-lg"
                        disabled={
                          isIncreaseLoading ||
                          increaseError !== null ||
                          !orderAmountForMarketOrder ||
                          isTxExecuteLoading
                        }
                      >
                        {Number(amount) <= 0 ? (
                          <span>Enter an amount</span>
                        ) : isTxExecuteLoading ? (
                          <span>Submitting Order...</span>
                        ) : orderAmountForMarketOrder ? (
                          <span>
                            {direction} {orderAmountForMarketOrder.toFixed(4)}{' '}
                            {assetTokenSymbol}
                          </span>
                        ) : (
                          <span>{direction}</span>
                        )}
                      </Button>

                      {increaseError && (
                        <p className="text-red-500 text-sm mt-2">
                          {increaseError}
                        </p>
                      )}
                    </>
                  )}

                  {orderType === OrderType.LIMIT && (
                    <>
                      <Button
                        onClick={() => handleLimitOrder()}
                        className="capitalize font-bold w-full text-lg"
                        disabled={
                          isLimitOrderTxLoading ||
                          isLimitLoading ||
                          limitError !== null ||
                          !orderAmountForLimitOrder
                        }
                      >
                        {isLimitOrderTxLoading || isLimitLoading ? (
                          <Spinner />
                        ) : orderAmountForLimitOrder && !limitError ? (
                          <p>
                            {direction} {orderAmountForLimitOrder.toFixed(4)}{' '}
                            {assetTokenSymbol}
                          </p>
                        ) : (
                          <p>Enter an amount</p>
                        )}
                      </Button>

                      {limitError && (
                        <p className="text-red-500 text-sm mt-2">
                          {limitError}
                        </p>
                      )}
                    </>
                  )}
                </div>
              )
            })()}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
