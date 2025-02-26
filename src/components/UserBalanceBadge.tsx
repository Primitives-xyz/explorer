'use client'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { TokenPortfolioResponse } from '@/types/Token'
import { formatNumber } from '@/utils/format'
import { BarChart3 } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface UserBalanceBadgeProps {
  isLoading: boolean
  portfolioData?: TokenPortfolioResponse
  walletAddress: string
}

export default function UserBalanceBadge({
  isLoading,
  portfolioData,
  walletAddress,
}: UserBalanceBadgeProps) {
  const t = useTranslations()
  const { items = [], totalUsd = 0 } = portfolioData?.data || {}

  // Find SOL token data
  const solToken = items.find((item) => item.symbol === 'SOL')
  const solBalance = solToken?.uiAmount ?? 0
  const solValue = solToken?.valueUsd ?? 0

  // Format SOL balance with 3 decimal places
  const formattedSolBalance = solBalance.toFixed(3).replace(/\.?0+$/, '')

  // Calculate other tokens
  const tokenCount = Math.max(0, items.length - 1) // Subtract SOL, ensure non-negative

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            variant="outline"
            className="text-xs font-mono border-green-500/50 text-green-400 cursor-pointer"
          >
            <BarChart3 className="w-3 h-3 mr-1" />
            {isLoading ? (
              <span className="animate-pulse">...</span>
            ) : (
              'Portfolio'
            )}
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="bg-gray-900 border border-green-800 p-3 font-mono text-xs">
          <div className="space-y-2">
            <div className="flex justify-between gap-4">
              <span>{formattedSolBalance} SOL</span>
              <span>${formatNumber(solValue)}</span>
            </div>
            {tokenCount > 0 && (
              <div className="flex justify-between gap-4">
                <span>
                  {tokenCount} {t('common.tokens')}
                </span>
                <span>${formatNumber(totalUsd - solValue)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-1 border-t border-green-800">
              <span>{t('common.total')}</span>
              <span>${formatNumber(totalUsd)}</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
