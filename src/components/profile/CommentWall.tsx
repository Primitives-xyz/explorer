import { useState } from 'react'
import { Card } from '../common/card'
import { usePostComment } from '@/hooks/use-post-comment'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { Alert } from '../common/alert'
import { LoadCircle } from '../common/load-circle'
import Link from 'next/link'
import { Avatar } from '../common/Avatar'
import { CommentItem } from '@/hooks/use-profile-comments'
import { useCommentLikes } from '@/hooks/use-comment-likes'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { ChatBubbleLeftIcon } from '@heroicons/react/24/outline'

interface Props {
  username: string
  comments?: CommentItem[]
  isLoading?: boolean
}

interface CommentFormProps {
  onSubmit: (text: string) => Promise<void>
  isLoading: boolean
  placeholder?: string
  initialText?: string
  buttonText?: string
}

function CommentForm({
  onSubmit,
  isLoading,
  placeholder = 'Write a comment...',
  initialText = '',
  buttonText = 'Post Comment',
}: CommentFormProps) {
  const [text, setText] = useState(initialText)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim() || isLoading) return
    await onSubmit(text.trim())
    setText('')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="relative">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={placeholder}
          className="w-full h-24 bg-black/20 border border-green-800/50 rounded-lg p-3 text-green-400 font-mono placeholder-green-700 focus:outline-none focus:border-green-600 hover:border-green-700 cursor-text transition-colors resize-none ring-1 ring-green-900/30 hover:ring-green-800/50 focus:ring-green-600"
          disabled={isLoading}
        />
        {isLoading && (
          <div className="absolute right-3 top-3">
            <LoadCircle />
          </div>
        )}
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isLoading || !text.trim()}
          className="px-4 py-2 bg-green-900/30 text-green-400 font-mono rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Posting...' : buttonText}
        </button>
      </div>
    </form>
  )
}

export function CommentWall({
  username,
  comments = [],
  isLoading = false,
}: Props) {
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const { postComment, isLoading: postCommentLoading, error } = usePostComment()
  const { mainUsername } = useCurrentWallet()
  const {
    likeComment,
    unlikeComment,
    isLoading: likeLoading,
  } = useCommentLikes()

  const handleSubmitComment = async (text: string) => {
    if (!mainUsername) return

    try {
      await postComment({
        profileId: mainUsername,
        targetProfileId: username,
        text: text.trim(),
      })
    } catch (err) {
      console.error('Failed to post comment:', err)
    }
  }

  const handleSubmitReply = async (text: string) => {
    if (!mainUsername || !replyingTo) return

    try {
      await postComment({
        profileId: mainUsername,
        targetProfileId: username,
        text: text.trim(),
        commentId: replyingTo,
      })
      setReplyingTo(null) // Close reply form after posting
    } catch (err) {
      console.error('Failed to post reply:', err)
    }
  }

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (!mainUsername || likeLoading) return

    try {
      if (isLiked) {
        await unlikeComment(commentId, mainUsername)
      } else {
        await likeComment(commentId, mainUsername)
      }
    } catch (err) {
      console.error('Failed to handle like:', err)
    }
  }

  const renderComment = (comment: CommentItem, isReply: boolean = false) => (
    <div
      key={comment.comment.id}
      className={`border border-green-800/30 rounded-lg p-3 ${
        isReply ? 'ml-8 mt-3' : ''
      }`}
    >
      {comment.author && (
        <div className="flex items-center gap-2 mb-2">
          <Link
            href={`/${comment.author.username}`}
            className="flex items-center gap-2 hover:opacity-80"
          >
            <Avatar username={comment.author.username} size={24} />
            <span className="text-green-400 font-mono text-sm">
              @{comment.author.username}
            </span>
          </Link>
        </div>
      )}
      <div className="text-green-300 font-mono">{comment.comment.text}</div>
      <div className="flex items-center justify-between mt-2">
        <div className="text-green-600 font-mono text-xs">
          {new Date(comment.comment.created_at).toLocaleDateString()}
        </div>
        <div className="flex items-center gap-3">
          {!isReply && mainUsername && (
            <button
              onClick={() => setReplyingTo(comment.comment.id)}
              className="flex items-center gap-1 text-green-500 hover:text-green-400 transition-colors"
            >
              <ChatBubbleLeftIcon className="w-5 h-5" />
              <span className="text-sm font-mono">Reply</span>
            </button>
          )}
          <div className="flex items-center gap-1">
            <button
              onClick={() =>
                handleLike(
                  comment.comment.id,
                  comment.requestingProfileSocialInfo?.hasLiked || false,
                )
              }
              disabled={!mainUsername || likeLoading}
              className={`p-1 rounded-full hover:bg-green-900/20 transition-colors ${
                !mainUsername ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {comment.requestingProfileSocialInfo?.hasLiked ? (
                <HeartSolid className="w-5 h-5 text-green-500" />
              ) : (
                <HeartOutline className="w-5 h-5 text-green-500" />
              )}
            </button>
            <span className="text-green-500 font-mono text-sm">
              {comment.socialCounts?.likeCount || 0}
            </span>
          </div>
        </div>
      </div>
      {replyingTo === comment.comment.id && (
        <div className="mt-3">
          <CommentForm
            onSubmit={handleSubmitReply}
            isLoading={postCommentLoading}
            placeholder="Write a reply..."
            buttonText="Post Reply"
          />
        </div>
      )}
    </div>
  )

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Comment Wall</h3>
        <div className="space-y-4">
          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {isLoading ? (
              <div className="text-center text-green-600 font-mono py-4">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              <div className="text-center text-green-600 font-mono py-4">
                be the first to comment on this profile
              </div>
            ) : (
              comments.map((comment) => (
                <div key={comment.comment.id}>
                  {renderComment(comment)}
                  {/* Render replies if this comment has any */}
                  {comments
                    .filter(
                      (reply) => reply.comment.commentId === comment.comment.id,
                    )
                    .map((reply) => renderComment(reply, true))}
                </div>
              ))
            )}
          </div>

          {/* Main Comment Form */}
          {mainUsername ? (
            <CommentForm
              onSubmit={handleSubmitComment}
              isLoading={postCommentLoading}
            />
          ) : (
            <div className="text-green-600 font-mono text-sm text-center">
              Connect your wallet to post comments
            </div>
          )}
          {error && <Alert type="error" message={error} />}
        </div>
      </div>
    </Card>
  )
}
