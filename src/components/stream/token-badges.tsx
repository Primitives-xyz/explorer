import { TokenBadge } from './token-badge'
import { MintAggregate } from './stream-types'
import { LAMPORTS_PER_SOL } from '@solana/web3.js'

export function TokenBadges({ agg }: { agg?: MintAggregate }) {
  if (!agg) return null;
  const walletVolumes = typeof agg.walletVolumes === 'object' && agg.walletVolumes !== null ? agg.walletVolumes : {}


  // Badge definitions
  const badges: {
    key: string,
    icon: React.ReactNode,
    tooltip: string,
    variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost',
    show: (agg: MintAggregate) => boolean
  }[] = [
    {
      key: 'concentrated',
      icon: '💩',
      tooltip: 'One trader controls more than 60% of the volume',
      variant: 'outline',
      show: (agg) => {
        const walletVolumes = typeof agg.walletVolumes === 'object' && agg.walletVolumes !== null ? agg.walletVolumes : {}
        const topWallets = Object.entries(walletVolumes)
          .map(([wallet, stats]: [string, any]) => ({ wallet, totalVolume: stats.totalVolume }))
          .sort((a, b) => b.totalVolume - a.totalVolume)
        const totalVolume = agg.volumePerToken || 0
        return totalVolume > 0 && topWallets[0]?.totalVolume / totalVolume > 0.6
      },
    },
    {
      key: 'sapling',
      icon: '🌱',
      tooltip: 'Top 3 traders control less than 20% of the total volume. Volume is well distributed!',
      variant: 'outline',
      show: (agg) => {
        const walletVolumes = typeof agg.walletVolumes === 'object' && agg.walletVolumes !== null ? agg.walletVolumes : {}
        const topWallets = Object.entries(walletVolumes)
          .map(([wallet, stats]: [string, any]) => ({ wallet, totalVolume: stats.totalVolume }))
          .sort((a, b) => b.totalVolume - a.totalVolume)
        const totalVolume = agg.volumePerToken || 0
        const top3Volume = topWallets.slice(0, 3).reduce((sum, w) => sum + (w.totalVolume || 0), 0)
        return totalVolume > 0 && (top3Volume / totalVolume) < 0.2
      },
    },
    {
      key: 'recent-rug',
      icon: '☠️',
      tooltip: 'Low liquidity post graduation.',
      variant: 'ghost',
      show: (agg) => {
        if (!agg.fullyBonded) return false;
        const lastTrade = agg.lastTrade?.eventData?.tradeEvents?.[0];
        if (!lastTrade || !lastTrade.realSolReserves) return false;
        const realSol = Number(lastTrade.realSolReserves) / LAMPORTS_PER_SOL;
        return realSol < 10;
      },
    },
  ]

  return (
    <div className="flex flex-row gap-2 mt-1">
      {badges.filter(b => b.show(agg)).map(badge => (
        <TokenBadge key={badge.key} icon={badge.icon} tooltip={badge.tooltip} variant={badge.variant} />
      ))}
    </div>
  )
} 