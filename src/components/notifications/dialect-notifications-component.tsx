'use client'

import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'
import '@dialectlabs/react-ui/index.css'
import { useDynamicContext } from '@dynamic-labs/sdk-react-core'
import { isSolanaWallet } from '@dynamic-labs/solana'
import type { ISolana } from '@dynamic-labs/solana-core'
import { PublicKey } from '@solana/web3.js'
import { useWallet } from '../auth/wallet-context'
export const DialectNotificationsComponent = () => {
  const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS
  const { walletAddress } = useWallet()
  if (!DAPP_ADDRESS || !walletAddress) {
    return null
  }
  const { primaryWallet } = useDynamicContext()
  const walletPK = new PublicKey(walletAddress)

  if (!primaryWallet || !isSolanaWallet(primaryWallet)) {
    return
  }
  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      customWalletAdapter={{
        publicKey: walletPK,
        signMessage: async (msg) => {
          // Convert Uint8Array to string for primaryWallet.signMessage
          const message = new TextDecoder().decode(msg)
          const signature = await primaryWallet.signMessage(message)
          // Convert signature back to Uint8Array
          return signature
            ? new TextEncoder().encode(signature)
            : new Uint8Array()
        },
        signTransaction: async (tx) => {
          const signer: ISolana = await primaryWallet.getSigner()
          const sign = signer.signTransaction(tx)
          return sign
        },
      }}
    >
      <NotificationsButton theme="dark" />
    </DialectSolanaSdk>
  )
}

/* necessary to make the button have the same height as connect walled + search */
