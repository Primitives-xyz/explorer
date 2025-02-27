'use client'

import { useIdentities } from '@/hooks/use-identities'
import { motion } from 'framer-motion'
import { ExternalLink, Plus } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

interface ProfileIdentitiesPanelProps {
  walletAddress: string
}

export function ProfileIdentitiesPanel({
  walletAddress,
}: ProfileIdentitiesPanelProps) {
  const {
    identities,
    loading: isLoading,
    error,
  } = useIdentities(walletAddress || '')

  const [isModalOpen, setIsModalOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-20 bg-gray-800/50 animate-pulse rounded-lg"
            ></div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
          <p className="text-red-400 font-mono text-sm">
            Error loading identities
          </p>
        </div>
      </div>
    )
  }

  if (!identities || identities.length === 0) {
    return (
      <div className="container mx-auto p-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 text-center">
          <p className="text-gray-400 font-mono text-sm mb-4">
            No connected identities found
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-green-900/30 hover:bg-green-900/50 text-green-400 font-mono text-sm py-2 px-4 rounded-lg border border-green-900/30 transition-colors"
          >
            Connect Identity
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-mono text-green-400">
          Connected Identities
        </h2>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-green-900/30 hover:bg-green-900/50 text-green-400 font-mono text-xs py-1 px-3 rounded-lg border border-green-900/30 transition-colors flex items-center gap-1"
        >
          <Plus size={14} />
          Add Identity
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {identities.map((identity, index) => (
          <motion.a
            key={`${identity.namespace.name}-${identity.profile.username}`}
            href={identity.namespace.userProfileURL}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.3,
              delay: index * 0.05,
            }}
            className="flex items-center gap-4 bg-gray-800 hover:bg-gray-700 
                      transition-colors p-4 rounded-lg border border-gray-700
                      hover:border-green-500/30 group"
          >
            <div className="relative flex-shrink-0 w-12 h-12">
              {identity.namespace.faviconURL ? (
                <Image
                  src={identity.namespace.faviconURL}
                  alt={identity.namespace.readableName}
                  width={48}
                  height={48}
                  className="rounded-full"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-900/30 flex items-center justify-center">
                  <span className="text-lg text-green-500">
                    {identity.namespace.readableName.charAt(0)}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-base font-mono text-green-400 truncate">
                {identity.profile.username}
              </div>
              <div className="text-sm text-gray-400">
                {identity.namespace.readableName}
              </div>
              {identity.profile.bio && (
                <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {identity.profile.bio}
                </div>
              )}
            </div>
            <ExternalLink className="w-4 h-4 text-gray-500 group-hover:text-green-400 transition-colors" />
          </motion.a>
        ))}
      </div>

      {/* Modal for adding identities - placeholder for now */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-mono text-green-400 mb-4">
              Connect New Identity
            </h3>
            <div className="flex flex-col gap-3">
              <button
                onClick={() =>
                  window.open('https://www.dotblink.me/search', '_blank')
                }
                className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
              >
                Create A .Blink Profile
              </button>
              <button
                onClick={() => window.open('https://www.sns.id/', '_blank')}
                className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
              >
                Create a .Sol Profile
              </button>
              <button
                onClick={() =>
                  window.open('https://alldomains.id/buy-domain', '_blank')
                }
                className="w-full p-3 text-left bg-green-500/5 hover:bg-green-500/10 rounded-lg transition-colors font-mono text-sm border border-green-500/20 hover:border-green-500/30"
              >
                Explore All Domains
              </button>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-mono text-sm py-2 px-4 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
