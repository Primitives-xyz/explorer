'use client'

import useSWR from 'swr'
import { Card } from '../common/card'
import { FollowButton } from './follow-button'
import { useApiVersion } from '@/hooks/use-api-version'

interface Props {
  username: string
}

interface ProfileData {
  walletAddress: string
  socialCounts?: {
    followers: number
    following: number
  }
}

function LoadingCard() {
  return (
    <Card>
      <div className="p-4">
        <div className="h-8 bg-green-900/20 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-green-900/20 rounded animate-pulse w-1/2"></div>
      </div>
    </Card>
  )
}

export function ProfileContent({ username }: Props) {
  const { useNewApi } = useApiVersion()

  const fetcher = async (url: string) => {
    const apiUrl = `${url}?useNewApi=${useNewApi}`
    const res = await fetch(apiUrl)
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json()
  }

  const { data, error, isLoading } = useSWR<ProfileData>(
    `/api/profiles/${username}`,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000,
      refreshInterval: 3000,
    },
  )

  const loading = isLoading

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-4xl font-mono text-green-400">@{username}</h1>
          <div className="min-w-[120px]">
            <FollowButton username={username} />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {loading ? (
            <div className="h-5 bg-green-900/20 rounded animate-pulse w-32"></div>
          ) : (
            <div className="flex items-center space-x-2">
              <span className="text-green-600 font-mono">
                {data?.walletAddress
                  ? `${data.walletAddress.slice(
                      0,
                      4,
                    )}...${data.walletAddress.slice(-4)}`
                  : 'Wallet not connected'}
              </span>
              {data?.walletAddress && (
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(data.walletAddress)
                    // Optional: Add a toast notification here
                  }}
                  className="p-1.5 text-green-400 hover:bg-green-900/30 rounded transition-colors"
                  title="Copy wallet address"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-mono text-green-400 mb-2">
                  Followers
                </h3>
                <div className="text-3xl font-mono text-green-500">
                  {loading ? (
                    <div className="h-8 bg-green-900/20 rounded animate-pulse w-16"></div>
                  ) : (
                    data?.socialCounts?.followers || 0
                  )}
                </div>
              </div>
            </Card>
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-mono text-green-400 mb-2">
                  Following
                </h3>
                <div className="text-3xl font-mono text-green-500">
                  {loading ? (
                    <div className="h-8 bg-green-900/20 rounded animate-pulse w-16"></div>
                  ) : (
                    data?.socialCounts?.following || 0
                  )}
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Profile Actions */}
          <Card>
            <div className="p-4 space-y-4">
              <h3 className="text-lg font-mono text-green-400">
                Profile Actions
              </h3>
              <div className="space-y-2">
                <button className="w-full px-4 py-2 bg-green-900/30 text-green-400 font-mono border border-green-800 hover:bg-green-900/50 transition-colors rounded">
                  Share Profile
                </button>
                <button className="w-full px-4 py-2 bg-green-900/30 text-green-400 font-mono border border-green-800 hover:bg-green-900/50 transition-colors rounded">
                  Copy Profile Link
                </button>
              </div>
            </div>
          </Card>

          {/* Profile Info */}
          <Card>
            <div className="p-4">
              <h3 className="text-lg font-mono text-green-400 mb-4">
                Profile Info
              </h3>
              <div className="space-y-2 text-sm font-mono">
                <div className="flex justify-between">
                  <span className="text-green-600">Created</span>
                  <span className="text-green-400">2024</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Network</span>
                  <span className="text-green-400">Solana</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">Status</span>
                  <span className="text-green-400">Active</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-green-600">API Version</span>
                  <span className="text-green-400">
                    {useNewApi ? 'New' : 'Old'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
