'use client'

import '@/styles/dynamic-labs.css'
import { DynamicContextProvider } from '@dynamic-labs/sdk-react-core'
import { SolanaWalletConnectors } from '@dynamic-labs/solana'
import { ReactNode } from 'react'

export function WalletProvider({ children }: { children: ReactNode }) {
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
      {children}
    </DynamicContextProvider>
  )
}
