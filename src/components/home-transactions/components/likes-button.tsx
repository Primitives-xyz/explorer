'use client'

import {
  Button,
  ButtonVariant,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui'
import { Avatar } from '@/components/ui/avatar/avatar'
import { route } from '@/utils/route'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { Heart } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useEffect, useState } from 'react'
import { useContentLikes, useLikeContent } from '../hooks/use-content-likes'

interface Props {
  contentId: string
  initialLikeCount?: number
  initialHasLiked?: boolean
  onLikeChange?: (hasLiked: boolean, newCount: number) => void
}

export function LikesButton({
  contentId,
  initialLikeCount = 0,
  initialHasLiked = false,
  onLikeChange,
}: Props) {
  const t = useTranslations()
  const { mainProfile } = useCurrentWallet()
  const [showLikesModal, setShowLikesModal] = useState(false)
  const [likeCount, setLikeCount] = useState(initialLikeCount)
  const [hasLiked, setHasLiked] = useState(initialHasLiked)

  // Sync local state when initial props change
  useEffect(() => {
    setLikeCount(initialLikeCount)
    setHasLiked(initialHasLiked)
  }, [initialLikeCount, initialHasLiked])

  const { likeContent, unlikeContent, loading } = useLikeContent({ contentId })

  // Only fetch likes data when modal is open
  const {
    users: likedUsers,
    loading: loadingUsers,
    refetch,
  } = useContentLikes({
    contentId,
    enabled: showLikesModal, // Only call when modal is open
  })

  const handleLikeToggle = async () => {
    if (!mainProfile?.username) return

    const newHasLiked = !hasLiked
    const newCount = newHasLiked ? likeCount + 1 : likeCount - 1

    // Optimistic update
    setHasLiked(newHasLiked)
    setLikeCount(newCount)
    onLikeChange?.(newHasLiked, newCount)

    try {
      if (newHasLiked) {
        await likeContent()
      } else {
        await unlikeContent()
      }
      // Refresh likes data if modal is open
      if (showLikesModal) {
        refetch()
      }
    } catch (error) {
      // Revert optimistic update on error
      setHasLiked(!newHasLiked)
      setLikeCount(likeCount)
      onLikeChange?.(hasLiked, likeCount)
    }
  }

  const handleCountClick = () => {
    if (likeCount > 0) {
      setShowLikesModal(true)
    }
  }

  // Close modal handler that can be used to clean up
  const handleModalClose = (open: boolean) => {
    setShowLikesModal(open)
  }

  if (!mainProfile?.username) {
    return null
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <Button
          variant={ButtonVariant.GHOST}
          onClick={handleLikeToggle}
          disabled={loading}
          className="p-2 h-auto"
        >
          <Heart
            size={16}
            className={
              hasLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
            }
          />
        </Button>

        {likeCount > 0 && (
          <Button
            variant={ButtonVariant.GHOST}
            onClick={handleCountClick}
            className="p-0 h-auto text-sm text-muted-foreground hover:text-foreground"
          >
            {likeCount}
          </Button>
        )}
      </div>

      <Dialog open={showLikesModal} onOpenChange={handleModalClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {t('common.likes')} ({likeCount})
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {loadingUsers ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              </div>
            ) : likedUsers.length > 0 ? (
              likedUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar
                    username={user.username}
                    imageUrl={user.image}
                    size={32}
                    className="w-8 h-8"
                  />
                  <Button
                    variant={ButtonVariant.GHOST}
                    href={route('entity', { id: user.username })}
                    className="p-0 hover:bg-transparent text-left flex-1"
                    onClick={() => setShowLikesModal(false)}
                  >
                    <div>
                      <p className="font-medium">@{user.username}</p>
                      {user.bio && (
                        <p className="text-sm text-muted-foreground truncate">
                          {user.bio}
                        </p>
                      )}
                    </div>
                  </Button>
                </div>
              ))
            ) : (
              <p className="text-center text-muted-foreground py-4">
                {t('common.no_likes_yet')}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
