'use client'

import {
  metadata,
  WalletAdapterWithMutableSupportedTransactionVersions,
} from '@/lib/constants'
import { UnifiedWalletProvider } from '@jup-ag/wallet-adapter'
import { IWalletNotification } from '@jup-ag/wallet-adapter/dist/types/contexts/WalletConnectionProvider'
import {
  Adapter,
  BaseSignerWalletAdapter,
  WalletAdapterNetwork,
} from '@solana/wallet-adapter-base'
import {
  PhantomWalletAdapter,
  WalletConnectWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import {
  initialize as initializeSolflareAndMetamaskSnap,
  SolflareWalletAdapter,
} from '@solflare-wallet/wallet-adapter'
import { useMemo } from 'react'
import { OnWalletChangeDisconnect } from './on-wallet-change-disconnect'

initializeSolflareAndMetamaskSnap()

export default function WalletProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const wallets: Adapter[] = useMemo(() => {
    const walletConnectWalletAdapter: WalletAdapterWithMutableSupportedTransactionVersions<BaseSignerWalletAdapter> | null =
      (() => {
        const adapter: WalletAdapterWithMutableSupportedTransactionVersions<BaseSignerWalletAdapter> =
          new WalletConnectWalletAdapter({
            network: WalletAdapterNetwork.Mainnet,
            options: {
              metadata: {
                name: metadata.name,
                description: metadata.description,
                url: metadata.url,
                icons: metadata.iconUrls,
              },
            },
          })

        // While sometimes supported, it mostly isn't. Should this be dynamic in the wallet-adapter instead?
        //@ts-ignore
        adapter.supportedTransactionVersions = new Set(['legacy'])
        return adapter
      })()

    return [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      walletConnectWalletAdapter,
    ].filter((item) => item && item.name && item.icon) as Adapter[]
  }, [])

  const params: Omit<Parameters<typeof UnifiedWalletProvider>[0], 'children'> =
    useMemo(
      () => ({
        wallets: wallets,
        config: {
          autoConnect: true,
          // autoConnect: false,
          env: 'mainnet-beta',
          metadata,
          notificationCallback: {
            onConnect: (props: IWalletNotification) => {
              console.log('onConnect', props)
            },
            onConnecting: (props: IWalletNotification) => {
              console.log('onConnecting', props)
            },
            onDisconnect: (props: IWalletNotification) => {
              console.log('onDisconnect', props)
            },
            onNotInstalled: (props: IWalletNotification) => {
              console.log('onNotInstalled', props)
            },
          },
          walletlistExplanation: {
            href: 'https://station.jup.ag/docs/additional-topics/wallet-list',
          },
          theme: 'dark',
          lang: 'en',
          provider: 'solana-wallet-adapter',
        },
      }),
      [wallets]
    )

  return (
    <UnifiedWalletProvider {...params}>
      <OnWalletChangeDisconnect />
      {children}
    </UnifiedWalletProvider>
  )
}
