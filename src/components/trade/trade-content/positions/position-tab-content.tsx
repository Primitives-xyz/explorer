import { Button, ButtonVariant, Card, CardContent, CardVariant, Spinner } from "@/components/ui"
import { useOpenPositions } from "../../hooks/drift/use-open-positions"
import { cn } from "@/utils/utils"
import { X } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"
import { useToastContent } from "../../hooks/drift/use-toast-content"

interface PositionTabContentProps {
  subAccountId: number,
}

export default function PositionTabContent({ subAccountId }: PositionTabContentProps) {
  const symbol = "SOL"
  const [loading, setLoading] = useState<boolean>(false)
  const { ERRORS, SUCCESS, LOADINGS } = useToastContent()
  const { perpsPositionsInfo, loading: positionsLoading, closePosition, refreshFetchOpenPositions } = useOpenPositions({
    subAccountId,
    symbol,
  })

  const handleClose = async () => {
    try {
      setLoading(true)
      toast.loading(LOADINGS.CONFIRM_LOADING.title, LOADINGS.CONFIRM_LOADING.content)
      const sig = await closePosition()
      toast.success(SUCCESS.CLOSE_POSITION_TX_SUCCESS.title, SUCCESS.CLOSE_POSITION_TX_SUCCESS.content)
      refreshFetchOpenPositions()
    } catch (error) {
      console.log(error)
      toast.error(ERRORS.CLOSE_POS_ERR.title, ERRORS.CLOSE_POS_ERR.content)
    } finally {
      toast.dismiss()
      setLoading(false)
    }
  }

  return (
    <div className="px-2 pb-2">
      <div className="grid grid-cols-6 gap-2 mb-2">
        <div className="text-primary">Market</div>
        <div className="text-primary">Size</div>
        <div className="text-primary">Entry/Mark</div>
        <div className="text-primary">PnL</div>
        <div className="text-primary">Liq Price</div>
        <div className="text-primary">Action</div>
      </div>

      <>
        {perpsPositionsInfo.length ? (
          <>
            {
              perpsPositionsInfo.map((position, index) => {
                return (
                  <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                    <CardContent className="p-2 grid grid-cols-6 gap-2 items-center">
                      <div>
                        <p>{position.market}</p>
                        <p className={cn(
                          "text-red-500",
                          position.direction === "LONG" && "text-primary"
                        )}>{position.direction}</p>
                      </div>

                      <div>
                        <p>{position.baseAssetAmountInToken.toFixed(2)} {symbol}</p>
                        <p className="text-gray-400">${position.baseAssetAmountInUsd.toFixed(2)}</p>
                      </div>

                      <div>
                        <p>${position.entryPrice.toFixed(2)}</p>
                        <p className="text-gray-400">${position.markPrice.toFixed(2)}</p>
                      </div>

                      <div>
                        <p className={cn(
                          "text-red-500",
                          position.pnlInUsd > 0 && "text-primary",
                        )}>
                          ${position.pnlInUsd.toFixed(2)}
                        </p>
                        <p className={cn(
                          "text-red-500",
                          position.pnlInUsd > 0 && "text-primary",
                        )}>
                          {position.pnlInPercentage.toFixed(2)}%
                        </p>
                      </div>

                      <p>${position.liqPrice.toFixed(2)}</p>

                      <div className="flex justify-center items-center">
                        <Button
                          variant={ButtonVariant.OUTLINE}
                          disabled={loading}
                          onClick={async () => await handleClose()}
                        >
                          {
                            loading ? <Spinner /> : <X size={16} className="font-bold" />
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
            <span>No Open Positions</span>
          </div>
        )
        }
      </>
    </div >
  )
}