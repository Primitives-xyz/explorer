'use client'

import { SwapMode } from '@/components-new-version/swap/components/swap'
import { Pay } from '@/components-new-version/swap/components/swap-elements/pay'
import { Receive } from '@/components-new-version/swap/components/swap-elements/received'
import { Card, CardContent } from '@/components-new-version/ui/card'
import { ArrowDownUp } from 'lucide-react'

interface Props {
  walletAddress: string
  inputTokenMint: string
  displayInAmount: string
  displayInAmountInUsd: string
  inputTokenImageUri?: string
  inputTokenSymbol?: string
  displayOutAmount: string
  displayOutAmountInUsd: string
  outputTokenImageUri?: string
  outputTokenSymbol?: string
  setSwapMode: (mode: SwapMode) => void
  handleInAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setShowInputTokenSearch: (show: boolean) => void
  handleInputAmountByPercentage: (percent: number) => void
  handleOutAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setShowOutputTokenSearch: (show: boolean) => void
  handleSwapDirection: () => void
}

export function TopSwap({
  walletAddress,
  inputTokenMint,
  displayInAmount,
  displayInAmountInUsd,
  inputTokenImageUri,
  inputTokenSymbol,
  displayOutAmount,
  displayOutAmountInUsd,
  outputTokenImageUri,
  outputTokenSymbol,
  handleSwapDirection,
  setSwapMode,
  handleInAmountChange,
  setShowInputTokenSearch,
  handleInputAmountByPercentage,
  handleOutAmountChange,
  setShowOutputTokenSearch,
}: Props) {
  return (
    <Card>
      <CardContent>
        <Pay
          walletAddress={walletAddress}
          inputTokenMint={inputTokenMint}
          setSwapMode={setSwapMode}
          handleInAmountChange={handleInAmountChange}
          displayInAmount={displayInAmount}
          displayInAmountInUsd={displayInAmountInUsd}
          setShowInputTokenSearch={setShowInputTokenSearch}
          inputTokenImageUri={inputTokenImageUri}
          inputTokenSymbol={inputTokenSymbol}
          handleInputAmountByPercentage={handleInputAmountByPercentage}
        />

        <div className="flex items-center w-full justify-between text-muted space-x-2">
          <div className="bg-muted w-full h-[1px]" />
          <ArrowDownUp
            size={40}
            className="cursor-pointer"
            onClick={handleSwapDirection}
          />
          <div className="bg-muted w-full h-[1px]" />
        </div>

        <Receive
          setSwapMode={setSwapMode}
          handleOutAmountChange={handleOutAmountChange}
          displayOutAmount={displayOutAmount}
          displayOutAmountInUsd={displayOutAmountInUsd}
          setShowOutputTokenSearch={setShowOutputTokenSearch}
          outputTokenImageUri={outputTokenImageUri}
          outputTokenSymbol={outputTokenSymbol}
        />
      </CardContent>
    </Card>
  )
}
