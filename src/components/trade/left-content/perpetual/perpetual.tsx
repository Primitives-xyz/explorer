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
  Separator,
  Spinner,
  Switch,
} from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn, formatUsdValue } from '@/utils/utils'
import { PositionDirection } from '@drift-labs/sdk-browser'
import { ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDriftUsers } from '../../hooks/drift/use-drift-users'
import { useLeverageSize } from '../../hooks/drift/use-leverage-size'
import { useLiquidationPrice } from '../../hooks/drift/use-liquidation-price'
import { useMarketPrice } from '../../hooks/drift/use-market-price'
import { usePlacePerpsOrder } from '../../hooks/drift/use-place-perps-order'
import { useUserStats } from '../../hooks/drift/use-user-stats'
import LimitOrder from './limit-order'
import MarketOrder from './market-order'

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

export function Perpetual() {
  const { accountIds } = useDriftUsers()
  const { userStats, loading: statsLoading } = useUserStats(accountIds[0] || 0)
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [limitPrice, setLimitPrice] = useState<number>(0)
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
  const [isSizeByLeverage, setIsSizeByLeverage] = useState<boolean>(false)
  const { price: marketPrice, loading: priceLoading } = useMarketPrice({
    symbol,
  })
  const { liquidationPrice, loading: liqPriceLoading } = useLiquidationPrice({
    symbol,
    amount,
    direction:
      selectedDirection === DirectionFilterType.LONG ? 'long' : 'short',
  })

  const { selectedLeverageSizeUsd, selectedLeverageSizeToken } =
    useLeverageSize({
      userStats,
      symbol,
      leverageValue,
      marketPrice: marketPrice,
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

  const getMaxTradeAmount = useMemo(() => {
    if (!userStats || userStats.maxTradeSize <= 0) return '0.00'

    return userStats.maxTradeSize.toFixed(2)
  }, [userStats])

  const handleAmountChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setError(null)
      setIsSizeByLeverage(false)
      const val = e.target.value
      if (
        val === '' ||
        val === '.' ||
        /^[0]?\.[0-9]*$/.test(val) ||
        /^[0-9]*\.?[0-9]*$/.test(val)
      ) {
        const cursorPosition = e.target.selectionStart
        if (Number(val) * marketPrice > userStats.maxTradeSize) {
          setAmount((userStats.maxTradeSize / marketPrice).toFixed(2))
        } else {
          setAmount(val)
        }
        window.setTimeout(() => {
          e.target.focus()
          e.target.setSelectionRange(cursorPosition, cursorPosition)
        }, 0)
      }
    },
    [userStats, marketPrice]
  )

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

  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLeverage = parseFloat(e.target.value)
    setLeverageValue(newLeverage)
  }

  const handleLimitPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLimitPrice(parseFloat(e.target.value))
  }

  const formatLeverage = (leverage: number) => {
    return leverage.toFixed(2) + 'x'
  }

  useEffect(() => {
    if (!isSizeByLeverage) {
      const newLeverageSize =
        ((Number(amount) * marketPrice) / userStats.maxTradeSize) *
        userStats.maxLeverage
      setLeverageValue(newLeverageSize)
    }
  }, [amount, userStats, marketPrice])

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
              <FilterTabs
                options={options}
                selected={orderType}
                onSelect={setOrderType}
              />

              {/* <Select
                  value={proOrderType}
                  defaultValue="Pro Orders"
                  onValueChange={(value) => {
                    setProOrderType(value as ProOrderType)
                    setOrderType(OrderType.PRO)
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      'bg-transparent h-12 border-none text-normal text-white',
                      orderType === OrderType.PRO && 'text-primary'
                    )}
                  >
                    <SelectValue defaultValue="Pro Orders" />
                  </SelectTrigger>
                  <SelectContent className="border border-primary text-primary">
                    {Object.values(ProOrderType).map((type, index) => (
                      <SelectItem value={type} key={index}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select> */}
            </div>

            <Separator className="mt-0" />

            {orderType === OrderType.MARKET && (
              <MarketOrder
                getMaxTradeAmount={getMaxTradeAmount}
                priceLoading={priceLoading}
                handleAmountChange={handleAmountChange}
                amount={amount}
                marketPrice={marketPrice}
                leverageValue={leverageValue}
                handleLeverageChange={handleLeverageChange}
                setLeverageValue={setLeverageValue}
                slippageExpanded={slippageExpanded}
                setSlippageExpanded={setSlippageExpanded}
                slippageOption={slippageOption}
                setSlippageOption={setSlippageOption}
                handleDynamicSlippage={handleDynamicSlippage}
                swift={swift}
                setSwift={setSwift}
                userStats={userStats}
                setAmount={setAmount}
                selectedLeverageSizeUsd={selectedLeverageSizeUsd.toString()}
                selectedLeverageSizeToken={selectedLeverageSizeToken}
                isSizeByLeverage={isSizeByLeverage}
                setIsSizeByLeverage={setIsSizeByLeverage}
                error={error}
              />
            )}

            {orderType === OrderType.LIMIT && (
              <LimitOrder
                limitPrice={limitPrice}
                handleLimitPriceChange={handleLimitPriceChange}
                amount={amount}
                marketPrice={marketPrice}
                leverageValue={leverageValue}
                setLeverageValue={setLeverageValue}
                handleLeverageChange={handleLeverageChange}
                selectedLeverageSizeUsd={selectedLeverageSizeUsd.toString()}
                selectedLeverageSizeToken={selectedLeverageSizeToken}
                handleAmountChange={handleAmountChange}
                setAmount={setAmount}
                userStats={userStats}
                swift={swift}
                setSwift={setSwift}
                isSizeByLeverage={isSizeByLeverage}
                setIsSizeByLeverage={setIsSizeByLeverage}
              />
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
