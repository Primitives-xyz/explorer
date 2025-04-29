import { useCurrentWallet } from '@/utils/use-current-wallet'
import { DriftClient } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export function useInitializeDrift() {
  const [driftClient, setDriftClient] = useState<DriftClient | null>(null)
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const [connection, setConnection] = useState<Connection>()

  useEffect(() => {
    const initializeClient = async () => {
      try {
        if (
          !walletAddress ||
          !primaryWallet ||
          !isSolanaWallet(primaryWallet)
        ) {
          setDriftClient(null)
          return
        }

        const signer = await primaryWallet.getSigner()

        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          'https://api.mainnet-beta.solana.com'
        const connection = new Connection(rpcUrl, 'confirmed')
        setConnection(connection)

        const driftClient = new DriftClient({
          connection,
          wallet: {
            publicKey: new PublicKey(walletAddress),
            signTransaction: signer.signTransaction,
            signAllTransactions: signer.signAllTransactions,
          },
          env: 'mainnet-beta',
        })
        setDriftClient(driftClient)
      } catch (error) {
        setDriftClient(null)
      }
    }

    initializeClient()
  }, [primaryWallet, walletAddress])

  return {
    driftClient,
    connection,
  }
}
