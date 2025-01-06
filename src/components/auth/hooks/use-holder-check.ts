'use client'

import { useEffect, useRef, useState } from 'react'
import { useCurrentWallet } from './use-current-wallet'

export function useHolderCheck() {
  const { walletAddress, isLoggedIn, sdkHasLoaded } = useCurrentWallet()
  const [state, setState] = useState<{
    isHolder: boolean | null
    modalDismissed: boolean
    isLoading: boolean
    checkedAddress: string | null
    shouldStartCheck: boolean
  }>({
    isHolder: null,
    modalDismissed: false,
    isLoading: false,
    checkedAddress: null,
    shouldStartCheck: false,
  })
  const modalTimer = useRef<ReturnType<typeof setTimeout>>(null)

  useEffect(() => {
    const shouldCheck =
      state.shouldStartCheck &&
      walletAddress &&
      isLoggedIn &&
      sdkHasLoaded &&
      state.checkedAddress !== walletAddress

    if (shouldCheck) {
      setState((prev) => ({
        ...prev,
        isLoading: true,
      }))

      const checkHolder = async () => {
        try {
          const response = await fetch(
            `/api/holders?address=${encodeURIComponent(walletAddress)}`,
          )
          const data = await response.json()
          console.log('Holder API response:', data)
          setState((prev) => ({
            ...prev,
            isHolder: data.isHolder,
            isLoading: false,
            checkedAddress: walletAddress,
          }))
        } catch (error) {
          console.error('Error checking holder status:', error)
          setState((prev) => ({
            ...prev,
            isHolder: false,
            isLoading: false,
            checkedAddress: walletAddress,
          }))
        }
      }

      checkHolder()
    } else if (!walletAddress || !isLoggedIn || !sdkHasLoaded) {
      setState((prev) => ({
        ...prev,
        isHolder: null,
        isLoading: false,
        checkedAddress: null,
      }))
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded, state.shouldStartCheck])

  const closeModal = () => {
    setState((prev) => ({ ...prev, modalDismissed: true }))

    // Clear any existing timer
    if (modalTimer.current) {
      clearTimeout(modalTimer.current)
    }

    // Show modal again after 30 seconds
    modalTimer.current = setTimeout(() => {
      setState((prev) => ({ ...prev, modalDismissed: false }))
    }, 30000)
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (modalTimer.current) {
        clearTimeout(modalTimer.current)
      }
    }
  }, [])

  const isHolderValue = state.isHolder ?? false
  const isLoadingValue =
    state.isLoading ||
    (walletAddress && !state.checkedAddress && state.shouldStartCheck)

  const startCheck = () => {
    setState((prev) => ({
      ...prev,
      shouldStartCheck: true,
      isLoading: true,
      isHolder: null,
      checkedAddress: null,
    }))
  }

  return {
    isHolder: state.isHolder,
    startCheck,
    showModal:
      !isLoadingValue &&
      sdkHasLoaded &&
      isLoggedIn &&
      state.isHolder === false &&
      !state.modalDismissed &&
      state.checkedAddress === walletAddress,
    closeModal,
    isCheckingHolder: isLoadingValue,
  }
}
