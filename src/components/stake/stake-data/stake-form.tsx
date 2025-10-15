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
import { formatRawAmount } from '@/utils/utils'
import { Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface Props {
  initialAmount?: string
  isStakingEnabled: boolean
}

export function StakeForm({
  initialAmount = '',
  isStakingEnabled,
}: Props) {
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
    compact: true,
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
    withComma: true,
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

  // Handle percentage amount buttons
  const handleQuarterAmount = () => {
    if (!inputRawBalance) return

    try {
      const quarterAmount = inputRawBalance / 4n
      const formattedAmount = formatRawAmount(
        quarterAmount,
        BigInt(SSE_TOKEN_DECIMAL)
      )

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
      const formattedAmount = formatRawAmount(
        halfAmount,
        BigInt(SSE_TOKEN_DECIMAL)
      )

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
        BigInt(SSE_TOKEN_DECIMAL)
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
        <Wallet className="h-4 w-4 mr-2" />
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

          {!inputBalanceLoading && inputBalance && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-muted-foreground text-xs">
                  {t('stake.form.balance')}: {formattedBalance} SSE
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full flex-1"
                  size={ButtonSize.SM}
                  disabled={showStakeLoading || !inputBalance}
                  onClick={handleQuarterAmount}
                >
                  25%
                </Button>

                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full flex-1"
                  size={ButtonSize.SM}
                  onClick={handleHalfAmount}
                  disabled={showStakeLoading || !inputBalance}
                >
                  50%
                </Button>

                <Button
                  variant={ButtonVariant.OUTLINE}
                  className="rounded-full flex-1"
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

        {inputError && <p className="text-destructive text-sm">{inputError}</p>}
      </div>

      <Button
        className="mt-6 w-full"
        onClick={handleStake}
        disabled={
          !isStakingEnabled ||
          showStakeLoading ||
          !displayAmount ||
          !!inputError
        }
        title={!isStakingEnabled ? 'Staking is currently disabled' : undefined}
      >
        {showStakeLoading ? <Spinner /> : t('stake.tabs.stake')}
      </Button>
    </div>
  )
}
