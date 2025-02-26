'use client'

import { Button } from '@/components/common/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import type { TokenPortfolioResponse } from '@/types/Token'
import { formatNumber } from '@/utils/format'
import { CoinsIcon, DollarSign, Share2, Users } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { FollowButton } from './profile/follow-button'

interface User {
  username: string
  walletAddress: string
  avatarUrl: string
  bio: string
  level: number
  reputation: number
  socialCounts?: {
    followers: number
    following: number
  }
  isLoading?: boolean
}

interface UserHeaderProps {
  user: User
  portfolioData?: TokenPortfolioResponse
  isPortfolioLoading?: boolean
}

export default function UserHeader({
  user,
  portfolioData,
  isPortfolioLoading = false,
}: UserHeaderProps) {
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
    <div className="border-b border-gray-700 bg-gray-900 py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24 border-2 border-green-500 shadow-lg shadow-green-500/20">
            <AvatarImage src={user.avatarUrl} alt={user.username} />
            <AvatarFallback className="bg-gray-800 text-green-500">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
              <h1 className="text-2xl font-mono font-bold text-green-500">
                @{user.username}
              </h1>
              <code className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                {user.walletAddress}
              </code>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-2 mt-3">
              {/* SOL Balance Badge */}
              <Badge
                variant="outline"
                className="text-xs font-mono border-green-500/50 text-green-400"
              >
                <CoinsIcon className="w-3 h-3 mr-1" />
                {isPortfolioLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${formattedSolBalance} SOL`
                )}
              </Badge>

              {/* Total Wallet Value Badge with Portfolio Tooltip */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge
                      variant="outline"
                      className="text-xs font-mono border-green-500/50 text-green-400 cursor-pointer"
                    >
                      <DollarSign className="w-3 h-3 mr-1" />
                      {isPortfolioLoading ? (
                        <span className="animate-pulse">...</span>
                      ) : (
                        `$${formatNumber(totalUsd)}`
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

              {/* Social Stats */}
              <Badge
                variant="outline"
                className="text-xs font-mono border-green-500/50 text-green-400"
              >
                <Users className="w-3 h-3 mr-1" />
                {user.isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${user.socialCounts?.followers || 0} followers`
                )}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs font-mono border-green-500/50 text-green-400"
              >
                <Users className="w-3 h-3 mr-1" />
                {user.isLoading ? (
                  <span className="animate-pulse">...</span>
                ) : (
                  `${user.socialCounts?.following || 0} following`
                )}
              </Badge>
            </div>

            {/* Bio */}
            {user.bio && (
              <div className="mt-4 bg-gray-800 border border-gray-700 rounded p-3">
                <p className="text-gray-300 font-mono text-sm">{user.bio}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 mt-4 md:mt-0">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="green" size="icon" className="h-9 w-9">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Share Profile</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <FollowButton username={user.username} />
          </div>
        </div>
      </div>
    </div>
  )
}
