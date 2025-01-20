import { Comment } from '@/types'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card } from '../common/card'

export function CommentWall() {
  const params = useParams()
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(
          `/api/comments?targetProfileId=${params.id}`,
        )
        if (!response.ok) {
          throw new Error('Failed to fetch comments')
        }
        const data = await response.json()
        setComments(data)
      } catch (err) {
        setError('Failed to load comments')
        console.error('Error fetching comments:', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [params.id])

  return (
    <Card>
      <div className="p-4">
        <h3 className="text-lg font-mono text-green-400 mb-4">Comment Wall</h3>

        {isLoading && (
          <div className="text-center text-gray-500">Loading comments...</div>
        )}

        {error && <div className="text-center text-red-500">{error}</div>}

        {!isLoading && !error && comments.length === 0 && (
          <div className="text-center text-gray-500">No comments yet</div>
        )}

        <div className="space-y-4">
          {comments.map((comment) => (
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
