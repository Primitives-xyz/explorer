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
      <span className="text-sm font-medium hover:text-green-500">
        {t('trade.about_title')}
      </span>
      <div className="flex flex-col gap-4 border bg-green-900/20 border-green-500/20 rounded-lg p-6 my-3">
        {/* Staking Benefits Overview */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-green-400">
            {t('trade.staking.benefits_title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-green-800/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="font-medium text-green-400">
                  {t('trade.staking.fee_sharing')}
                </h4>
              </div>
              <p className="text-sm text-gray-300">
                {t('trade.staking.fee_sharing_desc')}
              </p>
            </div>
            <div className="bg-green-800/20 rounded-lg p-4 border border-green-500/30">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <h4 className="font-medium text-green-400">
                  {t('trade.staking.flexible_staking')}
                </h4>
              </div>
              <p className="text-sm text-gray-300">
                {t('trade.staking.flexible_staking_desc')}
              </p>
            </div>
          </div>

          {/* Staking Tiers */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold text-green-400 mb-4">
              {t('trade.staking.tiers_title')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Bronze Tier */}
              <div className="relative bg-gradient-to-b from-green-800/30 to-green-900/30 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-700/50 to-yellow-600/50 rounded-t-lg"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-yellow-600">
                      {t('trade.staking.bronze_tier')}
                    </h4>
                    <span className="text-xs bg-green-800/40 px-2 py-1 rounded-full border border-green-500/20">
                      {t('trade.staking.bronze_requirement')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>10% {t('trade.staking.swap_fee_discount')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>30% {t('trade.staking.comment_fee_discount')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Silver Tier */}
              <div className="relative bg-gradient-to-b from-green-800/30 to-green-900/30 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-gray-400/70 to-gray-300/70 rounded-t-lg"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-gray-300">
                      {t('trade.staking.silver_tier')}
                    </h4>
                    <span className="text-xs bg-green-800/40 px-2 py-1 rounded-full border border-green-500/20">
                      {t('trade.staking.silver_requirement')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>25% {t('trade.staking.swap_fee_discount')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>40% {t('trade.staking.comment_fee_discount')}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Gold Tier */}
              <div className="relative bg-gradient-to-b from-green-800/30 to-green-900/30 rounded-lg p-4 border border-green-500/30 hover:border-green-400/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400/70 to-yellow-300/70 rounded-t-lg"></div>
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium text-yellow-400">
                      {t('trade.staking.gold_tier')}
                    </h4>
                    <span className="text-xs bg-green-800/40 px-2 py-1 rounded-full border border-green-500/20">
                      {t('trade.staking.gold_requirement')}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>50% {t('trade.staking.swap_fee_discount')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <svg
                        className="h-4 w-4 text-green-400 shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>60% {t('trade.staking.comment_fee_discount')}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
