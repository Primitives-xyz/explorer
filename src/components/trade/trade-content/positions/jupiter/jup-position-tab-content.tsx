import { Position } from '@/components/trade/hooks/jup-perps/use-positions'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Separator,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import { useState } from 'react'
import PositionCloseModal from './position-close-modal'
import TPSLModal from './tpsl-modal'

interface PositionTabContentProps {
  perpsPositionsInfo: Position[]
  positionsLoading: boolean
}

export default function JupPositionTabContent({
  perpsPositionsInfo,
  positionsLoading,
}: PositionTabContentProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false)
  const [size, setSize] = useState<string>('')
  const [positionPubkey, setPositionPubkey] = useState<string>('')
  const symbol = 'SOL'

  const handleAddTPAndSL = (size: string, positionPubkey: string) => {
    setIsModalOpen(true)
    setSize(size)
    setPositionPubkey(positionPubkey)
  }

  const handleClosePosition = (size: string, positionPubkey: string) => {
    setIsCloseModalOpen(true)
    setSize(size)
    setPositionPubkey(positionPubkey)
  }

  return (
    <div className="pb-2">
      <div className="h-[285px] overflow-auto space-y-2">
        {perpsPositionsInfo.length ? (
          <>
            {perpsPositionsInfo.map((position, index) => {
              return (
                <Card variant={CardVariant.ACCENT_SOCIAL} key={index}>
                  <CardContent className="px-2 py-2 space-y-2">
                    <div className="flex flex-row items-center gap-2">
                      <p className="text-md">{symbol}</p>
                      <p className="text-md text-primary">
                        {position.leverage}
                        {'x '}
                        {position.side.toUpperCase()}
                      </p>
                    </div>

                    <Separator className="my-1" />

                    <div className="flex flex-row justify-between gap-2">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-primary">
                          PNL (EX. open/close/borrow fees)
                        </span>
                        <div className="flex flex-row gap-2">
                          <span
                            className={cn(
                              'text-sm',
                              Number(position.pnlBeforeFeesUsd) < 0 &&
                                'text-red-400',
                              Number(position.pnlBeforeFeesUsd) > 0 &&
                                'text-primary'
                            )}
                          >
                            {Number(position.pnlBeforeFeesUsd) < 0 ? '-$' : '$'}
                            {Math.abs(Number(position.pnlBeforeFeesUsd))}
                          </span>
                          <span
                            className={cn(
                              'text-sm',
                              Number(position.pnlChangePctBeforeFees) < 0 &&
                                'text-red-400',
                              Number(position.pnlChangePctBeforeFees) > 0 &&
                                'text-primary'
                            )}
                          >
                            {`(${position.pnlChangePctBeforeFees}%)`}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-1 text-end">
                        <span className="text-sm text-primary">Value</span>
                        <span className="text-sm">${position.value}</span>
                      </div>
                    </div>

                    <Separator className="my-1" />

                    <div className="flex flex-row justify-between gap-2">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-primary">
                          Entry Price
                        </span>
                        <span className="text-sm">${position.entryPrice}</span>
                      </div>

                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-primary">Mark Price</span>
                        <span className="text-sm">${position.markPrice}</span>
                      </div>

                      <div className="flex flex-col space-y-1 text-end">
                        <span className="text-sm text-primary">Liq.Price</span>
                        <span className="text-sm">
                          ${position.liquidationPrice}
                        </span>
                      </div>
                    </div>

                    <Separator className="my-1" />

                    <div className="flex flex-row justify-between gap-2">
                      <div className="flex flex-col space-y-1">
                        <span className="text-sm text-primary">Size</span>
                        <span className="text-sm">${position.size}</span>
                        <span className="text-sm">
                          {Number(position.sizeTokenAmount) / Math.pow(10, 9)}{' '}
                          {symbol}
                        </span>
                      </div>

                      <div className="flex flex-col space-y-1 text-end">
                        <span className="text-sm text-primary">Collateral</span>
                        <span className="text-sm">${position.collateral}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant={ButtonVariant.OUTLINE}
                        onClick={() =>
                          handleAddTPAndSL(
                            position.size,
                            position.positionPubkey
                          )
                        }
                        className="w-full p-1"
                      >
                        <span className="text-center">
                          Take Profit/Stop Loss
                        </span>
                      </Button>

                      <Button
                        variant={ButtonVariant.OUTLINE}
                        onClick={() =>
                          handleClosePosition(
                            position.size,
                            position.positionPubkey
                          )
                        }
                        className="w-full p-1"
                      >
                        <span className="text-center">CLOSE</span>
                      </Button>
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
        {isModalOpen && (
          <TPSLModal
            setIsModalOpen={setIsModalOpen}
            size={size}
            positionPubkey={positionPubkey}
          />
        )}
        {isCloseModalOpen && (
          <PositionCloseModal
            setIsModalOpen={setIsCloseModalOpen}
            size={size}
            positionPubkey={positionPubkey}
          />
        )}
      </div>
    </div>
  )
}
