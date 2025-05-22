'use client'

import { TokenBalance } from '@/components/common/left-side-menu/balance'
import {
  DirectionFilterType,
  OrderType,
} from '@/components/tapestry/models/drift.model'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useIncreasePosition } from '@/components/trade/hooks/jup-perps/use-increase'
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
import { useCallback, useMemo, useState } from 'react'
import { Slippage } from '../slippage'

interface Props {
  setTokenMint?: (value: string) => void
}

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

// Extracted components
const DirectionSelector = ({
  selectedDirection,
  onDirectionChange,
}: {
  selectedDirection: DirectionFilterType
  onDirectionChange: (direction: DirectionFilterType) => void
}) => (
  <div className="w-full grid grid-cols-2 gap-2">
    <Button
      variant={
        selectedDirection === DirectionFilterType.LONG
          ? ButtonVariant.DEFAULT
          : ButtonVariant.GHOST
      }
      onClick={() => onDirectionChange(DirectionFilterType.LONG)}
    >
      Long/Buy
    </Button>
    <Button
      variant={
        selectedDirection === DirectionFilterType.SHORT
          ? ButtonVariant.DEFAULT
          : ButtonVariant.GHOST
      }
      onClick={() => onDirectionChange(DirectionFilterType.SHORT)}
    >
      Short/Sell
    </Button>
  </div>
)

const OrderTypeSelector = ({
  orderType,
  onOrderTypeChange,
  limitPrice,
  onLimitPriceChange,
}: {
  orderType: OrderType
  onOrderTypeChange: (type: OrderType) => void
  limitPrice: string
  onLimitPriceChange: (price: string) => void
}) => (
  <div className="flex items-center justify-between gap-1">
    <div className="p-1 space-x-2">
      <Button
        variant={
          orderType === OrderType.MARKET
            ? ButtonVariant.DEFAULT
            : ButtonVariant.GHOST
        }
        className="w-[50px] p-1"
        onClick={() => onOrderTypeChange(OrderType.MARKET)}
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
        onClick={() => onOrderTypeChange(OrderType.LIMIT)}
      >
        Limit
      </Button>
    </div>
    <Input
      placeholder="Amount"
      value={limitPrice}
      disabled={orderType !== OrderType.LIMIT}
      className="w-[150px]"
      onChange={(e) => onLimitPriceChange(e.target.value)}
    />
  </div>
)

export function JupiterPerps({ setTokenMint }: Props) {
  // Individual state variables
  const [direction, setDirection] = useState<DirectionFilterType>(
    DirectionFilterType.LONG
  )
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [limitPrice, setLimitPrice] = useState<string>('173.12')
  const [amount, setAmount] = useState<string>('')
  const [assetSymbol, setAssetSymbol] = useState<string>('SOL')
  const [leverageValue, setLeverageValue] = useState<number>(1.1)
  const [slippageOption, setSlippageOption] = useState<string>('0.1')
  const [slippageExpanded, setSlippageExpanded] = useState<boolean>(false)
  const [loading, setLoading] = useState<boolean>(false)

  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow, walletAddress } =
    useCurrentWallet()
  const { balance: inputBalance, rawBalance: inputRawBalance } =
    useTokenBalance(walletAddress, SOL_MINT)
  const {
    symbol: assetTokenSymbol,
    decimals: assetTokenDecimals,
    image: assetTokenImg,
  } = useTokenInfo(SOL_MINT)

  const {
    isLoading: isIncreaseLoading,
    response: increaseResponse,
    error: increaseError,
    placeIncreasePosition,
  } = useIncreasePosition({
    collateralMint: direction === DirectionFilterType.SHORT ? USDC_MINT : SOL_MINT,
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

  // Memoized handlers
  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (validateNumericInput(val)) {
        setAmount(val)
        const cursorPosition = e.target.selectionStart
        window.setTimeout(() => {
          e.target.focus()
          e.target.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
      }
    },
    []
  )

  const handleDynamicSlippage = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value
      if (validateNumericInput(val)) {
        setSlippageOption(Number(val) < 100 ? val : '99')
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
    if (!isLoggedIn || !sdkHasLoaded || loading) return

    try {
      setLoading(true)
      await placeIncreasePosition()
    } catch (err) {
      console.error('Failed to place order:', err)
    } finally {
      setLoading(false)
    }
  }, [isLoggedIn, sdkHasLoaded, loading, placeIncreasePosition])

  // Memoized values
  const buttonContent = useMemo(() => {
    if (!sdkHasLoaded) {
      return <Spinner />
    }
    if (!isLoggedIn) {
      return 'Connect Wallet'
    }
    if (loading || isIncreaseLoading) {
      return <Spinner />
    }
    if (Number(amount) > 0) {
      return `${direction} ~${amount} ${assetSymbol}-Perp`
    }
    return 'Enter an amount'
  }, [
    sdkHasLoaded,
    isLoggedIn,
    loading,
    isIncreaseLoading,
    direction,
    amount,
    assetSymbol,
  ])

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-4">
          <DirectionSelector
            selectedDirection={direction}
            onDirectionChange={setDirection}
          />

          <OrderTypeSelector
            orderType={orderType}
            onOrderTypeChange={setOrderType}
            limitPrice={limitPrice}
            onLimitPriceChange={setLimitPrice}
          />

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
                <Select value={assetSymbol} onValueChange={setAssetSymbol}>
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
                        {assetSymbol}
                      </div>
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent className="border border-primary text-primary">
                    <SelectItem value={'SOL'}>SOL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center">
                <Input
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                  className="w-full text-white border-none"
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

          <Slippage
            handleDynamicSlippage={handleDynamicSlippage}
            setSlippageExpanded={setSlippageExpanded}
            setSlippageOption={setSlippageOption}
            slippageExpanded={slippageExpanded}
            slippageOption={slippageOption}
          />

          <Separator />

          <div className="flex justify-between items-center text-sm">
            <p>Entry Price</p>
            <div className="flex items-center gap-2">$173.12</div>
          </div>

          <div className="flex justify-between items-center text-sm">
            <p>Liquidation Price</p>
            <p className="flex items-center gap-2">$167.16</p>
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
                <Button
                  onClick={() => handlePlaceOrder()}
                  className="capitalize font-bold w-full text-lg"
                  disabled={loading || isIncreaseLoading || increaseError !== null}
                >
                  {loading || isIncreaseLoading ? (
                    <Spinner />
                  ) : Number(amount) > 0 ? (
                    <p>
                      {direction} {(Number(increaseResponse?.quote.sizeTokenDelta) / Math.pow(10, assetTokenDecimals || 9)).toFixed(4)} {assetSymbol}
                    </p>
                  ) : (
                    <p>Enter an amount</p>
                  )}
                </Button>
                {increaseError && (
                  <p className="text-red-500 text-sm mt-2">{increaseError}</p>
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
