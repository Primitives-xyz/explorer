import { useState, useEffect } from 'react'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { Card } from '../common/card'

interface WallPost {
  id: string
  created_at: number
  text: string
  author: {
    username: string
    image?: string
  }
}

interface ProfileWallProps {
  recipientWalletAddress: string
}

export function ProfileWall({ recipientWalletAddress }: ProfileWallProps) {
  const [posts, setPosts] = useState<WallPost[]>([])
  const [newPost, setNewPost] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { walletAddress, isLoggedIn } = useCurrentWallet()

  // Fetch wall posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/wall/${recipientWalletAddress}`)
        if (response.ok) {
          const data = await response.json()
          setPosts(data.comments)
        }
      } catch (error) {
        console.error('Error fetching wall posts:', error)
      }
    }

    if (recipientWalletAddress) {
      fetchPosts()
    }
  }, [recipientWalletAddress])

  const handleSubmitPost = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isLoggedIn || !walletAddress || !newPost.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch('/api/wall/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentId: recipientWalletAddress,
          profileId: walletAddress,
          text: newPost,
        }),
      })

      if (response.ok) {
        const newPostData = await response.json()
        setPosts((prev) => [newPostData, ...prev])
        setNewPost('')
      }
    } catch (error) {
      console.error('Error posting to wall:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <div className="p-4 space-y-4">
        <h2 className="text-lg font-mono text-green-400">Wall</h2>
        
        {/* Post Form */}
        {isLoggedIn && walletAddress ? (
          <form onSubmit={handleSubmitPost}>
            <div className="flex flex-col space-y-2">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Write something on the wall..."
                className="w-full p-2 bg-black/50 border border-green-800 rounded-lg text-green-400 placeholder-green-700 font-mono resize-none focus:outline-none focus:border-green-600"
                rows={3}
              />
              <button
                type="submit"
                disabled={isLoading || !newPost.trim()}
                className="px-4 py-2 bg-green-900/50 text-green-400 border border-green-800 rounded-lg font-mono hover:bg-green-800/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Posting...' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 border border-green-800/50 rounded-lg bg-green-900/10">
            <p className="text-green-500 font-mono text-sm">
              Connect your wallet to write on the wall
            </p>
          </div>
        )}

        {/* Posts List */}
        <div className="space-y-4 mt-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="p-3 border border-green-800/50 rounded-lg bg-black/30"
            >
              <div className="flex items-start space-x-3">
                {post.author.image && (
                  <img
                    src={post.author.image}
                    alt={post.author.username}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <div className="flex-1">
                  <div className="flex items-baseline space-x-2">
                    <span className="text-green-400 font-mono">
                      {post.author.username}
                    </span>
                    <span className="text-green-700 text-xs font-mono">
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="mt-1 text-green-300 font-mono text-sm whitespace-pre-wrap">
                    {post.text}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
} 