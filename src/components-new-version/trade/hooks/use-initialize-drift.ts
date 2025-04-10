import { useCommonDriftStore } from '@drift-labs/react'
import { DriftClient } from '@drift-labs/sdk'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

export function useInitializeDrift(primaryWallet: any, walletAddress: string) {
  const { driftClient } = useCommonDriftStore()
  const [connection, setConnection] = useState<Connection>()

  useEffect(() => {
    if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
      return
    }

    const initializeClient = async () => {
      const env = 'mainnet-beta'
      const signer = await primaryWallet.getSigner()

      // const res = await fetch('api/drift/initialize-drift', {
      //   method: "POST",
      //   headers: {
      //     Accept: 'application/json',
      //   },
      //   body: JSON.stringify({
      //     signer,
      //   })
      // })
      const rpcUrl =
        process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
      const connection = new Connection(rpcUrl, 'confirmed')

      // const sdkConfig = initialize({ env })

      // const driftPublicKey = new PublicKey(sdkConfig.DRIFT_PROGRAM_ID)

      const driftClient = new DriftClient({
        connection,
        wallet: {
          publicKey: new PublicKey(walletAddress),
          signTransaction: signer.signTransaction,
          signAllTransactions: signer.signAllTransactions,
        },
        env: 'mainnet-beta',
      })
    }

    initializeClient()
  }, [primaryWallet])

  return {
    driftClient,
  }
}
