'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useCopyTradeStats } from '@/hooks/use-copy-trade-analytics'
import { formatNumber } from '@/utils/utils'
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DollarSign,
  TrendingUp,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'

interface CopyTradeStatsProps {
  walletAddress: string
}

export function CopyTradeStats({ walletAddress }: CopyTradeStatsProps) {
  const t = useTranslations()
  const { data: stats, isLoading } = useCopyTradeStats(walletAddress)

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-7 w-[120px]" />
              <Skeleton className="h-3 w-[80px] mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats) {
    return null
  }

  const statsCards = [
    {
      title: t('copy_trade.stats.trades_copied'),
      value: stats.asSource.totalTradesCopied,
      change: stats.last24h.tradesCopied,
      icon: TrendingUp,
      description: t('copy_trade.stats.unique_copiers', {
        count: stats.asSource.uniqueCopiers,
      }),
    },
    {
      title: t('copy_trade.stats.volume_generated'),
      value: `$${formatNumber(stats.asSource.totalVolumeGeneratedUsd)}`,
      change: stats.last24h.volumeGeneratedUsd,
      icon: DollarSign,
      description: t('copy_trade.stats.last_24h'),
      changePrefix: '$',
    },
    {
      title: t('copy_trade.stats.profit_generated'),
      value: `$${formatNumber(stats.asSource.totalProfitGeneratedUsd)}`,
      change: stats.last24h.profitGeneratedUsd,
      icon: ArrowUpIcon,
      description: t('copy_trade.stats.for_copiers'),
      changePrefix: '$',
    },
    {
      title: t('copy_trade.stats.pending_earnings'),
      value: `$${formatNumber(stats.asSource.pendingPaymentsUsd)}`,
      icon: Users,
      description: t('copy_trade.stats.to_be_paid'),
    },
  ]

  return (
    <div className="space-y-6">
      {/* Source Trader Stats */}
      <div>
        <h3 className="text-lg font-semibold mb-4">
          {t('copy_trade.as_source_trader')}
        </h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
                {stat.change !== undefined && (
                  <p className="text-xs text-green-600 mt-1">
                    +{stat.changePrefix}
                    {formatNumber(stat.change)} {t('copy_trade.stats.today')}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Copier Stats */}
      {stats.asCopier.totalTradesCopiedFrom > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {t('copy_trade.as_copier')}
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('copy_trade.stats.trades_copied_from')}
                </CardTitle>
                <ArrowDownIcon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.asCopier.totalTradesCopiedFrom}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('copy_trade.stats.from_traders', {
                    count: stats.asCopier.uniqueSourceTraders,
                  })}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('copy_trade.stats.volume_copied')}
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${formatNumber(stats.asCopier.totalVolumeCopiedUsd)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('copy_trade.stats.total_volume')}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {t('copy_trade.stats.profit_from_copies')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${formatNumber(stats.asCopier.totalProfitFromCopiesUsd)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('copy_trade.stats.total_profit')}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
