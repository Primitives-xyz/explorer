'use client'

import {
  DirectionFilterType,
  HeroPerpetual,
} from '@/components/trade/left-content/perpetual/hero-perpetual'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  FilterTabs,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
  Spinner,
  Switch,
} from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn, formatUsdValue } from '@/utils/utils'
import { PositionDirection } from '@drift-labs/sdk-browser'
import {
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CircleAlert,
  Infinity,
  Zap,
} from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useDriftUsers } from '../../hooks/drift/use-drift-users'
import { useLeverageSize } from '../../hooks/drift/use-leverage-size'
import { useLiquidationPrice } from '../../hooks/drift/use-liquidation-price'
import { useMarketPrice } from '../../hooks/drift/use-market-price'
import { usePlacePerpsOrder } from '../../hooks/drift/use-place-perps-order'
import { useUserStats } from '../../hooks/drift/use-user-stats'

enum OrderType {
  MARKET = 'market',
  LIMIT = 'limit',
  PRO = 'pro',
}

enum ProOrderType {
  STOP_MARKET = 'Stop Market',
  STOP_LIMIT = 'Stop Limit',
  TAKE_PROFIT_MARKET = 'Take Profit',
  TAKE_PROFIT_LIMIT = 'Take Profit Limit',
  ORACLE_Limit = 'Oracle Market',
  SCALE = 'Scale',
}

enum PerpsMarketType {
  SOL = 'SOL',
  USDC = 'USDC',
}

const slippageOptions = [
  { value: '0.1', label: '0.1%' },
  { value: '0.5', label: '0.5%' },
  { value: '1', label: '1%' },
  { value: 'zap', icon: <Zap size={16} /> },
  { value: 'infinity', icon: <Infinity size={16} /> },
]

export function Perpetual() {
  const { accountIds } = useDriftUsers()
  const { userStats, loading: statsLoading } = useUserStats(accountIds[0] || 0)
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [proOrderType, setProOrderType] = useState<ProOrderType>(
    ProOrderType.STOP_MARKET
  )
  const [perpsMarketType, setPerpsMarketType] = useState<PerpsMarketType>(
    PerpsMarketType.SOL
  )
  const [selectedDirection, setSelectedDirection] =
    useState<DirectionFilterType>(DirectionFilterType.LONG)
  const [slippageExpanded, setSlippageExpanded] = useState<boolean>(false)
  const [slippageOption, setSlippageOption] = useState<string>('0.1')
  const [swift, setSwift] = useState<boolean>(false)
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('SOL')
  const [leverageValue, setLeverageValue] = useState<number>(1)
  const { price: marketPrice, loading: priceLoading } = useMarketPrice({
    symbol,
  })
  const { liquidationPrice, loading: liqPriceLoading } = useLiquidationPrice({
    symbol,
    amount,
    direction:
      selectedDirection === DirectionFilterType.LONG ? 'long' : 'short',
  })

  const {
    maxSizeForToken,
    selectedLeverageSizeToken,
    getSizeByLeveragePercent,
  } = useLeverageSize({
    symbol,
    leverageValue,
    marketPrice: marketPrice || 100,
  })

  const { placePerpsOrder, loading, error, setError } = usePlacePerpsOrder({
    amount,
    symbol,
    direction:
      selectedDirection === DirectionFilterType.LONG
        ? PositionDirection.LONG
        : PositionDirection.SHORT,
    slippage: slippageOption,
  })

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setAmount(val)
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const handleDynamicSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      if (Number(val) < 100) {
        setSlippageOption(e.target.value)
      } else {
        setSlippageOption('99')
      }
      window.setTimeout(() => {
        e.target.focus()
        e.target.setSelectionRange(cursorPosition, cursorPosition)
      }, 0)
    }
  }

  const getMaxTradeAmount = () => {
    if (!userStats || userStats.maxTradeSize <= 0) return '0.00'

    const estimatedSolPrice = 100
    const maxAmount =
      Math.floor((userStats.maxTradeSize / estimatedSolPrice) * 100) / 100
    return maxAmount.toFixed(2)
  }

  const formatLeverage = (leverage: number) => {
    return leverage.toFixed(2) + 'x'
  }

  useEffect(() => {
    if (selectedLeverageSizeToken && Number(selectedLeverageSizeToken) > 0) {
      setAmount(selectedLeverageSizeToken)
    }
  }, [selectedLeverageSizeToken])

  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLeverage = parseFloat(e.target.value)
    setLeverageValue(newLeverage)
  }

  const options = [
    { label: 'Market', value: OrderType.MARKET },
    { label: 'Limit', value: OrderType.LIMIT },
  ]

  return (
    <div className="w-full">
      <div className="space-y-4">
        <HeroPerpetual
          selectedDirection={selectedDirection}
          userStats={userStats}
          setSelectedDirection={setSelectedDirection}
          formatLeverage={formatLeverage}
        />

        <Card>
          <CardContent>
            {/* Order Type */}
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <FilterTabs
                  options={options}
                  selected={orderType}
                  onSelect={setOrderType}
                />

                <div className="mb-4">
                  <Select
                    value={proOrderType}
                    onValueChange={(value) => {
                      setProOrderType(value as ProOrderType)
                      setOrderType(OrderType.PRO)
                    }}
                  >
                    <SelectTrigger className="border-none bg-transparent text-primary h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="border border-primary text-primary">
                      {Object.values(ProOrderType).map((type, index) => (
                        <SelectItem value={type} key={index}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator className="mt-0 mb-2" />

            {orderType === OrderType.MARKET && (
              <div className="space-y-4">
                {/* Size */}
                <div className="flex justify-between items-center">
                  <p>Size</p>

                  <div className="flex items-center gap-2">
                    <p>max: {getMaxTradeAmount()} SOL</p>
                    {priceLoading && <Spinner size={12} />}
                  </div>
                </div>

                {/* Market */}
                <Card className="flex items-center">
                  <Input
                    placeholder="0.00"
                    className="text-primary text-xl bg-transparent border-none placeholder:text-primary"
                    type="text"
                    onChange={(e) => handleAmountChange(e)}
                    value={amount}
                  />
                  <Image
                    src={
                      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
                    }
                    alt="USDC"
                    width={30}
                    height={30}
                    className="rounded-full mx-1"
                  />
                </Card>

                <Card className="flex items-center">
                  <Input
                    placeholder="0.00"
                    value={
                      marketPrice && amount
                        ? (Number(amount) * marketPrice).toFixed(2)
                        : ''
                    }
                    className="text-primary text-xl bg-transparent placeholder:text-primary border-none"
                    disabled={true}
                  />
                  <Image
                    src={
                      'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png'
                    }
                    alt="USDC"
                    width={30}
                    height={30}
                    className="rounded-full mx-1"
                  />
                </Card>

                {/* Leverage */}
                <div className="flex justify-between items-center">
                  <p>Leverage</p>
                  <p className="font-semibold">{leverageValue.toFixed(2)}x</p>
                </div>

                {/* Leverage Slider */}
                <div className="space-y-2">
                  <Input
                    type="range"
                    min="1"
                    max={`${Math.min(userStats.maxLeverage, 20)}`}
                    step="0.1"
                    value={leverageValue}
                    onChange={handleLeverageChange}
                    className="bg-primary text-primary fill-accent"
                  />

                  <div className="flex items-center justify-between gap-2">
                    {[25, 50, 75, 100].map((percent) => (
                      <Button
                        key={percent}
                        variant={ButtonVariant.BADGE}
                        onClick={() =>
                          setAmount(getSizeByLeveragePercent(percent))
                        }
                      >
                        {percent}%
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Slippage Tolerance */}
                <div className="space-y-2">
                  <div
                    className="flex items-center justify-between w-full cursor-pointer"
                    onClick={() => setSlippageExpanded(!slippageExpanded)}
                  >
                    <span>Slippage Tolerance (Dynamic)</span>
                    {slippageExpanded ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    )}
                  </div>

                  {slippageExpanded && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-5 gap-2">
                        {slippageOptions.map((option) => (
                          <Button
                            variant={
                              slippageOption === option.value
                                ? ButtonVariant.DEFAULT
                                : ButtonVariant.BADGE
                            }
                            key={option.value}
                            className="px-0"
                            onClick={() => setSlippageOption(option.value)}
                          >
                            {option.icon || option.label}
                          </Button>
                        ))}
                      </div>
                      <Card className="flex justify-between items-center px-2">
                        <Input
                          type="text"
                          placeholder="Custom"
                          className="h-[36px] w-full bg-transparent border-none text-primary/80"
                          onChange={(e) => handleDynamicSlippage(e)}
                          value={
                            isNaN(Number(slippageOption))
                              ? ''
                              : `${slippageOption}`
                          }
                        />
                        <span className="text-primary/80">%</span>
                      </Card>
                    </div>
                  )}
                </div>

                {/* Swift */}
                <div className="flex items-center space-x-2">
                  <span>SWIFT</span>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => setSwift(false)}
                      className={cn('text-sm', {
                        'text-muted-foreground': swift,
                      })}
                      isInvisible
                    ></Button>
                    <Switch checked={swift} onCheckedChange={setSwift} />
                    <Button
                      onClick={() => setSwift(true)}
                      className={cn('text-sm', {
                        'text-muted-foreground': !swift,
                      })}
                      isInvisible
                    ></Button>
                  </div>
                </div>

                {error && (
                  <p className="w-full flex justify-start items-center space-x-2 text-red-500">
                    <CircleAlert />
                    <span>{error}</span>
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div>
          {!sdkHasLoaded ? (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
            >
              <Spinner />
            </Button>
          ) : !isLoggedIn ? (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
              onClick={() => setShowAuthFlow(true)}
            >
              Connect Wallet
            </Button>
          ) : accountIds.length ? (
            <Button
              onClick={() => placePerpsOrder()}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
              disabled={loading || Number(amount) <= 0}
            >
              {loading ? (
                <Spinner />
              ) : Number(amount) > 0 ? (
                <p>
                  {selectedDirection} ~{amount} {symbol}-Perp
                </p>
              ) : (
                <p>Enter an amount</p>
              )}
            </Button>
          ) : (
            <Button
              variant={ButtonVariant.OUTLINE_WHITE}
              className="text-lg capitalize font-bold w-full"
              size={ButtonSize.LG}
            >
              No Drift Account
            </Button>
          )}
        </div>

        <Card>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center text-primary">
              <span>Dynamic Slippage</span>
              <span>Fee 0.00%</span>
            </div>

            <Separator />

            <div className="flex justify-between items-center">
              <span>Est.Liquidation Price</span>
              <span className="flex items-center space-x-1">
                {liqPriceLoading ? (
                  <Spinner size={16} />
                ) : liquidationPrice ? (
                  formatUsdValue(liquidationPrice)
                ) : (
                  'None'
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Acct. Leverage</span>
              <span className="flex items-center space-x-1">
                {formatLeverage(userStats.leverage)}{' '}
                <ArrowRight className="text-[14px]" />
                {formatLeverage(
                  userStats.leverage + (Number(amount) > 0 ? leverageValue : 0)
                )}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span>Fees</span>
              <span className="text-[14px]">$0.25</span>
            </div>

            <div className="flex justify-between items-center">
              <span>Show Confirmation</span>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => setShowConfirmation(false)}
                  className={cn('text-sm', {
                    'text-muted-foreground': showConfirmation,
                  })}
                  isInvisible
                ></Button>
                <Switch
                  checked={showConfirmation}
                  onCheckedChange={setShowConfirmation}
                />
                <Button
                  onClick={() => setShowConfirmation(true)}
                  className={cn('text-sm', {
                    'text-muted-foreground': !showConfirmation,
                  })}
                  isInvisible
                ></Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
