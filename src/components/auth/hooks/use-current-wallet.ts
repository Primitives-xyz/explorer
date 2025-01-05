'use client'

import { useGetProfiles } from '@/components/auth/hooks/use-get-profiles'
import { useUserWallets } from '@dynamic-labs/sdk-react-core'
import { useEffect, useState, useRef, useMemo } from 'react'

// Cache for holder status
const holderStatusCache: Record<string, boolean> = {}

export function useCurrentWallet() {
  const userWallets = useUserWallets()
  const prevWalletRef = useRef<string>('')

  // Stabilize the wallet address
  const walletAddress = useMemo(() => {
    const address = userWallets[0]?.address || ''
    // Only update if it's actually different
    if (address && address !== prevWalletRef.current) {
      prevWalletRef.current = address
      return address
    }
    return prevWalletRef.current
  }, [userWallets])

  const [isFrogHolder, setIsFrogHolder] = useState<boolean>(false)
  const [checkingHolder, setCheckingHolder] = useState<boolean>(false)
  const lastCheckedAddress = useRef<string>('')

  const { profiles, loading } = useGetProfiles(walletAddress)
  const mainUsername = profiles?.[0]?.profile?.username
  const hasProfile = profiles?.length > 0

  useEffect(() => {
    let mounted = true
    const controller = new AbortController()

    async function checkHolderStatus() {
      if (!walletAddress || !mounted) return
      if (walletAddress === lastCheckedAddress.current) return
      if (holderStatusCache[walletAddress] !== undefined) {
        setIsFrogHolder(holderStatusCache[walletAddress])
        return
      }

      lastCheckedAddress.current = walletAddress
      setCheckingHolder(true)

      try {
        const response = await fetch(`/api/holders?address=${walletAddress}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        if (mounted) {
          holderStatusCache[walletAddress] = data.isHolder
          setIsFrogHolder(data.isHolder)
        }
      } catch (error: any) {
        if (error.name === 'AbortError') return
        console.error('Error checking holder status:', error)
        if (mounted) {
          setIsFrogHolder(false)
        }
      } finally {
        if (mounted) {
          setCheckingHolder(false)
        }
      }
    }

    checkHolderStatus()

    return () => {
      mounted = false
      controller.abort()
    }
  }, [walletAddress])

  return {
    walletIsConnected: !!walletAddress,
    wallet: userWallets[0],
    walletAddress,
    mainUsername,
    loadingMainUsername: loading,
    hasProfile,
    profiles,
    isFrogHolder,
    checkingHolder,
  }
}
