import { useStake } from '@/components/stake/hooks/use-stake'
import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
  Spinner,
} from '@/components/ui'
import { SSE_MINT, SSE_TOKEN_DECIMAL } from '@/utils/constants'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { formatNumber } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface Props {
  initialAmount?: string
}

export function StakeForm({ initialAmount = '' }: Props) {
  const t = useTranslations()
  const [displayAmount, setDisplayAmount] = useState(initialAmount)
  const [inputError, setInputError] = useState<string | null>(null)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null
  )
  const { isLoggedIn, sdkHasLoaded, walletAddress, setShowAuthFlow } =
    useCurrentWallet()

  // Add token balance hooks for SSE token
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, SSE_MINT)

  // Format the balance to match unstake form
  const formattedBalance = formatSmartNumber(inputBalance, {
    micro: true,
    compact: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  })

  const { stake, isLoading: showStakeLoading } = useStake()

  const validateAmount = (value: string): boolean => {
    if (value === '') return true

    // Check if the value is a valid number
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      setInputError(t('stake.form.errors.invalid_number'))
      return false
    }

    // Check if the value is positive
    if (numericValue <= 0) {
      setInputError(t('stake.form.errors.amount_greater_than_zero'))
      return false
    }

    // Check if the value has too many decimal places
    const decimalParts = value.split('.')
    if (
      decimalParts.length > 1 &&
      decimalParts[1]?.length &&
      decimalParts[1]?.length > SSE_TOKEN_DECIMAL
    ) {
      setInputError(
        t('stake.form.errors.decimal_places', { decimals: SSE_TOKEN_DECIMAL })
      )
      return false
    }

    // Check if the value exceeds the balance
    if (inputRawBalance && numericValue > 0) {
      const rawAmount = BigInt(
        Math.floor(10 ** SSE_TOKEN_DECIMAL * numericValue)
      )
      if (rawAmount > inputRawBalance) {
        setInputError(t('stake.form.errors.exceeds_balance'))
        return false
      }
    }

    setInputError(null)
    return true
  }

  // Helper function to format raw token amounts
  const formatRawAmount = (rawAmount: bigint, decimals: number): string => {
    try {
      if (rawAmount === 0n) return '0'

      const divisor = 10n ** BigInt(decimals)
      const integerPart = rawAmount / divisor
      const fractionPart = rawAmount % divisor

      if (fractionPart === 0n) {
        return integerPart.toString()
      }

      // Convert to string and pad with zeros
      let fractionStr = fractionPart.toString()
      while (fractionStr.length < decimals) {
        fractionStr = '0' + fractionStr
      }

      // Remove trailing zeros
      fractionStr = fractionStr.replace(/0+$/, '')

      return `${integerPart}${fractionStr ? `.${fractionStr}` : ''}`
    } catch (err) {
      console.error('Error formatting amount:', err)
      return '0'
    }
  }

  // Handle percentage amount buttons
  const handleQuarterAmount = () => {
    if (!inputRawBalance) return

    try {
      const quarterAmount = inputRawBalance / 4n
      const formattedAmount = formatRawAmount(quarterAmount, SSE_TOKEN_DECIMAL)

      if (validateAmount(formattedAmount)) {
        setDisplayAmount(formattedAmount)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating quarter amount:', err)
    }
  }

  const handleHalfAmount = () => {
    if (!inputRawBalance) return

    try {
      const halfAmount = inputRawBalance / 2n
      const formattedAmount = formatRawAmount(halfAmount, SSE_TOKEN_DECIMAL)

      if (validateAmount(formattedAmount)) {
        setDisplayAmount(formattedAmount)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating half amount:', err)
    }
  }

  const handleMaxAmount = () => {
    if (!inputRawBalance) return

    try {
      const formattedAmount = formatRawAmount(
        inputRawBalance,
        SSE_TOKEN_DECIMAL
      )

      if (validateAmount(formattedAmount)) {
        setDisplayAmount(formattedAmount)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating max amount:', err)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value

    // Only allow valid number patterns
    if (
      val === '' ||
      val === '.' ||
      /^[0]?\.[0-9]*$/.test(val) ||
      /^[0-9]*\.?[0-9]*$/.test(val)
    ) {
      setDisplayAmount(val)
      if (debouncedUpdate) clearTimeout(debouncedUpdate)

      const timeout = setTimeout(() => {
        validateAmount(val)
      }, 500)

      setDebouncedUpdate(timeout)
    }
  }

  const handleStake = () => {
    if (!displayAmount || Number(displayAmount) <= 0 || inputError) {
      return
    }
    stake(displayAmount)
  }

  if (!sdkHasLoaded) {
    return (
      <Button variant={ButtonVariant.OUTLINE} className="w-full">
        <Spinner />
        <p>{t('stake.transaction.checking_wallet')}</p>
      </Button>
    )
  }

  if (!isLoggedIn) {
    return (
      <Button
        variant={ButtonVariant.OUTLINE}
        className="w-full"
        onClick={() => setShowAuthFlow(true)}
      >
        {t('common.connect_wallet')}
      </Button>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start md:items-center">
          <p>{t('stake.form.amount')}</p>
          {!inputBalanceLoading && inputBalance && (
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
              <p className="text-muted-foreground text-xs">
                {t('stake.form.balance')}: {formatNumber(inputBalance)}
              </p>
              <div className="flex items-center justify-end space-x-2">
                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full"
                  size={ButtonSize.SM}
                  disabled={showStakeLoading || !inputBalance}
                  onClick={handleQuarterAmount}
                >
                  25%
                </Button>

                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full"
                  size={ButtonSize.SM}
                  onClick={handleHalfAmount}
                  disabled={showStakeLoading || !inputBalance}
                >
                  50%
                </Button>

                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full"
                  size={ButtonSize.SM}
                  onClick={handleMaxAmount}
                  disabled={showStakeLoading || !inputBalance}
                >
                  {t('stake.form.max')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Input
          type="text"
          value={displayAmount}
          onChange={handleInputChange}
          placeholder="0.00"
          disabled={showStakeLoading}
        />

        {inputError && <p className="text-destructive">{inputError}</p>}
      </div>

      <Button
        className="mt-4 w-full"
        onClick={handleStake}
        disabled={showStakeLoading || !displayAmount || !!inputError}
      >
        {showStakeLoading ? <Spinner /> : t('stake.tabs.stake')}
      </Button>
    </div>
  )
}
