'use client'

import { useStakeInfo } from '@/components/stake/hooks/use-stake-info'
import { useTokenInfo } from '@/components/token/hooks/use-token-info'
import { Card, CardContent, CardHeader, Spinner } from '@/components/ui'
import { SSE_MINT } from '@/utils/constants'
import { formatSmartNumber } from '@/utils/formatting/format-number'
import {
  Activity,
  ArrowUp,
  Award,
  BarChart3,
  Calendar,
  Database,
  DollarSign,
  Globe,
  Info,
  Percent,
  Sparkles,
  Star,
  Timer,
  TrendingUp,
  User,
  Zap,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useMemo } from 'react'

// Constants from the CLI script
const PRECISION = 1e12
const TOKEN_DECIMALS = 1e6
const SECONDS_PER_DAY = 86400
const SECONDS_PER_HOUR = 3600

// Reusable metric card component
interface MetricCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  iconColor: string
  trend?: number
  size?: 'sm' | 'md' | 'lg'
  priority?: 'high' | 'medium' | 'low'
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  gradient,
  iconColor,
  trend,
  size = 'md',
  priority = 'medium',
}: MetricCardProps) {
  const sizeClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  }

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl xl:text-2xl',
    lg: 'text-2xl xl:text-3xl',
  }

  const priorityEffects = {
    high: 'ring-2 ring-primary/50 shadow-2xl',
    medium: 'shadow-xl',
    low: 'shadow-lg',
  }

  const formattedValue =
    typeof value === 'string'
      ? value
      : formatSmartNumber(value, { maximumFractionDigits: 6 })

  return (
    <div
      className={`${gradient} border rounded-2xl ${sizeClasses[size]} ${priorityEffects[priority]} relative overflow-hidden group hover:scale-[1.02] transition-all duration-300 min-w-0`}
    >
      {priority === 'high' && (
        <div className="absolute top-2 right-2">
          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
        </div>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Icon className={`h-5 w-5 ${iconColor} flex-shrink-0`} />
          <span className="text-sm font-medium opacity-90 truncate">
            {title}
          </span>
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full flex-shrink-0 ${
              trend > 0
                ? 'bg-green-500/20 text-green-600'
                : trend < 0
                ? 'bg-red-500/20 text-red-600'
                : 'bg-gray-500/20 text-gray-600'
            }`}
          >
            <ArrowUp className={`h-3 w-3 ${trend < 0 ? 'rotate-180' : ''}`} />
            <span>{Math.abs(trend).toFixed(1)}%</span>
          </div>
        )}
      </div>
      <div className="space-y-1 min-w-0">
        <p className={`${textSizes[size]} font-bold break-all`}>
          {formattedValue}
        </p>
        {subtitle && <p className="text-sm opacity-75 truncate">{subtitle}</p>}
      </div>
      <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-white/10 to-transparent rounded-full -translate-y-10 translate-x-10 group-hover:scale-150 transition-transform duration-500" />
    </div>
  )
}

// Progress ring component for batch progress
function ProgressRing({
  progress,
  size = 120,
  strokeWidth = 8,
}: {
  progress: number
  size?: number
  strokeWidth?: number
}) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const strokeDasharray = circumference.toFixed(3)
  const strokeDashoffset = (
    circumference -
    (progress / 100) * circumference
  ).toFixed(3)

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
        style={{ filter: 'drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.1))' }}
      >
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--muted))"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="hsl(var(--primary))"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-primary">
          {Math.round(progress)}%
        </span>
      </div>
    </div>
  )
}

function TotalPoolValueCard({
  totalStakeAmount,
}: {
  totalStakeAmount: string
}) {
  const { data: sseTokenInfo, loading: sseTokenLoading } =
    useTokenInfo(SSE_MINT)

  // Get SSE token price from token info
  const ssePrice =
    sseTokenInfo?.result && 'token_info' in sseTokenInfo.result
      ? sseTokenInfo.result.token_info?.price_info?.price_per_token
      : null

  const totalTokens = parseFloat(totalStakeAmount) || 0
  const usdValue = ssePrice && totalTokens ? totalTokens * ssePrice : null

  const formattedTokenValue = formatSmartNumber(totalTokens, {
    maximumFractionDigits: 0,
    withComma: true,
  })

  const formattedUsdValue = usdValue
    ? `$${formatSmartNumber(usdValue, {
        maximumFractionDigits: 0,
        withComma: true,
      })}`
    : null

  return (
    <MetricCard
      title="TVL"
      value={formattedUsdValue || formattedTokenValue}
      subtitle={formattedUsdValue ? `${formattedTokenValue} SSE` : 'SSE locked'}
      icon={usdValue ? DollarSign : Database}
      gradient="bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-indigo-500/10 border border-indigo-500/30"
      iconColor="text-indigo-600"
      size="lg"
      priority="high"
    />
  )
}

export function AdvancedStakingInfo() {
  const t = useTranslations('stake')
  const {
    userInfo,
    showUserInfoLoading,
    hasStaked,
    systemType,
    effectiveRewardRate,
    earningRates,
    userSharePercentage,
    canEarnRewards,
    distributionPeriod,
    emergencyReserveBp,
    lastUpdate,
    totalStakeAmount,
  } = useStakeInfo({})

  // Calculate enhanced metrics with clear separation of personal vs global
  const enhancedMetrics = useMemo(() => {
    if (!canEarnRewards || !earningRates || !userInfo) return null

    const dailyRate = parseFloat(earningRates.perDay.toString())
    const hourlyRate = parseFloat(earningRates.perHour.toString())
    const currentTime = Math.floor(Date.now() / 1000)
    const poolShare = parseFloat(userSharePercentage)
    const globalRate = parseFloat(effectiveRewardRate.toString())

    // User deposit info
    const userDepositTokens = parseFloat(userInfo.userDeposit || '0')
    const totalPoolValue =
      userDepositTokens > 0 && poolShare > 0
        ? userDepositTokens / (poolShare / 100)
        : 0

    // Calculate next batch information
    const calculateNextBatch = () => {
      const systemType = userInfo.systemType
      if (systemType !== 'Sustainable') return null

      const currentRewardRateRaw = parseFloat(userInfo.currentRewardRate || '0')
      if (currentRewardRateRaw <= 0) return null

      const currentRateRawPerSecond = currentRewardRateRaw / PRECISION
      if (currentRateRawPerSecond <= 0) return null

      const sharePercentageDecimal = parseFloat(userSharePercentage) / 100
      if (sharePercentageDecimal <= 0) return null

      const userDepositRaw = parseFloat(userInfo.rawDeposit || '0')
      const totalDepositRaw =
        sharePercentageDecimal > 0 ? userDepositRaw / sharePercentageDecimal : 0
      if (totalDepositRaw <= 0) return null

      const minRewardsNeeded = totalDepositRaw / PRECISION
      const lastRewardTime = parseInt(userInfo.lastRewardTime || '0')
      const timeSinceLastReward = currentTime - lastRewardTime
      const accumulatedSoFar = currentRateRawPerSecond * timeSinceLastReward
      const stillNeeded = Math.max(0, minRewardsNeeded - accumulatedSoFar)

      if (stillNeeded <= 0) {
        return {
          ready: true,
          progress: 100,
          timeRemainingSeconds: 0,
          expectedBatchSize: minRewardsNeeded,
          userShare:
            (userDepositTokens / (totalDepositRaw / TOKEN_DECIMALS)) *
            minRewardsNeeded,
        }
      }

      const secondsUntilBatch = stillNeeded / currentRateRawPerSecond
      const progress = (accumulatedSoFar / minRewardsNeeded) * 100
      const totalDepositTokens = totalDepositRaw / TOKEN_DECIMALS
      const userShare =
        (userDepositTokens / totalDepositTokens) * minRewardsNeeded

      return {
        ready: false,
        progress: Math.min(progress, 99),
        timeRemainingSeconds: secondsUntilBatch,
        expectedBatchSize: minRewardsNeeded,
        userShare,
      }
    }

    const nextBatch = calculateNextBatch()

    return {
      personal: {
        dailyEarnings: dailyRate,
        hourlyEarnings: hourlyRate,
        poolShare,
        userDeposit: userDepositTokens,
        projections: {
          weekly: dailyRate * 7,
          monthly: dailyRate * 30,
          yearly: dailyRate * 365,
        },
      },
      global: {
        networkRate: globalRate,
        totalPoolValue,
        systemType,
        distributionCycle: distributionPeriod,
        emergencyReserve: emergencyReserveBp,
        isActive: canEarnRewards,
      },
      nextBatch,
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canEarnRewards,
    earningRates,
    userSharePercentage,
    effectiveRewardRate,
    userInfo,
    lastUpdate,
  ])

  // Helper function to format time duration
  const formatDuration = (seconds: number): string => {
    if (seconds < 60) return `${Math.round(seconds)}s`
    if (seconds < 3600) return `${Math.round(seconds / 60)}m`
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.round((seconds % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  if (showUserInfoLoading) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
        <CardContent className="flex items-center justify-center py-16">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <Spinner className="h-12 w-12" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-blue-500 rounded-full animate-pulse opacity-20" />
            </div>
            <div className="text-center space-y-2">
              <p className="text-xl font-semibold">Analyzing Performance</p>
              <p className="text-sm text-muted-foreground">
                Calculating personal and global metrics...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!hasStaked || !userInfo || !enhancedMetrics) {
    return (
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
        <CardHeader className="text-center pb-4">
          <div className="mx-auto mb-6 p-6 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-3xl">
            <BarChart3 className="h-16 w-16 mx-auto text-primary" />
          </div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Performance Analytics
          </h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            Unlock detailed personal performance insights and global network
            analytics by staking your tokens.
          </p>
        </CardHeader>
        <CardContent className="text-center pb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary/10 text-primary rounded-full font-medium">
            <Sparkles className="h-4 w-4" />
            <span>Start earning to see live analytics</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  const { personal, global, nextBatch } = enhancedMetrics

  return (
    <div className="space-y-8">
      {/* Header with System Status */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-blue-500 bg-clip-text text-transparent">
            Performance Analytics
          </h1>
          <p className="text-muted-foreground mt-1">
            Personal performance & global network insights
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-muted/50 rounded-full border">
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                global.systemType === 'Sustainable'
                  ? 'bg-green-500 animate-pulse'
                  : global.systemType === 'Legacy'
                  ? 'bg-yellow-500'
                  : 'bg-gray-500'
              }`}
            />
            <span className="font-medium">{global.systemType}</span>
          </div>
          {global.isActive && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 text-green-600 rounded-full border border-green-500/20">
              <Zap className="h-4 w-4" />
              <span className="font-medium">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Personal Performance Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <User className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Your Yield Performance</h2>
            <p className="text-sm text-muted-foreground">
              Personal staking rewards and APY metrics
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Daily Earnings */}
          <MetricCard
            title="Daily Earnings"
            value={personal.dailyEarnings}
            subtitle="SSE per day"
            icon={Zap}
            gradient="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30"
            iconColor="text-green-600"
            size="lg"
            priority="high"
          />

          {/* APY */}
          <MetricCard
            title="APY"
            value={`${
              personal.userDeposit > 0
                ? (
                    (personal.dailyEarnings / personal.userDeposit) *
                    365 *
                    100
                  ).toFixed(1)
                : '0.0'
            }%`}
            subtitle="Annual Yield"
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-blue-500/10 via-blue-500/10 to-cyan-500/10 border border-blue-500/30"
            iconColor="text-blue-600"
            priority="high"
          />

          {/* Pool Dominance */}
          <MetricCard
            title="Pool Dominance"
            value={`${personal.poolShare.toFixed(4)}%`}
            subtitle="of total pool"
            icon={Percent}
            gradient="bg-gradient-to-br from-purple-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/30"
            iconColor="text-purple-600"
            size="lg"
          />

          {/* Hourly Rate */}
          <MetricCard
            title="Hourly Rate"
            value={personal.hourlyEarnings}
            subtitle="SSE per hour"
            icon={Timer}
            gradient="bg-gradient-to-br from-amber-500/10 via-amber-500/10 to-orange-500/10 border border-amber-500/30"
            iconColor="text-amber-600"
            size="lg"
          />
        </div>
      </div>

      {/* Global Network Section */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Globe className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Protocol Analytics</h2>
            <p className="text-sm text-muted-foreground">
              Global TVL, emission rate, and protocol health
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Emission Rate */}
          <MetricCard
            title="Emission Rate"
            value={global.networkRate}
            subtitle="SSE per second"
            icon={Activity}
            gradient="bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-emerald-500/10 border border-emerald-500/30"
            iconColor="text-emerald-600"
            size="lg"
            priority="high"
          />

          {/* TVL */}
          <TotalPoolValueCard totalStakeAmount={totalStakeAmount} />

          {/* Protocol Status */}
          <MetricCard
            title="Protocol Status"
            value={global.isActive ? 'Live' : 'Paused'}
            subtitle="Rewards active"
            icon={Activity}
            gradient={
              global.isActive
                ? 'bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-500/10 border border-green-500/30'
                : 'bg-gradient-to-br from-red-500/10 via-red-500/10 to-red-500/10 border border-red-500/30'
            }
            iconColor={global.isActive ? 'text-green-600' : 'text-red-600'}
            size="lg"
          />

          {/* Network Health Placeholder */}
          <MetricCard
            title="Network Health"
            value="Optimal"
            subtitle="System stable"
            icon={Globe}
            gradient="bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-indigo-500/10 border border-cyan-500/30"
            iconColor="text-cyan-600"
            size="lg"
          />
        </div>
      </div>

      {/* Personal Projections */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-background via-background to-muted/20">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold">Yield Projections</h2>
              <p className="text-sm text-muted-foreground">
                Based on current APY and staking amount
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              {
                period: 'Hourly',
                value: personal.hourlyEarnings,
                icon: Timer,
                color: 'text-green-600',
              },
              {
                period: 'Weekly',
                value: personal.projections.weekly,
                icon: Calendar,
                color: 'text-blue-600',
              },
              {
                period: 'Monthly',
                value: personal.projections.monthly,
                icon: BarChart3,
                color: 'text-purple-600',
              },
              {
                period: 'Yearly',
                value: personal.projections.yearly,
                icon: Award,
                color: 'text-amber-600',
              },
            ].map((projection, index) => (
              <div
                key={index}
                className="text-center p-4 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors"
              >
                <projection.icon
                  className={`h-6 w-6 mx-auto mb-2 ${projection.color}`}
                />
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  {projection.period}
                </p>
                <p className="text-lg font-bold">
                  {formatSmartNumber(projection.value, {
                    maximumFractionDigits: 4,
                  })}
                </p>
                <p className="text-xs text-muted-foreground">SSE</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* System Information Footer */}
      <div className="flex items-center justify-between p-4 bg-muted/20 rounded-xl border">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${
                global.isActive ? 'bg-green-500 animate-pulse' : 'bg-red-500'
              }`}
            />
            <span className="font-medium">
              {global.isActive ? 'Live Analytics Active' : 'Analytics Paused'}
            </span>
          </div>
          {global.systemType === 'Sustainable' && (
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              {global.distributionCycle !== '0' && (
                <div className="flex items-center gap-1">
                  <Info className="h-3.5 w-3.5" />
                  <span>
                    {Math.floor(parseInt(global.distributionCycle) / 86400)}d
                    cycle
                  </span>
                </div>
              )}
              {global.emergencyReserve !== '0' && (
                <div className="flex items-center gap-1">
                  <Database className="h-3.5 w-3.5" />
                  <span>
                    {(parseInt(global.emergencyReserve) / 100).toFixed(1)}%
                    reserve
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="text-sm text-muted-foreground">
          Earning{' '}
          {formatSmartNumber(personal.dailyEarnings, {
            maximumFractionDigits: 4,
          })}{' '}
          SSE daily
        </div>
      </div>
    </div>
  )
}
