import { useDeleteLimitOrder } from '@/components/trade/hooks/jup-perps/use-delete-order'
import { OpenOrder } from '@/components/trade/hooks/jup-perps/use-open-orders'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Separator,
} from '@/components/ui'

interface JupOrdersTabContentProps {
  limitOrders: OpenOrder[]
  ordersLoading: boolean
}

export default function JupOrdersTabContent({
  limitOrders,
  ordersLoading,
}: JupOrdersTabContentProps) {
  const { deleteLimitOrder, isLoading } = useDeleteLimitOrder()

  const handleCancelOrder = (positionRequestPubkey: string) => {
    deleteLimitOrder(positionRequestPubkey)
  }

  return (
    <div className="pb-2">
      <div className="h-[250px] overflow-auto space-y-2">
        {limitOrders.length ? (
          <>
            {limitOrders.map((openOrder, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-2 space-y-2">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <p className="text-sm">SOL</p>
                        <p className="text-sm text-primary">
                          {openOrder.side.toUpperCase()}
                        </p>
                      </div>

                      <div className="flex justify-end">
                        <Button
                          variant={ButtonVariant.OUTLINE}
                          onClick={() => {
                            handleCancelOrder(openOrder.positionRequestPubkey)
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? 'Cancelling...' : 'Cancel'}
                        </Button>
                      </div>
                    </div>

                    <Separator className="my-1" />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm text-primary">Trigger Price</p>
                        <p className="text-sm">${openOrder.triggerPrice}</p>
                      </div>

                      <div className="flex flex-col text-end space-y-1">
                        <p className="text-sm text-primary">Size</p>
                        <p className="text-sm">${openOrder.sizeUsd}</p>
                      </div>
                    </div>

                    <Separator className="my-1" />

                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm text-primary">
                          Collateral(amount)
                        </p>
                        <p className="text-sm">
                          {(
                            Number(openOrder.collateralTokenAmount) /
                            Math.pow(10, 9)
                          )
                            .toFixed(4)
                            .replace(/\.?0+$/, '')}{' '}
                          SOL
                        </p>
                      </div>

                      <div className="flex flex-col text-end space-y-1">
                        <p className="text-sm text-primary">
                          Collateral(trig.price)
                        </p>
                        <p className="text-sm">
                          ${openOrder.collateralUsdAtTriggerPrice}
                        </p>
                      </div>
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
