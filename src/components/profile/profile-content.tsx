'use client'

import useSWR from 'swr'
import { Card } from '../common/card'
import { FollowButton } from './follow-button'
import { useCurrentWallet } from '../auth/hooks/use-current-wallet'
import { ProfileSection } from '../ProfileSection'
import { useGetProfiles } from '../auth/hooks/use-get-profiles'
import { useProfileFollowers } from '@/hooks/use-profile-followers'
import { useProfileFollowing } from '@/hooks/use-profile-following'
import { useProfileComments } from '@/hooks/use-profile-comments'
import { SocialSection } from '../social/SocialSection'
import { TokenAddress } from '../tokens/TokenAddress'
import { Modal } from '../common/modal'
import { CommentWall } from './CommentWall'
import { useState } from 'react'
import { ProfileInfo } from './ProfileInfo'
import { Avatar } from '../common/Avatar'

interface Props {
  username: string
}

export interface ProfileData {
  walletAddress: string
  socialCounts?: {
    followers: number
    following: number
  }
  profile: {
    created_at: string
    image: string | null
  }
}

export function ProfileContent({ username }: Props) {
  const { mainUsername } = useCurrentWallet()
  const [showFollowersModal, setShowFollowersModal] = useState(false)
  const [showFollowingModal, setShowFollowingModal] = useState(false)
  const {
    followers,
    isLoading: isLoadingFollowers,
    error: followersError,
  } = useProfileFollowers(username)
  const {
    following,
    isLoading: isLoadingFollowing,
    error: followingError,
  } = useProfileFollowing(username)
  const { comments, isLoading: isLoadingComments } = useProfileComments(
    username,
    mainUsername || undefined,
  )

  const fetcher = async (url: string) => {
    const res = await fetch(url)

    if (res.status === 500) {
      window.location.href = '/'
      throw new Error('Server error')
    }
    if (!res.ok) throw new Error('Failed to fetch profile')
    return res.json()
  }

  const { data, isLoading } = useSWR<ProfileData>(
    `/api/profiles/${username}?fromUsername=${mainUsername} `,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 1000,
      refreshInterval: 3000,
    },
  )
  const {
    profiles,
    loading: loadingProfiles,
    error: profilesError,
  } = useGetProfiles(data?.walletAddress || '', true)

  const walletAddressError =
    profilesError?.message === 'Invalid Solana wallet address'
  const serverError = profilesError?.message?.includes('Server error')

  if (serverError) {
    window.location.href = '/'
    throw new Error('Server error')
  }

  const loading = isLoading || loadingProfiles

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
            <div className="flex items-center gap-4">
              <Avatar
                username={username}
                size={48}
                imageUrl={data?.profile.image}
              />
              <h1 className="text-4xl font-mono text-green-400">@{username}</h1>
            </div>
            {!loading && data?.walletAddress && (
              <div className="flex items-center gap-2 text-sm text-green-600 sm:mb-1">
                owned by <TokenAddress address={data.walletAddress} />
                {walletAddressError && (
                  <span className="text-red-500 font-mono text-xs">
                    (Invalid wallet address)
                  </span>
                )}
              </div>
            )}
          </div>
          <FollowButton username={username} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <button
                onClick={() => setShowFollowersModal(true)}
                className="w-full p-4 text-left hover:bg-green-900/10 transition-colors"
              >
                <h3 className="text-lg font-mono text-green-400 mb-2">
                  Followers
                </h3>
                <div className="text-3xl font-mono text-green-500">
                  {loading ? (
                    <div className="h-8 bg-green-900/20 rounded animate-pulse w-16" />
                  ) : (
                    data?.socialCounts?.followers || 0
                  )}
                </div>
              </button>
            </Card>
            <Card>
              <button
                onClick={() => setShowFollowingModal(true)}
                className="w-full p-4 text-left hover:bg-green-900/10 transition-colors"
              >
                <h3 className="text-lg font-mono text-green-400 mb-2">
                  Following
                </h3>
                <div className="text-3xl font-mono text-green-500">
                  {loading ? (
                    <div className="h-8 bg-green-900/20 rounded animate-pulse w-16" />
                  ) : (
                    data?.socialCounts?.following || 0
                  )}
                </div>
              </button>
            </Card>
          </div>

          <CommentWall
            username={username}
            isLoading={isLoadingComments}
            comments={comments}
          />
        </div>

        <div className="space-y-6">
          {walletAddressError ? (
            <Card>
              <div className="p-4">
                <h3 className="text-lg font-mono text-red-400 mb-4">
                  Profile Error
                </h3>
                <p className="text-red-500 font-mono text-sm">
                  Invalid wallet address associated with this profile. Some
                  features may be limited.
                </p>
              </div>
            </Card>
          ) : (
            !!data && <ProfileInfo profileData={data} />
          )}

          <ProfileSection
            walletAddress={data?.walletAddress}
            hasSearched={!loading}
            isLoadingProfileData={loading}
            profileData={{ profiles }}
            title="related_profiles"
          />

          {/* Followers Modal */}
          <Modal
            isOpen={showFollowersModal}
            onClose={() => setShowFollowersModal(false)}
            title={`@${username}'s Followers`}
          >
            <SocialSection
              users={followers}
              isLoading={isLoadingFollowers}
              error={followersError}
              type="followers"
            />
          </Modal>

          {/* Following Modal */}
          <Modal
            isOpen={showFollowingModal}
            onClose={() => setShowFollowingModal(false)}
            title={`@${username}'s Following`}
          >
            <SocialSection
              users={following}
              isLoading={isLoadingFollowing}
              error={followingError}
              type="following"
            />
          </Modal>
        </div>
      </div>
    </div>
  )
}
