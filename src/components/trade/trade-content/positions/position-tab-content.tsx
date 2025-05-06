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
import { useState } from 'react'
import { PerpsPositionInfoProps } from '../../hooks/drift/use-open-positions'

interface PositionTabContentProps {
  perpsPositionsInfo: PerpsPositionInfoProps[]
  positionsLoading: boolean
  closePosition: (value: number) => void
  refreshFetchOpenPositions: () => void
}

export default function PositionTabContent({
  perpsPositionsInfo,
  positionsLoading,
  closePosition,
  refreshFetchOpenPositions,
}: PositionTabContentProps) {
  const symbol = 'SOL'
  const [loading, setLoading] = useState<boolean>(false)

  const handleClose = async (marketIndex: number) => {
    try {
      setLoading(true)
      const sig = await closePosition(marketIndex)
      refreshFetchOpenPositions()
    } catch (error) {
      console.log(error)
    } finally {
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

      <div className="h-[250px] overflow-auto space-y-2">
        {perpsPositionsInfo.length ? (
          <>
            {perpsPositionsInfo.map((position, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-4 grid grid-cols-6 gap-2 items-center">
                    <div>
                      <p>{position.market}</p>
                      <p
                        className={cn(
                          'text-red-500',
                          position.direction === 'LONG' && 'text-primary'
                        )}
                      >
                        {position.direction}
                      </p>
                    </div>

                    <div>
                      <p>
                        {position.baseAssetAmountInToken.toFixed(2)} {symbol}
                      </p>
                      <p className="text-gray-400">
                        ${position.baseAssetAmountInUsd.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p>${position.entryPrice.toFixed(2)}</p>
                      <p className="text-gray-400">
                        ${position.markPrice.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p
                        className={cn(
                          'text-red-500',
                          position.pnlInUsd > 0 && 'text-primary'
                        )}
                      >
                        ${position.pnlInUsd.toFixed(2)}
                      </p>
                      <p
                        className={cn(
                          'text-red-500',
                          position.pnlInUsd > 0 && 'text-primary'
                        )}
                      >
                        {position.pnlInPercentage.toFixed(2)}%
                      </p>
                    </div>

                    <p>${position.liqPrice.toFixed(2)}</p>

                    <div className="flex justify-center items-center">
                      <Tooltip content="Close position">
                        <Button
                          variant={ButtonVariant.OUTLINE}
                          disabled={loading}
                          onClick={async () =>
                            await handleClose(position.marketIndex)
                          }
                        >
                          {loading ? (
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
            {!positionsLoading && (
              <div className="flex justify-center items-center p-4 w-full h-full">
                <span>No Open Positions</span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
