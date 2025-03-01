'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { CreateProfile } from '@/components/profile/create-profile'
import { useEffect, useState } from 'react'

export function TestCreateProfile({
  onProfileCreated,
  forceOpen = true,
}: {
  onProfileCreated?: () => void
  forceOpen?: boolean
}) {
  const { walletAddress } = useCurrentWallet()
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Force the modal to be open when the component mounts or when forceOpen changes
  useEffect(() => {
    if (forceOpen) {
      setIsModalOpen(true)
    }
  }, [forceOpen])

  // Handle the case when a profile is created
  const handleProfileCreated = () => {
    onProfileCreated?.()
    setIsModalOpen(false)
  }

  if (!walletAddress) {
    return (
      <div className="p-4 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-yellow-300">
        <p className="font-medium">
          Connect your wallet to test profile creation
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="flex flex-wrap gap-4 mb-6">
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-green-500 text-black rounded-lg hover:bg-green-600 transition-colors"
        >
          Open Profile Modal
        </button>
      </div>

      {isModalOpen && (
        <CreateProfile
          onProfileCreated={handleProfileCreated}
          forceOpen={true}
        />
      )}
    </>
  )
}
