import { Position } from '@/components/trade/hooks/jup-perps/use-positions'
import { Card, CardContent, CardVariant } from '@/components/ui'

interface PositionTabContentProps {
  perpsPositionsInfo: Position[]
  positionsLoading: boolean
}

export default function JupPositionTabContent({
  perpsPositionsInfo,
  positionsLoading,
}: PositionTabContentProps) {
  const symbol = 'SOL'
  return (
    <div className="pb-2">
      <div className="grid grid-cols-6 gap-2 px-2 py-2">
        <div className="text-primary">Position</div>
        <div className="text-primary">Value</div>
        <div className="text-primary">Entry/Mark</div>
        <div className="text-primary">Liq</div>
        <div className="text-primary">Size</div>
        <div className="text-primary">Collateral</div>
      </div>

      <div className="h-[250px] overflow-auto space-y-2">
        {perpsPositionsInfo.length ? (
          <>
            {perpsPositionsInfo.map((position, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-2 grid grid-cols-6 gap-2 items-center">
                    <div>
                      <p className="text-md">
                        {symbol}({position.side.toUpperCase()})
                      </p>
                      <p className="text-sm">
                        {position.leverage}
                        {'x '}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm">{position.value}</p>
                    </div>

                    <div>
                      <p className="text-sm">${position.entryPrice}</p>
                      <p className="text-sm">${position.markPrice}</p>
                    </div>

                    <p className="text-sm">${position.liquidationPrice}</p>

                    <div>
                      <p className="text-sm">${position.size}</p>
                      <p className="text-sm">
                        {(
                          Number(position.sizeTokenAmount) / Math.pow(10, 9)
                        ).toFixed(4)}{' '}
                        {symbol}
                      </p>
                    </div>

                    <p className="text-sm">${position.collateral}</p>
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
