'use client'

import type React from 'react'

import { Card } from '@/components/common/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useCommentLikes } from '@/hooks/use-comment-likes'
import { usePostComment } from '@/hooks/use-post-comment'
import { useProfileComments } from '@/hooks/use-profile-comments'
import { useToast } from '@/hooks/use-toast'
import { HeartIcon as HeartOutline } from '@heroicons/react/24/outline'
import {
  ChatBubbleLeftIcon,
  HeartIcon as HeartSolid,
} from '@heroicons/react/24/solid'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useCurrentWallet } from './auth/hooks/use-current-wallet'

export default function SocialHub({ username }: { username: string }) {
  const [newComment, setNewComment] = useState('')
  const [replyToCommentId, setReplyToCommentId] = useState<string | null>(null)
  const { mainUsername } = useCurrentWallet()
  const { toast } = useToast()
  const router = useRouter()
  const {
    postComment,
    isLoading: postCommentLoading,
    error: postError,
  } = usePostComment()
  const {
    likeComment,
    unlikeComment,
    isLoading: likeLoading,
  } = useCommentLikes()

  const {
    comments,
    isLoading: isLoadingComments,
    mutate: refreshComments,
  } = useProfileComments(username, mainUsername || undefined)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !mainUsername) return

    try {
      await postComment({
        profileId: mainUsername,
        targetProfileId: username,
        text: newComment.trim(),
        ...(replyToCommentId && { commentId: replyToCommentId }),
      })

      setNewComment('') // Clear the input on success
      setReplyToCommentId(null) // Clear reply state

      toast({
        title: 'Comment Posted',
        description: 'Your comment has been posted successfully!',
        variant: 'success',
        duration: 5000,
      })

      // Refresh comments after posting
      await refreshComments()
    } catch (err: any) {
      console.error('Failed to post comment:', err)
      toast({
        title: 'Error',
        description: err.message || 'Failed to post comment',
        variant: 'error',
        duration: 5000,
      })
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
      toast({
        title: 'Error',
        description: 'Failed to like/unlike comment',
        variant: 'error',
        duration: 3000,
      })
    }
  }

  const handleReply = (commentId: string) => {
    if (!mainUsername) return
    setReplyToCommentId(replyToCommentId === commentId ? null : commentId)
    setNewComment('') // Clear any existing comment text
  }

  const navigateToProfile = (profileUsername: string) => {
    if (profileUsername) {
      router.push(`/profile/${profileUsername}`)
    }
  }

  return (
    <Card>
      <div className="p-4 border-b border-green-900/20">
        <h3 className="text-lg font-mono">Social Hub</h3>
      </div>
      <div className="p-4">
        {/* Main comment form - only show when not replying */}
        {!replyToCommentId && (
          <form onSubmit={handleSubmitComment} className="mb-6">
            <Textarea
              placeholder="Share your thoughts..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="mb-2 bg-gray-800 border-green-800/50 text-gray-200 font-mono text-sm resize-none focus:border-green-500 focus:ring-green-500/20"
              disabled={postCommentLoading}
            />
            <Button
              type="submit"
              disabled={
                postCommentLoading || !newComment.trim() || !mainUsername
              }
              className="bg-green-700 hover:bg-green-600 text-white font-mono text-sm"
            >
              {postCommentLoading ? 'Posting...' : 'Post Comment'}
            </Button>
          </form>
        )}

        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex space-x-4 pb-4 border-b border-green-900/10 last:border-0"
            >
              <Avatar
                className="border border-green-500/30 cursor-pointer"
                onClick={() =>
                  navigateToProfile(comment.author?.username || '')
                }
              >
                <AvatarImage
                  src={comment.author?.image || ''}
                  alt={comment.author?.username || ''}
                />
                <AvatarFallback className="bg-gray-800 text-green-500">
                  {comment.author?.username?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <div className="flex items-center justify-between">
                  <span
                    className="font-mono text-green-400 cursor-pointer hover:underline"
                    onClick={() =>
                      navigateToProfile(comment.author?.username || '')
                    }
                  >
                    @{comment.author?.username}
                  </span>
                  <span className="text-xs text-gray-400 font-mono">
                    {new Date(comment.comment.created_at).toLocaleString()}
                  </span>
                </div>
                <p className="mt-1 text-gray-300 font-mono text-sm">
                  {comment.comment.text}
                </p>

                {/* Like and Reply buttons */}
                <div className="flex items-center gap-4 mt-2">
                  <button
                    onClick={() =>
                      handleLike(
                        comment.comment.id,
                        comment.requestingProfileSocialInfo?.hasLiked || false
                      )
                    }
                    disabled={!mainUsername || likeLoading}
                    className={`flex items-center gap-1 text-sm font-mono ${
                      !mainUsername
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:text-green-400'
                    }`}
                  >
                    {comment.requestingProfileSocialInfo?.hasLiked ? (
                      <HeartSolid className="w-5 h-5 text-green-500" />
                    ) : (
                      <HeartOutline className="w-5 h-5" />
                    )}
                    <span>{comment.socialCounts?.likeCount || 0}</span>
                  </button>
                  <button
                    onClick={() => handleReply(comment.comment.id)}
                    disabled={!mainUsername}
                    className={`flex items-center gap-1 text-sm font-mono ${
                      !mainUsername
                        ? 'opacity-50 cursor-not-allowed'
                        : 'hover:text-green-400'
                    }`}
                  >
                    <ChatBubbleLeftIcon className="w-5 h-5" />
                    <span>Reply</span>
                  </button>
                </div>

                {/* Reply form - only show when replying to this comment */}
                {replyToCommentId === comment.comment.id && (
                  <div className="mt-3">
                    <form
                      onSubmit={handleSubmitComment}
                      className="flex flex-col"
                    >
                      <Textarea
                        placeholder={`Reply to @${comment.author?.username}...`}
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="mb-2 bg-gray-800 border-green-800/50 text-gray-200 font-mono text-sm resize-none focus:border-green-500 focus:ring-green-500/20"
                        disabled={postCommentLoading}
                      />
                      <div className="flex justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setReplyToCommentId(null)}
                          className="text-xs"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          disabled={
                            postCommentLoading ||
                            !newComment.trim() ||
                            !mainUsername
                          }
                          className="bg-green-700 hover:bg-green-600 text-white font-mono text-xs"
                        >
                          {postCommentLoading ? 'Posting...' : 'Post Reply'}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Display replies */}
                {comment.recentReplies && comment.recentReplies.length > 0 && (
                  <div className="mt-3 ml-4 space-y-3 border-l-2 border-green-800/30 pl-4">
                    {comment.recentReplies.map((reply) => (
                      <motion.div
                        key={reply.comment.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex space-x-3"
                      >
                        <Avatar
                          className="w-8 h-8 border border-green-500/30 cursor-pointer"
                          onClick={() =>
                            navigateToProfile(reply.author?.username || '')
                          }
                        >
                          <AvatarImage
                            src={reply.author?.image || ''}
                            alt={reply.author?.username || ''}
                          />
                          <AvatarFallback className="text-xs bg-gray-800 text-green-500">
                            {reply.author?.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-grow">
                          <div className="flex items-center justify-between">
                            <span
                              className="font-mono text-green-400 text-sm cursor-pointer hover:underline"
                              onClick={() =>
                                navigateToProfile(reply.author?.username || '')
                              }
                            >
                              @{reply.author?.username}
                            </span>
                            <span className="text-xs text-gray-400 font-mono">
                              {new Date(
                                reply.comment.created_at
                              ).toLocaleString()}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-gray-300 font-mono">
                            {reply.comment.text}
                          </p>

                          {/* Like button for replies */}
                          <button
                            onClick={() =>
                              handleLike(
                                reply.comment.id,
                                reply.requestingProfileSocialInfo?.hasLiked ||
                                  false
                              )
                            }
                            disabled={!mainUsername || likeLoading}
                            className={`flex items-center gap-1 text-xs mt-1 font-mono ${
                              !mainUsername
                                ? 'opacity-50 cursor-not-allowed'
                                : 'hover:text-green-400'
                            }`}
                          >
                            {reply.requestingProfileSocialInfo?.hasLiked ? (
                              <HeartSolid className="w-4 h-4 text-green-500" />
                            ) : (
                              <HeartOutline className="w-4 h-4" />
                            )}
                            <span>{reply.socialCounts?.likeCount || 0}</span>
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}

          {isLoadingComments && (
            <div className="text-center py-4 font-mono text-gray-400">
              <div className="h-8 bg-green-900/20 rounded animate-pulse w-48 mx-auto"></div>
            </div>
          )}

          {!isLoadingComments && comments.length === 0 && (
            <div className="text-center py-4 font-mono text-gray-400">
              Be the first to comment!
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
