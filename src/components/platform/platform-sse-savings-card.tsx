'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  usePlatformSSESavings, 
  getTimeSinceUpdate 
} from '@/hooks/use-platform-sse-savings'
import { RefreshCw, TrendingUp, Users, DollarSign } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

export function PlatformSSESavingsCard() {
  const { data, loading, error, refresh } = usePlatformSSESavings()

  if (loading && !data) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Platform SSE Savings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Platform SSE Savings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Failed to load platform savings data
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Platform SSE Savings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={refresh}
            disabled={loading}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Updated {getTimeSinceUpdate(data.lastUpdated)}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main savings stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Saved</p>
            <p className="text-2xl font-bold text-green-600">
              {data.display.totalSavings}
            </p>
            <p className="text-xs text-muted-foreground">
              {data.display.savingsRate} of volume
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">SSE Usage</p>
            <p className="text-2xl font-bold">{data.display.usageRate}</p>
            <p className="text-xs text-muted-foreground">
              {data.totalTradesWithSSE.toLocaleString()} of {data.totalTrades.toLocaleString()} trades
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Avg Per Trade</p>
            <p className="text-2xl font-bold">{data.display.averageSavings}</p>
            <p className="text-xs text-muted-foreground">
              on {data.display.totalVolume} volume
            </p>
          </div>
        </div>

        {/* Potential savings */}
        <div className="rounded-lg bg-amber-50 dark:bg-amber-950/20 p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <p className="text-sm font-medium text-amber-900 dark:text-amber-100">
              Potential Additional Savings
            </p>
          </div>
          <p className="text-xl font-bold text-amber-700 dark:text-amber-300">
            {data.display.potentialSavings}
          </p>
          <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
            If all trades used SSE token
          </p>
        </div>

        {/* Top savers */}
        {data.topSavers.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <p className="text-sm font-medium">Top Savers</p>
            </div>
            <div className="space-y-1">
              {data.topSavers.slice(0, 5).map((saver, index) => (
                <div
                  key={saver.profileId}
                  className="flex items-center justify-between py-1.5 px-2 rounded hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground w-4">
                      #{index + 1}
                    </span>
                    <span className="text-sm font-medium">
                      {saver.profileId}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-green-600">
                      ${saver.savingsUSD.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {saver.tradesWithSSE} trades
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}