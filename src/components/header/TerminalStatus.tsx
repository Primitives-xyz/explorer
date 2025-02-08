import Link from 'next/link'
import { TokenBalance } from './TokenBalance'

interface TerminalStatusProps {
  mainUsername?: string | null
  walletAddress?: string
}

const shortenAddress = (address: string) => {
  return `${address.slice(0, 4)}...${address.slice(-4)}`
}

export const TerminalStatus = ({
  mainUsername,
  walletAddress,
}: TerminalStatusProps) => {
  const tokenAddress = 'H4phNbsqjV5rqk8u6FUACTLB6rNZRTAPGnBb8KXJpump'

  return (
    <div className="w-full bg-black/20 px-3 py-1.5 border border-green-800/30 rounded-sm overflow-hidden">
      <div className="flex items-center justify-between text-[10px] text-green-600/80 whitespace-nowrap overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500/80 flex-shrink-0"></div>
          <span className="hidden sm:inline">
            STATUS: ONLINE | NETWORK: SOLANA |
          </span>
          <span>$SSE: </span>
          <Link
            href={`/${tokenAddress}`}
            className="text-green-500 hover:opacity-80 transition-opacity"
            title={tokenAddress}
          >
            <span className="sm:hidden">{shortenAddress(tokenAddress)}</span>
            <span className="hidden sm:inline">{tokenAddress}</span>
          </Link>
          {walletAddress && (
            <span className="text-green-600/80">
              {' '}
              (Bal: <TokenBalance walletAddress={walletAddress} />)
            </span>
          )}
        </div>
        {mainUsername && (
          <Link
            href={`/${mainUsername}`}
            className="font-bold text-green-500 hover:opacity-80 transition-opacity flex-shrink-0"
          >
            USER: {mainUsername}
          </Link>
        )}
      </div>
    </div>
  )
}
