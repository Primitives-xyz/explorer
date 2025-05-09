import { SolanaAddressDisplay } from '@/components/common/solana-address-display'

export function TokenLiquidityProviders({ walletRugIncentive = {} }: {
  walletRugIncentive?: Record<string, number>
}) {
  const topRuggers = Object.entries(walletRugIncentive)
    .sort((a, b) => (b[1] as number) - (a[1] as number))
    .slice(0, 3)

  return (
    <div className="flex flex-col items-end min-w-0">
      <span className="text-[10px] text-red-400 font-bold flex items-center gap-1">
        Possible Ruggers <span>👹</span>
      </span>
      <div className="flex flex-col gap-0.5 w-full items-end">
        {topRuggers.length > 0 ? (
          topRuggers.map(([wallet, incentive]) => (
            <span key={wallet} className="flex items-center gap-1 text-[10px]">
              <SolanaAddressDisplay address={wallet} displayAbbreviatedAddress showCopyButton={false} highlightable />
              <span className="text-red-400 font-bold">{((incentive as number) * 100).toFixed(2)}%</span>
            </span>
          ))
        ) : (
          <span className="text-gray-500">--</span>
        )}
      </div>
    </div>
  )
}