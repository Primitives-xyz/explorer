'use client'

import { useCurrentWallet } from '@/utils/use-current-wallet'
import { useFollowUser } from '@/components/tapestry/hooks/use-follow-user'
import { useUnfollowUser } from '@/components/tapestry/hooks/use-unfollow-user'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui'
import { UserPlus, UserMinus, Loader2 } from 'lucide-react'
import { cn } from '@/utils/utils'

interface Props {
  targetUsername: string
  targetAddress?: string
  isFollowing?: boolean
  onFollowChange?: (isFollowing: boolean) => void
  className?: string
  variant?: 'default' | 'minimal' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
}

export function EnhancedFollowButton({
  targetUsername,
  targetAddress,
  isFollowing: initialIsFollowing = false,
  onFollowChange,
  className,
  variant = 'default',
  size = 'md',
}: Props) {
  const { mainProfile } = useCurrentWallet()
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isHovered, setIsHovered] = useState(false)
  
  const { followUser, loading: followLoading } = useFollowUser()
  const { unfollowUser, loading: unfollowLoading } = useUnfollowUser()
  
  const isLoading = followLoading || unfollowLoading
  
  useEffect(() => {
    setIsFollowing(initialIsFollowing)
  }, [initialIsFollowing])
  
  const handleClick = async () => {
    if (!mainProfile?.username) {
      // Show login prompt or handle unauthenticated state
      console.error('User must be logged in to follow')
      return
    }
    
    try {
      if (isFollowing) {
        await unfollowUser({
          followerUsername: mainProfile.username,
          followeeUsername: targetUsername,
        })
        setIsFollowing(false)
        onFollowChange?.(false)
      } else {
        // This will now create a content node automatically
        await followUser({
          followerUsername: mainProfile.username,
          followeeUsername: targetUsername,
        })
        setIsFollowing(true)
        onFollowChange?.(true)
      }
    } catch (error) {
      console.error('Error toggling follow:', error)
    }
  }
  
  // Don't show button if user is viewing their own profile
  if (mainProfile?.username === targetUsername) {
    return null
  }
  
  const sizeClasses = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  }
  
  const variantClasses = {
    default: cn(
      'bg-primary text-primary-foreground hover:bg-primary/90',
      isFollowing && 'bg-secondary hover:bg-red-500/10 hover:text-red-500'
    ),
    minimal: cn(
      'border border-border',
      isFollowing && 'border-primary text-primary hover:border-red-500 hover:text-red-500'
    ),
    ghost: cn(
      'hover:bg-accent hover:text-accent-foreground',
      isFollowing && 'text-primary hover:text-red-500'
    ),
  }
  
  return (
    <button
      onClick={handleClick}
      disabled={isLoading || !mainProfile}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md font-medium transition-colors',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
        'disabled:pointer-events-none disabled:opacity-50',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isFollowing ? (
        <>
          <UserMinus className="h-4 w-4" />
          {isHovered ? 'Unfollow' : 'Following'}
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4" />
          Follow
        </>
      )}
    </button>
  )
}