'use client'

import { Button, ButtonVariant, Skeleton } from '@/components/ui'
import { pudgyStorage } from '@/utils/pudgy-cookies'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { usePudgyProfileStatus } from '../hooks/use-pudgy-profile-status'
import { PudgyOnboardingModal } from './pudgy-onboarding-modal'

export function PudgyBanner() {
  const { mainProfile } = useCurrentWallet()
  const { shouldShowBanner, shouldShowModal, loading } = usePudgyProfileStatus()
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (shouldShowModal && mainProfile) {
      setOpen(true)
      // Mark that we've shown the modal this session
      pudgyStorage.setHasSeenModal(mainProfile.username)
    }
  }, [shouldShowModal, mainProfile])

  if (loading) {
    return <Skeleton className="w-full aspect-[594/130] rounded-lg" />
  }

  if (!shouldShowBanner) {
    return null
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
              onClick={() => {
                if (mainProfile) {
                  setOpen(true)
                } else {
                  // For logged out users, you might want to redirect to login
                  // or show a different modal. For now, we'll just open the modal
                  setOpen(true)
                }
              }}
            >
              Claim Profile
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
