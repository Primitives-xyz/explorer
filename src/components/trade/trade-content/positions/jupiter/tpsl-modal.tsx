'use client'

import { useEffect, useState } from 'react'

import {
  SOL_IMG_URI,
  USDC_IMG_URI,
} from '@/components/trade/constants/constants'
import { useTPSL } from '@/components/trade/hooks/jup-perps/use-tpsl'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardTitle,
  Input,
  Label,
  Switch,
} from '@/components/ui'
import { SOL_MINT, USDC_MINT } from '@/utils/constants'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'

interface TPSLModalProps {
  setIsModalOpen: (val: boolean) => void
  size: string
  positionPubkey: string
}

const convertPrecision = (price: string) => {
  return (Number(price) * Math.pow(10, 6)).toString() // 6 decimals
}

export default function TPSLModal({
  setIsModalOpen,
  size,
  positionPubkey,
}: TPSLModalProps) {
  const [mode, setMode] = useState<'FULL' | 'PARTIAL'>('FULL')
  const [activeTab, setActiveTab] = useState<'TP' | 'SL'>('TP')
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>('')
  const [stopLossPrice, setStopLossPrice] = useState<string>('')
  const [sizeUsdDelta, setSizeUsdDelta] = useState<string>(size)
  const { walletAddress } = useCurrentWallet()
  const [tpsl, setTpsl] = useState<
    {
      requestType: string
      desiredMint: string
      triggerPrice: string
      sizeUsdDelta: string
      entirePosition: boolean
    }[]
  >([])
  const { isLoading, error, placeTPSL, isTxExecuteLoading, isTxSuccess } =
    useTPSL({
      owner: walletAddress,
      positionPubkey: positionPubkey,
      tpsl: tpsl,
    })
  const [selectedPercentage, setSelectedPercentage] = useState<
    25 | 50 | 75 | 100
  >(100)
  const [selectedTokenForTP, setSelectedTokenForTP] = useState<'SOL' | 'USDC'>(
    'SOL'
  )
  const [selectedTokenForSL, setSelectedTokenForSL] = useState<'SOL' | 'USDC'>(
    'SOL'
  )
  const [receivedToken, setReceivedToken] = useState<'SOL' | 'USDC'>('SOL')
  const [tpPrice, setTpPrice] = useState<string>('')
  const [slPrice, setSlPrice] = useState<string>('')

  const handleSizeUsdDelta = (percentage: 25 | 50 | 75 | 100) => {
    const sizeUsdDelta = (Number(size) / 100) * Number(percentage)
    setSelectedPercentage(percentage)
    setSizeUsdDelta(sizeUsdDelta.toString())
  }

  useEffect(() => {
    if (mode === 'FULL') {
      setTpsl([
        {
          requestType: 'tp',
          desiredMint: selectedTokenForTP === 'SOL' ? SOL_MINT : USDC_MINT,
          triggerPrice: convertPrecision(takeProfitPrice),
          sizeUsdDelta: '0',
          entirePosition: true,
        },
        {
          requestType: 'sl',
          desiredMint: selectedTokenForSL === 'SOL' ? SOL_MINT : USDC_MINT,
          triggerPrice: convertPrecision(stopLossPrice),
          sizeUsdDelta: '0',
          entirePosition: true,
        },
      ])
    } else {
      setTpsl([
        {
          requestType: activeTab === 'TP' ? 'tp' : 'sl',
          desiredMint:
            activeTab === 'TP'
              ? receivedToken === 'SOL'
                ? SOL_MINT
                : USDC_MINT
              : receivedToken === 'SOL'
              ? SOL_MINT
              : USDC_MINT,
          triggerPrice:
            activeTab === 'TP'
              ? convertPrecision(tpPrice)
              : convertPrecision(slPrice),
          sizeUsdDelta: convertPrecision(sizeUsdDelta),
          entirePosition: false,
        },
      ])
    }
  }, [
    mode,
    activeTab,
    takeProfitPrice,
    stopLossPrice,
    sizeUsdDelta,
    selectedTokenForTP,
    selectedTokenForSL,
    tpPrice,
    slPrice,
    receivedToken,
  ])

  useEffect(() => {
    if (isTxSuccess) {
      setIsModalOpen(false)
    }
  }, [isTxSuccess])

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
      <Card className="w-[80%] h-[95%] bg-zinc-800 overflow-y-auto flex justify-center items-center">
        <CardContent className="p-4 space-y-2 flex flex-col justify-between">
          <div className="flex flex-row justify-between items-center">
            <CardTitle className="text-md">
              {mode === 'FULL' ? 'Full TPSL' : 'Partial TPSL'}
            </CardTitle>

            <div className="flex flex-row items-center gap-2">
              <span
                className={`text-sm ${
                  mode === 'FULL' ? 'text-primary' : 'text-white'
                }`}
              >
                FULL
              </span>
              <Switch
                checked={mode === 'PARTIAL'}
                onCheckedChange={() =>
                  setMode(mode === 'PARTIAL' ? 'FULL' : 'PARTIAL')
                }
              />
              <span
                className={`text-sm ${
                  mode === 'PARTIAL' ? 'text-primary' : 'text-white'
                }`}
              >
                PARTIAL
              </span>
            </div>
          </div>

          <p className="text-sm mt-2">
            {mode === 'FULL' ? (
              'Closes the entire position at the target price, even if the position size changes after the TP/SL is set.'
            ) : (
              <div className="flex gap-2">
                <span className="text-sm w-[70%]">
                  Closes only the specified size at the target price, based on
                  the size set when the TP/SL is created.
                </span>

                <Card className="w-[30%]">
                  <CardContent className="p-1 grid grid-cols-2 gap-2">
                    <Button
                      variant={
                        activeTab === 'TP'
                          ? ButtonVariant.DEFAULT
                          : ButtonVariant.GHOST
                      }
                      onClick={() => setActiveTab('TP')}
                    >
                      TP
                    </Button>
                    <Button
                      variant={
                        activeTab === 'SL'
                          ? ButtonVariant.DEFAULT
                          : ButtonVariant.GHOST
                      }
                      onClick={() => setActiveTab('SL')}
                    >
                      SL
                    </Button>
                  </CardContent>
                </Card>
              </div>
            )}
          </p>

          {mode === 'FULL' ? (
            // Full TPSL Mode Content
            <>
              <Card className="space-y-3">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <Label
                      htmlFor="take-profit"
                      className="text-sm font-medium"
                    >
                      Take Profit Price
                    </Label>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          selectedTokenForTP === 'SOL'
                            ? ButtonVariant.OUTLINE
                            : ButtonVariant.GHOST
                        }
                        className="p-1"
                        onClick={() => setSelectedTokenForTP('SOL')}
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
                          selectedTokenForTP === 'USDC'
                            ? ButtonVariant.OUTLINE
                            : ButtonVariant.GHOST
                        }
                        className="p-1"
                        onClick={() => setSelectedTokenForTP('USDC')}
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
                    <Input
                      id="take-profit"
                      type="number"
                      placeholder="0.00"
                      value={takeProfitPrice}
                      onChange={(e) => setTakeProfitPrice(e.target.value)}
                      className="text-right bg-transparent border-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="space-y-3">
                <CardContent className="p-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="stop-loss" className="text-sm font-medium">
                      Stop Loss Price
                    </Label>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          selectedTokenForSL === 'SOL'
                            ? ButtonVariant.OUTLINE
                            : ButtonVariant.GHOST
                        }
                        className="p-1"
                        onClick={() => setSelectedTokenForSL('SOL')}
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
                          selectedTokenForSL === 'USDC'
                            ? ButtonVariant.OUTLINE
                            : ButtonVariant.GHOST
                        }
                        className="p-1"
                        onClick={() => setSelectedTokenForSL('USDC')}
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
                    <Input
                      id="stop-loss"
                      type="number"
                      placeholder="0.00"
                      value={stopLossPrice}
                      onChange={(e) => setStopLossPrice(e.target.value)}
                      className="text-right bg-transparent border-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            // Partial TPSL Mode Content
            <>
              <Card className="space-y-3">
                <CardContent className="p-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label
                      htmlFor={activeTab === 'TP' ? 'tp-price' : 'sl-price'}
                      className="text-sm font-medium"
                    >
                      Receive token
                    </Label>
                    <span className="text-sm">
                      {activeTab === 'TP' ? 'TP Price' : 'SL Price'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant={
                          receivedToken === 'SOL'
                            ? ButtonVariant.OUTLINE
                            : ButtonVariant.GHOST
                        }
                        className="p-1"
                        onClick={() => setReceivedToken('SOL')}
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
                          receivedToken === 'USDC'
                            ? ButtonVariant.OUTLINE
                            : ButtonVariant.GHOST
                        }
                        className="p-1"
                        onClick={() => setReceivedToken('USDC')}
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
                    <Input
                      id={activeTab === 'TP' ? 'tp-price' : 'sl-price'}
                      type="number"
                      placeholder="0.00"
                      value={activeTab === 'TP' ? tpPrice : slPrice}
                      onChange={(e) =>
                        activeTab === 'TP'
                          ? setTpPrice(e.target.value)
                          : setSlPrice(e.target.value)
                      }
                      className="text-right bg-transparent border-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-2 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">Size</span>
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

                  <div className="text-right text-white font-medium">
                    {sizeUsdDelta} USD
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {error && <div className="text-red-500 text-sm">{error}</div>}

          <div className="w-full grid grid-cols-2 gap-3">
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={() => setIsModalOpen(false)}
            >
              Dismiss
            </Button>
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={placeTPSL}
              disabled={isLoading || isTxExecuteLoading}
            >
              {isLoading || isTxExecuteLoading ? 'Placing...' : 'Confirm'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
