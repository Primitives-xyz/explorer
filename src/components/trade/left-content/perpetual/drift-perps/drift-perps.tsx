'use client'

import {
  LimitOrderParams,
  MarketOrderParams,
  NeccessaryOrderParams,
  OrderType,
  StopLimitOrderParams,
  TakeProfitOrderParams,
} from '@/components/tapestry/models/drift.model'
import { useTrade } from '@/components/trade/context/trade-context'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import { useLimitOrders } from '@/components/trade/hooks/drift/use-limit-orders'
import { useMarketPrice } from '@/components/trade/hooks/drift/use-market-price'
import { useOpenPositions } from '@/components/trade/hooks/drift/use-open-positions'
import { usePlacePerpsOrder } from '@/components/trade/hooks/drift/use-place-perps-order'
import { useUserStats } from '@/components/trade/hooks/drift/use-user-stats'
import {
  DirectionFilterType,
  HeroPerpetual,
} from '@/components/trade/left-content/perpetual/drift-perps/hero-perpetual'
import {
  Button,
  ButtonVariant,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Separator,
} from '@/components/ui'
import { Card, CardContent } from '@/components/ui/card'
import { SOL_MINT } from '@/utils/constants'
import { PositionDirection } from '@drift-labs/sdk-browser'
import { useEffect, useMemo, useState } from 'react'
import AddFundsModal from '../add-funds-modal'
import { PlacePerpsOrder } from '../place-perps-order'
import LimitOrder from './limit-order'
import MarketOrder from './market-order'
import StopLimit from './stop-limit'
import TakeProfit from './take-profit'

const options = [
  { label: 'Market', value: OrderType.MARKET },
  { label: 'Limit', value: OrderType.LIMIT },
]

export function DriftPerps() {
  // State
  const { setTokenMint } = useTrade()
  const { accountIds } = useDriftUsers()
  const [orderType, setOrderType] = useState<OrderType>(OrderType.MARKET)
  const [isFundsModalOpen, setIsFundsModalOpen] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [selectedDirection, setSelectedDirection] =
    useState<DirectionFilterType>(DirectionFilterType.LONG)
  const [symbol, setSymbol] = useState<string>('SOL')
  const [orderParams, setOrderParams] = useState<
    | MarketOrderParams
    | LimitOrderParams
    | TakeProfitOrderParams
    | StopLimitOrderParams
    | NeccessaryOrderParams
  >({
    orderType: OrderType.MARKET,
    amount: '',
  })
  const placeOrderParams = useMemo(() => {
    if (orderParams.orderType === OrderType.MARKET) {
      return {
        amount: (orderParams as MarketOrderParams).amount,
        symbol,
        direction:
          selectedDirection === DirectionFilterType.LONG
            ? PositionDirection.LONG
            : PositionDirection.SHORT,
        slippage: (orderParams as MarketOrderParams).slippage,
        orderType,
      }
    }

    if (orderParams.orderType === OrderType.LIMIT) {
      return {
        amount: orderParams.amount,
        symbol,
        direction:
          selectedDirection === DirectionFilterType.LONG
            ? PositionDirection.LONG
            : PositionDirection.SHORT,
        slippage: (orderParams as LimitOrderParams).slippage,
        orderType,
        limitPrice: (orderParams as LimitOrderParams).limitPrice,
        reduceOnly: (orderParams as LimitOrderParams).reduceOnly,
      }
    }

    if (orderParams.orderType === OrderType.TP) {
      return {
        amount: orderParams.amount,
        symbol,
        direction:
          selectedDirection === DirectionFilterType.LONG
            ? PositionDirection.LONG
            : PositionDirection.SHORT,
        orderType,
        triggerPrice: (orderParams as TakeProfitOrderParams).triggerPrice,
        reduceOnly: (orderParams as TakeProfitOrderParams).reduceOnly,
      }
    }

    if (orderParams.orderType === OrderType.SL) {
      return {
        amount: orderParams.amount,
        symbol,
        direction:
          selectedDirection === DirectionFilterType.LONG
            ? PositionDirection.LONG
            : PositionDirection.SHORT,
        orderType,
        triggerPrice: (orderParams as StopLimitOrderParams).triggerPrice,
        limitPrice: (orderParams as StopLimitOrderParams).limitPrice,
        reduceOnly: (orderParams as StopLimitOrderParams).reduceOnly,
      }
    }

    return {
      amount: '',
      symbol,
      direction:
        selectedDirection === DirectionFilterType.LONG
          ? PositionDirection.LONG
          : PositionDirection.SHORT,
      orderType,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderParams, selectedDirection, symbol, orderType])

  // Market
  const { price: marketPrice, loading: priceLoading } = useMarketPrice({
    symbol,
  })
  const { userStats, loading: statsLoading } = useUserStats({
    subAccountId: accountIds[0] || 0,
    symbol,
  })
  const { placePerpsOrder, loading } = usePlacePerpsOrder(placeOrderParams)

  const { refreshFetchOpenPositions } = useOpenPositions({
    subAccountId: accountIds[0] || 0,
  })

  const { refreshFetchLimitOrders } = useLimitOrders({
    subAccountId: accountIds[0] || 0,
  })

  // handlers
  const handlePlaceOrder = async () => {
    await placePerpsOrder()

    if (orderType === OrderType.MARKET) {
      refreshFetchOpenPositions()
    }

    if (orderType === OrderType.LIMIT) {
      refreshFetchLimitOrders()
    }
  }

  useEffect(() => {
    if (setTokenMint) {
      setTokenMint(SOL_MINT)
    }
  }, [setTokenMint])

  useEffect(() => {
    console.log('placeOrderParams', placeOrderParams)
  }, [placeOrderParams])

  return (
    <div className="w-full">
      <Card className={`${!accountIds.length ? 'blur-xs' : ''}`}>
        <CardContent className="p-4">
          <div className="space-y-4">
            <HeroPerpetual
              selectedDirection={selectedDirection}
              userStats={userStats}
              statsLoading={statsLoading}
              setSelectedDirection={setSelectedDirection}
              blur={!accountIds.length}
            />

            <div className="grid grid-cols-3 items-center justify-center gap-2">
              <Button
                variant={
                  orderType === OrderType.MARKET
                    ? ButtonVariant.DEFAULT
                    : ButtonVariant.GHOST
                }
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
                onClick={() => setOrderType(OrderType.LIMIT)}
              >
                Limit
              </Button>

              <Select
                value={
                  orderType === OrderType.MARKET ||
                  orderType === OrderType.LIMIT
                    ? OrderType.PRO
                    : orderType
                }
                onValueChange={(value) => {
                  setOrderType(value as OrderType)
                }}
              >
                <SelectTrigger className="bg-transparent h-12 rounded-input border-none">
                  <SelectValue placeholder="TP/SL" />
                </SelectTrigger>
                <SelectContent className="border border-primary text-primary">
                  <SelectItem value={OrderType.PRO} className="hidden">
                    TP/SL
                  </SelectItem>
                  <SelectItem value={OrderType.TP}>Take Profit</SelectItem>
                  <SelectItem value={OrderType.SL}>Stop Limit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Separator className="mt-0" />

            {orderType === OrderType.MARKET && (
              <MarketOrder
                direction={selectedDirection}
                symbol={'SOL'}
                marketPrice={marketPrice}
                priceLoading={priceLoading}
                userStats={userStats}
                setOrderParams={setOrderParams}
              />
            )}

            {orderType === OrderType.LIMIT && (
              <LimitOrder
                direction={selectedDirection}
                symbol={'SOL'}
                marketPrice={marketPrice}
                priceLoading={priceLoading}
                userStats={userStats}
                setOrderParams={setOrderParams}
              />
            )}

            {orderType === OrderType.TP && (
              <TakeProfit
                direction={selectedDirection}
                marketPrice={marketPrice}
                priceLoading={priceLoading}
                userStats={userStats}
                setIsError={setIsError}
                setOrderParams={setOrderParams}
              />
            )}

            {orderType === OrderType.SL && (
              <StopLimit
                direction={selectedDirection}
                marketPrice={marketPrice}
                priceLoading={priceLoading}
                userStats={userStats}
                setIsError={setIsError}
                setOrderParams={setOrderParams}
              />
            )}

            <PlacePerpsOrder
              accountIds={accountIds}
              placePerpsOrder={handlePlaceOrder}
              loading={loading}
              selectedDirection={selectedDirection}
              amount={placeOrderParams.amount}
              symbol={symbol}
              isError={isError}
              setIsFundsModalOpen={setIsFundsModalOpen}
            />

            <AddFundsModal
              isOpen={isFundsModalOpen}
              setIsOpen={setIsFundsModalOpen}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
