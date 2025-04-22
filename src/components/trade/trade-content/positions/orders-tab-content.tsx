import { Button, ButtonVariant, Card, CardContent, CardVariant, Spinner } from "@/components/ui"
import { cn } from "@/utils/utils"
import { X } from "lucide-react"
import { useLimitOrders } from "../../hooks/drift/use-limit-orders"

interface OrdersTabContentProps {
  subAccountId: number,
}

export default function OrdersTabContent({ subAccountId }: OrdersTabContentProps) {
  const symbol = "SOL"
  const { limitOrders, cancelLoading, cancelOrder } = useLimitOrders({
    subAccountId,
    symbol,
  })

  const handleClose = async (
    orderId: number,
    subAccountId: number
  ) => {
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

      <div className="space-y-2">
        {limitOrders.length ? (
          <>
            {
              limitOrders.map((limitOrder, index) => {
                return (
                  <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                    <CardContent className="p-2 grid grid-cols-5 gap-2 items-center text-center">
                      <div>
                        <p>{limitOrder.market}</p>
                        <p className={cn(
                          "text-red-500",
                          limitOrder.direction === "LONG" && "text-primary"
                        )}>{limitOrder.direction}</p>
                      </div>

                      <p>LIMIT</p>

                      <div>
                        <p>0 / {limitOrder.baseAssetAmount}</p>
                      </div>

                      <div>
                        <p>
                          {limitOrder.triggerPrice ? limitOrder.triggerPrice.toFixed(2) : "-"} / {limitOrder.price.toFixed(2)}
                        </p>
                      </div>

                      <div className="flex justify-center items-center">
                        <Button
                          variant={ButtonVariant.OUTLINE}
                          disabled={cancelLoading}
                          onClick={() => {
                            handleClose(limitOrder.orderId, subAccountId)
                          }}
                        >
                          {
                            cancelLoading ? <Spinner /> : <X size={16} className="font-bold" />
                          }
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            }
          </>
        ) : (
          <div className="flex justify-center items-center p-4">
            <span>No Limit Orders</span>
          </div>
        )
        }
      </div>
    </div >
  )
}