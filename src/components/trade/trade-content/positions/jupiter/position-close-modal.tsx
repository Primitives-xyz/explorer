'use client'

import { cn } from '@/utils/utils'
import { useEffect, useState } from 'react'

import {
  SOL_IMG_URI,
  SOL_MINT,
  USDC_IMG_URI,
  USDC_MINT,
} from '@/components/trade/constants/constants'
import { useDecreasePosition } from '@/components/trade/hooks/jup-perps/use-decrease-position'
import { Button, ButtonVariant, Card, CardContent } from '@/components/ui'
import Image from 'next/image'

interface TPSLModalProps {
  setIsModalOpen: (val: boolean) => void
  size: string
  positionPubkey: string
}

const convertPrecision = (price: string) => {
  return (Number(price) * Math.pow(10, 6)).toString() // 6 decimals
}

export default function PositionCloseModal({
  setIsModalOpen,
  size,
  positionPubkey,
}: TPSLModalProps) {
  const [sizeUsdDelta, setSizeUsdDelta] = useState<string>(size)
  const [receiveInToken, setReceiveInToken] = useState<'SOL' | 'USDC'>('SOL')
  const [selectedPercentage, setSelectedPercentage] = useState<
    25 | 50 | 75 | 100
  >(100)

  const {
    quote,
    closePosition,
    isLoading: isDecreasePositionLoading,
    isTxExecuteLoading,
    isTxSuccess,
  } = useDecreasePosition({
    collateralUsdDelta: '0',
    desiredMint: receiveInToken === 'SOL' ? SOL_MINT : USDC_MINT,
    entirePosition: selectedPercentage === 100 ? true : false,
    positionPubkey,
    sizeUsdDelta:
      selectedPercentage === 100 ? '0' : convertPrecision(sizeUsdDelta),
  })

  const handleSizeUsdDelta = (percentage: 25 | 50 | 75 | 100) => {
    const sizeUsdDelta = (Number(size) / 100) * Number(percentage)
    setSelectedPercentage(percentage)
    setSizeUsdDelta(sizeUsdDelta.toString())
  }

  useEffect(() => {
    if (isTxSuccess) {
      setIsModalOpen(false)
    }
  }, [isTxSuccess])

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
      <Card className="w-[80%] h-[95%] bg-zinc-800 overflow-y-auto flex justify-center items-center">
        <CardContent className="p-4 space-y-2 flex flex-col justify-between w-full">
          <Card>
            <CardContent className="p-2 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Close Size</span>
                <div className="flex flex-row items-center gap-2">
                  {[25, 50, 75, 100].map((size) => (
                    <Button
                      key={size}
                      variant={
                        selectedPercentage === size
                          ? ButtonVariant.DEFAULT
                          : ButtonVariant.OUTLINE
                      }
                      className="py-1 rounded-md text-sm px-2 h-fit"
                      onClick={() =>
                        handleSizeUsdDelta(size as 25 | 50 | 75 | 100)
                      }
                    >
                      {size}%
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span
                  className={cn('text-sm', {
                    'text-red-500': Number(quote?.pnlBeforeFeesUsd || 0) < 0,
                    'text-primary': Number(quote?.pnlBeforeFeesUsd || 0) >= 0,
                  })}
                >
                  ${quote ? quote.pnlBeforeFeesUsd : '0'}
                  {`(${quote ? quote.pnlBeforeFeesPercent : '0'}%)`}
                </span>
                <span className="text-sm">{sizeUsdDelta} USD</span>
              </div>
            </CardContent>
          </Card>

          <Card className="space-y-2">
            <CardContent className="p-2 space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium">Receive token</span>
              </div>

              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant={
                      receiveInToken === 'SOL'
                        ? ButtonVariant.OUTLINE
                        : ButtonVariant.GHOST
                    }
                    className="p-1"
                    onClick={() => setReceiveInToken('SOL')}
                  >
                    <Image
                      src={SOL_IMG_URI}
                      alt="SOL"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-sm">SOL</span>
                  </Button>

                  <Button
                    variant={
                      receiveInToken === 'USDC'
                        ? ButtonVariant.OUTLINE
                        : ButtonVariant.GHOST
                    }
                    className="p-1"
                    onClick={() => setReceiveInToken('USDC')}
                  >
                    <Image
                      src={USDC_IMG_URI}
                      alt="USDC"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-sm">USDC</span>
                  </Button>
                </div>

                <span className="text-sm">
                  {quote
                    ? `${
                        receiveInToken === 'SOL'
                          ? (
                              Number(quote.transferAmountToken) /
                              Math.pow(10, 9)
                            )
                              .toFixed(9)
                              .replace(/\.?0+$/, '')
                          : Number(quote.transferAmountUsd)
                              .toFixed(6)
                              .replace(/\.?0+$/, '')
                      } ${receiveInToken}`
                    : '0.00'}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-sm">Size</span>
              <span className="text-sm">Collateral</span>
              <span className="text-sm">Close Fee</span>
              <span className="text-sm">Borrow Fees</span>
              <span className="text-sm">Price Impact</span>
            </div>

            <div className="flex flex-col space-y-1 text-right">
              <span className="text-sm">
                ${size}
                {'->'}
                {quote ? quote.positionSizeUsd : '0'}
              </span>
              <span className="text-sm">
                ${quote ? quote.positionCollateralSizeUsd : '0'}
              </span>
              <span className="text-sm">
                ${quote ? quote.closeFeeUsd : '0'}
              </span>
              <span className="text-sm">
                ${quote ? quote.outstandingBorrowFeeUsd : '0'}
              </span>
              <span className="text-sm">
                ${quote ? quote.priceImpactFeeUsd : '0'}
              </span>
            </div>
          </div>

          <div className="w-full grid grid-cols-2 gap-3">
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={() => setIsModalOpen(false)}
            >
              Dismiss
            </Button>

            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={closePosition}
              disabled={
                isDecreasePositionLoading || isTxExecuteLoading || !quote
              }
            >
              {isTxExecuteLoading ? 'Closing...' : 'Close'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
