import { useStakeInfo } from '@/components-new-version/stake/hooks/useStakeInfo'
import { useTokenBalance } from '@/components-new-version/trade/hooks/use-token-balance'
import {
  Button,
  ButtonSize,
  ButtonVariant,
  Input,
  Spinner,
} from '@/components-new-version/ui'
import { useToast } from '@/components-new-version/ui/toast/hooks/use-toast'
import {
  SSE_MINT,
  SSE_TOKEN_DECIMAL,
} from '@/components-new-version/utils/constants'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

export function StakeForm({ initialAmount = '' }: { initialAmount?: string }) {
  const t = useTranslations()
  const { toast } = useToast()
  const [displayAmount, setDisplayAmount] = useState(initialAmount)
  const [showStakeLoading, setShowStakeLoading] = useState<boolean>(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null
  )
  const {
    isLoggedIn,
    sdkHasLoaded,
    primaryWallet,
    walletAddress,
    setShowAuthFlow,
  } = useCurrentWallet()
  const { refreshUserInfo } = useStakeInfo({})

  // Add token balance hooks for SSE token
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, SSE_MINT)

  if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
    throw new Error('Wallet not connected')
  }

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

  // Add handler for stake
  const handleStake = async () => {
    try {
      setShowStakeLoading(true)
      const response = await fetch(`/api/stake`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: displayAmount,
          walletAddy: walletAddress,
        }),
      })
      const data = await response.json()
      const stakeTx = data.stakeTx
      const serializedBuffer: Buffer = Buffer.from(stakeTx, 'base64')
      const vtx: VersionedTransaction = VersionedTransaction.deserialize(
        Uint8Array.from(serializedBuffer)
      )
      const signer = await primaryWallet.getSigner()
      const connection = new Connection(process.env.NEXT_PUBLIC_RPC_URL || '')
      const simulateTx = await connection.simulateTransaction(vtx)
      console.log('sim:', simulateTx)
      const txid = await signer.signAndSendTransaction(vtx)
      const confirmToast = toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      const tx = await connection.confirmTransaction({
        signature: txid.signature,
        ...(await connection.getLatestBlockhash()),
      })

      confirmToast.dismiss()

      if (tx.value.err) {
        toast({
          title: t('trade.transaction_failed'),
          description: t('trade.the_stake_transaction_failed_please_try_again'),
          variant: 'error',
          duration: 5000,
        })
      } else {
        toast({
          title: t('trade.transaction_successful'),
          description: t(
            'trade.the_stake_transaction_was_successful_creating_shareable_link'
          ),
          variant: 'success',
          duration: 5000,
        })

        // Refresh user info after successful stake
        refreshUserInfo()
      }

      setShowStakeLoading(false)
    } catch (error) {
      console.log('Error in making stake tx:', error)
      setShowStakeLoading(false)
      toast({
        title: t('trade.transaction_failed'),
        description: t('trade.the_stake_transaction_failed_please_try_again'),
        variant: 'error',
        duration: 5000,
      })
    }
  }

  if (!sdkHasLoaded) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Spinner />
        <p>{t('trade.checking_wallet_status')}</p>
      </div>
    )
  }

  if (!isLoggedIn) {
    return (
      <Button
        variant={ButtonVariant.OUTLINE}
        expand
        onClick={() => setShowAuthFlow(true)}
      >
        {t('common.connect_wallet')}
      </Button>
    )
  }

  return (
    <div>
      <div className="flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <p>{t('common.amount')}</p>
          {isLoggedIn && !inputBalanceLoading && inputBalance && (
            <div className="flex items-center gap-2">
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

      <Button expand onClick={handleStake} disabled={showStakeLoading}>
        {showStakeLoading ? <Spinner /> : t('trade.stake')}
      </Button>
    </div>
  )
}
