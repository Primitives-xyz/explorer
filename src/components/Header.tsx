'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { TerminalStatus } from './header/TerminalStatus'
import { Title } from './header/Title'
import { UserActions } from './header/UserActions'

export const Header = () => {
  const { walletAddress, mainUsername } = useCurrentWallet()

  return (
    <div className="w-full border-b border-green-800/50">
      <div className="max-w-6xl mx-auto px-4 w-full">
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
