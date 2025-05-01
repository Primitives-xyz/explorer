import { TokenBadge } from './token-badge'
import { MintAggregate } from './stream-types'

export function TokenBadges({ agg }: { agg?: MintAggregate }) {
  if (!agg) return null;
  // Compute topWallets and totalVolume from agg
  const walletVolumes = typeof agg.walletVolumes === 'object' && agg.walletVolumes !== null ? agg.walletVolumes : {}
  const topWallets = Object.entries(walletVolumes)
    .map(([wallet, stats]: [string, any]) => ({ wallet, totalVolume: stats.totalVolume }))
    .sort((a, b) => b.totalVolume - a.totalVolume)
    .slice(0, 3)
  const totalVolume = agg.volumePerToken || 0

  // Badge definitions
  const badges: {
    key: string,
    icon: React.ReactNode,
    tooltip: string,
    variant: 'default' | 'secondary' | 'destructive' | 'outline',
    show: (agg: MintAggregate) => boolean
  }[] = [
    {
      key: 'concentrated',
      icon: '💩',
      tooltip: 'One trader controls more than 60% of the volume',
      variant: 'destructive',
      show: (agg) => {
        const walletVolumes = typeof agg.walletVolumes === 'object' && agg.walletVolumes !== null ? agg.walletVolumes : {}
        const topWallets = Object.entries(walletVolumes)
          .map(([wallet, stats]: [string, any]) => ({ wallet, totalVolume: stats.totalVolume }))
          .sort((a, b) => b.totalVolume - a.totalVolume)
        const totalVolume = agg.volumePerToken || 0
        return totalVolume > 0 && topWallets[0]?.totalVolume / totalVolume > 0.6
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