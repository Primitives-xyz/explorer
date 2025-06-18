'use client'

import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { cn } from '@/utils/utils'
import { formatDistanceToNow } from 'date-fns'
import { 
  UserPlus, 
  Users, 
  Heart, 
  Sparkles,
  TrendingUp,
  ArrowRight
} from 'lucide-react'
import Link from 'next/link'
import { IHomeTransaction } from '../home-transactions.models'

interface Props {
  transaction: IHomeTransaction & {
    content?: {
      type?: string
      timestamp?: string
      followId?: string
      
      // Follower details
      followerUsername?: string
      followerAddress?: string
      followerImage?: string
      followerBio?: string
      followerFollowersCount?: string
      followerFollowingCount?: string
      
      // Followee details
      followeeUsername?: string
      followeeAddress?: string
      followeeImage?: string
      followeeBio?: string
      followeeFollowersCount?: string
      followeeFollowingCount?: string
      
      // Relationship
      isMutualFollow?: string
    }
  }
  sourceWallet: string
}

export function FollowTransactionsView({ transaction }: Props) {
  const content = transaction.content
  if (!content) return null

  const timestamp = content.timestamp
    ? new Date(Number(content.timestamp))
    : new Date(transaction.timestamp)

  const timeAgo = formatDistanceToNow(timestamp, { addSuffix: true })
  const isMutual = content.isMutualFollow === 'true'

  // Format follower counts
  const formatCount = (count: string | undefined) => {
    const num = parseInt(count || '0')
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  return (
    <div className="relative">
      {/* Main Card */}
      <div
        className={cn(
          'relative rounded-xl border-2 bg-gradient-to-br overflow-hidden transition-all hover:scale-[1.02]',
          isMutual 
            ? 'from-pink-500/20 to-purple-600/20 border-pink-500/30'
            : 'from-blue-500/20 to-indigo-600/20 border-blue-500/30'
        )}
      >
        {/* Mutual Follow Badge */}
        {isMutual && (
          <div className="absolute top-4 right-4 bg-pink-500/20 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
            <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
            <span className="text-xs font-medium text-pink-400">Mutual</span>
          </div>
        )}

        {/* Content */}
        <div className="relative p-6 space-y-4">
          {/* Action Header */}
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">New Follow</span>
            <span>•</span>
            <span>{timeAgo}</span>
          </div>

          {/* Users Section */}
          <div className="flex items-center justify-between gap-4">
            {/* Follower */}
            <Link 
              href={route('entity', { id: content.followerUsername || '' })}
              className="flex-1 group"
            >
              <div className="bg-black/10 backdrop-blur-sm rounded-lg p-4 transition-all group-hover:bg-black/20">
                <div className="flex items-center gap-3">
                  <Avatar
                    username={content.followerUsername || 'User'}
                    imageUrl={content.followerImage}
                    size={48}
                    className="h-12 w-12 ring-2 ring-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:underline">
                      {content.followerUsername}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatCount(content.followerFollowersCount)} followers</span>
                      <span>{formatCount(content.followerFollowingCount)} following</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Arrow */}
            <div className="flex items-center justify-center">
              <div className="bg-white/10 rounded-full p-2">
                <ArrowRight className="w-5 h-5" />
              </div>
            </div>

            {/* Followee */}
            <Link 
              href={route('entity', { id: content.followeeUsername || '' })}
              className="flex-1 group"
            >
              <div className="bg-black/10 backdrop-blur-sm rounded-lg p-4 transition-all group-hover:bg-black/20">
                <div className="flex items-center gap-3">
                  <Avatar
                    username={content.followeeUsername || 'User'}
                    imageUrl={content.followeeImage}
                    size={48}
                    className="h-12 w-12 ring-2 ring-white/20"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate group-hover:underline">
                      {content.followeeUsername}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatCount(content.followeeFollowersCount)} followers</span>
                      <span>{formatCount(content.followeeFollowingCount)} following</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            {/* Followee Stats - with enhanced legibility */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <TrendingUp className="w-16 h-16" />
              </div>
              <div className="relative">
                <p className="text-xs text-muted-foreground mb-1">
                  @{content.followeeUsername} gained
                </p>
                <p className="text-2xl font-bold">
                  {parseInt(content.followeeFollowersCount || '0') > 0 
                    ? '+1' 
                    : '1'
                  }
                </p>
                <p className="text-sm text-muted-foreground">
                  new follower
                </p>
              </div>
            </div>

            {/* Connection Status */}
            <div className="bg-gradient-to-r from-white/5 to-white/10 backdrop-blur-sm rounded-lg p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 opacity-10">
                <Users className="w-16 h-16" />
              </div>
              <div className="relative">
                <p className="text-xs text-muted-foreground mb-1">
                  Connection type
                </p>
                <div className="flex items-center gap-2">
                  {isMutual ? (
                    <>
                      <Heart className="w-5 h-5 text-pink-400 fill-pink-400" />
                      <p className="text-lg font-semibold text-pink-400">Mutual</p>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-5 h-5 text-blue-400" />
                      <p className="text-lg font-semibold text-blue-400">Following</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bio Preview (if available) */}
          {content.followeeBio && (
            <div className="bg-black/10 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-yellow-500 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs text-muted-foreground mb-1">About @{content.followeeUsername}</p>
                  <p className="text-sm line-clamp-2">{content.followeeBio}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}