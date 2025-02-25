'use client'

import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'
import '@dialectlabs/react-ui/index.css'
import { isSolanaWallet } from '@dynamic-labs/solana'
import type { ISolana } from '@dynamic-labs/solana-core'
import { PublicKey } from '@solana/web3.js'
import { useMemo } from 'react'
import { useWallet } from '../auth/wallet-context'

export const DialectNotificationsComponent = () => {
  // Get environment variable once
  const dappAddress = useMemo(
    () => process.env.NEXT_PUBLIC_DAPP_ADDRESS || '',
    []
  )
  const { walletAddress, primaryWallet } = useWallet()

  // Check conditions early to avoid unnecessary computations
  const shouldRender = useMemo(() => {
    return !!(
      dappAddress &&
      walletAddress &&
      primaryWallet &&
      isSolanaWallet(primaryWallet)
    )
  }, [dappAddress, walletAddress, primaryWallet])

  // Memoize the wallet public key
  const walletPK = useMemo(() => {
    if (!walletAddress || !shouldRender) return null
    try {
      return new PublicKey(walletAddress)
    } catch (e) {
      console.error('Invalid wallet address for PublicKey', e)
      return null
    }
  }, [walletAddress, shouldRender])

  // Memoize the wallet adapter
  const customWalletAdapter = useMemo(() => {
    if (!walletPK || !primaryWallet || !shouldRender) return null

    return {
      publicKey: walletPK,
      signMessage: async (msg: Uint8Array) => {
        // Convert Uint8Array to string for primaryWallet.signMessage
        const message = new TextDecoder().decode(msg)
        const signature = await primaryWallet.signMessage(message)
        // Convert signature back to Uint8Array
        return signature
          ? new TextEncoder().encode(signature)
          : new Uint8Array()
      },
      signTransaction: async (tx: any) => {
        const signer: ISolana = await primaryWallet.getSigner()
        return signer.signTransaction(tx)
      },
    }
  }, [walletPK, primaryWallet, shouldRender])

  // Early return if any required condition is not met
  if (!shouldRender || !walletPK || !customWalletAdapter) {
    return null
  }

  return (
    <DialectSolanaSdk
      dappAddress={dappAddress}
      customWalletAdapter={customWalletAdapter}
    >
      <NotificationsButton theme="dark" />
    </DialectSolanaSdk>
  )
}

/* necessary to make the button have the same height as connect walled + search */
