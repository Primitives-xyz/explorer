import { SolanaAddressDisplay } from '@/components/common/solana-address-display'
import { TokenBadges } from './token-badges'

export function TokenLiquidityProviders({ topWallets, totalVolume }: {
  topWallets: { wallet: string, totalVolume: number }[],
  totalVolume: number,
}) {
  return (
    <div className="flex flex-col items-end min-w-0">
      <span className="text-[10px] text-gray-400">Top Traders</span>
      <div className="flex flex-col gap-0.5 w-full items-end">
        {topWallets.length > 0 && totalVolume > 0 ? topWallets.map((w) => (
          <span key={w.wallet} className="flex items-center gap-1 text-[10px]">
            <SolanaAddressDisplay address={w.wallet} displayAbbreviatedAddress showCopyButton={false} highlightable />
            <span className="text-blue-400 font-bold">{((w.totalVolume / totalVolume) * 100).toFixed(1)}%</span>
          </span>
        )) : <span className="text-gray-500">--</span>}
      </div>
    </div>
  )
}