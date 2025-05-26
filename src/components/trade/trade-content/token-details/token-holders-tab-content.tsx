'use client'

import { BirdeyeTokenOverview } from '@/components/tapestry/models/token.models'
import { useTokenHolders } from '@/components/trade/hooks/use-token-holders'
import {
  Badge,
  Button,
  ButtonSize,
  ButtonVariant,
  Card,
  CardContent,
  CardVariant,
  Spinner,
} from '@/components/ui'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import { route } from '@/utils/route'
import { abbreviateWalletAddress, cn, formatNumber } from '@/utils/utils'
import { AlertTriangle, Fish, Shield, TrendingUp, Trophy } from 'lucide-react'
import { useMemo } from 'react'

interface TokenHoldersTabProps {
  id: string
  overview?: BirdeyeTokenOverview
}

interface HolderInsight {
  type: 'whale' | 'concentration' | 'distribution'
  message: string
  severity: 'info' | 'warning' | 'success'
}

export function TokenHoldersTabContent({ id, overview }: TokenHoldersTabProps) {
  const { holdersLoading, holders } = useTokenHolders(id)

  const insights = useMemo(() => {
    const results: HolderInsight[] = []

    if (!holders.length || !overview) return results

    // Calculate concentration metrics
    const top10Holdings = holders
      .slice(0, 10)
      .reduce(
        (sum, holder) =>
          sum + (Number(holder.uiAmountString) / overview.supply) * 100,
        0
      )

    const topHolderPercentage =
      (Number(holders[0]?.uiAmountString || 0) / overview.supply) * 100

    // Whale alert
    if (topHolderPercentage > 10) {
      results.push({
        type: 'whale',
        message: `Top holder owns ${topHolderPercentage.toFixed(1)}% of supply`,
        severity: topHolderPercentage > 20 ? 'warning' : 'info',
      })
    }

    // Concentration risk
    if (top10Holdings > 50) {
      results.push({
        type: 'concentration',
        message: `Top 10 holders control ${top10Holdings.toFixed(
          1
        )}% of supply`,
        severity: top10Holdings > 70 ? 'warning' : 'info',
      })
    } else {
      results.push({
        type: 'distribution',
        message: `Well distributed - Top 10 hold only ${top10Holdings.toFixed(
          1
        )}%`,
        severity: 'success',
      })
    }

    return results
  }, [holders, overview])

  const getInsightIcon = (type: HolderInsight['type']) => {
    switch (type) {
      case 'whale':
        return <Fish size={14} />
      case 'concentration':
        return <AlertTriangle size={14} />
      case 'distribution':
        return <Shield size={14} />
    }
  }

  const getInsightColor = (severity: HolderInsight['severity']) => {
    switch (severity) {
      case 'warning':
        return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
      case 'success':
        return 'text-green-500 bg-green-500/10 border-green-500/20'
      default:
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20'
    }
  }

  return (
    <div className="space-y-4">
      {/* Insights Section */}
      {insights.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            <TrendingUp size={14} />
            Holder Insights
          </h3>
          <div className="flex flex-wrap gap-2">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs',
                  getInsightColor(insight.severity)
                )}
              >
                {getInsightIcon(insight.type)}
                <span>{insight.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Holders Table */}
      <div>
        <div className="grid grid-cols-12 px-4 py-3 font-semibold text-xs text-muted-foreground border-b border-border/50">
          <p className="col-span-1">#</p>
          <p className="col-span-5">Holder</p>
          <p className="col-span-3 text-right">% Owned</p>
          <p className="col-span-3 text-right">Amount</p>
        </div>

        <div className="max-h-[400px] overflow-auto">
          {!holdersLoading ? (
            <div className="space-y-1">
              {holders.map((holder, index) => {
                const percentage = overview
                  ? (Number(holder.uiAmountString) / overview.supply) * 100
                  : 0
                const isWhale = percentage > 5
                const isTop3 = index < 3

                return (
                  <div
                    key={index}
                    className={cn(
                      'grid grid-cols-12 px-4 py-3 items-center hover:bg-accent/50 transition-colors',
                      isTop3 && 'bg-accent/30'
                    )}
                  >
                    <div className="col-span-1">
                      <div
                        className={cn(
                          'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
                          isTop3
                            ? 'bg-primary text-primary-foreground'
                            : 'text-muted-foreground'
                        )}
                      >
                        {isTop3 && index === 0 ? (
                          <Trophy size={12} />
                        ) : (
                          index + 1
                        )}
                      </div>
                    </div>

                    <div className="col-span-5 flex items-center gap-2">
                      {holder.address && (
                        <Button
                          variant={ButtonVariant.BADGE}
                          size={ButtonSize.SM}
                          href={route('entity', {
                            id: holder.address,
                          })}
                          className="h-7"
                        >
                          {abbreviateWalletAddress({
                            address: holder.address,
                          })}
                        </Button>
                      )}
                      {isWhale && (
                        <Badge
                          variant="outline"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          <Fish size={10} className="mr-1" />
                          Whale
                        </Badge>
                      )}
                    </div>

                    <div className="col-span-3 text-right">
                      <div
                        className={cn(
                          'text-sm font-medium',
                          percentage > 10 && 'text-yellow-500',
                          percentage > 20 && 'text-red-500'
                        )}
                      >
                        {percentage.toFixed(2)}%
                      </div>
                      {percentage > 1 && (
                        <div className="text-[10px] text-muted-foreground">
                          1 of {Math.floor(100 / percentage)}
                        </div>
                      )}
                    </div>

                    <div className="col-span-3 text-right">
                      <div className="text-sm font-medium">
                        {formatSmartNumber(holder.uiAmountString, {
                          compact: true,
                          maximumFractionDigits: 2,
                        })}
                      </div>
                      {overview && (
                        <div className="text-[10px] text-muted-foreground">
                          ≈ $
                          {formatSmartNumber(
                            Number(holder.uiAmountString) * overview.price,
                            { compact: true }
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="flex justify-center items-center h-[200px]">
              <Spinner />
            </div>
          )}
        </div>
      </div>

      {/* Summary Stats */}
      {!holdersLoading && holders.length > 0 && overview && (
        <Card variant={CardVariant.ACCENT}>
          <CardContent className="p-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total Holders</p>
                <p className="text-sm font-semibold">
                  {formatNumber(overview.holder)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Active (24h)</p>
                <p className="text-sm font-semibold">
                  {formatNumber(overview.uniqueWallet24h)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Top 10 Control</p>
                <p className="text-sm font-semibold">
                  {holders
                    .slice(0, 10)
                    .reduce(
                      (sum, holder) =>
                        sum +
                        (Number(holder.uiAmountString) / overview.supply) * 100,
                      0
                    )
                    .toFixed(1)}
                  %
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Avg Holdings</p>
                <p className="text-sm font-semibold">
                  {formatSmartNumber(overview.supply / overview.holder, {
                    compact: true,
                  })}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
