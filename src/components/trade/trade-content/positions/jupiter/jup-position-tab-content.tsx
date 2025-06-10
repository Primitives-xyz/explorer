import {
  Position,
  TPSLRequest,
} from '@/components/tapestry/models/jupiter.models'
import {
  SOL_IMG_URI,
  USDC_IMG_URI,
} from '@/components/trade/constants/constants'
import { useDeleteTPSL } from '@/components/trade/hooks/jup-perps/use-delete-tpsl'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Separator,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import { Edit3 } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'
import PositionCloseModal from './position-close-modal'
import TPSLModal from './tpsl-modal'
import EditTPSLModal from './edit-tpsl-modal'

interface PositionTabContentProps {
  perpsPositionsInfo: Position[]
  positionsLoading: boolean
}

// const perpsPositionsInfoTest: Position[] = [
//   {
//     borrowFees: '757',
//     borrowFeesUsd: '0.00',
//     closeFees: '344090',
//     closeFeesUsd: '0.34',
//     collateral: '9.56',
//     collateralUsd: '9560456',
//     collateralMint: 'So11111111111111111111111111111111111111112',
//     createdTime: 1749205155,
//     entryPrice: '148.69',
//     leverage: '59.98',
//     liquidationPrice: '146.61',
//     marketMint: 'So11111111111111111111111111111111111111112',
//     markPrice: '148.80',
//     openFees: '344090',
//     openFeesUsd: '0.34',
//     pnlAfterFees: '-230039',
//     pnlAfterFeesUsd: '-0.23',
//     pnlBeforeFees: '458898',
//     pnlBeforeFeesUsd: '0.46',
//     pnlChangePctAfterFees: '-2.41',
//     pnlChangePctBeforeFees: '4.80',
//     positionPubkey: '9crjGdPPNjuWkWkhstBFh1a811p6zvSJja7xauGQhwF6',
//     side: 'long',
//     size: '573.48',
//     sizeUsdDelta: '573483695',
//     sizeTokenAmount: '3857038000',
//     totalFees: '688937',
//     totalFeesUsd: '0.69',
//     tpslRequests: [
//       {
//         collateralUsdDelta: '0',
//         desiredMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
//         entirePosition: false,
//         positionRequestPubkey: '82kX9afgQ8iVZJYHmX32JSwuzwHyGL5VwgECn57Y8zFn',
//         positionSizeUsd: '573483695',
//         positionSizeUsdFormatted: '573.48',
//         sizeUsd: '573483695',
//         sizeUsdFormatted: '573.48',
//         sizePercentage: '100.00',
//         triggerPrice: '151000000',
//         triggerPriceUsd: '151.00',
//         openTime: '1749205304',
//         requestType: 'tp',
//       },
//       {
//         collateralUsdDelta: '0',
//         desiredMint: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
//         entirePosition: false,
//         positionRequestPubkey: 'HTrnZvEYvPi4mvqaWp54KW8gyZebuwzMCkdZLWf8dEKm',
//         positionSizeUsd: '573483695',
//         positionSizeUsdFormatted: '573.48',
//         sizeUsd: '573483695',
//         sizeUsdFormatted: '573.48',
//         sizePercentage: '100.00',
//         triggerPrice: '148500000',
//         triggerPriceUsd: '148.50',
//         openTime: '1749205304',
//         requestType: 'sl',
//       },
//     ],
//     updatedTime: 1749205155,
//     value: '9.67',
//   },
// ]

export default function JupPositionTabContent({
  perpsPositionsInfo,
  positionsLoading,
}: PositionTabContentProps) {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [isCloseModalOpen, setIsCloseModalOpen] = useState<boolean>(false)
  const [isEditTPSLModalOpen, setIsEditTPSLModalOpen] = useState<boolean>(false)
  const [editTPSLRequest, setEditTPSLRequest] = useState<TPSLRequest | null>(
    null
  )
  const [size, setSize] = useState<string>('')
  const [positionPubkey, setPositionPubkey] = useState<string>('')
  const {
    deleteTPSL,
    isLoading: isDeleteTPSLLoading,
    error: deleteTPSLError,
  } = useDeleteTPSL()
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

  const handleEditTPSL = (request: TPSLRequest) => {
    setIsEditTPSLModalOpen(true)
    setEditTPSLRequest(request)
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
                        <span className="text-center">TP/SL</span>
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

                    {position.tpslRequests.length > 0 && (
                      <>
                        <Card>
                          <CardContent className="px-2 py-2 space-y-2">
                            <span className="text-sm text-primary">
                              Full TP/SL
                            </span>

                            {position.tpslRequests.filter(
                              (request) => request.entirePosition
                            ).length > 0 ? (
                              <>
                                {position.tpslRequests
                                  .filter((request) => request.entirePosition)
                                  .map((request, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div>
                                            <div className="text-sm">
                                              {request.requestType === 'tp'
                                                ? 'Take Profit'
                                                : 'Stop Loss'}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                              <Image
                                                src={
                                                  request.desiredMint ===
                                                  'So11111111111111111111111111111111111111112'
                                                    ? SOL_IMG_URI
                                                    : USDC_IMG_URI
                                                }
                                                alt="SOL"
                                                width={20}
                                                height={20}
                                                className="rounded-full"
                                              />
                                              <span className="text-sm">
                                                {request.desiredMint ===
                                                'So11111111111111111111111111111111111111112'
                                                  ? 'SOL'
                                                  : 'USDC'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <span
                                            className={cn(
                                              'text-sm',
                                              request.requestType === 'tp' &&
                                                'text-primary',
                                              request.requestType === 'sl' &&
                                                'text-red-400'
                                            )}
                                          >
                                            ${request.triggerPriceUsd}
                                          </span>

                                          <Button
                                            variant={ButtonVariant.GHOST}
                                            className="text-gray-400 hover:text-white transition-colors text-xs p-1 h-6"
                                            onClick={() =>
                                              handleEditTPSL(request)
                                            }
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </Button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <span className="text-sm">
                                            {request.sizePercentage}%
                                          </span>
                                          <Button
                                            variant={ButtonVariant.OUTLINE}
                                            className="text-xs p-1 h-6"
                                            disabled={isDeleteTPSLLoading}
                                          >
                                            {isDeleteTPSLLoading
                                              ? 'Cancelling...'
                                              : 'Cancel'}
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </>
                            ) : (
                              <div className="w-full flex justify-center items-center">
                                <span className="text-sm">-</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>

                        <Card>
                          <CardContent className="px-2 py-2 space-y-2">
                            <span className="text-sm text-primary">
                              Partial TP/SL
                            </span>

                            {position.tpslRequests.filter(
                              (request) => !request.entirePosition
                            ).length > 0 ? (
                              <>
                                {position.tpslRequests
                                  .filter((request) => !request.entirePosition)
                                  .map((request, index) => {
                                    return (
                                      <div
                                        key={index}
                                        className="flex justify-between items-center"
                                      >
                                        <div className="flex items-center gap-2">
                                          <div>
                                            <div className="text-sm">
                                              {request.requestType === 'tp'
                                                ? 'Take Profit'
                                                : 'Stop Loss'}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs">
                                              <Image
                                                src={
                                                  request.desiredMint ===
                                                  'So11111111111111111111111111111111111111112'
                                                    ? SOL_IMG_URI
                                                    : USDC_IMG_URI
                                                }
                                                alt="SOL"
                                                width={20}
                                                height={20}
                                                className="rounded-full"
                                              />
                                              <span className="text-sm">
                                                {request.desiredMint ===
                                                'So11111111111111111111111111111111111111112'
                                                  ? 'SOL'
                                                  : 'USDC'}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="flex items-center gap-1">
                                          <span
                                            className={cn(
                                              'text-sm',
                                              request.requestType === 'tp' &&
                                                'text-primary',
                                              request.requestType === 'sl' &&
                                                'text-red-400'
                                            )}
                                          >
                                            ${request.triggerPriceUsd}
                                          </span>

                                          <Button
                                            variant={ButtonVariant.GHOST}
                                            className="text-gray-400 hover:text-white transition-colors text-xs p-1 h-6"
                                            onClick={() =>
                                              handleEditTPSL(request)
                                            }
                                          >
                                            <Edit3 className="w-3 h-3" />
                                          </Button>
                                        </div>

                                        <div className="flex items-center gap-3">
                                          <div className="flex flex-col gap-1">
                                            <span className="text-sm">
                                              {request.sizePercentage}%
                                            </span>
                                            <span className="text-sm">
                                              ${request.sizeUsdFormatted}
                                            </span>
                                          </div>

                                          <Button
                                            variant={ButtonVariant.OUTLINE}
                                            className="text-xs p-1 h-full"
                                            onClick={() =>
                                              deleteTPSL(
                                                request.positionRequestPubkey
                                              )
                                            }
                                            disabled={isDeleteTPSLLoading}
                                          >
                                            {isDeleteTPSLLoading
                                              ? 'Cancelling...'
                                              : 'Cancel'}
                                          </Button>
                                        </div>
                                      </div>
                                    )
                                  })}
                              </>
                            ) : (
                              <div className="w-full flex justify-center items-center">
                                <span className="text-sm">-</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </>
                    )}
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
        {isEditTPSLModalOpen && (
          <EditTPSLModal
            setIsModalOpen={setIsEditTPSLModalOpen}
            editTPSLRequest={editTPSLRequest}
          />
        )}
      </div>
    </div>
  )
}
