'use client'

import { TokenBalance } from '@/components/common/left-side-menu/balance'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { DEFAULT_INPUT_TOKEN_SYMBOL } from '@/components/swap/swap.constants'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { Button, ButtonSize, ButtonVariant, Input } from '@/components/ui'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { formatUsdValue } from '@/utils/utils'
import { ChevronDownIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { ESwapMode } from '../../swap.models'

interface Props {
  walletAddress: string
  autoFocus?: boolean
  setShowInputTokenSearch: (show: boolean) => void
  handleInputAmountByPercentage: (percent: number) => void
  notEnoughInput?: boolean
}

export function Pay({
  walletAddress,
  autoFocus = true,
  setShowInputTokenSearch,
  handleInputAmountByPercentage,
  notEnoughInput,
}: Props) {
  const t = useTranslations()
  const {
    inputs: { inputMint },
    inAmount,
    setSwapMode,
    setInAmount,
  } = useSwapStore()

  const {
    symbol: inputTokenSymbol,
    image: inputTokenImageUri,
    decimals: inputTokenDecimals,
  } = useTokenInfo(inputMint)
  const { price: inputTokenUsdPrice } = useTokenUSDCPrice({
    tokenMint: inputMint,
    decimals: inputTokenDecimals,
  })

  const displayInAmount = inAmount
  const displayInAmountInUsd = inputTokenUsdPrice
    ? formatUsdValue(parseFloat(inAmount) * inputTokenUsdPrice)
    : '...'

  const handleInAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setInAmount(val)
      window.setTimeout(() => {
        if (e.target) {
          e.target.focus()
          e.target.setSelectionRange(cursorPosition, cursorPosition)
        }
      }, 0)
    }
  }

  const percentageButtons = [
    { label: '25%', value: 25 },
    { label: '50%', value: 50 },
    { label: t('common.max'), value: 100 },
  ]

  return (
    <div>
      <div className="flex justify-between items-center">
        <p>{t('swap.input.pay')}</p>
        <p className="text-xs text-muted-foreground">
          {t('swap.input.balance_label')}{' '}
          <TokenBalance walletAddress={walletAddress} tokenMint={inputMint} />
        </p>
      </div>

      <div className="flex justify-between items-center">
        <Input
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          className="text-primary placeholder:text-primary text-xl bg-transparent border-none px-0"
          onFocus={() => setSwapMode(ESwapMode.EXACT_IN)}
          onChange={handleInAmountChange}
          value={displayInAmount}
          autoFocus={autoFocus}
        />
        <p className="text-xs text-muted-foreground">{displayInAmountInUsd}</p>
      </div>

      <Button
        variant={ButtonVariant.BADGE_WHITE}
        onClick={() => setShowInputTokenSearch(true)}
        size={ButtonSize.LG}
        className="flex justify-between px-4 w-full"
      >
        <div className="flex items-center gap-3">
          <div>
            {inputTokenImageUri ? (
              <ValidatedImage
                src={inputTokenImageUri}
                alt={`${inputTokenSymbol || t('swap.token.select')} logo`}
                width={32}
                height={32}
                className="rounded-full aspect-square object-cover max-w-[32px] max-h-[32px]"
              />
            ) : (
              <span className="rounded-full h-[32px] w-[32px] bg-background" />
            )}
          </div>
          <span>
            {inputTokenSymbol ? inputTokenSymbol : DEFAULT_INPUT_TOKEN_SYMBOL}
          </span>
        </div>
        <ChevronDownIcon />
      </Button>
      <div className="flex items-center justify-end space-x-2 mt-2">
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
