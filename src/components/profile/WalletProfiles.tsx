'use client'

import { Profile } from '@/utils/api'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface WalletProfilesProps {
  walletAddress: string
}

export function WalletProfiles({ walletAddress }: WalletProfilesProps) {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfiles() {
      if (!walletAddress) return
      
      setIsLoading(true)
      try {
        const response = await fetch(`/api/profiles?walletAddress=${walletAddress}`)
        if (!response.ok) throw new Error('Failed to fetch profiles')
        const data = await response.json()
        setProfiles(data.profiles || [])
      } catch (err) {
        console.error('Error fetching profiles:', err)
        setError('Failed to load profiles')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfiles()
  }, [walletAddress])

  if (isLoading) {
    return (
      <div className="border border-green-800 bg-black/50 rounded-lg p-4 font-mono">
        <h2 className="text-green-500 mb-4">&gt; profile_info.sol</h2>
        <span className="text-green-600 animate-pulse">• Loading profiles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="border border-green-800 bg-black/50 rounded-lg p-4 font-mono">
        <h2 className="text-green-500 mb-4">&gt; profile_info.sol</h2>
        <span className="text-red-400">{error}</span>
      </div>
    )
  }

  if (profiles.length === 0) {
    return (
      <div className="border border-green-800 bg-black/50 rounded-lg p-4 font-mono">
        <h2 className="text-green-500 mb-4">&gt; profile_info.sol</h2>
        <span className="text-green-400">No profiles found</span>
      </div>
    )
  }

  return (
    <div className="border border-green-800 bg-black/50 rounded-lg p-4 font-mono">
      <h2 className="text-green-500 mb-4">&gt; profile_info.sol</h2>
      <div className="space-y-4">
        {profiles.map((profile, index) => (
          <div key={index} className="flex items-start space-x-4">
            {profile.profile.image && (
              <Image
                src={profile.profile.image}
                alt={profile.profile.username}
                width={40}
                height={40}
                className="rounded-full"
              />
            )}
            <div>
              <p className="text-green-400">@{profile.profile.username}</p>
              {profile.profile.bio && (
                <p className="text-green-600 text-sm mt-1">{profile.profile.bio}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 