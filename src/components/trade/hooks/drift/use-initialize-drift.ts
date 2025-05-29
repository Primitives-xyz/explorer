import { useCurrentWallet } from '@/utils/use-current-wallet'
import { DriftClient } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export function useInitializeDrift() {
  const [driftClient, setDriftClient] = useState<DriftClient | null>(null)
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const [connection, setConnection] = useState<Connection>()
  const [isInitializing, setIsInitializing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const initializeClient = async () => {
      // Skip if already initializing or initialized
      if (isInitializing || driftClient) return

      // Skip if no wallet
      if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
        setDriftClient(null)
        return
      }

      try {
        setIsInitializing(true)
        setError(null)

        const signer = await primaryWallet.getSigner()

        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          'https://api.mainnet-beta.solana.com'
        const newConnection = new Connection(rpcUrl, 'confirmed')
        setConnection(newConnection)

        const newDriftClient = new DriftClient({
          connection: newConnection,
          wallet: {
            publicKey: new PublicKey(walletAddress),
            signTransaction: signer.signTransaction,
            signAllTransactions: signer.signAllTransactions,
          },
          env: 'mainnet-beta',
        })
        setDriftClient(newDriftClient)
      } catch (error) {
        console.error('Failed to initialize Drift client:', error)
        setError(error instanceof Error ? error.message : 'Unknown error')
        setDriftClient(null)
      } finally {
        setIsInitializing(false)
      }
    }

    initializeClient()
  }, [walletAddress, primaryWallet])

  // Clean up on wallet disconnect
  useEffect(() => {
    if (!walletAddress && driftClient) {
      setDriftClient(null)
      setConnection(undefined)
      setError(null)
      setIsInitializing(false)
    }
  }, [walletAddress, driftClient])

  return {
    driftClient,
    connection,
    isInitializing,
    error,
  }
}
