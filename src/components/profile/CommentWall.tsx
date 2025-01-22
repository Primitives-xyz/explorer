import { useState } from 'react'
import { Card } from '../common/card'
import { usePostComment } from '@/hooks/use-post-comment'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { Alert } from '../common/alert'
import { LoadCircle } from '../common/load-circle'

interface Props {
  username: string
  comments?: any[] // Using any[] temporarily, should be properly typed based on your comment structure
}

export function CommentWall({ username, comments = [] }: Props) {
  const [comment, setComment] = useState('')
  const { postComment, isLoading, error } = usePostComment()
  //   const { mainUsername } = useCurrentWallet()
  const mainUsername = 'marcusmth'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!comment.trim() || !mainUsername) return

    try {
      await postComment({
        profileId: mainUsername,
        targetProfileId: username,
        text: comment.trim(),
      })
      setComment('') // Clear the input on success
    } catch (err) {
      console.error('Failed to post comment:', err)
    }
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Comment Wall</h3>
        <div className="space-y-4">
          {/* Comments List */}
          <div className="space-y-3 mb-4">
            {comments.map((comment, index) => (
              <div
                key={index}
                className="border border-green-800/30 rounded-lg p-3"
              >
                <div className="text-green-400 font-mono text-sm mb-1">
                  @{comment.profileId}
                </div>
                <div className="text-green-300 font-mono">{comment.text}</div>
              </div>
            ))}
          </div>

          {/* Comment Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <p>{`mainusername: ${mainUsername}`}</p>
              <p>{`username: ${username}`}</p>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write a comment..."
                className="w-full h-24 bg-black/20 border border-green-800/50 rounded-lg p-3 text-green-400 font-mono placeholder-green-700 focus:outline-none focus:border-green-600 hover:border-green-700 cursor-text transition-colors resize-none ring-1 ring-green-900/30 hover:ring-green-800/50 focus:ring-green-600"
                disabled={isLoading || !mainUsername}
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
                disabled={isLoading || !comment.trim() || !mainUsername}
                className="px-4 py-2 bg-green-900/30 text-green-400 font-mono rounded hover:bg-green-900/50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isLoading ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </form>

          {error && <Alert type="error" message={error} />}

          {!mainUsername && (
            <div className="text-green-600 font-mono text-sm text-center">
              Connect your wallet to post comments
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
