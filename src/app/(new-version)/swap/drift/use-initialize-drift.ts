import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { AnchorProvider } from '@coral-xyz/anchor'
import { BulkAccountLoader, DriftClient, initialize } from '@drift-labs/sdk'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect, useState } from 'react'

const env = 'mainnet-beta'

interface DriftClientState {
  driftClient: DriftClient | undefined
  connection: Connection | undefined
}

export function useInitializeDriftClient(): DriftClientState {
  const { primaryWallet, walletAddress } = useCurrentWallet()
  const [driftClient, setDriftClient] = useState<DriftClient>()
  const [connection, setConnection] = useState<Connection>()

  useEffect(() => {
    async function initializeClient() {
      if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
        return
      }

      try {
        const rpcUrl =
          process.env.NEXT_PUBLIC_RPC_URL ||
          'https://api.mainnet-beta.solana.com'
        const connection = new Connection(rpcUrl, 'confirmed')
        setConnection(connection)

        const signer = await primaryWallet.getSigner()

        const provider = new AnchorProvider(
          connection,
          {
            publicKey: new PublicKey(walletAddress),
            signTransaction: signer.signTransaction,
            signAllTransactions: signer.signAllTransactions,
          },
          AnchorProvider.defaultOptions()
        )

        const sdkConfig = initialize({ env })
        const driftPublicKey = new PublicKey(sdkConfig.DRIFT_PROGRAM_ID)
        const bulkAccountLoader = new BulkAccountLoader(
          connection,
          'confirmed',
          1000
        )

        const driftClient = new DriftClient({
          connection,
          wallet: provider.wallet,
          programID: driftPublicKey,
          env,
          accountSubscription: {
            type: 'polling',
            accountLoader: bulkAccountLoader,
          },
        })

        await driftClient.subscribe()
        setDriftClient(driftClient)
      } catch (error) {
        console.error('Failed to initialize Drift client:', error)
      }
    }

    initializeClient()
  }, [primaryWallet, walletAddress])

  return {
    driftClient,
    connection,
  }
}
