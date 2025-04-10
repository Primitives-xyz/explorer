import { useEffect, useState } from "react";
import { useCurrentWallet } from "@/components-new-version/utils/use-current-wallet";
import { isSolanaWallet } from "@dynamic-labs/solana";
import { DriftClient, initialize } from '@drift-labs/sdk'
import { Connection } from '@solana/web3.js'
import { PublicKey } from "@solana/web3.js";

export function useInitializeDrift(primaryWallet: any, walletAddress: string) {
  const [driftClient, setDriftClient] = useState<DriftClient>()
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
      });
      setDriftClient(driftClient)
    }

    initializeClient()
  }, [primaryWallet])

  return {
    driftClient
  }
}