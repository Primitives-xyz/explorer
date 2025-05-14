'use client'

import { TokenHolders } from '@/components/common/token-holders'
import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { DEFAULT_OUTPUT_TOKEN_SYMBOL } from '@/components/swap/swap.constants'
import { useGetProfilesOwnSpecificToken } from '@/components/tapestry/hooks/use-get-profiles-own-specific-token'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { useTokenUSDCPrice } from '@/components/token/hooks/use-token-usdc-price'
import { Button, ButtonSize, ButtonVariant, Input } from '@/components/ui'
import { ValidatedImage } from '@/components/ui/validated-image/validated-image'
import { formatUsdValue } from '@/utils/utils'
import { ChevronDownIcon } from 'lucide-react'
import { ESwapMode } from '../../swap.models'

interface Props {
  setShowOutputTokenSearch: (show: boolean) => void
}

export function Receive({ setShowOutputTokenSearch }: Props) {
  const {
    inputs: { outputMint },
    outAmount,
    setSwapMode,
    setOutAmount,
  } = useSwapStore()

  const {
    symbol: outputTokenSymbol,
    image: outputTokenImageUri,
    decimals: outputTokenDecimals,
  } = useTokenInfo(outputMint)
  const { price: outputTokenUsdPrice } = useTokenUSDCPrice({
    tokenMint: outputMint,
    decimals: outputTokenDecimals,
  })

  const displayOutAmount = outAmount
  const displayOutAmountInUsd = outputTokenUsdPrice
    ? formatUsdValue(parseFloat(outAmount) * outputTokenUsdPrice)
    : '...'

  const { data: tokenHolders } = useGetProfilesOwnSpecificToken({
    tokenAddress: outputMint,
  })

  const handleOutAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      const cursorPosition = e.target.selectionStart
      setOutAmount(val)
      window.setTimeout(() => {
        if (e.target) {
          e.target.focus()
          e.target.setSelectionRange(cursorPosition, cursorPosition)
        }
      }, 0)
    }
  }

  return (
    <>
      <div>
        <div className="flex justify-between items-center">
          <p>Buying</p>
        </div>

        <div className="flex justify-between items-center">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            className="text-primary placeholder:text-primary text-xl bg-transparent border-none px-0"
            onFocus={() => setSwapMode(ESwapMode.EXACT_OUT)}
            onChange={handleOutAmountChange}
            value={displayOutAmount}
          />
          <p className="text-xs text-muted-foreground">
            {displayOutAmountInUsd}
          </p>
        </div>

        <Button
          variant={ButtonVariant.BADGE_WHITE}
          onClick={() => setShowOutputTokenSearch(true)}
          size={ButtonSize.LG}
          className="flex justify-between px-4 w-full"
        >
          <div className="flex items-center gap-3">
            <div>
              {outputTokenImageUri ? (
                <ValidatedImage
                  src={outputTokenImageUri}
                  alt={`${outputTokenSymbol || 'Token'} logo`}
                  width={32}
                  height={32}
                  className="rounded-full aspect-square object-cover max-w-[32px] max-h-[32px]"
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
          <ChevronDownIcon />
        </Button>
        {tokenHolders && (
          <div className="mt-3">
            <TokenHolders data={tokenHolders} />
          </div>
        )}
      </div>
    </>
  )
}
