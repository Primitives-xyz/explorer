interface TokenMarketActivityProps {
  isLoading?: boolean
  overview?: any
}

export function TokenMarketActivity({
  isLoading,
  overview,
}: TokenMarketActivityProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
      {/* Buy/Sell Ratio */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3 col-span-2 md:col-span-1">
        <div className="text-sm text-gray-400 mb-2">Buy/Sell Ratio (24h)</div>
        <div className="flex items-center gap-2 mb-2">
          <div className="w-full  rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full"
              style={{ width: '51.2%' }}
            ></div>
          </div>
          <span className="text-xs font-mono whitespace-nowrap">51.2%</span>
        </div>
        <div className="flex justify-between text-xs font-mono">
          <span className="text-green-500">Buy: 5,046</span>
          <span className="text-red-500">Sell: 4,802</span>
        </div>
      </div>

      {/* Trading Volume */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-400">Volume</div>
        <div className="text-lg font-bold font-mono text-green-400">$1.60M</div>
        <div className="flex items-center text-xs text-green-500 font-mono">
          +181.05%
        </div>
      </div>

      {/* Unique Wallets */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3">
        <div className="text-sm text-gray-400">Wallets</div>
        <div className="text-lg font-bold font-mono">1,882</div>
        <div className="flex items-center text-xs text-green-500 font-mono">
          +19.42%
        </div>
      </div>

      {/* Trading Markets */}
      <div className="bg-black/40 border border-green-800/40 rounded-lg p-3 col-span-2 md:col-span-1">
        <div className="text-sm text-gray-400">Markets</div>
        <div className="text-lg font-bold font-mono">6</div>
        <div className="text-xs text-gray-400 font-mono">Trading pairs</div>
      </div>
    </div>
  )
}
