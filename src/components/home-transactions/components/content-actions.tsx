'use client'

import { Button } from '@/components/ui/button/button'
import { MessageCircle } from 'lucide-react'
import { useState } from 'react'
import { useContentComments } from '../hooks/use-content-comments'
import { CommentsSection } from './content-comments-section'
import { LikesButton } from './likes-button'

interface Props {
  contentId: string
  initialLikeCount?: number
  initialHasLiked?: boolean
  initialCommentCount?: number
  onLikeChange?: (hasLiked: boolean, newCount: number) => void
}

export function ContentActions({
  contentId,
  initialLikeCount = 0,
  initialHasLiked = false,
  initialCommentCount = 0,
  onLikeChange,
}: Props) {
  const [showComments, setShowComments] = useState(false)
  const { comments, refetch } = useContentComments({
    contentId,
    enabled: showComments,
  })

  const commentCount = showComments ? comments.length : initialCommentCount

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-4">
        <LikesButton
          contentId={contentId}
          initialLikeCount={initialLikeCount}
          initialHasLiked={initialHasLiked}
          onLikeChange={onLikeChange}
        />
        <Button
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-foreground"
          onClick={() => setShowComments((s) => !s)}
        >
          <MessageCircle className="w-4 h-4 mr-2" />
          {commentCount}
        </Button>
      </div>
      {showComments && (
        <CommentsSection contentId={contentId} onAfterSubmit={refetch} />
      )}
    </div>
  )
}
