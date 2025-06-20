'use client'

import { TPSLRequest } from '@/components/tapestry/models/jupiter.models'
import {
  SOL_IMG_URI,
  USDC_IMG_URI,
} from '@/components/trade/constants/constants'
import { useEditTPSL } from '@/components/trade/hooks/jup-perps/use-edit-tpsl'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  Input,
  Label,
} from '@/components/ui'
import { SOL_MINT } from '@/utils/constants'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface TPSLModalProps {
  setIsModalOpen: (val: boolean) => void
  editTPSLRequest: TPSLRequest | null
}

const convertPrecision = (price: string) => {
  return (Number(price) * Math.pow(10, 6)).toString() // 6 decimals
}

export default function EditTPSLModal({
  setIsModalOpen,
  editTPSLRequest,
}: TPSLModalProps) {
  const [triggerPrice, setTriggerPrice] = useState<string>('')
  const { editTPSL, isLoading, isTxExecuteLoading, isTxSuccess } = useEditTPSL({
    positionRequestPubkey: editTPSLRequest?.positionRequestPubkey || '',
    triggerPrice: convertPrecision(triggerPrice),
  })

  const handleEditTPSL = async () => {
    await editTPSL()
  }

  useEffect(() => {
    if (isTxSuccess) {
      setIsModalOpen(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTxSuccess])

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
      <Card className="w-[80%] h-fit bg-zinc-800 overflow-y-auto">
        <CardContent className="p-4 space-y-2">
          <Button variant={ButtonVariant.OUTLINE} className="w-fit">
            {editTPSLRequest?.requestType.toUpperCase()}
          </Button>

          <Card className="space-y-3">
            <CardContent className="p-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="trigger-price" className="text-sm font-medium">
                  Receive token
                </Label>
              </div>

              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button variant={ButtonVariant.OUTLINE} className="p-1">
                    <Image
                      src={
                        editTPSLRequest?.desiredMint === SOL_MINT
                          ? SOL_IMG_URI
                          : USDC_IMG_URI
                      }
                      alt="SOL"
                      width={20}
                      height={20}
                      className="rounded-full"
                    />
                    <span className="text-sm">
                      {editTPSLRequest?.desiredMint === SOL_MINT
                        ? 'SOL'
                        : 'USDC'}
                    </span>
                  </Button>
                </div>
                <Input
                  id="trigger-price"
                  type="number"
                  placeholder="0.00"
                  value={triggerPrice}
                  onChange={(e) => setTriggerPrice(e.target.value)}
                  className="text-right bg-transparent border-none"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="space-y-3">
            <CardContent className="p-2">
              <div className="grid grid-cols-2 gap-2">
                <span className="text-sm">Size</span>
                <span className="text-sm text-right">
                  {editTPSLRequest?.sizeUsdFormatted}
                </span>
              </div>
            </CardContent>
          </Card>

          <div className="w-full grid grid-cols-2 gap-3">
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={() => setIsModalOpen(false)}
            >
              Dismiss
            </Button>
            <Button
              variant={ButtonVariant.OUTLINE}
              onClick={handleEditTPSL}
              disabled={isLoading || isTxExecuteLoading}
            >
              {isTxExecuteLoading ? 'Executing...' : 'Confirm'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
