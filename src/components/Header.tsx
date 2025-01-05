'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton,
    ),
  { ssr: false },
)

const WalletConnectButton = (
  <div className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer">
    [CONNECT WALLET]
  </div>
) as React.ReactElement

export const Header = () => {
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { walletAddress, mainUsername, loadingMainUsername } =
    useCurrentWallet()

  const handleSearchClick = () => {
    // Trigger the global search with Cmd/Ctrl + K
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <div className="w-full border-b border-green-800/50">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col gap-4 pb-4 pt-2 w-full overflow-hidden">
          {/* Terminal Header */}
          <div className="w-full bg-black/20 px-3 py-1.5 border border-green-800/30 rounded-sm overflow-hidden">
            <div className="flex items-center justify-between text-[10px] text-green-600/80 whitespace-nowrap overflow-x-auto scrollbar-none">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500/80 flex-shrink-0"></div>
                STATUS: ONLINE | NETWORK: SOLANA | MODE: READ
              </div>
              {mainUsername && (
                <Link
                  href={`/${mainUsername}`}
                  className="font-bold text-green-500 hover:opacity-80 transition-opacity"
                >
                  USER: {mainUsername}
                </Link>
              )}
            </div>
          </div>

          {/* Main Title */}
          <div className="flex items-center flex-col sm:flex-row justify-between w-full gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-green-400 truncate">
                {`>`} social_graph_explorer.sol
              </h1>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <button
                onClick={handleSearchClick}
                className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0"
              >
                [SEARCH]
              </button>
              {!walletAddress && (
                <>
                  <div className="flex-shrink-0">
                    <DynamicConnectButton>
                      {WalletConnectButton}
                    </DynamicConnectButton>
                  </div>
                </>
              )}
              {walletAddress && (
                <Link
                  href={`/portfolio/${walletAddress}`}
                  className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
                >
                  [PORTFOLIO]
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
