'use client'

import { DEFAULT_OUTPUT_TOKEN_SYMBOL } from '@/components/swap/swap.constants'
import { Button, ButtonSize, ButtonVariant, Input } from '@/components/ui'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import { ESwapMode } from '../../swap.models'

interface Props {
  displayOutAmount: string
  displayOutAmountInUsd: string
  outputTokenImageUri?: string
  outputTokenSymbol?: string
  setSwapMode: (mode: ESwapMode) => void
  handleOutAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setShowOutputTokenSearch: (show: boolean) => void
}

export function Receive({
  displayOutAmount,
  displayOutAmountInUsd,
  outputTokenImageUri,
  outputTokenSymbol,
  setSwapMode,
  handleOutAmountChange,
  setShowOutputTokenSearch,
}: Props) {
  return (
    <>
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <p>Buying</p>
        </div>

        <div className="flex justify-between items-center">
          <Input
            placeholder="0.00"
            className="text-primary text-xl bg-transparent border-none placeholder:text-primary"
            type="text"
            onFocus={() => setSwapMode(ESwapMode.EXACT_OUT)}
            onChange={(e) => handleOutAmountChange(e)}
            value={displayOutAmount}
          />

          <p className="text-xs text-muted">{displayOutAmountInUsd}</p>
        </div>

        <Button
          variant={ButtonVariant.OUTLINE_WHITE}
          onClick={() => setShowOutputTokenSearch(true)}
          size={ButtonSize.LG}
          className="flex justify-between px-4 w-full"
        >
          <div className="flex items-center gap-3">
            <div>
              {outputTokenImageUri ? (
                <Image
                  src={outputTokenImageUri}
                  alt="ITokeImg"
                  width={32}
                  height={32}
                  className="rounded-full aspect-square object-cover"
                />
              ) : (
                <span className="rounded-full h-[32px] w-[32px] bg-background" />
              )}
            </div>

            <span>
              {outputTokenSymbol
                ? outputTokenSymbol
                : DEFAULT_OUTPUT_TOKEN_SYMBOL}
            </span>
          </div>
          <ChevronDown size={32} />
        </Button>
      </div>
    </>
  )
}
