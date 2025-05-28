import { OpenOrder } from '@/components/trade/hooks/jup-perps/use-open-orders'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
} from '@/components/ui'

interface JupOrdersTabContentProps {
  limitOrders: OpenOrder[]
  ordersLoading: boolean
}

export default function JupOrdersTabContent({
  limitOrders,
  ordersLoading,
}: JupOrdersTabContentProps) {
  return (
    <div className="pb-2">
      <div className="grid grid-cols-5 gap-2 px-2 py-2">
        <div className="text-primary">Position</div>
        <div className="text-primary">Trigger Price</div>
        <div className="text-primary">Size</div>
        <div className="text-primary">Collateral</div>
        <div className="text-primary">Action</div>
      </div>

      <div className="h-[250px] overflow-auto space-y-2">
        {limitOrders.length ? (
          <>
            {limitOrders.map((openOrder, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-2 grid grid-cols-5 gap-2 items-center">
                    <div>
                      <p className="text-sm">SOL</p>
                      <p className="text-sm">{openOrder.side.toUpperCase()}</p>
                    </div>

                    <div>
                      <p className="text-sm">${openOrder.triggerPrice}</p>
                    </div>

                    <div>
                      <p className="text-sm">${openOrder.sizeUsd}</p>
                    </div>

                    <div>
                      <p className="text-sm">
                        {(
                          Number(openOrder.collateralTokenAmount) /
                          Math.pow(10, 9)
                        ).toFixed(4).replace(/\.?0+$/, '')}{' '}
                        SOL
                      </p>
                      <p className="text-sm">${openOrder.collateralUsdAtTriggerPrice}</p>
                    </div>

                    <Button variant={ButtonVariant.OUTLINE}>Cancel</Button>
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
