'use client'

import { Modal } from '@/components/common/modal'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useHolderCheck } from '@/components/auth/hooks/use-holder-check'
import { useEffect, useRef } from 'react'
import { FrogHolderRequired } from './FrogHolderRequired'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { showModal, closeModal, startCheck, isHolder, isCheckingHolder } =
    useHolderCheck()
  const { sdkHasLoaded, isLoggedIn, walletAddress } = useCurrentWallet()
  const hasInitialized = useRef(false)

  // Single initialization point for holder check
  useEffect(() => {
    if (
      !hasInitialized.current &&
      sdkHasLoaded &&
      isLoggedIn &&
      walletAddress &&
      isHolder === null &&
      !isCheckingHolder
    ) {
      hasInitialized.current = true
      console.log('AuthWrapper: Initial holder check')
      startCheck()
    }
  }, [sdkHasLoaded, isLoggedIn, walletAddress, isHolder, isCheckingHolder])

  // Reset initialization flag when wallet disconnects
  useEffect(() => {
    if (!walletAddress || !isLoggedIn || !sdkHasLoaded) {
      hasInitialized.current = false
    }
  }, [walletAddress, isLoggedIn, sdkHasLoaded])

  return (
    <>
      {children}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Solana Business Frog Required"
      >
        <FrogHolderRequired />
      </Modal>
    </>
  )
}
