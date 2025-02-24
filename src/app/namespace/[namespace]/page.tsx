'use client'

import { DataContainer } from '@/components/common/data-container'
import { useGetNamespaceDetails } from '@/hooks/use-get-namespace-details'
import { useGetNamespaceProfiles } from '@/hooks/use-get-namespace-profiles'
import { useParams } from 'next/navigation'

interface Namespace {
  id: number
  name: string
  readableName: string
  faviconURL: string | null
  createdAt: string
  isDefault: boolean
}

interface Profile {
  profile: {
    id: string
    username: string
    bio: string | null
    image: string | null
    created_at: number
  }
  wallet: {
    address: string
  }
  namespace: Namespace
  followStats: {
    followers: number
    following: number
  }
}

export default function NamespacePage() {
  const params = useParams()
  const { namespace } = params

  const { namespaceDetails, isLoading } = useGetNamespaceDetails({
    name: namespace as string,
  })

  const { profiles, totalCount } = useGetNamespaceProfiles({
    name: namespace as string,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black  p-8">
        <div className="text-center font-mono">
          {'>>> LOADING NAMESPACE DATA...'}
        </div>
      </div>
    )
  }

  if (!namespaceDetails) {
    return (
      <div className="min-h-screen bg-black  p-8">
        <div className="text-center font-mono">{'>>> NAMESPACE NOT FOUND'}</div>
      </div>
    )
  }

  return (
    <div className="py-8">
      <NamespaceHeader namespaceDetails={namespaceDetails} />

      {/* Profiles Section */}
      <DataContainer title="recent_profiles" count={totalCount} height="max">
        <div className="divide-y divide-green-800/30">
          {(profiles ?? []).map((profile: any) => (
            <button
              key={profile.profile.id}
              className="w-full text-left p-4 hover:bg-green-900/10"
              onClick={() =>
                (window.location.href = `${profile.namespace.userProfileURL}${profile.profile.username}`)
              }
            >
              <div className="flex items-center gap-4">
                <img
                  src={
                    profile.profile.image ||
                    `https://api.dicebear.com/7.x/shapes/svg?seed=${profile.profile.username}`
                  }
                  alt={profile.profile.username}
                  className="w-12 h-12 rounded-lg bg-black/40 ring-1 ring-green-500/20"
                />
                <div>
                  <div className="font-mono ">@{profile.profile.username}</div>
                  {profile.profile.bio && (
                    <div className="text-sm font-mono ">
                      {profile.profile.bio}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </DataContainer>
    </div>
  )
}

function NamespaceHeader({
  namespaceDetails,
}: {
  namespaceDetails: Namespace
}) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-4">
            {namespaceDetails.faviconURL && (
              <img
                src={namespaceDetails.faviconURL}
                alt={namespaceDetails.readableName}
                className="w-16 h-16 rounded-lg bg-black/40 ring-1 ring-green-500/20"
              />
            )}
            <div>
              <h1 className="text-2xl font-mono ">
                {namespaceDetails.readableName}
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
