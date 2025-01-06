'use client'

import { Modal } from '@/components/common/modal'
import { useCurrentWallet } from '@/components/auth/hooks/use-current-wallet'
import { useHolderCheck } from '@/components/auth/hooks/use-holder-check'
import { useEffect } from 'react'
import { FrogHolderRequired } from './FrogHolderRequired'

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { showModal, closeModal, startCheck } = useHolderCheck()
  const { sdkHasLoaded, isLoggedIn } = useCurrentWallet()

  // Start holder check after SDK has loaded
  useEffect(() => {
    if (sdkHasLoaded && isLoggedIn) {
      startCheck()
    }
  }, [sdkHasLoaded, isLoggedIn])

  return (
    <>
      {children}
      <Modal
        isOpen={showModal}
        onClose={closeModal}
        title="Frog Holder Required"
      >
        <FrogHolderRequired />
      </Modal>
    </>
  )
}
