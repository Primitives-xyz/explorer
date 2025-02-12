'use client'

import { Cache } from '@/utils/cache'
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { useCurrentWallet } from './use-current-wallet'

// Create a singleton cache instance for holder status with 24 hour TTL
const holderCache = new Cache<{
  address: string
  isHolder: boolean
}>(24 * 60 * 60)

// Keep track of in-flight requests to prevent duplicate calls
const pendingChecks = new Map<string, Promise<boolean>>()

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
  const abortControllerRef = useRef<AbortController | null>(null)

  const checkHolder = useCallback(
    async (address: string) => {
      // Check cache first
      const cached = holderCache.get(address)
      if (cached?.isHolder) {
        setState((prev) => ({
          ...prev,
          isHolder: true,
          isLoading: false,
          checkedAddress: address,
          lastCheckTime: Date.now(),
        }))
        return
      }

      // Check if there's already a pending request for this address
      if (pendingChecks.has(address)) {
        try {
          const result = await pendingChecks.get(address)
          if (address === walletAddress) {
            setState((prev) => ({
              ...prev,
              isHolder: result ?? false,
              isLoading: false,
              checkedAddress: address,
              lastCheckTime: Date.now(),
            }))
          }
          return
        } catch (error: unknown) {
          if (error instanceof Error) {
            console.error('Error in pending check:', error.message)
          }
        }
      }

      // Cancel any existing request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      setState((prev) => ({ ...prev, isLoading: true }))

      // Create the promise for this check
      const checkPromise = (async () => {
        try {
          const response = await fetch(
            `/api/holders?address=${encodeURIComponent(address)}`,
            {
              signal: abortControllerRef.current?.signal,
            }
          )
          const data = await response.json()
          return data.isHolder
        } catch (error: unknown) {
          if (error instanceof Error && error.name === 'AbortError') {
            throw error
          }
          if (error instanceof Error) {
            console.error('Error checking holder status:', error.message)
          }
          return false
        } finally {
          pendingChecks.delete(address)
        }
      })()

      // Store the promise
      pendingChecks.set(address, checkPromise)

      try {
        const isHolder = await checkPromise

        // Only update if this is still the current wallet
        if (address === walletAddress) {
          const now = Date.now()
          setState((prev) => ({
            ...prev,
            isHolder,
            isLoading: false,
            checkedAddress: address,
            lastCheckTime: now,
          }))

          // Only cache positive holder status
          if (isHolder) {
            holderCache.set(address, {
              address,
              isHolder: true,
            })
          }
        }
      } catch (error: unknown) {
        if (
          error instanceof Error &&
          error.name !== 'AbortError' &&
          address === walletAddress
        ) {
          setState((prev) => ({
            ...prev,
            isHolder: false,
            isLoading: false,
            checkedAddress: address,
            lastCheckTime: Date.now(),
          }))
        }
      }
    },
    [walletAddress]
  )

  // Cleanup function for abort controller
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

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
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    } else if (!hasInitialized.current) {
      // If we have a wallet and haven't initialized, start the check
      hasInitialized.current = true
      checkHolder(walletAddress)
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded, checkHolder])

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
  }, [
    walletAddress,
    isLoggedIn,
    sdkHasLoaded,
    state.checkedAddress,
    state.isLoading,
    checkHolder,
  ])

  const closeModal = useCallback(() => {
    setState((prev) => ({ ...prev, modalDismissed: true }))
    if (modalTimer.current) clearTimeout(modalTimer.current)
    modalTimer.current = setTimeout(() => {
      setState((prev) => ({ ...prev, modalDismissed: false }))
    }, 30000)
  }, [])

  useEffect(() => {
    return () => {
      if (modalTimer.current) clearTimeout(modalTimer.current)
    }
  }, [])

  const startCheck = useCallback(() => {
    if (walletAddress && !state.isLoading) {
      setState((prev) => ({ ...prev, isHolder: null, isLoading: true }))
      checkHolder(walletAddress)
    }
  }, [walletAddress, state.isLoading, checkHolder])

  const value = useMemo<HolderContextType>(
    () => ({
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
    }),
    [
      state.isHolder,
      state.isLoading,
      state.modalDismissed,
      sdkHasLoaded,
      isLoggedIn,
      walletAddress,
      startCheck,
      closeModal,
    ]
  )

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
