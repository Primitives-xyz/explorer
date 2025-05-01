export function TokenPrice({ lastTradePriceSol }: { lastTradePriceSol: string | null }) {
  return (
    <div className="flex flex-row items-center gap-2">
      <span className="text-[10px] text-gray-400">Price</span>
      <span className="font-bold text-blue-400 text-xs">
        {lastTradePriceSol ? `${lastTradePriceSol} SOL` : '--'}
      </span>
    </div>
  )
} 