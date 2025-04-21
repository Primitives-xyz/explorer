'use client'

import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import { useLeverageSize } from '@/components/trade/hooks/drift/use-leverage-size'
import { useLiquidationPrice } from '@/components/trade/hooks/drift/use-liquidation-price'
import { useMarketPrice } from '@/components/trade/hooks/drift/use-market-price'
import { usePlacePerpsOrder } from '@/components/trade/hooks/drift/use-place-perps-order'
import { useUserStats } from '@/components/trade/hooks/drift/use-user-stats'
import { BottomPerpetual } from '@/components/trade/left-content/perpetual/bottom-perpetual'
import { ButtonMiddlePerpetual } from '@/components/trade/left-content/perpetual/button-middle-perpetual'
import {
  DirectionFilterType,
  HeroPerpetual,
} from '@/components/trade/left-content/perpetual/hero-perpetual'
import LimitOrder from '@/components/trade/left-content/perpetual/limit-order'
import MarketOrder from '@/components/trade/left-content/perpetual/market-order'
import { FilterTabs, Separator } from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { PositionDirection } from '@drift-labs/sdk-browser'
import { useCallback, useEffect, useMemo, useState } from 'react'
import AddFundsModal from './add-funds-modal'

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
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
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
  const [orderAmount, setOrderAmount] = useState<string>('')
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

  const { placePerpsOrder, loading } = usePlacePerpsOrder({
    amount: orderAmount,
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, userStats, marketPrice])

  useEffect(() => {
    if (isSizeByLeverage) {
      setOrderAmount(selectedLeverageSizeToken)
    } else {
      setOrderAmount(amount)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [amount, selectedLeverageSizeToken])

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
          blur={!accountIds.length}
        />

        <Card className={`${!accountIds.length ? "blur-xs" : ""}`}>
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

        <ButtonMiddlePerpetual
          sdkHasLoaded={sdkHasLoaded}
          isLoggedIn={isLoggedIn}
          setShowAuthFlow={setShowAuthFlow}
          accountIds={accountIds}
          placePerpsOrder={placePerpsOrder}
          loading={loading}
          selectedDirection={selectedDirection}
          amount={orderAmount}
          symbol={symbol}
          setIsFundsModalOpen={setIsFundsModalOpen}
        />

        <div className={`${!accountIds.length ? "blur-xs" : ""}`}>
          <BottomPerpetual
            liqPriceLoading={liqPriceLoading}
            liquidationPrice={liquidationPrice}
            userStats={userStats}
            amount={orderAmount}
            leverageValue={leverageValue}
            showConfirmation={showConfirmation}
            formatLeverage={formatLeverage}
            setShowConfirmation={setShowConfirmation}
          />
        </div>
        <AddFundsModal
          isOpen={isFundsModalOpen}
          setIsOpen={setIsFundsModalOpen}
        />

      </div>
    </div>
  )
}
