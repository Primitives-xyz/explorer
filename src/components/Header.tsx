import { DynamicWidget } from '@dynamic-labs/sdk-react-core'
import Link from 'next/link'

export const Header = ({ walletAddress }: { walletAddress: string }) => (
  <div className="flex flex-col gap-4 mb-6 border-b border-green-800/50 pb-4">
    {/* Terminal Header */}
    <div className="w-full bg-black/20 px-3 py-1 border border-green-800/30 rounded-sm">
      <div className="flex items-center gap-2 text-[10px] text-green-600/80">
        <div className="w-2 h-2 rounded-full bg-green-500/80"></div>
        STATUS: ONLINE | NETWORK: SOLANA | MODE: READ
      </div>
    </div>

    {/* Main Title */}
    <div className="flex flex-col sm:flex-row justify-between w-full gap-4">
      <h1 className="text-xl sm:text-2xl font-mono font-bold tracking-tight text-green-400">
        {`>`} social_graph_explorer.sol
      </h1>

      {/* Actions */}
      <div className="flex items-center gap-3 w-full sm:w-auto">
        <div className="mt-[3px]">
          <DynamicWidget variant="dropdown" />
        </div>
        <Link
          href={walletAddress ? `/portfolio/${walletAddress}` : '#'}
          className={`px-4 py-1.5 border font-mono text-sm transition-colors ${
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
)
