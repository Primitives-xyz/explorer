'use client'

import { FetchMethod, fetchWrapper } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { abbreviateWalletAddress } from '@/utils/utils'
import { useEffect, useMemo } from 'react'

export function SignupHandler() {
  const { isLoggedIn, profiles, mainProfile, walletAddress, loading, refetch } =
    useCurrentWallet()

  const shouldSignUp = useMemo(() => {
    // Not logged in or profiles undefined
    if (!isLoggedIn || typeof profiles === 'undefined') {
      return false
    }

    // No profile
    if (!mainProfile) {
      return true
    }

    return false
  }, [isLoggedIn, profiles, mainProfile])

  useEffect(() => {
    if (shouldSignUp && !loading && walletAddress) {
      const createProfile = async () => {
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

        refetch()
      }

      createProfile()
    }
  }, [shouldSignUp, walletAddress, loading, refetch])

  return null
}
