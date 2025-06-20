import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
  Spinner,
} from '@/components/ui'
import { SSE_TOKEN_DECIMAL } from '@/utils/constants'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { useStakeInfo } from '../hooks/use-stake-info'
import { useUnstake } from '../hooks/use-unstake'

interface Props {
  initialAmount?: string
}

export function UnstakeForm({ initialAmount = '' }: Props) {
  const t = useTranslations()
  const [displayAmount, setDisplayAmount] = useState(initialAmount)
  const [inputError, setInputError] = useState<string | null>(null)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null
  )
  const { isLoggedIn, sdkHasLoaded, setShowAuthFlow } = useCurrentWallet()
  const { stakeAmount, showUserInfoLoading } = useStakeInfo({})
  const { unstake, isLoading: showUnstakeLoading } = useUnstake()

  // Format the stake amount to match how it's displayed in stake form
  const formattedStakeAmount = formatSmartNumber(stakeAmount, {
    compact: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    withComma: true,
  })

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

    // Check if the value exceeds the staked amount
    if (stakeAmount && numericValue > Number(stakeAmount)) {
      setInputError(t('stake.form.errors.exceeds_staked_balance'))
      return false
    }

    setInputError(null)
    return true
  }

  // Helper function to format amount with proper decimals
  const formatAmount = (amount: number, decimals: number): string => {
    return amount.toFixed(decimals).replace(/\.?0+$/, '')
  }

  // Handle percentage buttons
  const handleQuarterAmount = () => {
    if (!stakeAmount) return

    try {
      const stakedAmount = Number(stakeAmount)
      const quarterAmount = stakedAmount * 0.25
      const formattedAmount = formatAmount(quarterAmount, SSE_TOKEN_DECIMAL)

      if (validateAmount(formattedAmount)) {
        setDisplayAmount(formattedAmount)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating quarter amount:', err)
    }
  }

  const handleHalfAmount = () => {
    if (!stakeAmount) return

    try {
      const stakedAmount = Number(stakeAmount)
      const halfAmount = stakedAmount * 0.5
      const formattedAmount = formatAmount(halfAmount, SSE_TOKEN_DECIMAL)

      if (validateAmount(formattedAmount)) {
        setDisplayAmount(formattedAmount)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating half amount:', err)
    }
  }

  const handleMaxAmount = () => {
    if (!stakeAmount) return

    try {
      // stakeAmount is already in human-readable format
      if (validateAmount(stakeAmount)) {
        setDisplayAmount(stakeAmount)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error setting max amount:', err)
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

  const handleUnstake = () => {
    if (!displayAmount || Number(displayAmount) <= 0 || inputError) {
      return
    }
    unstake(displayAmount)
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
      <div className="flex flex-col gap-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm font-medium">{t('stake.form.amount')}</p>
          </div>

          {!showUserInfoLoading && stakeAmount && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  {t('stake.form.staked_balance')}: {formattedStakeAmount}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full flex-1"
                  size={ButtonSize.SM}
                  disabled={showUnstakeLoading || !stakeAmount}
                  onClick={handleQuarterAmount}
                >
                  25%
                </Button>

                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full flex-1"
                  size={ButtonSize.SM}
                  onClick={handleHalfAmount}
                  disabled={showUnstakeLoading || !stakeAmount}
                >
                  50%
                </Button>

                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full flex-1"
                  size={ButtonSize.SM}
                  onClick={handleMaxAmount}
                  disabled={showUnstakeLoading || !stakeAmount}
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
          disabled={showUnstakeLoading}
        />

        {inputError && <p className="text-destructive text-sm">{inputError}</p>}
      </div>

      <Button
        className="mt-6 w-full"
        onClick={handleUnstake}
        disabled={showUnstakeLoading || !displayAmount || !!inputError}
      >
        {showUnstakeLoading ? <Spinner /> : t('stake.tabs.unstake')}
      </Button>
    </div>
  )
}
