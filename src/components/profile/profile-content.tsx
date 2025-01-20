'use client'

import useSWR from 'swr'
import { Card } from '../common/card'
import { FollowButton } from './follow-button'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { ProfileSection } from '../ProfileSection'
import { useGetProfiles } from '../auth/hooks/use-get-profiles'
import { useRouter } from 'next/navigation'
import { TokenAddress } from '../tokens/TokenAddress'
import { CommentWall } from './comment-wall'
import { useGetComments } from '../auth/hooks/use-get-comments'

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

export function ProfileContent({ username }: Props) {
  const { mainUsername } = useCurrentWallet()

  const fetcher = async (url: string) => {
    const res = await fetch(url)
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json()
  }

  const { data, error, isLoading } = useSWR<ProfileData>(
    `/api/profiles/${username}?fromUsername=${mainUsername} `,
    fetcher,
  )
  const { profiles, loading: loadingProfiles } = useGetProfiles(
    data?.walletAddress || '',
  )
  const { comments, loading: loadingComments } = useGetComments({
    targetProfileId: 'marcus',
    requestingProfileId: 'marcus',
  })
  console.log('comments ----------------', comments)
  console.log('profiles ----------------', profiles)
  const loading = isLoading || loadingProfiles

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
            <h1 className="text-4xl font-mono text-green-400">@{username}</h1>
            {!loading && data?.walletAddress && (
              <div className="flex items-center gap-2 text-sm text-green-600 sm:mb-1">
                owned by <TokenAddress address={data.walletAddress} />
              </div>
            )}
          </div>
          <FollowButton username={username} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4"></div>
        </div>

        <div className="space-y-6">
          <CommentWall comments={comments} targetProfileId={username} />
        </div>
      </div>
    </div>
  )
}
