'use client'

import '@/styles/dynamic-labs.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { SolanaWalletConnectors } from '@dynamic-labs/solana'

function WalletProviderComponent({ children }: { children: React.ReactNode }) {
  return (
    <DynamicContextProvider
      settings={{
        environmentId:
          process.env.NEXT_PUBLIC_DYNAMIC_ENVIRONMENT_ID ||
          '186dbeec-35af-4a94-8b5a-73b04840be61',
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
      {children}
    </DynamicContextProvider>
  )
}

export default WalletProviderComponent
