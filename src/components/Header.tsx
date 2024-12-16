import Link from 'next/link'

export const Header = ({ walletAddress }: { walletAddress: string }) => (
  <div className="flex justify-between items-center mb-6 border-b border-green-800 pb-2">
    <div>
      <h1 className="text-2xl font-bold tracking-tight">
        {`>`} social_graph_explorer.sol
      </h1>
      <div className="text-xs text-green-600">
        STATUS: ONLINE | NETWORK: SOLANA | MODE: READ
      </div>
    </div>
    <Link
      href={walletAddress ? `/portfolio/${walletAddress}` : '#'}
      className={`px-3 py-1 border ${
        walletAddress
          ? 'border-green-500 text-green-400 hover:bg-green-900/30'
          : 'border-gray-700 text-gray-600 cursor-not-allowed'
      }`}
    >
      [PORTFOLIO]
    </Link>
  </div>
)
