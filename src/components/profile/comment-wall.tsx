import { Comment } from '@/types'
import { useState } from 'react'
import { Card } from '../common/card'

export function CommentWall({
  comments,
  targetProfileId,
}: {
  comments: Comment[]
  targetProfileId: string
}) {
  console.log('$$$$$')
  console.log(comments)
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      const requestingProfileId = localStorage.getItem('profile_id')
      const response = await fetch('/api/comments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: newComment,
          targetProfileId: targetProfileId,
          authorProfileId: requestingProfileId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post comment')
      }

      const newCommentData = await response.json()
      //   setNewComment('')
      //   refreshComments(targetProfileId, requestingProfileId)
    } catch (err) {
      setError('Failed to post comment')
      console.error('Error posting comment:', err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Comment Wall</h3>
        {/* 
        <form onSubmit={handleSubmitComment} className="mb-6">
          <div className="flex flex-col space-y-2">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Write a comment..."
              className="w-full p-2 bg-gray-800 border border-gray-700 rounded-lg 
                       text-gray-200 placeholder-gray-500 focus:outline-none 
                       focus:border-green-400 resize-none"
              rows={3}
            />
            <button
              type="submit"
              disabled={isSubmitting || !newComment.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded-lg 
                       hover:bg-green-700 disabled:opacity-50 
                       disabled:cursor-not-allowed font-mono"
            >
              {isSubmitting ? 'Posting...' : 'Post Comment'}
            </button>
          </div>
        </form> */}

        <div className="space-y-4">
          {(comments ?? []).map((comment) => (
            <div
              key={comment.id}
              className="border border-gray-700 rounded-lg p-4"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-green-400 font-mono">
                  {comment.authorUsername || 'Anonymous'}
                </span>
                <span className="text-gray-500 text-sm">
                  {new Date(comment.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="text-gray-300">{comment.content}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
