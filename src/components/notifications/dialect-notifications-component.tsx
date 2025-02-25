'use client'

import { DialectSolanaSdk } from '@dialectlabs/react-sdk-blockchain-solana'
import { NotificationsButton } from '@dialectlabs/react-ui'
import '@dialectlabs/react-ui/index.css'
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react'
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'
import { useMemo } from 'react'

const DAPP_ADDRESS =
  process.env.NEXT_PUBLIC_DAPP_ADDRESS ||
  '2dCVckCxPgmTPass9sqYedLi9QNQc7yNuW6rPTU1Su4d'

export const DialectNotificationsComponent = () => {
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), [])
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [])

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <DialectSolanaSdk dappAddress={DAPP_ADDRESS}>
          <NotificationsButton />
        </DialectSolanaSdk>
      </WalletProvider>
    </ConnectionProvider>
  )
}
