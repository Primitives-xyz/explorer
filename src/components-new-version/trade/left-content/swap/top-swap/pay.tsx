'use client'

import { TokenBalance } from '@/components-new-version/common/left-side-menu/balance'
import { SwapMode } from '@/components-new-version/trade/left-content/swap/swap'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
} from '@/components-new-version/ui'
import { ChevronDown } from 'lucide-react'
import Image from 'next/image'
import {
  DEFAULT_INPUT_TOKEN_IMAGEURI,
  DEFAULT_INPUT_TOKEN_SYMBOL,
} from '../constants'

interface Props {
  walletAddress: string
  inputTokenMint: string
  displayInAmount: string
  displayInAmountInUsd: string
  inputTokenImageUri?: string
  inputTokenSymbol?: string
  setSwapMode: (mode: SwapMode) => void
  handleInAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  setShowInputTokenSearch: (show: boolean) => void
  handleInputAmountByPercentage: (percent: number) => void
}

export function Pay({
  walletAddress,
  inputTokenMint,
  displayInAmount,
  displayInAmountInUsd,
  inputTokenImageUri,
  inputTokenSymbol,
  setSwapMode,
  handleInAmountChange,
  setShowInputTokenSearch,
  handleInputAmountByPercentage,
}: Props) {
  const percentageButtons = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: 'max', value: 100 },
  ]

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <p>Pay</p>
        <p className="text-xs text-muted">
          Balance:{' '}
          <TokenBalance
            walletAddress={walletAddress}
            tokenMint={inputTokenMint}
          />
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Input
          placeholder="0.00"
          className="text-primary text-3xl bg-transparent border-none placeholder:text-primary"
          type="text"
          onFocus={() => setSwapMode(SwapMode.EXACT_IN)}
          onChange={(e) => handleInAmountChange(e)}
          value={displayInAmount}
        />
        <p className="text-xs text-muted">{displayInAmountInUsd}</p>
      </div>

      <Button
        variant={ButtonVariant.OUTLINE_WHITE}
        expand
        onClick={() => setShowInputTokenSearch(true)}
        size={ButtonSize.LG}
        className="flex justify-between px-4"
      >
        <div className="flex items-center gap-3">
          <div>
            <Image
              src={
                inputTokenImageUri
                  ? inputTokenImageUri
                  : DEFAULT_INPUT_TOKEN_IMAGEURI
              }
              alt="ITokeImg"
              width={32}
              height={32}
              className="rounded-full aspect-square object-cover"
            />
          </div>
          <span>
            {inputTokenSymbol ? inputTokenSymbol : DEFAULT_INPUT_TOKEN_SYMBOL}
          </span>
        </div>
        <ChevronDown size={32} />
      </Button>

      <div className="flex items-center justify-end space-x-2">
        {percentageButtons.map(({ label, value }) => (
          <Button
            key={value}
            variant={ButtonVariant.OUTLINE}
            className="rounded-full"
            size={ButtonSize.SM}
            onClick={() => handleInputAmountByPercentage(value)}
          >
            {label}
          </Button>
        ))}
      </div>
    </div>
  )
}
