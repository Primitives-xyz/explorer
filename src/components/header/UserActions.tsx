'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'

import '@dialectlabs/react-ui/index.css'

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

interface UserActionsProps {
  walletAddress?: string
}

export const UserActions = ({ walletAddress }: UserActionsProps) => {
  const handleSearchClick = () => {
    const event = new KeyboardEvent('keydown', {
      key: 'k',
      metaKey: true,
      bubbles: true,
    })
    document.dispatchEvent(event)
  }

  return (
    <div className="flex items-center gap-3 w-full sm:w-auto">
      <button
        onClick={handleSearchClick}
        className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors cursor-pointer flex-shrink-0"
      >
        [SEARCH]
      </button>
      <Link
        href="/trade"
        className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
      >
        [TRADE]
      </Link>
      {!walletAddress && (
        <div className="flex-shrink-0">
          <DynamicConnectButton>{WalletConnectButton}</DynamicConnectButton>
        </div>
      )}
      {walletAddress && (
        <Link
          href={`/${walletAddress}`}
          className="px-4 py-1.5 border border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400 font-mono text-sm transition-colors flex-shrink-0"
        >
          [PORTFOLIO]
        </Link>
      )}
    </div>
  )
}
