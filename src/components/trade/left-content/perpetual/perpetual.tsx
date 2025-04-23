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
import { OrderType, PerpsMarketType, ProOrderType } from '@/components/tapestry/models/drift.model'
import { SOL_MINT } from '@/utils/constants'

interface Props {
  setTokenMint?: (value: string) => void
}

const isValidNumericInput = (val: string) =>
  val === '' || val === '.' || /^[0]?\.[0-9]*$/.test(val) || /^[0-9]*\.?[0-9]*$/.test(val)

const restoreCursor = (e: React.ChangeEvent<HTMLInputElement>, cursor: number) => {
  setTimeout(() => {
    e.target.focus()
    e.target.setSelectionRange(cursor, cursor)
  }, 0)
}

const options = [
  { label: 'Market', value: OrderType.MARKET },
  { label: 'Limit', value: OrderType.LIMIT },
]

const formatLeverage = (leverage: number) => {
  return leverage.toFixed(2) + 'x'
}

export function Perpetual({ setTokenMint }: Props) {
  const { accountIds } = useDriftUsers()
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()

  // State
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [reduceOnly, setRedulyOnly] = useState<boolean>(false)
  const [selectedDirection, setSelectedDirection] = useState<DirectionFilterType>(DirectionFilterType.LONG)
  const [slippageExpanded, setSlippageExpanded] = useState<boolean>(false)
  const [slippageOption, setSlippageOption] = useState<string>('0.1')
  const [swift, setSwift] = useState<boolean>(false)
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [amount, setAmount] = useState<string>('')
  const [orderAmount, setOrderAmount] = useState<string>('')
  const [symbol, setSymbol] = useState<string>('SOL')
  const [limitPrice, setLimitPrice] = useState<string>("")
  const [leverageValue, setLeverageValue] = useState<number>(1)
  const [isSizeByLeverage, setIsSizeByLeverage] = useState<boolean>(false)

  // Market
  const { price: marketPrice, loading: priceLoading } = useMarketPrice({ symbol })
  const { userStats, loading: statsLoading } = useUserStats({
    subAccountId: accountIds[0] || 0,
    symbol
  })
  const { liquidationPrice, loading: liqPriceLoading } = useLiquidationPrice({
    symbol,
    amount: orderAmount,
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
    orderType,
    limitPrice,
    reduceOnly,
  })

  // Derived Data
  const getMaxTradeAmount = useMemo(() => {
    if (!userStats || userStats.maxTradeSize <= 0) return '0.00'

    return userStats.maxTradeSize.toFixed(2)
  }, [userStats])

  // handlers
  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const cursorPosition = e.target.selectionStart || 0

    setIsSizeByLeverage(false)

    if (!isValidNumericInput(val)) return

    const maxAmount = userStats?.maxTradeSize || 0
    const totalAmountInUSD = Number(val) * marketPrice

    const newVal = totalAmountInUSD > maxAmount ? (maxAmount / marketPrice).toFixed(2) : val

    setAmount(newVal)

    restoreCursor(e, cursorPosition)
  },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userStats, marketPrice]
  )

  const handleDynamicSlippage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart || 0

    if (!isValidNumericInput(val)) return

    setSlippageOption(Number(val) < 100 ? val : '99')
    restoreCursor(e, cursor)
  }

  const handleLeverageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newLeverage = parseFloat(e.target.value)
    setLeverageValue(newLeverage)
  }

  const handleLimitPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    const cursor = e.target.selectionStart || 0

    if (!isValidNumericInput(val)) return

    setLimitPrice(val)
    restoreCursor(e, cursor)
  }, [])

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

  useEffect(() => {
    if (setTokenMint) {
      setTokenMint(SOL_MINT)
    }
  }, [setTokenMint])

  return (
    <div className="w-full">
      <div className="space-y-4">
        <HeroPerpetual
          selectedDirection={selectedDirection}
          userStats={userStats}
          statsLoading={statsLoading}
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
            </div>

            <Separator className="mt-0" />

            {orderType === OrderType.MARKET && (
              <MarketOrder
                amount={amount}
                getMaxTradeAmount={getMaxTradeAmount}
                handleAmountChange={handleAmountChange}
                handleDynamicSlippage={handleDynamicSlippage}
                handleLeverageChange={handleLeverageChange}
                isSizeByLeverage={isSizeByLeverage}
                leverageValue={leverageValue}
                marketPrice={marketPrice}
                priceLoading={priceLoading}
                selectedLeverageSizeToken={selectedLeverageSizeToken}
                selectedLeverageSizeUsd={selectedLeverageSizeUsd.toString()}
                setAmount={setAmount}
                setIsSizeByLeverage={setIsSizeByLeverage}
                setLeverageValue={setLeverageValue}
                setSlippageExpanded={setSlippageExpanded}
                setSlippageOption={setSlippageOption}
                setSwift={setSwift}
                slippageExpanded={slippageExpanded}
                slippageOption={slippageOption}
                swift={swift}
                userStats={userStats}
              />

            )}

            {orderType === OrderType.LIMIT && (
              <LimitOrder
                amount={amount}
                handleAmountChange={handleAmountChange}
                handleDynamicSlippage={handleDynamicSlippage}
                handleLeverageChange={handleLeverageChange}
                handleLimitPriceChange={handleLimitPriceChange}
                isSizeByLeverage={isSizeByLeverage}
                leverageValue={leverageValue}
                limitPrice={limitPrice}
                marketPrice={marketPrice}
                marketPriceLoading={priceLoading}
                selectedLeverageSizeToken={selectedLeverageSizeToken}
                selectedLeverageSizeUsd={selectedLeverageSizeUsd.toString()}
                setAmount={setAmount}
                setIsSizeByLeverage={setIsSizeByLeverage}
                setLeverageValue={setLeverageValue}
                setReduceOnly={setRedulyOnly}
                setSlippageExpanded={setSlippageExpanded}
                setSlippageOption={setSlippageOption}
                setSwift={setSwift}
                slippageExpanded={slippageExpanded}
                slippageOption={slippageOption}
                swift={swift}
                reduceOnly={reduceOnly}
                userStats={userStats}
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
