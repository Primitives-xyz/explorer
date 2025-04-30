import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Spinner,
} from '@/components/ui'
import Tooltip from '@/components/ui/tooltip'
import { cn } from '@/utils/utils'
import { X } from 'lucide-react'
import { useLimitOrders } from '../../hooks/drift/use-limit-orders'

interface OrdersTabContentProps {
  subAccountId: number
}

export default function OrdersTabContent({
  subAccountId,
}: OrdersTabContentProps) {
  const symbol = 'SOL'
  const { limitOrders, cancelLoading, loading, cancelOrder } = useLimitOrders({
    subAccountId,
    symbol,
  })

  const handleClose = async (orderId: number, subAccountId: number) => {
    await cancelOrder(orderId, subAccountId)
  }

  return (
    <div className="px-2 pb-2">
      <div className="grid grid-cols-5 gap-2 mb-2 text-center">
        <div className="text-primary">Market</div>
        <div className="text-primary">Type</div>
        <div className="text-primary">Size</div>
        <div className="text-primary">Trigger/limit</div>
        <div className="text-primary">Action</div>
      </div>

      <div className="h-[250px] overflow-auto space-y-2">
        {loading && (
          <div className="flex items-center gap-2">
            <p>Loading Limit Orders</p>
            <Spinner size={16} />
          </div>
        )}

        {limitOrders.length ? (
          <>
            {limitOrders.map((limitOrder, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-4 grid grid-cols-5 gap-2 items-center text-center">
                    <div>
                      <p>{limitOrder.market}</p>
                      <p
                        className={cn(
                          'text-red-500',
                          limitOrder.direction === 'LONG' && 'text-primary'
                        )}
                      >
                        {limitOrder.direction}
                      </p>
                    </div>

                    <p>LIMIT</p>

                    <div>
                      <p>0 / {limitOrder.baseAssetAmount}</p>
                    </div>

                    <div>
                      <p>
                        {limitOrder.triggerPrice
                          ? limitOrder.triggerPrice.toFixed(2)
                          : '-'}{' '}
                        / {limitOrder.price.toFixed(2)}
                      </p>
                    </div>

                    <div className="flex justify-center items-center">
                      <Tooltip content="Cancel Order">
                        <Button
                          variant={ButtonVariant.OUTLINE}
                          disabled={cancelLoading}
                          onClick={() => {
                            handleClose(limitOrder.orderId, subAccountId)
                          }}
                        >
                          {cancelLoading ? (
                            <Spinner />
                          ) : (
                            <X size={16} className="font-bold" />
                          )}
                        </Button>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </>
        ) : (
          <>
            {!loading && (
              <div className="flex justify-center items-center w-full h-full">
                <span>No Limit Orders</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
