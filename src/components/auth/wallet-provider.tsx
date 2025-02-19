'use client'

import '@/styles/dynamic-labs.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { SolanaWalletConnectors } from '@dynamic-labs/solana'
import { WalletContextProvider } from './wallet-context'

function WalletProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
          'ab6ac670-0b93-4483-86a5-d0eff1dfca10',
        walletConnectors: [SolanaWalletConnectors],
      }}
      theme="dark"
      locale={{
        en: {
          dyn_login: {
            wallet_list: {
              button_only: 'Continue with wallet + email',
            },
          },
        },
      }}
    >
      <WalletContextProvider>{children}</WalletContextProvider>
    </DynamicContextProvider>
  )
}

export default WalletProviderComponent
