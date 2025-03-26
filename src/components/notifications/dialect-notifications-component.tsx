'use client'

import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'
import '@dialectlabs/react-ui/index.css'
import { isSolanaWallet } from '@dynamic-labs/solana'
import type { ISolana } from '@dynamic-labs/solana-core'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { ErrorBoundary } from './error-boundary'

// Component that renders just the notifications button with error handling
export const DialectNotificationsComponent = () => {
  return (
    <ErrorBoundary fallback={<div className="w-9 h-9"></div>}>
      <DialectNotificationsComponentInner />
    </ErrorBoundary>
  )
}

// Inner component with the actual implementation
const DialectNotificationsComponentInner = () => {
  const DAPP_ADDRESS = process.env.NEXT_PUBLIC_DAPP_ADDRESS
  const { walletAddress, primaryWallet } = useCurrentWallet()

  const walletAdapter = useMemo(() => {
    if (!walletAddress || !primaryWallet || !isSolanaWallet(primaryWallet)) {
      return null
    }

    return {
      publicKey: new PublicKey(walletAddress),
      signMessage: async (msg: Uint8Array) => {
        const signer = await primaryWallet.getSigner()

        const result = await signer.signMessage(msg)
        return result.signature
      },
      signTransaction: async (tx: any) => {
        const signer: ISolana = await primaryWallet.getSigner()
        const sign = signer.signTransaction(tx)
        return sign
      },
    }
  }, [walletAddress, primaryWallet])

  if (
    !DAPP_ADDRESS ||
    !walletAddress ||
    !primaryWallet ||
    !isSolanaWallet(primaryWallet) ||
    !walletAdapter
  ) {
    return null
  }

  return (
    <DialectSolanaSdk
      dappAddress={DAPP_ADDRESS}
      customWalletAdapter={walletAdapter}
    >
      <NotificationsButton theme="dark" />
    </DialectSolanaSdk>
  )
}

/* necessary to make the button have the same height as connect walled + search */
