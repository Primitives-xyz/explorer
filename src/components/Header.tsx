'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import dynamic from 'next/dynamic'
import Link from 'next/link'

const DynamicWidget = dynamic(
  () => import('@dynamic-labs/sdk-react-core').then((mod) => mod.DynamicWidget),
  { ssr: false },
)

export const Header = () => {
  const { walletAddress, mainUsername, loadingMainUsername } =
    useCurrentWallet()

  return (
    <div className="w-full border-b border-green-800/50">
      <div className="max-w-6xl mx-auto px-4 w-full">
        <div className="flex flex-col gap-4 mb-6 pb-4 w-full overflow-hidden">
          {/* Terminal Header */}
          <div className="w-full bg-black/20 px-3 py-1 border border-green-800/30 rounded-sm overflow-hidden">
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
          <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
            <Link href="/" className="hover:opacity-80 transition-opacity">
              <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-green-400 truncate">
                {`>`} social_graph_explorer.sol
              </h1>
            </Link>

            {/* Actions */}
            <div className="flex items-center gap-3 w-full sm:w-auto overflow-x-auto scrollbar-none">
              <div className="mt-[3px] flex-shrink-0">
                <DynamicWidget />
              </div>
              <Link
                href={walletAddress ? `/portfolio/${walletAddress}` : '#'}
                className={`px-4 py-1.5 border font-mono text-sm transition-colors flex-shrink-0 ${
                  walletAddress
                    ? 'border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400'
                    : 'border-gray-700/50 text-gray-600 cursor-not-allowed'
                }`}
              >
                [PORTFOLIO]
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
