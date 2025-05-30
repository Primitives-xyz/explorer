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
import { LimitOrderProps } from '../../../hooks/drift/use-limit-orders'

interface OrdersTabContentProps {
  subAccountId: number
  limitOrders: LimitOrderProps[]
  ordersLoading: boolean
  cancelOrder: (orderId: number, subAccountId: number) => void
  cancelLoading: boolean
}

export default function OrdersTabContent({
  subAccountId,
  limitOrders,
  ordersLoading,
  cancelOrder,
  cancelLoading,
}: OrdersTabContentProps) {
  const handleClose = async (orderId: number, subAccountId: number) => {
    await cancelOrder(orderId, subAccountId)
  }

  return (
    <div className="pb-2">
      <div className="grid grid-cols-5 gap-2 px-2 py-2">
        <div className="text-primary">Market</div>
        <div className="text-primary">Type</div>
        <div className="text-primary">Size</div>
        <div className="text-primary">Trigger/limit</div>
        <div className="text-primary">Action</div>
      </div>

      <div className="h-[250px] overflow-auto space-y-2">
        {limitOrders.length ? (
          <>
            {limitOrders.map((limitOrder, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-2 grid grid-cols-5 gap-2 items-center">
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
                        / {limitOrder.price ? limitOrder.price.toFixed(2) : '-'}
                      </p>
                    </div>

                    <div className="flex items-center">
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
                            <span className="text-center leading-main-content">
                              Close
                            </span>
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
            {!ordersLoading && (
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
