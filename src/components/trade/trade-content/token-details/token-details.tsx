import { useSwapStore } from '@/components/swap/stores/use-swap-store'
import { useBirdeyeTokenOverview } from '@/components/trade/hooks/use-birdeye-token-overview'
import {
  FilterTabsTokenDetails,
  FilterTabsYourTransactions,
  FilterTokenDetails,
  TabsTokenDetails,
} from '@/components/trade/trade-content/filter-token-details'
import { AboutTabContent } from '@/components/trade/trade-content/token-details/about-tab-content'
import { MarketsTabContent } from '@/components/trade/trade-content/token-details/markets-tab-content'
import { TokenHoldersTabContent } from '@/components/trade/trade-content/token-details/token-holders-tab-content'
import {
  Badge,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui'
import { SOL_MINT } from '@/utils/constants'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { cn, formatCurrency, formatNumber } from '@/utils/utils'
import {
  Activity,
  DollarSign,
  Droplets,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { YourTransactions } from '../transactions/your-transactions'

interface TokenDetailsProps {
  id: string
}

interface QuickStatProps {
  label: string
  value: string | number
  change?: number
  icon?: React.ReactNode
  loading?: boolean
}

function QuickStat({ label, value, change, icon, loading }: QuickStatProps) {
  return (
    <div className="flex flex-col space-y-1 min-w-0">
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {icon}
        <span className="truncate">{label}</span>
      </div>
      <div className="flex flex-col">
        <span className="text-sm md:text-base font-semibold truncate">
          {loading ? '...' : value}
        </span>
        {change !== undefined && !loading && (
          <span
            className={cn(
              'text-xs font-medium flex items-center gap-0.5 mt-0.5',
              change >= 0 ? 'text-green-500' : 'text-red-500'
            )}
          >
            {change >= 0 ? (
              <TrendingUp size={10} />
            ) : (
              <TrendingDown size={10} />
            )}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
      </div>
    </div>
  )
}

export function TokenDetails({ id }: TokenDetailsProps) {
  const { walletAddress, setShowAuthFlow } = useCurrentWallet()
  const { overview, isLoading } = useBirdeyeTokenOverview(id)
  const { setOpen, setInputs } = useSwapStore()
  const [selectedType, setSelectedType] = useState(
    TabsTokenDetails.TOKEN_DETAILS
  )
  const [sort, setSort] = useState<
    FilterTabsTokenDetails | FilterTabsYourTransactions
  >(FilterTabsTokenDetails.ABOUT)

  useEffect(() => {
    if (selectedType === TabsTokenDetails.TOKEN_DETAILS) {
      setSort(FilterTabsTokenDetails.ABOUT)
    } else {
      setSort(FilterTabsYourTransactions.ALL)
    }
  }, [selectedType])

  const handleSwapClick = () => {
    setOpen(true)
    setInputs({
      inputMint: SOL_MINT,
      outputMint: id,
      inputAmount: 0,
    })
  }

  const priceChangeColor = overview?.priceChange24hPercent
    ? overview.priceChange24hPercent >= 0
      ? 'text-green-500'
      : 'text-red-500'
    : 'text-muted-foreground'

  // Calculate market cap with multiple fallbacks
  let displayMarketCap = 0
  let marketCapLabel = 'Market Cap'

  if (overview) {
    // Debug log to see what data we're getting
    console.log('Token Overview Data:', {
      ca: id,
      symbol: overview.symbol,
      price: overview.price,
      mc: overview.mc,
      realMc: overview.realMc,
      supply: overview.supply,
      circulatingSupply: overview.circulatingSupply,
    })

    // Priority 1: Use the mc field if it's valid
    if (overview.mc && overview.mc > 0) {
      displayMarketCap = overview.mc
    }
    // Priority 2: Calculate from price × circulating supply
    else if (overview.price > 0 && overview.circulatingSupply > 0) {
      displayMarketCap = overview.price * overview.circulatingSupply
    }
    // Priority 3: If total supply is 0 but we have circulating supply, use that for FDV
    else if (
      overview.price > 0 &&
      overview.circulatingSupply > 0 &&
      (!overview.supply || overview.supply === 0)
    ) {
      displayMarketCap = overview.price * overview.circulatingSupply
      marketCapLabel = 'Market Cap'
      console.log(
        'Using circulating supply for market cap (total supply is 0):',
        displayMarketCap
      )
    }
    // Priority 4: Use realMc (FDV) if available
    else if (overview.realMc && overview.realMc > 0) {
      displayMarketCap = overview.realMc
      marketCapLabel = 'FDV'
    }
    // Priority 5: Calculate FDV from price × total supply
    else if (overview.price > 0 && overview.supply > 0) {
      displayMarketCap = overview.price * overview.supply
      marketCapLabel = 'FDV'
      console.log('Calculated FDV from price × total supply:', displayMarketCap)
    }

    // If we still don't have a market cap but have price, try to estimate
    if (displayMarketCap === 0 && overview.price > 0) {
      // For tokens without supply data, we can't calculate market cap
      console.warn('Unable to calculate market cap - missing supply data')
    }
  }

  return (
    <div className="space-y-4">
      {/* Quick Trading Stats Bar - Always visible at top */}
      <Card className="bg-gradient-to-r from-card to-card-accent border-primary/20">
        <CardContent className="p-4">
          {/* Price and Swap CTA */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xl md:text-2xl font-bold">
                  {overview
                    ? overview.price < 0.01
                      ? `$${overview.price.toFixed(6)}`
                      : overview.price < 1
                      ? `$${overview.price.toFixed(4)}`
                      : formatCurrency(overview.price)
                    : '...'}
                </h2>
                <span className={cn('text-sm font-medium', priceChangeColor)}>
                  {overview && !isLoading ? (
                    <>
                      {overview.priceChange24hPercent >= 0 ? '+' : ''}
                      {overview.priceChange24hPercent.toFixed(2)}%
                    </>
                  ) : (
                    '...'
                  )}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {overview?.symbol || 'Token'} Price
              </p>
            </div>
          </div>

          {/* Key Metrics Grid - Only showing non-duplicate info */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
            <QuickStat
              icon={<DollarSign size={12} />}
              label={marketCapLabel}
              value={
                displayMarketCap > 0
                  ? `$${formatSmartNumber(displayMarketCap, { compact: true })}`
                  : '...'
              }
              loading={isLoading}
            />

            <QuickStat
              icon={<Activity size={12} />}
              label="24h Volume"
              value={overview ? formatCurrency(overview.v24hUSD) : '...'}
              change={overview?.priceChange24hPercent}
              loading={isLoading}
            />

            <QuickStat
              icon={<Droplets size={12} />}
              label="Liquidity"
              value={overview ? formatCurrency(overview.liquidity) : '...'}
              loading={isLoading}
            />

            <QuickStat
              icon={<Users size={12} />}
              label="24h Active"
              value={overview ? formatNumber(overview.uniqueWallet24h) : '...'}
              loading={isLoading}
            />
          </div>

          {/* Risk Indicators for Meme Coins */}
          {overview && !isLoading && (
            <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
              {/* High volume indicator */}
              {overview.v24hUSD > displayMarketCap * 0.5 &&
                displayMarketCap > 0 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-yellow-500/50 text-yellow-500"
                  >
                    🔥 High Volume
                  </Badge>
                )}

              {/* New token indicator */}
              {overview.holder < 1000 && (
                <Badge
                  variant="outline"
                  className="text-xs border-blue-500/50 text-blue-500"
                >
                  🆕 New Token
                </Badge>
              )}

              {/* Price pump indicator */}
              {overview.priceChange24hPercent > 50 && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-500/50 text-green-500"
                >
                  🚀 Pumping
                </Badge>
              )}

              {/* Low liquidity warning */}
              {overview.liquidity < 10000 && (
                <Badge
                  variant="outline"
                  className="text-xs border-red-500/50 text-red-500"
                >
                  ⚠️ Low Liquidity
                </Badge>
              )}

              {/* High FDV relative to MC */}
              {overview.mc > 0 &&
                overview.realMc > 0 &&
                overview.realMc / overview.mc > 2 && (
                  <Badge
                    variant="outline"
                    className="text-xs border-orange-500/50 text-orange-500"
                  >
                    📊 High FDV
                  </Badge>
                )}

              {/* Very small market cap */}
              {displayMarketCap > 0 && displayMarketCap < 100000 && (
                <Badge
                  variant="outline"
                  className="text-xs border-purple-500/50 text-purple-500"
                >
                  💎 Micro Cap
                </Badge>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detailed Information Tabs */}
      <Card>
        <CardHeader>
          <CardTitle>
            <FilterTokenDetails
              selectedType={selectedType}
              setSelectedType={setSelectedType}
              sort={sort}
              setSort={setSort}
            />
          </CardTitle>
        </CardHeader>
        <CardContent>
          {selectedType === TabsTokenDetails.TOKEN_DETAILS && (
            <>
              {FilterTabsTokenDetails.ABOUT === sort && (
                <AboutTabContent id={id} overview={overview} />
              )}

              {FilterTabsTokenDetails.TOKEN_HOLDERS === sort && (
                <TokenHoldersTabContent id={id} overview={overview} />
              )}

              {FilterTabsTokenDetails.MARKETS === sort && <MarketsTabContent />}
            </>
          )}
          {selectedType === TabsTokenDetails.YOUR_TRANSACTIONS && (
            <YourTransactions
              id={id}
              walletAddress={walletAddress}
              sort={sort as FilterTabsYourTransactions}
              setShowAuthFlow={setShowAuthFlow}
            />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
