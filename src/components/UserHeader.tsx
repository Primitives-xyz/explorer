'use client'

import { Button } from '@/components/common/button'
import { TokenAddress } from '@/components/tokens/token-address'
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
import {
  CalendarIcon,
  CoinsIcon,
  DollarSign,
  Edit,
  NetworkIcon,
  Share2,
  Users,
} from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useCallback, useState } from 'react'
import { FollowButton } from './profile/follow-button'
import { UpdateProfileModal } from './profile/update-profile-modal'

interface User {
  username: string
  walletAddress: string
  avatarUrl: string | null
  bio: string
  socialCounts?: {
    followers: number
    following: number
  }
  isLoading?: boolean
  createdAt?: string
}

interface UserHeaderProps {
  user: User
  portfolioData?: TokenPortfolioResponse
  isPortfolioLoading?: boolean
  isOwnProfile?: boolean
}

export default function UserHeader({
  user,
  portfolioData,
  isPortfolioLoading = false,
  isOwnProfile = false,
}: UserHeaderProps) {
  const t = useTranslations()
  const { items = [], totalUsd = 0 } = portfolioData?.data || {}
  const [showUpdateModal, setShowUpdateModal] = useState(false)

  // Find SOL token data
  const solToken = items.find((item) => item.symbol === 'SOL')
  const solBalance = solToken?.uiAmount ?? 0
  const solValue = solToken?.valueUsd ?? 0

  // Format SOL balance with 3 decimal places
  const formattedSolBalance = solBalance.toFixed(3).replace(/\.?0+$/, '')

  // Calculate other tokens
  const tokenCount = Math.max(0, items.length - 1) // Subtract SOL, ensure non-negative

  // Get creation year or default to current year
  const creationYear = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear()

  // Handle edit profile button click
  const handleEditProfile = useCallback(() => {
    setShowUpdateModal(true)
  }, [])

  // Handle close update modal
  const handleCloseUpdate = useCallback(() => {
    setShowUpdateModal(false)
  }, [])

  // Handle profile updated
  const handleProfileUpdated = useCallback(() => {
    window.location.reload()
  }, [])

  return (
    <div className="border-b border-gray-700 py-4 lg:py-6 bg-[#111111]">
      <div className="container mx-auto px-4">
        {/* Mobile Layout */}
        <div className="md:hidden">
          {/* Top Section with Avatar and User Info */}
          <div className="flex items-start gap-4 mb-4">
            {/* Avatar */}
            <Avatar className="w-20 h-20 border-2 border-green-500 shadow-lg shadow-green-500/20 flex-shrink-0">
              <AvatarImage src={user.avatarUrl ?? ''} alt={user.username} />
              <AvatarFallback className="text-green-500">
                {user.username.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-mono font-bold text-green-500">
                  @{user.username}
                </h1>
                <div className="flex gap-2">
                  {isOwnProfile && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleEditProfile}
                      className="border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  )}
                  <FollowButton username={user.username} size="sm" />
                </div>
              </div>

              <div className="mt-1">
                <TokenAddress address={user.walletAddress} />
              </div>

              <div className="flex gap-2 mt-2">
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-green-500/50 text-green-400"
                >
                  <CalendarIcon className="w-3 h-3 mr-1" />
                  {`Since ${creationYear}`}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-xs font-mono border-green-500/50 text-green-400"
                >
                  <NetworkIcon className="w-3 h-3 mr-1" />
                  Solana
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats Section - 2 rows of 2 columns */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {/* SOL Balance Badge */}
            <Badge
              variant="outline"
              className="text-xs font-mono border-green-500/50 text-green-400 flex justify-center py-2"
            >
              <CoinsIcon className="w-3 h-3 mr-1" />
              {isPortfolioLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `${formattedSolBalance} SOL`
              )}
            </Badge>

            {/* Total Wallet Value Badge */}
            <Badge
              variant="outline"
              className="text-xs font-mono border-green-500/50 text-green-400 flex justify-center py-2"
            >
              <DollarSign className="w-3 h-3 mr-1" />
              {isPortfolioLoading ? (
                <span className="animate-pulse">...</span>
              ) : (
                `$${formatNumber(totalUsd)}`
              )}
            </Badge>

            {/* Social Stats */}
            <Badge
              variant="outline"
              className="text-xs font-mono border-green-500/50 text-green-400 flex justify-center py-2"
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
              className="text-xs font-mono border-green-500/50 text-green-400 flex justify-center py-2"
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
            <div className="border border-gray-700 rounded p-3 w-full">
              <p className="text-gray-300 font-mono text-sm">{user.bio}</p>
            </div>
          )}
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex md:flex-row items-start gap-6">
          {/* Avatar */}
          <Avatar className="w-24 h-24 border-2 border-green-500 shadow-lg shadow-green-500/20">
            <AvatarImage src={user.avatarUrl ?? ''} alt={user.username} />
            <AvatarFallback className="text-green-500">
              {user.username.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>

          {/* User Info */}
          <div className="flex-1">
            <div className="flex flex-row items-center gap-4">
              <h1 className="text-2xl font-mono font-bold text-green-500">
                @{user.username}
              </h1>
              <TokenAddress address={user.walletAddress} />
            </div>

            {/* Profile Info Badges */}
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge
                variant="outline"
                className="text-xs font-mono border-green-500/50 text-green-400"
              >
                <CalendarIcon className="w-3 h-3 mr-1" />
                {`Since ${creationYear}`}
              </Badge>

              <Badge
                variant="outline"
                className="text-xs font-mono border-green-500/50 text-green-400"
              >
                <NetworkIcon className="w-3 h-3 mr-1" />
                Solana
              </Badge>
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
                  <TooltipContent className="border border-green-800 p-3 font-mono text-xs">
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
              <div className="mt-4 border border-gray-700 rounded p-3">
                <p className="text-gray-300 font-mono text-sm">{user.bio}</p>
              </div>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="flex gap-2">
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
            {isOwnProfile && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      onClick={handleEditProfile}
                      className="h-9 px-4 border-green-500/50 text-green-400 hover:bg-green-900/30 hover:border-green-400"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Edit Your Profile</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <FollowButton username={user.username} size="lg" />
          </div>
        </div>
      </div>

      {/* Update Profile Modal */}
      {isOwnProfile && (
        <UpdateProfileModal
          isOpen={showUpdateModal}
          onClose={handleCloseUpdate}
          currentUsername={user.username}
          currentBio={user.bio}
          currentImage={user.avatarUrl}
          onProfileUpdated={handleProfileUpdated}
        />
      )}
    </div>
  )
}
