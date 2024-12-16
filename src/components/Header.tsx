import { DynamicWidget } from '@dynamic-labs/sdk-react-core'
import Link from 'next/link'

export const Header = ({ walletAddress }: { walletAddress: string }) => (
  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-6 border-b border-green-800 pb-2">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
        {`>`} social_graph_explorer.sol
      </h1>
      <div className="text-xs text-green-600">
        STATUS: ONLINE | NETWORK: SOLANA | MODE: READ
      </div>
    </div>
    <div className="flex items-center gap-4 w-full sm:w-auto">
      <div className="mt-[3px]">
        <DynamicWidget variant="dropdown" />
      </div>
      <Link
        href={walletAddress ? `/portfolio/${walletAddress}` : '#'}
        className={`px-3 py-1 border whitespace-nowrap ${
          walletAddress
            ? 'border-green-500 text-green-400 hover:bg-green-900/30'
            : 'border-gray-700 text-gray-600 cursor-not-allowed'
        }`}
      >
        [PORTFOLIO]
      </Link>
    </div>
  </div>
)
