import { DriftClient } from '@drift-labs/sdk-browser'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export function useInitializeDrift(primaryWallet: any, walletAddress: string) {
  const [driftClient, setDriftClient] = useState<DriftClient>()

  useEffect(() => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return
    }

    const initializeClient = async () => {
      const env = 'mainnet-beta'
      const signer = await primaryWallet.getSigner()

      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
      const connection = new Connection(rpcUrl, 'confirmed')

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
    }

    initializeClient()
  }, [primaryWallet, walletAddress])

  return {
    driftClient,
  }
}
