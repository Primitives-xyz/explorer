import { TimeDisplay } from '@/components/common/time-display'
import { useContentLikes } from '@/hooks/use-content-likes'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { route } from '@/utils/routes'
import { ArrowRight, ExternalLink, Heart } from 'lucide-react'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import { Avatar } from '../common/avatar'
import { Card } from '../common/card'

interface ContentItem {
  authorProfile: {
    image: string
    namespace: string
    bio: string
    created_at: number
    id: string
    username: string
  }
  content: {
    outputTokenName: string
    inputMint: string
    namespace: string
    created_at: number
    expectedOutput: string
    inputAmount: string
    id: string
    outputMint: string
    type: string
    priceImpact: string
    inputTokenName: string
    sourceWallet?: string
    sourceWalletUsername?: string
    sourceWalletImage?: string
    walletUsername?: string
    walletImage?: string
    walletAddress?: string
    inputTokenImage?: string
    outputTokenImage?: string
    inputTokenSymbol?: string
    outputTokenSymbol?: string
    timestamp?: string
    txSignature?: string
  }
  socialCounts: {
    likeCount: number
    commentCount: number
    hasLiked?: boolean
  }
}

interface ProfileContentFeedProps {
  username: string
}

export const ProfileContentFeed = memo(function ProfileContentFeed({
  username,
}: ProfileContentFeedProps) {
  const { mainUsername } = useCurrentWallet()
  const {
    likeContent,
    unlikeContent,
    isLoading: likeLoading,
  } = useContentLikes()
  const [contents, setContents] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleLike = async (contentId: string, isLiked: boolean) => {
    if (!mainUsername || likeLoading) return

    try {
      if (isLiked) {
        await unlikeContent(contentId, mainUsername, username)
      } else {
        await likeContent(contentId, mainUsername, username)
      }
    } catch (err) {
      console.error('Failed to handle like:', err)
    }
  }

  useEffect(() => {
    async function fetchContents() {
      try {
        const response = await fetch(
          `/api/content?profileId=${username}&orderByField=created_at&orderByDirection=DESC`
        )
        if (!response.ok) {
          throw new Error('Failed to fetch contents')
        }
        const data = await response.json()
        setContents(data.contents || [])
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to fetch contents'
        )
      } finally {
        setIsLoading(false)
      }
    }

    fetchContents()
  }, [username])

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <div className="animate-pulse p-4 space-y-4">
              <div className="h-4 bg-green-900/20 rounded w-3/4"></div>
              <div className="h-4 bg-green-900/20 rounded w-1/2"></div>
            </div>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <div className="p-4">
          <div className="text-red-500">Error: {error}</div>
        </div>
      </Card>
    )
  }

  if (!contents.length) {
    return (
      <Card>
        <div className="p-4">
          <div className="text-gray-500">No swaps found</div>
        </div>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {contents.map((item) => (
        <Card key={item.content.id}>
          <div className="p-4 space-y-4">
            {/* Header with user info and timestamp */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Avatar
                  username={item.authorProfile.username}
                  size={32}
                  imageUrl={item.authorProfile.image}
                />
                <div>
                  <Link
                    href={route('address', { id: item.authorProfile.username })}
                    className=" hover: font-semibold"
                  >
                    @{item.authorProfile.username}
                  </Link>
                  <TimeDisplay
                    timestamp={new Date(item.content.created_at).getTime()}
                    className="text-xs text-gray-400"
                  />
                </div>
              </div>

              {/* Link to trade details */}
              <Link
                href={route('tradeId', { id: item.content.id })}
                className=" hover: text-sm"
              >
                View Details <ExternalLink size={12} className="inline" />
              </Link>
            </div>

            {/* Swap Details */}
            <div className="flex items-center justify-between p-3 bg-green-900/10 rounded-lg border border-green-500/10">
              <div className="flex items-center space-x-4">
                {/* Input Token */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center">
                    {item.content.inputTokenImage ? (
                      <img
                        src={item.content.inputTokenImage}
                        alt={item.content.inputTokenName}
                        className="w-6 h-6 rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-green-500/20 rounded" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium ">
                      {item.content.inputAmount}{' '}
                      {item.content.inputTokenSymbol ||
                        item.content.inputTokenName}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="" size={20} />

                {/* Output Token */}
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-black/40 ring-1 ring-green-500/20 flex items-center justify-center">
                    {item.content.outputTokenImage ? (
                      <img
                        src={item.content.outputTokenImage}
                        alt={item.content.outputTokenName}
                        className="w-6 h-6 rounded"
                      />
                    ) : (
                      <div className="w-6 h-6 bg-green-500/20 rounded" />
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium ">
                      {item.content.expectedOutput}{' '}
                      {item.content.outputTokenSymbol ||
                        item.content.outputTokenName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Price Impact */}
              <div className="text-sm">
                <span className="text-gray-400">Impact: </span>
                <span
                  className={
                    Number(item.content.priceImpact) > 1 ? 'text-red-400' : ''
                  }
                >
                  {Number(item.content.priceImpact).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Social Counts */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <button
                onClick={() => handleLike(
                  item.content.id,
                  item.socialCounts.hasLiked || false
                )}
                disabled={!mainUsername || likeLoading}
                className={`flex items-center space-x-1 p-1 rounded-full hover:bg-green-900/20 transition-colors ${
                  !mainUsername ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${item.socialCounts.hasLiked ? 'fill-current' : ''}`}
                />
                <span>{item.socialCounts.likeCount}</span>
              </button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})
