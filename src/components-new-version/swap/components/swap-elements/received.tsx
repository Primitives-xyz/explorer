'use client'

import {
  DEFAULT_OUTPUT_TOKEN_IMAGEURI,
  DEFAULT_OUTPUT_TOKEN_SYMBOL,
} from '@/components-new-version/swap/swap.constants'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
} from '@/components-new-version/ui'
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
          <p>Receive</p>
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
          expand
          size={ButtonSize.LG}
          className="flex justify-between px-4"
        >
          <div className="flex items-center gap-3">
            <div>
              <Image
                src={
                  outputTokenImageUri
                    ? outputTokenImageUri
                    : DEFAULT_OUTPUT_TOKEN_IMAGEURI
                }
                alt="ITokeImg"
                width={32}
                height={32}
                className="rounded-full aspect-square object-cover"
              />
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
