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
import { useCallback, useState } from 'react'
import {
  IPudgyUpgradeCallbackInput,
  IPudgyUpgradeCallbackResponse,
  IPudgyUpgradeInitiateResponse,
} from '../pudgy-payment.models'

const PENGU_MINT_ADDRESS = '2zMMhcVQEXDtdE6vsFS7S7D5oUodfJHE8vd1gnBouauv'
const PENGU_DECIMALS = 6

interface Props {
  profileId: string
  onComplete?: () => void
}

export function usePudgyPayment({ profileId, onComplete }: Props) {
  const { primaryWallet } = useDynamicContext()
  const { refetch } = useCurrentWallet()
  const [isComplete, setIsComplete] = useState(false)

  // Get payment details
  const {
    data: paymentDetails,
    loading: loadingDetails,
    error: detailsError,
  } = useQuery<IPudgyUpgradeInitiateResponse>({
    endpoint: `profiles/${profileId}/pudgy/upgrade/initiate`,
  })

  // Submit signature mutation
  const {
    mutate: submitSignature,
    loading: submittingSignature,
    error: submitError,
  } = useMutation<IPudgyUpgradeCallbackResponse, IPudgyUpgradeCallbackInput>({
    endpoint: `profiles/${profileId}/pudgy/upgrade/callback`,
  })

  // Get PENGU balance
  const {
    balance,
    rawBalance,
    loading: balanceLoading,
    mutate: refreshBalance,
  } = useTokenBalance(primaryWallet?.address, PENGU_MINT_ADDRESS)

  // Calculate balance requirements
  const requiredAmount = paymentDetails ? Math.ceil(paymentDetails.amount) : 0
  const requiredAmountRaw =
    BigInt(requiredAmount) * BigInt(10 ** PENGU_DECIMALS)
  const hasInsufficientBalance =
    rawBalance == null || rawBalance < requiredAmountRaw

  // Use Solana transaction hook
  const {
    sendAndConfirmTransaction,
    loading: transactionLoading,
    status: transactionStatus,
    error: transactionError,
  } = useSolanaTransaction({
    onSuccess: async (signature) => {
      if (!paymentDetails) return

      try {
        // Submit to backend
        await submitSignature({
          txSignature: signature,
          txId: paymentDetails.memo,
          pudgyProfileId: profileId,
        })

        // Mark as complete and trigger callback
        setIsComplete(true)
        await refetch()
        onComplete?.()
      } catch (error) {
        console.error('Failed to submit signature:', error)
        throw error
      }
    },
  })

  const pay = useCallback(async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet) || !paymentDetails) {
      throw new Error('Missing requirements for payment')
    }

    const connection = await primaryWallet.getConnection()
    const publicKey = new PublicKey(primaryWallet.address)
    const penguMint = new PublicKey(PENGU_MINT_ADDRESS)
    const tokenAccount = await getAssociatedTokenAddress(penguMint, publicKey)

    const amount = Math.ceil(paymentDetails.amount)
    const { blockhash } = await connection.getLatestBlockhash('finalized')

    // Create burn instruction
    const burnIx = createBurnCheckedInstruction(
      tokenAccount,
      penguMint,
      publicKey,
      amount * 10 ** PENGU_DECIMALS,
      PENGU_DECIMALS
    )

    // Create memo instruction
    const MEMO_PROGRAM_ID = new PublicKey(
      'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
    )
    const memoIx = new TransactionInstruction({
      keys: [{ pubkey: publicKey, isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(paymentDetails.memo, 'utf-8'),
    })

    // Build and sign transaction
    const message = new TransactionMessage({
      payerKey: publicKey,
      recentBlockhash: blockhash,
      instructions: [burnIx, memoIx],
    }).compileToV0Message()

    const transaction = new VersionedTransaction(message)
    const signer = await primaryWallet.getSigner()
    const signedTx = await signer.signTransaction(transaction)

    // Send transaction
    await sendAndConfirmTransaction(signedTx, {
      type: 'pudgy-payment',
      profileId,
      memo: paymentDetails.memo,
      amount,
      tokenMint: PENGU_MINT_ADDRESS,
    })
  }, [primaryWallet, paymentDetails, profileId, sendAndConfirmTransaction])

  return {
    paymentDetails,
    transactionStatus,
    isComplete,
    loading:
      loadingDetails ||
      balanceLoading ||
      transactionLoading ||
      submittingSignature,
    error: detailsError || submitError || transactionError,
    pay,
    balance,
    rawBalance,
    hasInsufficientBalance,
    requiredAmount,
    refreshBalance,
  }
}
