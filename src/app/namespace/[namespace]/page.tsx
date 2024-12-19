'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'

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
  const [namespace, setNamespace] = useState<Namespace | null>(null)
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulated data fetch
    const fetchData = async () => {
      setIsLoading(true)
      try {
        // This would be replaced with actual API calls
        const mockNamespace: Namespace = {
          id: 5,
          name: params.namespace as string,
          readableName: 'DotBlink',
          faviconURL: 'https://assets.usetapestry.dev/dotblink_logo.png',
          createdAt: '2024-07-01T14:12:27.780Z',
          isDefault: true,
        }

        const mockProfiles: Profile[] = Array(5)
          .fill(null)
          .map((_, i) => ({
            profile: {
              id: `user${i}`,
              username: `user${i}.${params.namespace}`,
              bio: i % 2 === 0 ? `Bio for user ${i}` : null,
              image: null,
              created_at: Date.now() - i * 86400000,
            },
            wallet: {
              address: `wallet${i}`,
            },
            namespace: mockNamespace,
            followStats: {
              followers: Math.floor(Math.random() * 100),
              following: Math.floor(Math.random() * 100),
            },
          }))

        setNamespace(mockNamespace)
        setProfiles(mockProfiles)
      } catch (error) {
        console.error('Error fetching namespace data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (params.namespace) {
      fetchData()
    }
  }, [params.namespace])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8">
        <div className="container mx-auto">
          <div className="text-center font-mono">
            {'>>> LOADING NAMESPACE DATA...'}
          </div>
        </div>
      </div>
    )
  }

  if (!namespace) {
    return (
      <div className="min-h-screen bg-black text-green-500 p-8">
        <div className="container mx-auto">
          <div className="text-center font-mono">
            {'>>> NAMESPACE NOT FOUND'}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-green-500 p-8">
      <div className="container mx-auto">
        {/* Namespace Header */}
        <div className="border border-green-800 bg-black/50 p-6 rounded-lg mb-8">
          <div className="flex items-center gap-4">
            {namespace.faviconURL && (
              <img
                src={namespace.faviconURL}
                alt={namespace.readableName}
                className="w-16 h-16 rounded-lg bg-black/40 ring-1 ring-green-500/20"
              />
            )}
            <div>
              <h1 className="text-2xl font-mono text-green-400">
                {namespace.readableName}
              </h1>
              <p className="text-sm font-mono text-green-600">
                Created {new Date(namespace.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-green-800 bg-black/50 p-4 rounded-lg">
            <div className="text-sm font-mono text-green-600">
              Total Profiles
            </div>
            <div className="text-2xl font-mono text-green-400">
              {profiles.length}
            </div>
          </div>
          <div className="border border-green-800 bg-black/50 p-4 rounded-lg">
            <div className="text-sm font-mono text-green-600">
              Active This Week
            </div>
            <div className="text-2xl font-mono text-green-400">
              {Math.floor(profiles.length * 0.8)}
            </div>
          </div>
          <div className="border border-green-800 bg-black/50 p-4 rounded-lg">
            <div className="text-sm font-mono text-green-600">
              Total Interactions
            </div>
            <div className="text-2xl font-mono text-green-400">
              {Math.floor(Math.random() * 1000)}
            </div>
          </div>
        </div>

        {/* Profiles Section */}
        <div className="border border-green-800 bg-black/50 rounded-lg">
          <div className="border-b border-green-800 p-4">
            <h2 className="font-mono text-green-400">Recent Profiles</h2>
          </div>
          <div className="divide-y divide-green-800/30">
            {profiles.map((profile) => (
              <div
                key={profile.profile.id}
                className="p-4 hover:bg-green-900/10"
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
                    <div className="font-mono text-green-400">
                      @{profile.profile.username}
                    </div>
                    {profile.profile.bio && (
                      <div className="text-sm font-mono text-green-600">
                        {profile.profile.bio}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
