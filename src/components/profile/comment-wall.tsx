import { TimeDisplay } from '@/components/common/time-display'

import { getPriorityLevels } from '@/constants/jupiter'
import { useCommentFee } from '@/hooks/use-comment-fee'
import { useCommentLikes } from '@/hooks/use-comment-likes'
import { usePostComment } from '@/hooks/use-post-comment'
import type { CommentItem } from '@/hooks/use-profile-comments'
import { useProfileComments } from '@/hooks/use-profile-comments'
import { useToast } from '@/hooks/use-toast'
import type { PriorityLevel } from '@/types/jupiter'
import { route } from '@/utils/routes'
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartOutline,
} from '@heroicons/react/24/outline'
import { HeartIcon as HeartSolid } from '@heroicons/react/24/solid'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { Alert } from '../common/alert'
import { Avatar } from '../common/avatar'
import { Card } from '../common/card'
import { LoadCircle } from '../common/load-circle'
import { FollowButton } from './follow-button'

const DynamicConnectButton = dynamic(
  () =>
    import('@dynamic-labs/sdk-react-core').then(
      (mod) => mod.DynamicConnectButton
    ),
  { ssr: false }
)

interface Props {
  username: string
  comments?: CommentItem[]
  isLoading?: boolean
  targetWalletAddress?: string
}

export function CommentWall({
  username,
  comments = [],
  isLoading = false,
  targetWalletAddress,
}: Props) {
  const [commentText, setCommentText] = useState('')
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)
  const [priorityLevel, setPriorityLevel] = useState<PriorityLevel>('Medium')
  const { postComment, isLoading: postCommentLoading, error } = usePostComment()
  const { mainUsername } = useCurrentWallet()
  const { processCommentFee, isProcessing: isProcessingFee } = useCommentFee()
  const { toast } = useToast()
  const {
    likeComment,
    unlikeComment,
    isLoading: likeLoading,
  } = useCommentLikes()

  const t = useTranslations()

  const { mutate: refreshComments } = useProfileComments(
    username,
    mainUsername || undefined
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !mainUsername || !targetWalletAddress) return

    try {
      // First process the SSE payment
      toast({
        title: 'Processing Payment',
        description: 'Please approve the SSE payment transaction...',
        variant: 'pending',
        duration: 5000,
      })

      await processCommentFee(targetWalletAddress, priorityLevel)

      toast({
        title: 'Payment Successful',
        description: 'Posting your comment...',
        variant: 'pending',
        duration: 2000,
      })

      // Then post the comment
      await postComment({
        profileId: mainUsername,
        targetProfileId: username,
        text: commentText.trim(),
        ...(replyToCommentId && { commentId: replyToCommentId }),
      })

      setCommentText('') // Clear the input on success
      setReplyToCommentId(null) // Clear reply state

      toast({
        title: 'Comment Posted',
        description: 'Your comment has been posted successfully!',
        variant: 'success',
        duration: 5000,
      })
    } catch (err: any) {
      console.error('Failed to post comment:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to post comment',
        variant: 'error',
        duration: 5000,
      })
    } finally {
      // Always refresh comments, even if there was an error
      await refreshComments()
    }
  }

  const handleLike = async (commentId: string, isLiked: boolean) => {
    if (!mainUsername || likeLoading) return

    try {
      if (isLiked) {
        await unlikeComment(commentId, mainUsername, username)
      } else {
        await likeComment(commentId, mainUsername, username)
      }
    } catch (err) {
      console.error('Failed to handle like:', err)
    }
  }

  const handleReply = (commentId: string) => {
    if (!mainUsername) return
    setReplyToCommentId(replyToCommentId === commentId ? null : commentId)
    setCommentText('') // Clear any existing comment text
  }

  return (
    <Card>
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-mono ">Comment Wall</h3>
          <div className="text-sm  font-mono">100 SSE per comment</div>
        </div>
        <div className="space-y-4">
          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {isLoading ? (
              <div className="text-center  font-mono py-4">
                Loading comments...
              </div>
            ) : comments.length === 0 ? (
              !mainUsername ? (
                <div className="flex items-center justify-center min-h-[300px]">
                  <DynamicConnectButton>
                    <div className="bg-green-900/30  font-mono rounded border border-green-800 hover:bg-green-900/50 text-center cursor-pointer px-4 py-2">
                      Connect Wallet to Comment
                    </div>
                  </DynamicConnectButton>
                </div>
              ) : (
                <div className="text-center  font-mono py-4">
                  be the first to comment on this profile
                </div>
              )
            ) : (
              comments.map((comment) => (
                <div key={comment.comment.id}>
                  <div className="border border-green-800/30 rounded-lg p-3">
                    {comment.author && (
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          href={route('address', {
                            id: comment.author.username,
                          })}
                          className="flex items-center gap-2 hover:opacity-80"
                        >
                          <Avatar
                            username={comment.author.username}
                            size={24}
                            imageUrl={comment.author.image}
                          />
                          <span className=" font-mono text-sm">
                            @{comment.author.username}
                          </span>
                        </Link>
                        {comment.author && (
                          <FollowButton
                            username={comment.author.username}
                            size="sm"
                          />
                        )}
                      </div>
                    )}
                    <div className=" font-mono">{comment.comment.text}</div>
                    <div className="flex items-center justify-between mt-2">
                      <div className=" font-mono text-xs">
                        <TimeDisplay
                          timestamp={new Date(
                            comment.comment.created_at
                          ).getTime()}
                          textColor=""
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        {mainUsername && (
                          <button
                            onClick={() => handleReply(comment.comment.id)}
                            className={`p-1 rounded-full hover:bg-green-900/20 transition-colors flex items-center gap-1 ${
                              !mainUsername
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            <ChatBubbleLeftIcon className="w-5 h-5 " />
                            <span className=" font-mono text-sm">
                              {comment.socialCounts?.replyCount || 0} Reply
                            </span>
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() =>
                              handleLike(
                                comment.comment.id,
                                comment.requestingProfileSocialInfo?.hasLiked ||
                                  false
                              )
                            }
                            disabled={!mainUsername || likeLoading}
                            className={`p-1 rounded-full hover:bg-green-900/20 transition-colors ${
                              !mainUsername
                                ? 'opacity-50 cursor-not-allowed'
                                : ''
                            }`}
                          >
                            {comment.requestingProfileSocialInfo?.hasLiked ? (
                              <HeartSolid className="w-5 h-5 " />
                            ) : (
                              <HeartOutline className="w-5 h-5 " />
                            )}
                          </button>
                          <span className=" font-mono text-sm">
                            {comment.socialCounts?.likeCount || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Display Threaded Replies */}
                  {comment.recentReplies &&
                    comment.recentReplies.length > 0 && (
                      <div className="mt-2 ml-8 space-y-2">
                        {comment.recentReplies.map((reply) => (
                          <div
                            key={reply.comment.id}
                            className="border-l-2 border-green-800/30 pl-4"
                          >
                            <div className="border border-green-800/30 rounded-lg p-3">
                              {reply.author && (
                                <div className="flex items-center gap-2 mb-2">
                                  <Link
                                    href={route('address', {
                                      id: reply.author.username,
                                    })}
                                    className="flex items-center gap-2 hover:opacity-80"
                                  >
                                    <Avatar
                                      username={reply.author.username}
                                      size={20}
                                      imageUrl={reply.author.image}
                                    />
                                    <span className=" font-mono text-sm">
                                      @{reply.author.username}
                                    </span>
                                  </Link>
                                  {reply.author && (
                                    <FollowButton
                                      username={reply.author.username}
                                      size="sm"
                                    />
                                  )}
                                </div>
                              )}
                              <div className=" font-mono text-sm">
                                {reply.comment.text}
                              </div>
                              <div className="flex items-center justify-between mt-2">
                                <div className=" font-mono text-xs">
                                  <TimeDisplay
                                    timestamp={new Date(
                                      reply.comment.created_at
                                    ).getTime()}
                                    textColor=""
                                  />
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      handleLike(
                                        reply.comment.id,
                                        reply.requestingProfileSocialInfo
                                          ?.hasLiked || false
                                      )
                                    }
                                    disabled={!mainUsername || likeLoading}
                                    className={`p-1 rounded-full hover:bg-green-900/20 transition-colors ${
                                      !mainUsername
                                        ? 'opacity-50 cursor-not-allowed'
                                        : ''
                                    }`}
                                  >
                                    {reply.requestingProfileSocialInfo
                                      ?.hasLiked ? (
                                      <HeartSolid className="w-4 h-4 " />
                                    ) : (
                                      <HeartOutline className="w-4 h-4 " />
                                    )}
                                  </button>
                                  <span className=" font-mono text-sm">
                                    {reply.socialCounts?.likeCount || 0}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Reply Form */}
                  {replyToCommentId === comment.comment.id && mainUsername && (
                    <div className="mt-2 ml-6 border-l-2 border-green-800/30 pl-4">
                      <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                          <textarea
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            placeholder="Write a reply..."
                            className="w-full h-24 bg-black/20 border border-green-800/50 rounded-lg p-3  font-mono placeholder-green-700 focus:outline-none focus:border-green-600 hover:border-green-700 cursor-text transition-colors resize-none ring-1 ring-green-900/30 hover:ring-green-800/50 focus:ring-green-600"
                            disabled={postCommentLoading || isProcessingFee}
                          />
                          {(postCommentLoading || isProcessingFee) && (
                            <div className="absolute right-3 top-3">
                              <LoadCircle />
                            </div>
                          )}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="submit"
                            disabled={
                              postCommentLoading ||
                              isProcessingFee ||
                              !commentText.trim()
                            }
                            className="px-4 py-2 bg-green-900/30  font-mono rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {isProcessingFee
                              ? 'Processing...'
                              : postCommentLoading
                              ? 'Posting...'
                              : 'Post Reply'}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Main Comment Form - Only show when logged in */}
          {mainUsername && !replyToCommentId && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Write a comment..."
                  className="w-full h-24 bg-black/20 border border-green-800/50 rounded-lg p-3  font-mono placeholder-green-700 focus:outline-none focus:border-green-600 hover:border-green-700 cursor-text transition-colors resize-none ring-1 ring-green-900/30 hover:ring-green-800/50 focus:ring-green-600"
                  disabled={postCommentLoading || isProcessingFee}
                />
                {(postCommentLoading || isProcessingFee) && (
                  <div className="absolute right-3 top-3">
                    <LoadCircle />
                  </div>
                )}
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div className="text-sm  font-mono">
                    {isProcessingFee
                      ? 'Processing payment...'
                      : '80% goes to profile owner'}
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={priorityLevel}
                      onChange={(e) =>
                        setPriorityLevel(e.target.value as PriorityLevel)
                      }
                      className="bg-green-900/20  text-sm font-mono rounded border border-green-800/50 px-2 py-1"
                      disabled={postCommentLoading || isProcessingFee}
                    >
                      {getPriorityLevels(t).map((level) => (
                        <option
                          key={level.value}
                          value={level.value}
                          title={level.description}
                        >
                          {level.label}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs  font-mono">Priority</span>
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={
                    postCommentLoading || isProcessingFee || !commentText.trim()
                  }
                  className="px-4 py-2 bg-green-900/30  font-mono rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isProcessingFee
                    ? 'Processing...'
                    : postCommentLoading
                    ? 'Posting...'
                    : 'Post Comment'}
                </button>
              </div>
            </form>
          )}
          {error && <Alert type="error" message={error} />}
        </div>
      </div>
    </Card>
  )
}
