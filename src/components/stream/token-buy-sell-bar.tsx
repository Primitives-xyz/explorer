export function TokenBuySellBar({ totalBuy, totalSell, decimals }: { totalBuy: number, totalSell: number, decimals: number }) {
  const total = totalBuy + totalSell
  const buyPercent = total > 0 ? totalBuy / total : 0.5
  const sellPercent = total > 0 ? totalSell / total : 0.5
  return (
    <div className="relative w-full h-3 rounded overflow-hidden flex flex-row border border-gray-700 bg-gray-800">
      <div style={{ width: `${buyPercent * 100}%` }} className="h-full bg-green-500 transition-all"></div>
      <div style={{ width: `${sellPercent * 100}%` }} className="h-full bg-red-500 transition-all"></div>
    </div>
  )
} 