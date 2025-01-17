'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useCurrentWallet } from './use-current-wallet'

interface HolderContextType {
  isHolder: boolean | null
  isCheckingHolder: boolean
  startCheck: () => void
  showModal: boolean
  closeModal: () => void
}

const HolderContext = createContext<HolderContextType | null>(null)

export function HolderProvider({ children }: { children: React.ReactNode }) {
  const { walletAddress, isLoggedIn, sdkHasLoaded } = useCurrentWallet()
  const [state, setState] = useState<{
    isHolder: boolean | null
    modalDismissed: boolean
    isLoading: boolean
    checkedAddress: string | null
    lastCheckTime: number | null
  }>({
    isHolder: null,
    modalDismissed: false,
    isLoading: false,
    checkedAddress: null,
    lastCheckTime: null,
  })
  const modalTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const hasInitialized = useRef(false)

  const checkHolder = async (address: string) => {
    const HOLDER_CACHE_KEY = 'frog_holder_status'
    const HOLDER_CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

    // Check localStorage cache first, but only for positive holder status
    try {
      const cached = localStorage.getItem(HOLDER_CACHE_KEY)
      if (cached) {
        const {
          address: cachedAddress,
          isHolder: cachedIsHolder,
          timestamp,
        } = JSON.parse(cached)
        const now = Date.now()

        // Only use cache if it's a confirmed holder and within duration
        if (
          cachedIsHolder === true &&
          cachedAddress === address &&
          now - timestamp < HOLDER_CACHE_DURATION
        ) {
          setState((prev) => ({
            ...prev,
            isHolder: true,
            isLoading: false,
            checkedAddress: address,
            lastCheckTime: timestamp,
          }))
          return
        }
      }
    } catch (e) {
      console.error('Error reading from cache:', e)
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch(
        `/api/holders?address=${encodeURIComponent(address)}`,
      )
      const data = await response.json()

      // Only update if this is still the current wallet
      if (address === walletAddress) {
        const now = Date.now()
        setState((prev) => ({
          ...prev,
          isHolder: data.isHolder,
          isLoading: false,
          checkedAddress: address,
          lastCheckTime: now,
        }))

        // Only cache positive holder status
        if (data.isHolder) {
          try {
            localStorage.setItem(
              HOLDER_CACHE_KEY,
              JSON.stringify({
                address,
                isHolder: true,
                timestamp: now,
              }),
            )
          } catch (e) {
            console.error('Error writing to cache:', e)
          }
        }
      }
    } catch (error) {
      console.error('Error checking holder status:', error)
      if (address === walletAddress) {
        setState((prev) => ({
          ...prev,
          isHolder: false,
          isLoading: false,
          checkedAddress: address,
          lastCheckTime: Date.now(),
        }))
      }
    }
  }

  // Reset when wallet disconnects
  useEffect(() => {
    if (!walletAddress || !isLoggedIn || !sdkHasLoaded) {
      setState({
        isHolder: null,
        modalDismissed: false,
        isLoading: false,
        checkedAddress: null,
        lastCheckTime: null,
      })
      hasInitialized.current = false
    } else if (!hasInitialized.current) {
      // If we have a wallet and haven't initialized, start the check
      hasInitialized.current = true
      checkHolder(walletAddress)
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded])

  // Check when wallet changes, but only if it's different from the last checked address
  useEffect(() => {
    if (
      walletAddress &&
      isLoggedIn &&
      sdkHasLoaded &&
      state.checkedAddress !== walletAddress &&
      !state.isLoading // Prevent concurrent checks
    ) {
      checkHolder(walletAddress)
    }
  }, [walletAddress])

  const closeModal = () => {
    setState((prev) => ({ ...prev, modalDismissed: true }))
    if (modalTimer.current) clearTimeout(modalTimer.current)
    modalTimer.current = setTimeout(() => {
      setState((prev) => ({ ...prev, modalDismissed: false }))
    }, 30000)
  }

  useEffect(() => {
    return () => {
      if (modalTimer.current) clearTimeout(modalTimer.current)
    }
  }, [])

  const startCheck = () => {
    if (walletAddress && !state.isLoading) {
      setState((prev) => ({ ...prev, isHolder: null, isLoading: true }))
      checkHolder(walletAddress)
    }
  }

  const value: HolderContextType = {
    isHolder: state.isHolder,
    startCheck,
    showModal:
      sdkHasLoaded &&
      isLoggedIn &&
      walletAddress != null &&
      !state.isLoading && // Only show when not loading
      state.isHolder === false && // Only show when explicitly false
      !state.modalDismissed,
    closeModal,
    isCheckingHolder: state.isLoading,
  }

  return (
    <HolderContext.Provider value={value}>{children}</HolderContext.Provider>
  )
}

export function useHolderCheck() {
  const context = useContext(HolderContext)
  if (!context) {
    throw new Error('useHolderCheck must be used within a HolderProvider')
  }
  return context
}
