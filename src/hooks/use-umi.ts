import { useCurrentWallet } from '@/utils/use-current-wallet'
import { isSolanaWallet } from '@dynamic-labs/solana'
import type { ISolana } from '@dynamic-labs/solana-core'
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults'
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
const RPC_URL = process.env.RPC_URL ?? 'https://api.devnet.solana.com'

export function useUmi() {
  const { primaryWallet, walletAddress } = useCurrentWallet()

  const umi = useMemo(() => {
    const baseUmi = createUmi(RPC_URL, 'confirmed')

    // Check if we have a valid Solana wallet
    if (walletAddress && primaryWallet && isSolanaWallet(primaryWallet)) {
      const publicKey = new PublicKey(walletAddress)
      return baseUmi.use(
        walletAdapterIdentity({
          publicKey,
          signAllTransactions: async (tx: any) => {
            const signer: ISolana = await primaryWallet.getSigner()
            const sign = signer.signTransaction(tx)
            return sign
          },
          signMessage: async (msg: Uint8Array) => {
            const signer: ISolana = await primaryWallet.getSigner()
            const result = await signer.signMessage(msg)
            return result.signature
          },
        })
      )
    } else {
      // Use null when no wallet is connected
      return baseUmi.use(walletAdapterIdentity({ publicKey: null }))
    }
  }, [walletAddress, primaryWallet])

  return umi
}
