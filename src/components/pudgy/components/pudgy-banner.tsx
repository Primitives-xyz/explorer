'use client'

import { Button, ButtonVariant, Skeleton } from '@/components/ui'
import { pudgyStorage } from '@/utils/pudgy-cookies'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'
import { usePudgyProfileStatus } from '../hooks/use-pudgy-profile-status'
import { PudgyOnboardingModal } from './pudgy-onboarding-modal'

export function PudgyBanner() {
  const { mainProfile, isLoggedIn, setShowAuthFlow, sdkHasLoaded } = useCurrentWallet()
  const { shouldShowBanner, shouldShowModal, loading } = usePudgyProfileStatus()
  const [open, setOpen] = useState(false)
  const [waitingForAuth, setWaitingForAuth] = useState(false)
  const previouslyLoggedIn = useRef(isLoggedIn)

  useEffect(() => {
    if (shouldShowModal && mainProfile) {
      setOpen(true)
      // Mark that we've shown the modal this session
      pudgyStorage.setHasSeenModal(mainProfile.username)
    }
  }, [shouldShowModal, mainProfile])

  // Handle post-authentication flow
  useEffect(() => {
    // If user was waiting for auth and is now logged in with a profile, open the modal
    if (waitingForAuth && isLoggedIn && mainProfile && !previouslyLoggedIn.current) {
      setWaitingForAuth(false)
      setOpen(true)
    }
    
    // Update the previous logged in state
    previouslyLoggedIn.current = isLoggedIn
  }, [isLoggedIn, mainProfile, waitingForAuth])

  // Show loading state while SDK is loading
  if (!sdkHasLoaded) {
    return <Skeleton className="w-full aspect-[594/130] rounded-lg" />
  }

  // For logged-in users, use the existing logic
  if (isLoggedIn) {
    if (loading) {
      return <Skeleton className="w-full aspect-[594/130] rounded-lg" />
    }

    if (!mainProfile || !shouldShowBanner) {
      return null
    }
  }

  // For logged-out users, always show the banner (unless they're logged in and shouldn't see it)
  if (isLoggedIn && (!mainProfile || !shouldShowBanner)) {
    return null
  }

  const handleCtaClick = () => {
    if (!isLoggedIn) {
      // For logged-out users, trigger auth flow and mark that we're waiting
      setWaitingForAuth(true)
      setShowAuthFlow(true)
      return
    }
    
    // For logged-in users, open the onboarding modal
    setOpen(true)
  }

  return (
    <>
      <div
        key={mainProfile?.pudgy_profile_date ? 'claimed' : 'unclaimed'}
        className="bg-pudgy-background relative rounded-lg overflow-hidden flex items-center justify-center px-5 py-5"
      >
        <Image
          src="/images/pudgy/mountains-banner.webp"
          alt="Pudgy Banner"
          width={642}
          height={137}
          className="w-full absolute bottom-0 left-0"
        />
        <div className="rounded-lg border-2 border-pudgy-border bg-pudgy-background/30 relative backdrop-blur-sm py-4 px-5 w-full flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4 md:gap-0">
          <div>
            <h2 className="font-pudgy-heading text-xl uppercase drop-shadow-md">
              The pudgy x sse collab is here!
            </h2>
            <p className="font-pudgy-body text-sm uppercase drop-shadow-md">
              level up to a Pudgy profile — exclusively on sse
            </p>
          </div>
          <div className="md:mr-9">
            <Button
              variant={ButtonVariant.PUDGY_DEFAULT}
              onClick={handleCtaClick}
              disabled={waitingForAuth}
            >
              {waitingForAuth 
                ? 'Connecting...' 
                : isLoggedIn 
                  ? 'Claim Profile' 
                  : 'Connect & Claim Profile'
              }
            </Button>
          </div>
        </div>
        <Image
          src="/images/pudgy/pudgy-banner.webp"
          alt="Pudgy Banner"
          width={80}
          height={100}
          className="absolute bottom-0 right-0"
        />
      </div>
      {mainProfile && (
        <PudgyOnboardingModal
          mainProfile={mainProfile}
          open={open}
          setOpen={setOpen}
        />
      )}
    </>
  )
}
