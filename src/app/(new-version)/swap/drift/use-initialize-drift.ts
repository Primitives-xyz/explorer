import { useCurrentWallet } from '@/components-new-version/utils/use-current-wallet'
import { AnchorProvider } from '@coral-xyz/anchor'
import { BulkAccountLoader, DriftClient, initialize } from '@drift-labs/sdk'
import { isSolanaWallet } from '@dynamic-labs/solana'
import { Connection, PublicKey } from '@solana/web3.js'

const env = 'mainnet-beta'
export function useInitializeDriftClient() {
  const { primaryWallet } = useCurrentWallet()
  if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
    throw new Error('Wallet not connected')
  }

  const rpcUrl =
    process.env.NEXT_PUBLIC_RPC_URL || 'https://api.mainnet-beta.solana.com'
  const connection = new Connection(rpcUrl, 'confirmed')

  // Set up the Provider
  const provider = new AnchorProvider(
    connection,
    // @ts-ignore
    primaryWallet,
    AnchorProvider.defaultOptions()
  )

  const sdkConfig = initialize({ env })

  const driftPublicKey = new PublicKey(sdkConfig.DRIFT_PROGRAM_ID)
  const bulkAccountLoader = new BulkAccountLoader(
    provider.connection,
    'confirmed',
    1000
  )

  const driftClient = new DriftClient({
    connection: connection,
    wallet: provider.wallet,
    programID: driftPublicKey,
    env,
    accountSubscription: {
      type: 'polling',
      accountLoader: bulkAccountLoader,
    },
  })

  driftClient.subscribe()

  return {
    driftClient,
    connection,
    publicKey: provider.wallet.publicKey,
  }
}
