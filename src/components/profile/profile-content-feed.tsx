import { formatTimeAgo } from '@/utils/format-time'
import { route } from '@/utils/routes'
import { ArrowRight, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { memo, useEffect, useState } from 'react'
import { Avatar } from '../common/Avatar'
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
  }
}

interface ProfileContentFeedProps {
  username: string
}

export const ProfileContentFeed = memo(function ProfileContentFeed({
  username,
}: ProfileContentFeedProps) {
  const [contents, setContents] = useState<ContentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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
                    className="text-green-400 hover:text-green-300 font-semibold"
                  >
                    @{item.authorProfile.username}
                  </Link>
                  <div className="text-xs text-gray-400">
                    {formatTimeAgo(new Date(item.content.created_at))}
                  </div>
                </div>
              </div>

              {/* Link to trade details */}
              <Link
                href={route('tradeId', { id: item.content.id })}
                className="text-green-500 hover:text-green-400 text-sm"
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
                    <div className="text-sm font-medium text-green-400">
                      {item.content.inputAmount}{' '}
                      {item.content.inputTokenSymbol ||
                        item.content.inputTokenName}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <ArrowRight className="text-green-500" size={20} />

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
                    <div className="text-sm font-medium text-green-400">
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
                    Number(item.content.priceImpact) > 1
                      ? 'text-red-400'
                      : 'text-green-400'
                  }
                >
                  {Number(item.content.priceImpact).toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Social Counts */}
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
                <span>{item.socialCounts.likeCount}</span>
              </div>
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  />
                </svg>
                <span>{item.socialCounts.commentCount}</span>
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
})
