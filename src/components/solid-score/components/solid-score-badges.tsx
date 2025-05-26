import { SolidScoreResponse } from '@/components/tapestry/models/solid.score.models'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui'
import { cn } from '@/utils/utils'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

interface Props {
  data?: SolidScoreResponse
  smallView?: boolean
  compactLimit?: number
}

export function SolidScoreBadges({ data, smallView, compactLimit }: Props) {
  const t = useTranslations('menu.solid_score.badges')

  const badges: Record<
    string,
    {
      name: string
      description: string
      image: string
    }
  > = {
    SOLANA_OG: {
      name: t('solana_og.name'),
      description: t('solana_og.description'),
      image: '/images/solid-score/solid-score-badges/solana-og.svg',
    },
    SOLANA_POWER_USER: {
      name: t('solana_power_user.name'),
      description: t('solana_power_user.description'),
      image: '/images/solid-score/solid-score-badges/solana-power-user.svg',
    },
    HODLER: {
      name: t('hodler.name'),
      description: t('hodler.description'),
      image: '/images/solid-score/solid-score-badges/hodler.svg',
    },
    DEX_TRADER: {
      name: t('dex_trader.name'),
      description: t('dex_trader.description'),
      image: '/images/solid-score/solid-score-badges/dex-trader.svg',
    },
    RISK_TAKER: {
      name: t('risk_taker.name'),
      description: t('risk_taker.description'),
      image: '/images/solid-score/solid-score-badges/risk-taker.svg',
    },
    DIVERSE_NFT_TRADER: {
      name: t('diverse_nft_trader.name'),
      description: t('diverse_nft_trader.description'),
      image: '/images/solid-score/solid-score-badges/diverse-nft-trader.svg',
    },
    LIQUIDITY_PROVIDER: {
      name: t('liquidity_provider.name'),
      description: t('liquidity_provider.description'),
      image: '/images/solid-score/solid-score-badges/liquidity-provider.svg',
    },
    DIVERSE_LIQUIDITY_PROVIDER: {
      name: t('diverse_liquidity_provider.name'),
      description: t('diverse_liquidity_provider.description'),
      image:
        '/images/solid-score/solid-score-badges/diverse-liquidity-provider.svg',
    },
    DIVERSE_HODLER: {
      name: t('diverse_hodler.name'),
      description: t('diverse_hodler.description'),
      image: '/images/solid-score/solid-score-badges/diverse-hodler.svg',
    },
    MULTIPLATFORM_DEX_TRADER: {
      name: t('multiplatform_dex_trader.name'),
      description: t('multiplatform_dex_trader.description'),
      image:
        '/images/solid-score/solid-score-badges/multiplatform-dex-trader.svg',
    },
    NFT_TRADER: {
      name: t('nft_trader.name'),
      description: t('nft_trader.description'),
      image: '/images/solid-score/solid-score-badges/nft-trader.svg',
    },
    MULTIPLATFORM_NFT_TRADER: {
      name: t('multiplatform_nft_trader.name'),
      description: t('multiplatform_nft_trader.description'),
      image:
        '/images/solid-score/solid-score-badges/multiplatform-nft-trader.svg',
    },
    MULTIPLATFORM_LIQUIDITY_PROVIDER: {
      name: t('multiplatform_liquidity_provider.name'),
      description: t('multiplatform_liquidity_provider.description'),
      image:
        '/images/solid-score/solid-score-badges/multiplatform-liquidity-provider.svg',
    },
    NATIVE_STAKER: {
      name: t('native_staker.name'),
      description: t('native_staker.description'),
      image: '/images/solid-score/solid-score-badges/native-staker.svg',
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

  const userBadges = data?.badges ?? []

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
          {t('more_badges', { count: hiddenCount })}
        </span>
      )}
    </div>
  )
}
