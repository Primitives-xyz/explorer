'use client'

import { useIdentities } from '@/hooks/use-identities'
import { motion } from 'framer-motion'
import { ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { useEffect, useState } from 'react'

interface ProfileIdentitiesProps {
  walletAddress: string
}

export function ProfileIdentities({ walletAddress }: ProfileIdentitiesProps) {
  const {
    identities,
    loading: isLoading,
    error,
  } = useIdentities(walletAddress || '')

  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Add a small delay for animation
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 300)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="container  py-3 px-4 bg-gray-800/50 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">
            Loading identities...
          </span>
          <div className="h-4 w-24 bg-gray-700 animate-pulse rounded"></div>
        </div>
      </div>
    )
  }

  if (error || !identities || identities.length === 0) {
    return null
  }

  return (
    <div className="container py-2 px-2 bg-gray-800/50 border-b border-gray-700 min-w-full">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-mono">
            Connected Identities:
          </span>
        </div>
      </div>

      <div className="mt-2 overflow-x-auto pb-2">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isVisible ? 1 : 0 }}
          className="flex gap-2"
        >
          {identities.map((identity, index) => (
            <motion.a
              key={`${identity.namespace.name}-${identity.profile.username}`}
              href={identity.namespace.userProfileURL}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              animate={{
                opacity: isVisible ? 1 : 0,
                y: isVisible ? 0 : 20,
              }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
              }}
              className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 
                        transition-colors px-3 py-2 rounded-lg border border-gray-700
                        hover:border-green-500/30 group min-w-[180px]"
            >
              <div className="relative flex-shrink-0 w-6 h-6">
                {identity.namespace.faviconURL ? (
                  <Image
                    src={identity.namespace.faviconURL}
                    alt={identity.namespace.readableName}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-green-900/30 flex items-center justify-center">
                    <span className="text-xs text-green-500">
                      {identity.namespace.readableName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-mono text-green-400 truncate">
                  {identity.profile.username}
                </div>
                <div className="text-xs text-gray-400 truncate">
                  {identity.namespace.readableName}
                </div>
              </div>
              <ExternalLink className="w-3 h-3 text-gray-500 group-hover:text-green-400 transition-colors" />
            </motion.a>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
