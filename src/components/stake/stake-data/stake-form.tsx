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
import { useCurrentWallet } from '@/utils/use-current-wallet'
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

  const { stake, isLoading: showStakeLoading } = useStake()

  const validateAmount = (value: string): boolean => {
    if (value === '') return true

    // Check if the value is a valid number
    const numericValue = Number(value)
    if (isNaN(numericValue)) {
      setInputError(t('error.please_enter_a_valid_number'))
      return false
    }

    // Check if the value is positive
    if (numericValue <= 0) {
      setInputError(t('error.amount_must_be_greater_than_0'))
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
        `${t('trade.maximum')} ${SSE_TOKEN_DECIMAL} ${t(
          'trade.decimal_places_allowed'
        )}`
      )
      return false
    }

    // Check if the value exceeds the balance
    if (
      BigInt(Math.floor(Math.pow(10, SSE_TOKEN_DECIMAL) * Number(value))) >
      inputRawBalance
    ) {
      setInputError(t('error.amount_exceeds_your_balance'))
      return false
    }

    setInputError(null)
    return true
  }

  // Utility function to format raw token amounts
  const formatRawAmount = (rawAmount: bigint, decimals: bigint): string => {
    try {
      if (rawAmount === 0n) return '0'

      const divisor = 10n ** decimals
      const integerPart = rawAmount / divisor
      const fractionPart = rawAmount % divisor

      if (fractionPart === 0n) {
        return integerPart.toString()
      }

      // Convert to string and pad with zeros
      let fractionStr = fractionPart.toString()
      while (fractionStr.length < Number(decimals)) {
        fractionStr = '0' + fractionStr
      }

      // Remove trailing zeros
      fractionStr = fractionStr.replace(/0+$/, '')

      return fractionStr
        ? `${integerPart}.${fractionStr}`
        : integerPart.toString()
    } catch (err) {
      console.error('Error formatting amount:', err)
      return '0'
    }
  }

  // Add handlers for quarter, half and max amount
  const handleQuarterAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint') return

    try {
      // Calculate quarter of the raw balance using bigint arithmetic
      const quarterAmount = inputRawBalance / 4n
      const formattedQuarter = formatRawAmount(
        quarterAmount,
        BigInt(SSE_TOKEN_DECIMAL)
      )

      if (validateAmount(formattedQuarter)) {
        setDisplayAmount(formattedQuarter)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating quarter amount:', err)
    }
  }

  const handleMaxAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint') return

    try {
      const formattedMax = formatRawAmount(
        inputRawBalance,
        BigInt(SSE_TOKEN_DECIMAL)
      )

      if (validateAmount(formattedMax)) {
        setDisplayAmount(formattedMax)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating max amount:', err)
    }
  }

  const handleHalfAmount = () => {
    if (!inputBalance || typeof inputRawBalance !== 'bigint') return

    try {
      // Calculate half of the raw balance using bigint arithmetic
      const halfAmount = inputRawBalance / 2n
      const formattedHalf = formatRawAmount(
        halfAmount,
        BigInt(SSE_TOKEN_DECIMAL)
      )

      if (validateAmount(formattedHalf)) {
        setDisplayAmount(formattedHalf)
        if (debouncedUpdate) clearTimeout(debouncedUpdate)
      }
    } catch (err) {
      console.error('Error calculating half amount:', err)
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-start md:items-center">
          <p>{t('common.amount')}</p>
          {!inputBalanceLoading && inputBalance && (
            <div className="flex flex-col md:flex-row items-end md:items-center gap-2">
              <p className="text-muted-foreground text-xs">
                {t('common.balance')}: {inputBalance}
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
                  {t('common.max')}
                </Button>
              </div>
            </div>
          )}
        </div>

        <Input
          type="text"
          value={displayAmount}
          onChange={(e) => {
            const val = e.target.value
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
          }}
          placeholder="0.00"
          disabled={showStakeLoading}
        />

        {inputError && <p className="text-destructive">{inputError}</p>}
      </div>

      {!sdkHasLoaded ? (
        <Button variant={ButtonVariant.OUTLINE} className="mt-4 w-full">
          <Spinner />
          <p>{t('trade.checking_wallet_status')}</p>
        </Button>
      ) : !isLoggedIn ? (
        <Button
          variant={ButtonVariant.OUTLINE}
          className="mt-4 w-full"
          onClick={() => setShowAuthFlow(true)}
        >
          {t('common.connect_wallet')}
        </Button>
      ) : (
        <Button
          className="mt-4 w-full"
          onClick={() => stake(displayAmount)}
          disabled={showStakeLoading}
        >
          {showStakeLoading ? <Spinner /> : t('trade.stake')}
        </Button>
      )}
    </div>
  )
}
