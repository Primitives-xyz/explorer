'use client'

import { FetchMethod, fetchWrapper } from '@/utils/api'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import { getAuthToken } from '@dynamic-labs/sdk-react-core'
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
            username: walletAddress.slice(0, 4) + '_' + walletAddress.slice(-4),
            ownerWalletAddress: walletAddress,
          },
          jwt: getAuthToken(),
        })

        refetch()
      }

      createProfile()
    }
  }, [shouldSignUp, walletAddress, loading, refetch])

  return null
}
