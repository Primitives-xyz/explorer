import { useInitializeDriftClient } from '@/app/(new-version)/swap/drift/use-initialize-drift'
import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { useToast } from '@/hooks/use-toast'
import {
  BASE_PRECISION,
  PositionDirection,
  getMarketOrderParams,
} from '@drift-labs/sdk'
import { isSolanaWallet } from '@dynamic-labs/solana'
import {
  PublicKey,
  TransactionMessage,
  VersionedTransaction,
} from '@solana/web3.js'
import { BN } from 'bn.js'
import { useTranslations } from 'next-intl'
import { useState } from 'react'

interface UseDriftPerpetualParams {
  amount: string
  marketIndex: number
  direction: PositionDirection
}

export function useDriftPerpetual({
  amount,
  marketIndex,
  direction,
}: UseDriftPerpetualParams) {
  const t = useTranslations()
  const { primaryWallet } = useCurrentWallet()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [txSignature, setTxSignature] = useState<string | null>(null)

  const { driftClient, connection } = useInitializeDriftClient()

  const handleTrade = async () => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      setError('Wallet not connected')
      return
    }

    if (!driftClient || !connection) {
      setError('Drift client not initialized')
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Get the order parameters
      const orderParams = getMarketOrderParams({
        baseAssetAmount: new BN(amount).mul(BASE_PRECISION),
        direction,
        marketIndex,
      })

      // Get the transaction instructions
      const ixs = await driftClient.getPlacePerpOrderIx(orderParams)

      // Get the latest blockhash
      const blockHash = (await connection.getLatestBlockhash('finalized'))
        .blockhash

      // Create and compile the transaction
      const messageV0 = new TransactionMessage({
        payerKey: new PublicKey(primaryWallet.address),
        recentBlockhash: blockHash,
        instructions: [ixs],
      }).compileToV0Message()

      const vtx = new VersionedTransaction(messageV0)

      // Sign and send the transaction
      const signer = await primaryWallet.getSigner()
      const txid = await signer.signAndSendTransaction(vtx)
      setTxSignature(txid.signature)

      toast({
        title: t('trade.confirming_transaction'),
        description: t('trade.waiting_for_confirmation'),
        variant: 'pending',
        duration: 1000000000,
      })

      // Wait for confirmation
      const tx = await connection.confirmTransaction(
        {
          signature: txid.signature,
          ...(await connection.getLatestBlockhash()),
        },
        'confirmed'
      )

      toast({
        title: t('trade.transaction_confirmed'),
        description: t('trade.transaction_successful'),
        variant: 'success',
      })
    } catch (err) {
      console.error('Error in perpetual trade:', err)
      setError(err instanceof Error ? err.message : 'An error occurred')
      toast({
        title: t('trade.error'),
        description: err instanceof Error ? err.message : 'An error occurred',
        variant: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    error,
    txSignature,
    handleTrade,
  }
}
