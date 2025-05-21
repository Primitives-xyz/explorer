'use client'

import {
  AddStopLimitOrderParams,
  AddTakeProfitOrderParams,
  NeccessaryOrderParams,
  OrderType,
} from '@/components/tapestry/models/drift.model'
import { usePlacePerpsOrder } from '@/components/trade/hooks/drift/use-place-perps-order'
import {
  Button,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui'
import { PositionDirection } from '@drift-labs/sdk-browser'
import { X } from 'lucide-react'
import { useMemo, useState } from 'react'
import AddStopLimit from './add-stop-loss'
import AddTakeProfit from './add-take-profit'

interface AddTPAndSLProps {
  currentPositionDirection: string | null
  currentPositionBaseAssetSymbol: string
  setIsModalOpen: (val: boolean) => void
}

export default function AddTPAndSL({
  currentPositionDirection,
  currentPositionBaseAssetSymbol,
  setIsModalOpen,
}: AddTPAndSLProps) {
  const [isError, setIsError] = useState<boolean>(false)
  const [orderParams, setOrderParams] = useState<
    NeccessaryOrderParams | AddTakeProfitOrderParams | AddStopLimitOrderParams
  >({ orderType: OrderType.ADD_TP, amount: '' })
  const placeOrderParams = useMemo(() => {
    if (orderParams.orderType === OrderType.ADD_TP) {
      return {
        amount: orderParams.amount,
        symbol: (orderParams as AddTakeProfitOrderParams).symbol,
        direction:
          currentPositionDirection === 'long'
            ? PositionDirection.LONG
            : PositionDirection.SHORT,
        orderType: OrderType.ADD_TP,
        triggerPrice: (orderParams as AddTakeProfitOrderParams).triggerPrice,
      }
    }

    if (orderParams.orderType === OrderType.ADD_SL) {
      return {
        amount: orderParams.amount,
        symbol: (orderParams as AddStopLimitOrderParams).symbol,
        direction:
          currentPositionDirection === 'long'
            ? PositionDirection.LONG
            : PositionDirection.SHORT,
        orderType: OrderType.ADD_SL,
        limitPrice: (orderParams as AddStopLimitOrderParams).limitPrice,
      }
    }

    return {
      amount: '',
      symbol: (orderParams as AddTakeProfitOrderParams).symbol,
      direction:
        currentPositionDirection === 'long'
          ? PositionDirection.LONG
          : PositionDirection.SHORT,
      orderType: OrderType.ADD_TP,
      triggerPrice: (orderParams as AddTakeProfitOrderParams).triggerPrice,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderParams])

  const { placePerpsOrder, loading } = usePlacePerpsOrder(placeOrderParams)

  const handlePlaceOrder = async () => {
    if (!isError) {
      await placePerpsOrder()
      setIsModalOpen(false)
    }
  }

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
      <div
        className="bg-zinc-800 rounded-lg shadow-lg p-4 w-full max-w-md border border-zinc-700"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 id="modal-title" className="text-lg font-medium">
            Add TP/SL for {currentPositionDirection} Position
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsModalOpen(false)}
            className="h-8 w-8 rounded-full hover:bg-zinc-700"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <Tabs defaultValue="takeProfit">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="takeProfit">Take Profit</TabsTrigger>
            <TabsTrigger value="stopLoss">Stop Loss</TabsTrigger>
          </TabsList>
          <TabsContent value="takeProfit" className="space-y-4">
            <AddTakeProfit
              direction={currentPositionDirection}
              symbol={currentPositionBaseAssetSymbol}
              setOrderParams={setOrderParams}
              setIsError={setIsError}
            />
          </TabsContent>
          <TabsContent value="stopLoss">
            <AddStopLimit
              direction={currentPositionDirection}
              symbol={currentPositionBaseAssetSymbol}
              setOrderParams={setOrderParams}
              setIsError={setIsError}
            />
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsModalOpen(false)}
            className="bg-zinc-700 hover:bg-zinc-600 text-white border-none"
          >
            Cancel
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-500 text-white"
            onClick={handlePlaceOrder}
            disabled={loading}
          >
            {loading ? <Spinner /> : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
