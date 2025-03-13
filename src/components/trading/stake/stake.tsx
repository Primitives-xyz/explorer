import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { useState } from 'react'

import { Connection } from '@solana/web3.js'
import { Loader2 } from 'lucide-react'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useToast } from '@/hooks/use-toast'
import { useTokenBalance } from '@/hooks/use-token-balance'

import { AmountInput } from '../../transactions/swap/amount-input'

import { VersionedTransaction } from '@solana/web3.js'
import { SSE_MINT, SSE_TOKEN_DECIMAL } from '../constants'

export interface StakeFormProps {
  initialAmount?: string
}

// Dynamic Imports
const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

export const StakeForm = ({ initialAmount = '' }: StakeFormProps) => {
  const t = useTranslations()
  const { toast } = useToast()
  const [displayAmount, setDisplayAmount] = useState(initialAmount)
  const [showStakeLoading, setShowStakeLoading] = useState<boolean>(false)
  const [inputError, setInputError] = useState<string | null>(null)
  const [debouncedUpdate, setDebouncedUpdate] = useState<NodeJS.Timeout | null>(
    null
  )
  const { isLoggedIn, sdkHasLoaded, primaryWallet, walletAddress } =
    useCurrentWallet()

  const LoadingDots = () => {
    return (
      <span className="inline-flex items-center">
        <span className="animate-pulse">.</span>
        <span className="animate-pulse animation-delay-200">.</span>
        <span className="animate-pulse animation-delay-400">.</span>
      </span>
    )
  }

  // Add token balance hooks for SSE token
  const {
    balance: inputBalance,
    rawBalance: inputRawBalance,
    loading: inputBalanceLoading,
  } = useTokenBalance(walletAddress, SSE_MINT)
  console.log({ inputBalance, inputRawBalance })

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

  return (
    <div>
      <AmountInput
        value={displayAmount}
        onChange={setDisplayAmount}
        onEffectiveAmountChange={() => {}}
        balance={inputBalance}
        isLoggedIn={isLoggedIn}
        isBalanceLoading={inputBalanceLoading}
        disabled={showStakeLoading}
        error={inputError}
        validateAmount={validateAmount}
        onQuarterClick={handleQuarterAmount}
        onHalfClick={handleHalfAmount}
        onMaxClick={handleMaxAmount}
      />
      <div className="w-full my-3">
        {!sdkHasLoaded ? (
          <div className="bg-green-900/20 rounded-lg p-3 border border-green-400/20">
            <div className="flex items-center justify-center gap-3">
              <div className="relative w-5 h-5">
                <div className="absolute inset-0 border-2 border-green-400/20 rounded-full"></div>
                <div className="absolute inset-0 border-2 border-green-400 rounded-full border-t-transparent animate-spin"></div>
              </div>
              <span className="text-sm font-medium">
                {t('trade.checking_wallet_status')}
                <LoadingDots />
              </span>
            </div>
          </div>
        ) : !isLoggedIn ? (
          <DynamicConnectButton buttonClassName={'w-full'}>
            <div className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full text-center cursor-pointer font-medium">
              {t('trade.connect_wallet_to_swap')}
            </div>
          </DynamicConnectButton>
        ) : (
          <button
            onClick={handleStake}
            disabled={showStakeLoading}
            className="bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg disabled:opacity-50 w-full font-medium"
          >
            {showStakeLoading ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              t('trade.stake')
            )}
          </button>
        )}
      </div>
    </div>
  )
}
