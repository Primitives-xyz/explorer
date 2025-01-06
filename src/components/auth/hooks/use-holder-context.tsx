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
  }>({
    isHolder: null,
    modalDismissed: false,
    isLoading: false,
    checkedAddress: null,
  })
  const modalTimer = useRef<ReturnType<typeof setTimeout>>(null)
  const hasInitialized = useRef(false)

  const checkHolder = async (address: string) => {
    console.log('Checking holder status for:', address)
    setState((prev) => ({ ...prev, isLoading: true }))

    try {
      const response = await fetch(
        `/api/holders?address=${encodeURIComponent(address)}`,
      )
      const data = await response.json()
      console.log('Holder API response:', data)

      // Only update if this is still the current wallet
      if (address === walletAddress) {
        setState((prev) => ({
          ...prev,
          isHolder: data.isHolder,
          isLoading: false,
          checkedAddress: address,
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
        }))
      }
    }
  }

  // Initial check when component mounts and wallet is ready
  useEffect(() => {
    console.log('Checking initialization conditions:', {
      hasInitialized: hasInitialized.current,
      walletAddress,
      isLoggedIn,
      sdkHasLoaded,
      currentHolder: state.isHolder,
      checkedAddress: state.checkedAddress,
    })

    if (
      walletAddress &&
      isLoggedIn &&
      sdkHasLoaded &&
      !hasInitialized.current
    ) {
      console.log('Performing initial holder check')
      hasInitialized.current = true
      checkHolder(walletAddress)
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded])

  // Check when wallet changes
  useEffect(() => {
    if (
      walletAddress &&
      isLoggedIn &&
      sdkHasLoaded &&
      state.checkedAddress !== walletAddress
    ) {
      console.log('Wallet changed, checking new wallet:', walletAddress)
      checkHolder(walletAddress)
    }
  }, [walletAddress])

  // Reset when wallet disconnects
  useEffect(() => {
    if (!walletAddress || !isLoggedIn || !sdkHasLoaded) {
      console.log('Resetting holder state')
      setState({
        isHolder: null,
        modalDismissed: false,
        isLoading: false,
        checkedAddress: null,
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
    console.log('Manual check requested')
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

  console.log('Provider state:', {
    state,
    walletAddress,
    isLoggedIn,
    sdkHasLoaded,
    value,
  })

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
