'use client'

import { getFollowStats, getProfiles, Profile } from '@/utils/api'
import { Plus } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Modal } from './common/modal'

interface ProfileWithStats extends Profile {
  followStats?: {
    followers: number
    following: number
  }
}

interface ProfileSectionProps {
  walletAddress: string
  hasSearched?: boolean
}

export const ProfileSection = ({
  walletAddress,
  hasSearched,
}: ProfileSectionProps) => {
  const router = useRouter()
  const [profiles, setProfiles] = useState<ProfileWithStats[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<ProfileWithStats[]>(
    [],
  )
  const [selectedNamespace, setSelectedNamespace] = useState<string | null>(
    null,
  )
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const fetchProfiles = async () => {
      if (!walletAddress || !hasSearched) return

      setSelectedNamespace(null)
      setProfiles([])
      setFilteredProfiles([])
      setIsLoading(true)
      setError(null)

      try {
        const profilesData = await getProfiles(walletAddress)
        if (!profilesData.items || profilesData.items.length === 0) {
          setProfiles([])
          return
        }

        const profilesWithStats = await Promise.all(
          profilesData.items.map(async (profile) => {
            try {
              const stats = await getFollowStats(profile.profile.username)
              return { ...profile, followStats: stats }
            } catch (error) {
              return { ...profile, followStats: { followers: 0, following: 0 } }
            }
          }),
        )
        setProfiles(profilesWithStats)
        setFilteredProfiles(profilesWithStats)
      } catch (error) {
        console.error('Profiles fetch error:', error)
        setError('Failed to fetch profiles.')
        setProfiles([])
        setFilteredProfiles([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [walletAddress, hasSearched])

  useEffect(() => {
    if (selectedNamespace) {
      const filtered = profiles.filter((profile) => {
        const profileNamespace = profile.namespace?.name || ''
        const targetNamespace = selectedNamespace

        return profileNamespace === targetNamespace
      })

      setFilteredProfiles([...filtered])
    } else {
      setFilteredProfiles([...profiles])
    }
  }, [selectedNamespace, profiles])

  // Get unique namespaces
  const namespaces = Array.from(
    new Set(
      profiles
        .map((p) => p.namespace)
        .filter(Boolean)
        .map((n) =>
          JSON.stringify({
            name: n!.name,
            readableName: n!.readableName,
            faviconURL: n!.faviconURL,
          }),
        ),
    ),
  ).map((str) => JSON.parse(str))

  if (!hasSearched) return null

  return (
    <div className="border border-green-800 bg-black/50 w-full overflow-hidden flex flex-col h-[400px] lg:h-[600px] relative group">
      {/* Header */}
      <div className="border-b border-green-800 p-2 flex-shrink-0">
        <div className="flex justify-between items-center overflow-x-auto scrollbar-none">
          <div className="text-green-500 text-sm font-mono whitespace-nowrap">
            {'>'} profile_info.sol
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-green-600 font-mono whitespace-nowrap">
              COUNT: {filteredProfiles.length}
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="w-5 h-5 flex items-center justify-center rounded hover:bg-green-500/10 text-green-500 transition-colors"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Domain Creation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Profile"
      >
        <div className="flex flex-col gap-3">
          <button
            onClick={() =>
              window.open('https://www.dotblink.me/search', '_blank')
            }
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Create A .Blink Profile
          </button>
          <button
            onClick={() => window.open('https://www.sns.id/', '_blank')}
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Create a .Sol Profile
          </button>
          <button
            onClick={() =>
              window.open('https://alldomains.id/buy-domain', '_blank')
            }
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Explore All Domains
          </button>
          <button
            onClick={() => window.open('https://www.tapaigames.com/', '_blank')}
            className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 text-green-400 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
          >
            Create a Nimbus App
          </button>
        </div>
      </Modal>

      {/* Namespace Filters */}
      {namespaces.length > 0 && (
        <div className="border-b border-green-800/30 p-2 flex-shrink-0">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setSelectedNamespace(null)}
              className={`px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                selectedNamespace === null
                  ? 'bg-green-500 text-black font-semibold'
                  : 'text-green-500 hover:bg-green-500/10'
              }`}
            >
              All
            </button>
            {namespaces.map((namespace) => (
              <button
                key={namespace.name}
                onClick={() => setSelectedNamespace(namespace.name)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono whitespace-nowrap transition-colors ${
                  selectedNamespace === namespace.name
                    ? 'bg-green-500 text-black font-semibold'
                    : 'text-green-500 hover:bg-green-500/10'
                }`}
              >
                {namespace.faviconURL && (
                  <img
                    src={namespace.faviconURL}
                    alt=""
                    className="w-3.5 h-3.5 rounded-full"
                  />
                )}
                {namespace.readableName || namespace.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="p-2 mb-4 border border-red-800 bg-red-900/20 text-red-400 flex-shrink-0">
          <span>! ERROR: {error}</span>
        </div>
      )}

      {/* Scroll Indicators */}
      <div
        className="absolute right-1 top-[40px] bottom-1 w-1 opacity-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: 0,
          animation: 'fadeOut 0.3s ease-out',
        }}
      >
        <div className="h-full bg-green-500/5 rounded-full">
          <div
            className="h-16 w-full bg-green-500/10 rounded-full"
            style={{
              animation: 'slideY 3s ease-in-out infinite',
              transformOrigin: 'top',
            }}
          />
        </div>
      </div>

      {/* Profile List */}
      <div
        className="divide-y divide-green-800/30 overflow-y-auto flex-grow scrollbar-thin scrollbar-track-black/20 scrollbar-thumb-green-900/50 hover-scroll-indicator"
        onScroll={(e) => {
          const indicator = e.currentTarget.previousSibling as HTMLElement
          if (e.currentTarget.scrollTop > 0) {
            indicator.style.opacity = '1'
            indicator.style.animation = 'fadeIn 0.3s ease-out'
          } else {
            indicator.style.opacity = '0'
            indicator.style.animation = 'fadeOut 0.3s ease-out'
          }
        }}
      >
        {isLoading ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> FETCHING PROFILES...'}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-4 text-center text-green-600 font-mono">
            {'>>> NO PROFILES FOUND'}
          </div>
        ) : (
          filteredProfiles.map((profile) => (
            <div
              key={`${profile.profile.username}-${profile.namespace?.name}`}
              className="p-4 hover:bg-green-900/10"
            >
              <div className="flex items-start gap-4">
                <div className="relative">
                  <img
                    src={
                      profile.profile.image ||
                      'https://api.dicebear.com/7.x/shapes/svg?seed=' +
                        profile.profile.username
                    }
                    alt={profile.profile.username}
                    className="w-16 h-16 rounded-lg object-cover bg-black/40 ring-1 ring-green-500/20"
                  />
                  {profile.namespace?.faviconURL && (
                    <button
                      onClick={() =>
                        router.push(`/namespace/${profile.namespace?.name}`)
                      }
                      className="absolute -bottom-2 -right-2 hover:scale-110 transition-transform"
                    >
                      <img
                        src={profile.namespace.faviconURL}
                        alt={profile.namespace.readableName}
                        className="w-6 h-6 rounded-full bg-black ring-1 ring-green-500/20"
                      />
                    </button>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() =>
                            router.push(`/${profile.profile.username}`)
                          }
                          className="text-green-400 font-mono bg-green-900/20 px-2 py-1 rounded hover:bg-green-900/40 transition-colors"
                        >
                          @{profile.profile.username}
                        </button>
                        {profile.profile.bio && (
                          <span className="text-green-600 font-mono">
                            {profile.profile.bio}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-4 text-xs text-green-600 font-mono">
                      <span>
                        Followers: {profile.followStats?.followers || 0}
                      </span>
                      <span>
                        Following: {profile.followStats?.following || 0}
                      </span>
                    </div>
                    <div className="text-xs text-green-600/50 font-mono">
                      <button
                        onClick={() =>
                          router.push(`/namespace/${profile.namespace?.name}`)
                        }
                        className="hover:text-green-500 transition-colors"
                      >
                        {profile.namespace?.readableName ||
                          profile.namespace?.name}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
