import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import Image from 'next/image'

interface Props {
  data?: SolidScoreResponse
  smallView?: boolean
  compactLimit?: number
}

export function SolidScoreBadges({ data, smallView, compactLimit }: Props) {
  const badges: Record<
    string,
    {
      name: string
      description: string
      image: string
    }
  > = {
    SOLANA_OG: {
      name: 'Solana OG',
      description: 'Early adopter with a long history of engagement',
      image: '/images/solid-score-badges/solana-og.svg',
    },
    SOLANA_POWER_USER: {
      name: 'Solana Power User',
      description: 'High-volume transactor with consistent, frequent activity',
      image: '/images/solid-score-badges/solana-power-user.svg',
    },
    HODLER: {
      name: 'Hodler',
      description: 'Consistently holds assets without frequent trading',
      image: '/images/solid-score-badges/hodler.svg',
    },
    DEX_TRADER: {
      name: 'DEX Trader',
      description: 'Actively trades on decentralized exchanges',
      image: '/images/solid-score-badges/dex-trader.svg',
    },
    RISK_TAKER: {
      name: 'Risk Taker',
      description:
        'High-volatility trader with a history of significant PnL swings',
      image: '/images/solid-score-badges/risk-taker.svg',
    },
    DIVERSE_NFT_TRADER: {
      name: 'Diverse NFT Trader',
      description: 'Holds NFTs from a variety of collections',
      image: '/images/solid-score-badges/diverse-nft-trader.svg',
    },
    LIQUIDITY_PROVIDER: {
      name: 'Liquidity Provider',
      description: 'Supplies liquidity to DeFi protocols or DEX pools',
      image: '/images/solid-score-badges/liquidity-provider.svg',
    },
    DIVERSE_LIQUIDITY_PROVIDER: {
      name: 'Diverse Liquidity Provider',
      description: 'Provides liquidity positions across multiple asset pairs',
      image: '/images/solid-score-badges/diverse-liquidity-provider.svg',
    },
    DIVERSE_HODLER: {
      name: 'Diverse Hodler',
      description: 'Holds a wide variety of tokens across different categories',
      image: '/images/solid-score-badges/diverse-hodler.svg',
    },
    MULTIPLATFORM_DEX_TRADER: {
      name: 'Multiplatform DEX Trader',
      description: 'Trades across multiple DEXs',
      image: '/images/solid-score-badges/multiplatform-dex-trader.svg',
    },
    NFT_TRADER: {
      name: 'NFT Trader',
      description: 'Buys and sells NFTs actively on Solana',
      image: '/images/solid-score-badges/nft-trader.svg',
    },
    MULTIPLATFORM_NFT_TRADER: {
      name: 'Multiplatform NFT Trader',
      description: 'Trades NFTs across multiple marketplaces',
      image: '/images/solid-score-badges/multiplatform-nft-trader.svg',
    },
    MULTIPLATFORM_LIQUIDITY_PROVIDER: {
      name: 'Multiplatform Liquidity Provider',
      description: 'Provides liquidity across multiple platforms',
      image: '/images/solid-score-badges/multiplatform-liquidity-provider.svg',
    },
    NATIVE_STAKER: {
      name: 'Native Staker',
      description: 'Stakes SOL directly with validators',
      image: '/images/solid-score-badges/native-staker.svg',
    },
  }

  // const userBadgesMock = [
  //   'SOLANA_OG',
  //   'SOLANA_POWER_USER',
  //   'HODLER',
  //   'DEX_TRADER',
  //   'RISK_TAKER',
  //   'DIVERSE_NFT_TRADER',
  //   'LIQUIDITY_PROVIDER',
  //   'DIVERSE_LIQUIDITY_PROVIDER',
  //   'DIVERSE_HODLER',
  //   'MULTIPLATFORM_DEX_TRADER',
  //   'NFT_TRADER',
  //   'MULTIPLATFORM_NFT_TRADER',
  //   'MULTIPLATFORM_LIQUIDITY_PROVIDER',
  //   'NATIVE_STAKER',
  // ]
  // const userBadges = userBadgesMock

  const userBadges = data?.solidUser.badges ?? []

  const showCompact = typeof compactLimit === 'number'

  const displayedBadges = showCompact
    ? userBadges.slice(0, compactLimit)
    : userBadges
  const hiddenCount = showCompact ? userBadges.length - compactLimit : 0

  return (
    <div
      className={cn(
        {
          'gap-4 px-10': !smallView && !showCompact,
          'gap-2': smallView,
          'pt-2': !showCompact,
          'gap-1': showCompact,
        },
        'flex flex-wrap justify-center'
      )}
    >
      {displayedBadges.map((key) => {
        const badge = badges[key]
        if (!badge) return null
        return (
          <TooltipProvider key={key}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Image
                  src={badge.image}
                  alt={key}
                  width={showCompact ? 18 : smallView ? 15 : 16}
                  height={showCompact ? 18 : smallView ? 15 : 16}
                  className="rounded-full aspect-square object-contain"
                />
              </TooltipTrigger>
              <TooltipContent>
                <div className="flex items-center gap-2">
                  <Image
                    src={badge.image}
                    alt={key}
                    width={40}
                    height={40}
                    className="rounded-full aspect-square object-contain"
                  />
                  <div className="flex-col">
                    <p className="font-bold text-sm">{badge.name}</p>
                    <p className="text-xs">{badge.description}</p>
                  </div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      })}

      {showCompact && hiddenCount > 0 && (
        <span className="text-xs text-muted-foreground font-bold">
          + {hiddenCount} more
        </span>
      )}
    </div>
  )
}
