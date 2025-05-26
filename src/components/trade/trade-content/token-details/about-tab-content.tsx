import { BirdeyeTokenOverview } from '@/components/tapestry/models/token.models'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import {
  Button,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Spinner,
} from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import isFungibleToken from '@/utils/helper'
import { cn, formatCurrency, formatNumber } from '@/utils/utils'
import {
  Activity,
  BarChart3,
  Coins,
  DollarSign,
  Globe,
  Info,
  TrendingDown,
  TrendingUp,
  Twitter,
  Users,
} from 'lucide-react'
import { useEffect, useState } from 'react'

interface AboutTabContentProps {
  id: string
  overview?: BirdeyeTokenOverview
}

interface AboutProps {
  description: string
  decimals: number
  tokenProgram: string
}

const defaultAbout = {
  description: '',
  decimals: 6,
  tokenProgram: '',
}

function calculatePercentage(
  part: number | undefined,
  total: number | undefined
): string {
  if (
    part === undefined ||
    total === undefined ||
    isNaN(part) ||
    isNaN(total) ||
    total === 0
  ) {
    return '0%'
  }

  const result = (part / total) * 100
  return `${result.toFixed(2)}%`
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string | React.ReactNode
  subValue?: string
  trend?: number
  loading?: boolean
}

function MetricCard({
  icon,
  label,
  value,
  subValue,
  trend,
  loading,
}: MetricCardProps) {
  return (
    <Card variant={CardVariant.ACCENT} className="h-full">
      <CardContent className="p-3 md:p-4">
        <div className="flex items-start justify-between mb-2">
          <div className="text-muted-foreground">{icon}</div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 text-xs font-medium',
                trend >= 0 ? 'text-green-500' : 'text-red-500'
              )}
            >
              {trend >= 0 ? (
                <TrendingUp size={12} />
              ) : (
                <TrendingDown size={12} />
              )}
              {Math.abs(trend).toFixed(2)}%
            </div>
          )}
        </div>
        <p className="text-xs text-muted-foreground mb-1">{label}</p>
        {loading ? (
          <Spinner size={16} />
        ) : (
          <>
            <p className="text-sm md:text-base font-semibold">{value}</p>
            {subValue && (
              <p className="text-xs text-muted-foreground mt-1">{subValue}</p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function AboutTabContent({ id, overview }: AboutTabContentProps) {
  const { decimals: outputTokenDecimals, data: outputTokenData } =
    useTokenInfo(id)
  const [about, setAbout] = useState<AboutProps>(defaultAbout)

  useEffect(() => {
    if (outputTokenDecimals && outputTokenData) {
      setAbout({
        description: outputTokenData.result.content.metadata.description,
        decimals: outputTokenDecimals,
        tokenProgram: isFungibleToken(outputTokenData)
          ? outputTokenData.result.token_info.token_program
          : 'NONE',
      })
    }
  }, [outputTokenDecimals, outputTokenData])

  const priceChangeColor = overview?.priceChange24hPercent
    ? overview.priceChange24hPercent >= 0
      ? 'text-green-500'
      : 'text-red-500'
    : 'text-muted-foreground'

  return (
    <div className="space-y-4">
      {/* Header with price and social links */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <h2 className="text-2xl md:text-3xl font-bold">
              {overview ? formatCurrency(overview.price) : '...'}
            </h2>
            <span
              className={cn(
                'text-sm md:text-base font-medium',
                priceChangeColor
              )}
            >
              {overview ? (
                <>
                  {overview.priceChange24hPercent >= 0 ? '+' : ''}
                  {overview.priceChange24hPercent.toFixed(2)}%
                </>
              ) : (
                '...'
              )}
            </span>
          </div>
          {about.description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {about.description}
            </p>
          )}
        </div>

        {overview?.extensions && (
          <div className="flex flex-row md:flex-col gap-2">
            {overview.extensions.twitter && (
              <Button
                variant={ButtonVariant.BADGE}
                href={overview.extensions.twitter}
                newTab
                className="h-8"
              >
                <Twitter size={14} />
                <span className="hidden md:inline text-xs">Twitter</span>
              </Button>
            )}
            {overview.extensions.website && (
              <Button
                variant={ButtonVariant.BADGE}
                href={overview.extensions.website}
                newTab
                className="h-8"
              >
                <Globe size={14} />
                <span className="hidden md:inline text-xs">Website</span>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Key Trading Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MetricCard
          icon={<DollarSign size={16} />}
          label="Market Cap"
          value={
            overview ? formatSmartNumber(overview.mc, { compact: true }) : '...'
          }
          subValue={
            overview
              ? `FDV: ${formatSmartNumber(overview.realMc, { compact: true })}`
              : undefined
          }
        />

        <MetricCard
          icon={<Activity size={16} />}
          label="24h Volume"
          value={overview ? formatCurrency(overview.v24hUSD) : '...'}
          trend={overview?.priceChange24hPercent}
        />

        <MetricCard
          icon={<Users size={16} />}
          label="Holders"
          value={overview ? formatNumber(overview.holder) : '...'}
          subValue={
            overview
              ? `${formatNumber(overview.uniqueWallet24h)} active (24h)`
              : undefined
          }
        />

        <MetricCard
          icon={<BarChart3 size={16} />}
          label="24h Trades"
          value={overview ? formatNumber(overview.trade24h) : '...'}
          subValue={overview ? `${overview.numberMarkets} markets` : undefined}
        />
      </div>

      {/* Liquidity and Supply Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Card variant={CardVariant.ACCENT}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Coins size={16} className="text-muted-foreground" />
              <h3 className="font-semibold">Liquidity & Supply</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Liquidity
                </span>
                <span className="text-sm font-medium">
                  {overview ? formatCurrency(overview.liquidity) : '...'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Circulating Supply
                </span>
                <span className="text-sm font-medium">
                  {overview ? (
                    <div className="text-right">
                      <div>
                        {formatSmartNumber(overview.circulatingSupply, {
                          compact: true,
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {calculatePercentage(
                          overview.circulatingSupply,
                          overview.supply
                        )}{' '}
                        of total
                      </div>
                    </div>
                  ) : (
                    '...'
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Total Supply
                </span>
                <span className="text-sm font-medium">
                  {overview
                    ? formatSmartNumber(overview.supply, { compact: true })
                    : '...'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card variant={CardVariant.ACCENT}>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Info size={16} className="text-muted-foreground" />
              <h3 className="font-semibold">Token Info</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Decimals</span>
                <span className="text-sm font-medium">{about.decimals}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Token Program
                </span>
                <span
                  className="text-sm font-medium truncate max-w-[150px]"
                  title={about.tokenProgram}
                >
                  {about.tokenProgram || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Contract</span>
                <Button
                  variant={ButtonVariant.BADGE}
                  href={`https://solscan.io/token/${id}`}
                  newTab
                  className="h-6 text-xs"
                >
                  View on Solscan
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
