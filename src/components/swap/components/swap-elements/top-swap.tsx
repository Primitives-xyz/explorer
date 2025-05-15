'use client'

import { Pay } from '@/components/swap/components/swap-elements/pay'
import { Receive } from '@/components/swap/components/swap-elements/received'
import { Card, CardContent } from '@/components/ui/card'
import { ArrowDownUp } from 'lucide-react'

interface Props {
  walletAddress: string
  autoFocus?: boolean
  handleSwapDirection: () => void
  setShowInputTokenSearch: (show: boolean) => void
  handleInputAmountByPercentage: (percent: number) => void
  setShowOutputTokenSearch: (show: boolean) => void
  notEnoughInput?: boolean
}

export function TopSwap({
  walletAddress,
  autoFocus,
  handleSwapDirection,
  setShowInputTokenSearch,
  handleInputAmountByPercentage,
  setShowOutputTokenSearch,
  notEnoughInput,
}: Props) {
  return (
    <Card className="border-glow-animation">
      <CardContent className="p-4">
        <Pay
          walletAddress={walletAddress}
          setShowInputTokenSearch={setShowInputTokenSearch}
          handleInputAmountByPercentage={handleInputAmountByPercentage}
          autoFocus={autoFocus}
          notEnoughInput={notEnoughInput}
        />

        <div className="flex items-center w-full justify-between text-muted space-x-2">
          <div className="bg-muted w-full h-[1px]" />
          <ArrowDownUp
            size={40}
            className="cursor-pointer text-primary"
            onClick={handleSwapDirection}
          />
          <div className="bg-muted w-full h-[1px]" />
        </div>

        <Receive setShowOutputTokenSearch={setShowOutputTokenSearch} />
      </CardContent>
    </Card>
  )
}
