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
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
    SOLANA_POWER_USER: {
      name: 'Solana Power User',
      description: 'High-volume transactor with consistent, frequent activity',
      image: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    },
    HODLER: {
      name: 'Hodler',
      description: 'Consistently holds assets without frequent trading',
      image: 'https://cdn-icons-png.flaticon.com/512/1828/1828817.png',
    },
    DEX_TRADER: {
      name: 'DEX Trader',
      description: 'Actively trades on decentralized exchanges',
      image: 'https://cdn-icons-png.flaticon.com/512/2203/2203183.png',
    },
    RISK_TAKER: {
      name: 'Risk Taker',
      description:
        'High-volatility trader with a history of significant PnL swings',
      image: 'https://cdn-icons-png.flaticon.com/512/1040/1040230.png',
    },
    DIVERSE_NFT_TRADER: {
      name: 'Diverse NFT Trader',
      description: 'Holds NFTs from a variety of collections',
      image: 'https://cdn-icons-png.flaticon.com/512/1256/1256650.png',
    },
    LIQUIDITY_PROVIDER: {
      name: 'Liquidity Provider',
      description: 'Supplies liquidity to DeFi protocols or DEX pools',
      image: 'https://cdn-icons-png.flaticon.com/512/833/833314.png',
    },
    DIVERSE_LIQUIDITY_PROVIDER: {
      name: 'Diverse Liquidity Provider',
      description: 'Provides liquidity positions across multiple asset pairs',
      image: 'https://cdn-icons-png.flaticon.com/512/2278/2278992.png',
    },
    DIVERSE_HODLER: {
      name: 'Diverse Hodler',
      description: 'Holds a wide variety of tokens across different categories',
      image: 'https://cdn-icons-png.flaticon.com/512/3039/3039435.png',
    },
    MULTIPLATFORM_DEX_TRADER: {
      name: 'Multiplatform DEX Trader',
      description: 'Trades across multiple DEXs',
      image: 'https://cdn-icons-png.flaticon.com/512/1828/1828919.png',
    },
    NFT_TRADER: {
      name: 'NFT Trader',
      description: 'Buys and sells NFTs actively on Solana',
      image: 'https://cdn-icons-png.flaticon.com/512/2933/2933245.png',
    },
    MULTIPLATFORM_NFT_TRADER: {
      name: 'Multiplatform NFT Trader',
      description: 'Trades NFTs across multiple marketplaces',
      image: 'https://cdn-icons-png.flaticon.com/512/3103/3103446.png',
    },
    MULTIPLATFORM_LIQUIDITY_PROVIDER: {
      name: 'Multiplatform Liquidity Provider',
      description: 'Provides liquidity across multiple platforms',
      image: 'https://cdn-icons-png.flaticon.com/512/1023/1023593.png',
    },
    NATIVE_STAKER: {
      name: 'Native Staker',
      description: 'Stakes SOL directly with validators',
      image: 'https://cdn-icons-png.flaticon.com/512/456/456141.png',
    },
  }

  const userBadgesMock = [
    'SOLANA_OG',
    'SOLANA_POWER_USER',
    'HODLER',
    'DEX_TRADER',
    'RISK_TAKER',
    'DIVERSE_NFT_TRADER',
    'LIQUIDITY_PROVIDER',
    'DIVERSE_LIQUIDITY_PROVIDER',
    'DIVERSE_HODLER',
    'MULTIPLATFORM_DEX_TRADER',
    'NFT_TRADER',
    'MULTIPLATFORM_NFT_TRADER',
    'MULTIPLATFORM_LIQUIDITY_PROVIDER',
    'NATIVE_STAKER',
  ]

  const userBadges = data?.solidUser.badges ?? []

  //  const userBadges = userBadgesMock

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
          'gap-2': smallView || showCompact,
          'pt-2': !showCompact,
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
                  width={showCompact ? 14 : smallView ? 15 : 16}
                  height={showCompact ? 14 : smallView ? 15 : 16}
                  className="rounded aspect-square object-contain"
                />
              </TooltipTrigger>
              <TooltipContent>
                <div>
                  <p className="font-bold text-sm">{badge.name}</p>
                  <p className="text-xs">{badge.description}</p>
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
