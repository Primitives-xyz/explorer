import Link from 'next/link'

interface TerminalStatusProps {
  mainUsername?: string | null
}

export const TerminalStatus = ({ mainUsername }: TerminalStatusProps) => {
  return (
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
  )
}
