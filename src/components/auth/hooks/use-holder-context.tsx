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
    // Add time-based cache check (30 minutes)
    const now = Date.now()
    if (
      state.checkedAddress === address &&
      state.lastCheckTime &&
      now - state.lastCheckTime < 1800000
    ) {
      return
    }

    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch(
        `/api/holders?address=${encodeURIComponent(address)}`,
      )
      const data = await response.json()

      // Only update if this is still the current wallet
      if (address === walletAddress) {
        setState((prev) => ({
          ...prev,
          isHolder: data.isHolder,
          isLoading: false,
          checkedAddress: address,
          lastCheckTime: now,
        }))
      }
    } catch (error) {
      console.error('Error checking holder status:', error)
      if (address === walletAddress) {
        setState((prev) => ({
          ...prev,
          isHolder: false,
          isLoading: false,
          checkedAddress: address,
          lastCheckTime: now,
        }))
      }
    }
  }

  // Initial check when component mounts and wallet is ready
  useEffect(() => {
    if (
      walletAddress &&
      isLoggedIn &&
      sdkHasLoaded &&
      !hasInitialized.current
    ) {
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
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded])

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
      checkHolder(walletAddress)
    }
  }

  const value: HolderContextType = {
    isHolder: state.isHolder,
    startCheck,
    showModal:
      !state.isLoading &&
      sdkHasLoaded &&
      isLoggedIn &&
      walletAddress != null &&
      state.isHolder === false &&
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
