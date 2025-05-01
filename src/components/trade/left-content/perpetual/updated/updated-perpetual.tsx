'use client'

import {
  LimitOrderParams,
  MarketOrderParams,
  NeccessaryOrderParams,
  OrderType,
  TakeProfitOrderParams,
} from '@/components/tapestry/models/drift.model'
import { useDriftUsers } from '@/components/trade/hooks/drift/use-drift-users'
import { useLimitOrders } from '@/components/trade/hooks/drift/use-limit-orders'
import { useMarketPrice } from '@/components/trade/hooks/drift/use-market-price'
import { useOpenPositions } from '@/components/trade/hooks/drift/use-open-positions'
import { usePlacePerpsOrder } from '@/components/trade/hooks/drift/use-place-perps-order'
import { useUserStats } from '@/components/trade/hooks/drift/use-user-stats'
import {
  DirectionFilterType,
  HeroPerpetual,
} from '@/components/trade/left-content/perpetual/hero-perpetual'
import {
  FilterTabs,
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
import LimitOrder from './limit-order'
import MarketOrder from './market-order'
import { PlacePerpsOrder } from './place-perps-order'
import TakeProfit from './take-profit'

interface Props {
  setTokenMint?: (value: string) => void
}

const options = [
  { label: 'Market', value: OrderType.MARKET },
  { label: 'Limit', value: OrderType.LIMIT },
]

export function Perpetual({ setTokenMint }: Props) {
  // State
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

    return {
      amount: '',
      symbol,
      direction:
        selectedDirection === DirectionFilterType.LONG
          ? PositionDirection.LONG
          : PositionDirection.SHORT,
      orderType,
    }
  }, [orderParams])

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
    symbol,
  })

  const { refreshFetchLimitOrders } = useLimitOrders({
    subAccountId: accountIds[0] || 0,
    symbol,
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

  return (
    <div className="w-full">
      <div className="space-y-4">
        <HeroPerpetual
          selectedDirection={selectedDirection}
          userStats={userStats}
          statsLoading={statsLoading}
          setSelectedDirection={setSelectedDirection}
          blur={!accountIds.length}
        />

        <Card className={`${!accountIds.length ? 'blur-xs' : ''}`}>
          <CardContent>
            <div className="flex justify-between items-center">
              <FilterTabs
                options={options}
                selected={orderType}
                onSelect={setOrderType}
                className="mb-0"
              />
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
                  <SelectValue placeholder="Pro Orders" />
                </SelectTrigger>
                <SelectContent className="border border-primary text-primary">
                  <SelectItem value={OrderType.PRO} className="hidden">
                    Pro Orders
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
          </CardContent>
        </Card>

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
      </div>
    </div>
  )
}
