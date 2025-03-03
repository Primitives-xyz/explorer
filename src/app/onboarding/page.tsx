'use client'

import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { OnboardingSteps } from './onboarding-steps'

export default function OnboardingPage() {
  const router = useRouter()
  const {
    walletAddress,
    mainUsername,
    isLoggedIn,
    loadingProfiles,
    sdkHasLoaded,
  } = useCurrentWallet()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Wait for SDK and profiles to load
    if (!sdkHasLoaded || loadingProfiles) {
      return
    }

    // Everything is loaded, we can show the content
    setLoading(false)
  }, [sdkHasLoaded, loadingProfiles])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-10 h-10 border-2 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex flex-col items-center mb-8 text-center">
        <div className="w-20 h-20 relative mb-4">
          <div className="absolute inset-0 bg-violet-500/30 animate-pulse rounded-full"></div>
          <div className="absolute inset-1 bg-black rounded-full flex items-center justify-center">
            <Image
              src="/images/solana-icon.svg"
              alt="Welcome"
              width={50}
              height={50}
              className="w-10 h-10"
            />
          </div>
        </div>
        <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-violet-400 to-indigo-400">
          Welcome to the Solana Social Explorer
        </h1>
        <p className="text-violet-300/70 max-w-md text-center">
          Complete these quick steps to get the most out of your Explorer
          experience
        </p>
      </div>
      <OnboardingSteps walletAddress={walletAddress} username={mainUsername} />
    </div>
  )
}
