'use client'

import { FetchMethod, fetchWrapper } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useEffect, useMemo, useRef, useState } from 'react'

export function SignupHandler() {
  const { isLoggedIn, profiles, mainProfile, walletAddress, loading, refetch } =
    useCurrentWallet()
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)
  const previousWalletRef = useRef<string>('')
  const hasAttemptedSignupRef = useRef<Set<string>>(new Set())

  const shouldSignUp = useMemo(() => {
    // Not logged in or still loading
    if (!isLoggedIn || loading) {
      return false
    }

    // No wallet address yet
    if (!walletAddress) {
      return false
    }

    // Profiles not fetched yet
    if (typeof profiles === 'undefined') {
      return false
    }

    // Already has a profile
    if (mainProfile) {
      return false
    }

    // Already attempted signup for this wallet
    if (hasAttemptedSignupRef.current.has(walletAddress)) {
      return false
    }

    // No profile found for this wallet
    return true
  }, [isLoggedIn, profiles, mainProfile, walletAddress, loading])

  // Detect wallet changes and clear cache
  useEffect(() => {
    if (walletAddress && walletAddress !== previousWalletRef.current) {
      previousWalletRef.current = walletAddress
      // Force refetch profiles when wallet changes
      refetch()
    }
  }, [walletAddress, refetch])

  useEffect(() => {
    if (shouldSignUp && !isCreatingProfile && walletAddress) {
      const createProfile = async () => {
        setIsCreatingProfile(true)
        hasAttemptedSignupRef.current.add(walletAddress)
        
        try {
          await fetchWrapper({
            endpoint: 'profiles/create',
            method: FetchMethod.POST,
            body: {
              username: abbreviateWalletAddress({
                address: walletAddress,
              }),
              ownerWalletAddress: walletAddress,
            },
          })

          // Wait a bit before refetching to ensure the backend has processed the creation
          setTimeout(() => {
            refetch()
          }, 1000)
        } catch (error) {
          console.error('Failed to create profile:', error)
          // Remove from attempted set on error so it can retry
          hasAttemptedSignupRef.current.delete(walletAddress)
        } finally {
          setIsCreatingProfile(false)
        }
      }

      createProfile()
    }
  }, [shouldSignUp, walletAddress, isCreatingProfile, refetch])

  return null
}
