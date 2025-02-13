'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { TerminalStatus } from '@/components/header-container/terminal-status'
import { Title } from '@/components/header-container/title'
import { UserActions } from '@/components/header-container/user-actions'

export function Header() {
  const { walletAddress, mainUsername } = useCurrentWallet()

  return (
    <div className="w-full border-b border-green-800/50 text-[color:var(--text-header)]">
      <div className="mx-auto w-full">
        <div className="flex flex-col gap-4 pb-4 pt-2 w-full overflow-hidden">
          <TerminalStatus
            mainUsername={mainUsername}
            walletAddress={walletAddress}
          />

          <div className="flex items-center flex-col sm:flex-row justify-between w-full gap-4">
            <Title />
            <div className="flex items-center gap-4">
              <UserActions walletAddress={walletAddress} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
