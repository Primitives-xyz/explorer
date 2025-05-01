import styles from './token-bonded-bar.module.css'

export function TokenBuySellBar({ totalBuy, totalSell, decimals }: { totalBuy: number, totalSell: number, decimals: number }) {
  const total = totalBuy + totalSell
  const buyPercent = total > 0 ? totalBuy / total : 0.5
  const sellPercent = total > 0 ? totalSell / total : 0.5
  return (
    <div className="relative w-full h-3 rounded overflow-hidden flex flex-row border border-gray-700 bg-gray-800">
      <div
        style={{ width: `${buyPercent * 100}%` }}
        className={`h-full ${styles['token-buy-bar-gradient']} ${styles['animate-gradient-x']} transition-all`}
      ></div>
      <div
        style={{ width: `${sellPercent * 100}%` }}
        className={`h-full ${styles['token-sell-bar-gradient']} ${styles['animate-gradient-x']} transition-all`}
      ></div>
    </div>
  )
} 