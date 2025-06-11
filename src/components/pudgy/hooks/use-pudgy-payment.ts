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
import { useEffect, useState } from 'react'
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
  const [loadingPayment, setLoadingPayment] = useState(false)

  useEffect(() => {
    if (transactionStatusData?.status === ECryptoTransactionStatus.COMPLETED) {
      setPolling(false)
      refetch()
    }
  }, [transactionStatusData, refetch])

  const pay = async () => {
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
      setLoadingPayment(true)

      // const connection: Connection = await primaryWallet.getConnection()
      const connection = await primaryWallet.getConnection()
      const publicKey = new PublicKey(primaryWallet.address)
      const penguPublicKey = new PublicKey(PENGU_MINT_ADDRESS)

      const account = await getAssociatedTokenAddress(penguPublicKey, publicKey)
      const amount = Math.ceil(paymentDetailsData.amount) // round up to the nearest whole number, so that the transaction ca pass
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
      const txSignature = await connection.sendTransaction(signedTransaction)
      console.log('    ✅ - Transaction sent to network')
      console.log(
        '🚀 ~ createAndSendBurnTransaction ~ txSignature:',
        txSignature
      ) // must save this to /callback

      await submitSignature({
        txSignature,
        txId: paymentDetailsData.memo,
        pudgyProfileId: profileId,
      })

      setPolling(true)
    } catch (error: any) {
      // console.error('Error sending transaction:', error)
      setPaymentError(error)
      throw error
    } finally {
      setLoadingPayment(false)
    }
  }

  const loading =
    loadingPaymentDetails ||
    loadingSubmitSignature ||
    loadingTransactionStatus ||
    loadingPayment ||
    polling

  const error =
    paymentDetailsError ||
    submitSignatureError ||
    transactionStatusError ||
    paymentError

  return {
    paymentDetailsData,
    loading,
    transactionStatusData,
    error,
    pay,
  }
}
