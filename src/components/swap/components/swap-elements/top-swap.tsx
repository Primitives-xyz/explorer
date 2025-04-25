'use client'

import { Pay } from '@/components/swap/components/swap-elements/pay'
import { Receive } from '@/components/swap/components/swap-elements/received'
import { Card, CardContent } from '@/components/ui/card'
import { motion } from 'framer-motion'
import { ArrowDownUp } from 'lucide-react'
import { ESwapMode } from '../../swap.models'

interface Props {
  walletAddress: string
  inputTokenMint: string
  outputTokenMint: string
  displayInAmount: string
  displayInAmountInUsd: string
  inputTokenImageUri?: string
  inputTokenSymbol?: string
  displayOutAmount: string
  displayOutAmountInUsd: string
  outputTokenImageUri?: string
  outputTokenSymbol?: string
  setSwapMode: (mode: ESwapMode) => void
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
  outputTokenMint,
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
    <div className="relative">
      <motion.div
        className="absolute inset-0 rounded-card z-0 overflow-hidden blur-md"
        animate={{
          boxShadow: [
            '0 0 5px 3px rgba(57, 255, 20, 0.1)',
            '0 0 10px 5px rgba(57, 255, 20, 0.15)',
            '0 0 5px 3px rgba(57, 255, 20, 0.1)',
          ],
          backgroundColor: [
            'rgba(57, 255, 20, 0.1)',
            'rgba(57, 255, 20, 0.03)',
            'rgba(57, 255, 20, 0.1)',
          ],
        }}
        transition={{
          duration: 3,
          ease: 'easeInOut',
          repeat: Infinity,
          repeatType: 'reverse',
        }}
      />
      <Card className="border-primary/30">
        <CardContent className="p-4">
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
            outputTokenMint={outputTokenMint}
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
    </div>
  )
}
