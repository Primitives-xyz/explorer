import { useUmi } from '@/hooks/use-umi'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, VersionedTransaction } from '@solana/web3.js'
import { useState } from 'react'
import { toast } from 'sonner'
import { mutate } from 'swr'

interface MigrationResult {
  success: boolean
  transactionSignature?: string
  error?: Error
}

export function useMigrationExecute() {
  const umi = useUmi()

  const [isProcessing, setIsProcessing] = useState(false)
  const { walletAddress, primaryWallet } = useCurrentWallet()

  /**
   * Executes the migration
   */
  const executeMigration = async (): Promise<MigrationResult> => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      return {
        success: false,
        error: new Error('Wallet not connected'),
      }
    }

    setIsProcessing(true)

    try {
      const connection = new Connection(
        process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
      )

      console.log('Executing migration for wallet:', walletAddress)

      // Call API to create the migration transaction
      const response = await fetch('/api/migration/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.error || 'Failed to create migration transaction'
        )
      }

      const { transaction: serializedTxAsString } = await response.json()
      const migrationTransactionBuf = Buffer.from(
        serializedTxAsString,
        'base64'
      )

      let transaction = VersionedTransaction.deserialize(
        migrationTransactionBuf
      )
      const signer = await primaryWallet.getSigner()

      transaction = await signer.signTransaction(transaction)

      // Optional: simulate the transaction without signature verification
      // since it's not signed yet
      const simulation = await connection.simulateTransaction(transaction, {
        sigVerify: false,
      })
      console.log('Simulation:', simulation)

      if (simulation.value.err) {
        throw new Error(
          `Transaction simulation failed: ${JSON.stringify(
            simulation.value.err
          )}`
        )
      }

      // Get signer from Dynamic wallet
      console.log('ARE WE HERE?')

      const signature = await connection.sendRawTransaction(
        transaction.serialize()
      )

      const confirmation = await connection.confirmTransaction(signature)

      // Sign and send the transaction using Dynamic wallet's method
      console.log('Transaction sent, signature:', confirmation)

      // Invalidate caches to refresh data
      await mutate(`/migration/check/${walletAddress}`)
      // Invalidate the unified staking endpoint to ensure fresh data
      await mutate(`/api/staking/user-info/${walletAddress}`)
      await mutate(`/api/staking-v2/${walletAddress}`)

      toast.success('Migration completed successfully!')

      return {
        success: true,
        transactionSignature: signature,
      }
    } catch (error) {
      console.error('Migration error:', error)
      toast.error('Migration failed', {
        description:
          error instanceof Error ? error.message : 'Unknown error occurred',
      })

      return {
        success: false,
        error: error instanceof Error ? error : new Error('Unknown error'),
      }
    } finally {
      setIsProcessing(false)
    }
  }

  return {
    executeMigration,
    isProcessing,
  }
}
