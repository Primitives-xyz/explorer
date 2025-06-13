import { useTokenBalance } from '@/components/trade/hooks/use-token-balance'
import { useSolanaTransaction } from '@/hooks/use-solana-transaction'
import { useMutation } from '@/utils/api/use-mutation'
import { useQuery } from '@/utils/api/use-query'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isSolanaWallet } from '@dynamic-labs/solana'
import {
  createBurnCheckedInstruction,
  getAssociatedTokenAddress,
} from '@solana/spl-token'
import {
  PublicKey,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'
import {
  ECryptoTransactionStatus,
  ICryptoChallengePaymentStatus,
  IPudgyUpgradeCallbackInput,
  IPudgyUpgradeCallbackResponse,
  IPudgyUpgradeInitiateResponse,
} from '../pudgy-payment.models'

const PENGU_MINT_ADDRESS = '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv'
const PENGU_DECIMALS = 6

interface Props {
  profileId: string
}

export function usePudgyPayment({ profileId }: Props) {
  const { primaryWallet } = useDynamicContext()
  const [polling, setPolling] = useState(false)
  const {
    data: paymentDetailsData,
    loading: loadingPaymentDetails,
    error: paymentDetailsError,
  } = useQuery<IPudgyUpgradeInitiateResponse>({
    endpoint: `profiles/${profileId}/pudgy/upgrade/initiate`,
  })
  const {
    mutate: submitSignature,
    loading: loadingSubmitSignature,
    error: submitSignatureError,
  } = useMutation<IPudgyUpgradeCallbackResponse, IPudgyUpgradeCallbackInput>({
    endpoint: `profiles/${profileId}/pudgy/upgrade/callback`,
  })
  const {
    data: transactionStatusData,
    loading: loadingTransactionStatus,
    error: transactionStatusError,
  } = useQuery<ICryptoChallengePaymentStatus>({
    endpoint: `pudgy/transactions/${paymentDetailsData?.memo}`,
    skip: !polling,
    config: {
      refreshInterval: 3000,
    },
  })
  const { refetch } = useCurrentWallet()
  const [paymentError, setPaymentError] = useState<Error>()

  // Use the generic Solana transaction hook for real-time updates
  const {
    sendAndConfirmTransaction,
    loading: loadingTransaction,
    status: transactionStatus,
    error: transactionError,
  } = useSolanaTransaction({
    onStatusUpdate: (status) => {
      console.log('Transaction status update:', status)
    },
    onSuccess: async (signature) => {
      console.log('Transaction confirmed:', signature)

      // Submit the signature to the backend
      if (paymentDetailsData) {
        await submitSignature({
          txSignature: signature,
          txId: paymentDetailsData.memo,
          pudgyProfileId: profileId,
        })
        setPolling(true)
      }
    },
    onError: (error) => {
      console.error('Transaction error:', error)
      setPaymentError(new Error(error))
    },
  })

  // Get PENGU token balance
  const {
    balance,
    rawBalance,
    loading: balanceLoading,
  } = useTokenBalance(primaryWallet?.address, PENGU_MINT_ADDRESS)

  // Check if user has sufficient balance
  const requiredAmount = paymentDetailsData
    ? Math.ceil(paymentDetailsData.amount)
    : 0
  const requiredAmountRaw =
    BigInt(requiredAmount) * BigInt(10 ** PENGU_DECIMALS)
  const hasInsufficientBalance =
    rawBalance == null || rawBalance < requiredAmountRaw

  useEffect(() => {
    if (transactionStatusData?.status === ECryptoTransactionStatus.COMPLETED) {
      setPolling(false)
      refetch()
    }
  }, [transactionStatusData, refetch])

  const pay = useCallback(async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      console.error(
        'Wallet not connected. Please connect your wallet to proceed with the payment.'
      )
      return
    }

    if (!paymentDetailsData) {
      console.error('Payment details not available. Please try again later.')
      return
    }

    try {
      const connection = await primaryWallet.getConnection()
      const publicKey = new PublicKey(primaryWallet.address)
      const penguPublicKey = new PublicKey(PENGU_MINT_ADDRESS)

      const account = await getAssociatedTokenAddress(penguPublicKey, publicKey)
      console.dir(paymentDetailsData, { depth: null })
      const amount = Math.ceil(paymentDetailsData.amount) // round up to the nearest whole number
      const finalAmount = amount * 10 ** PENGU_DECIMALS
      console.log(`    ✅ - Amount: ${amount}`)
      console.log(`    ✅ - Final Amount: ${finalAmount}`)
      console.log(`    ✅ - Decimals: ${PENGU_DECIMALS}`)

      const burnIx = createBurnCheckedInstruction(
        account, // PublicKey of Owner's Associated Token Account
        penguPublicKey, // Public Key of the Token Mint Address
        publicKey, // Public Key of Owner's Wallet
        amount * 10 ** PENGU_DECIMALS, // Number of tokens to burn
        PENGU_DECIMALS // Number of Decimals of the Token Mint
      )
      console.log(`    ✅ - Burn Instruction Created`)

      console.log(`Step 3 - Fetch Blockhash`)
      const { blockhash } = await connection.getLatestBlockhash('finalized')
      console.log(`    ✅ - Latest Blockhash: ${blockhash}`)

      const MEMO_PROGRAM_ID = new PublicKey(
        'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
      )

      const memoIx = new TransactionInstruction({
        keys: [
          {
            pubkey: publicKey,
            isSigner: true,
            isWritable: true,
          },
        ],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(paymentDetailsData.memo, 'utf-8'),
      })

      console.log(`Step 4 - Assemble Transaction`)
      const messageV0 = new TransactionMessage({
        payerKey: publicKey,
        recentBlockhash: blockhash,
        instructions: [burnIx, memoIx],
      }).compileToV0Message()

      const transaction = new VersionedTransaction(messageV0)
      console.log(`    ✅ - Transaction Created`)

      const signer = await primaryWallet.getSigner()
      const signedTransaction = await signer.signTransaction(transaction)

      console.log(`Step 5 - Execute & Confirm Transaction`)

      // Use the generic transaction system with metadata
      await sendAndConfirmTransaction(signedTransaction, {
        type: 'pudgy-payment',
        profileId,
        memo: paymentDetailsData.memo,
        amount: amount,
        tokenMint: PENGU_MINT_ADDRESS,
      })
    } catch (error: any) {
      console.error('Error creating transaction:', error)
      setPaymentError(error)
      throw error
    }
  }, [primaryWallet, paymentDetailsData, profileId, sendAndConfirmTransaction])

  const loading =
    loadingPaymentDetails ||
    loadingSubmitSignature ||
    loadingTransactionStatus ||
    loadingTransaction ||
    polling ||
    balanceLoading

  const error =
    paymentDetailsError ||
    submitSignatureError ||
    transactionStatusError ||
    transactionError ||
    paymentError

  return {
    paymentDetailsData,
    loading,
    transactionStatusData,
    transactionStatus,
    error,
    pay,
    balance,
    rawBalance,
    hasInsufficientBalance,
    requiredAmount,
  }
}
