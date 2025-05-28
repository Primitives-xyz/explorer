'use client'

import { Skeleton } from '@/components/ui'
import { useCurrentWallet } from '@/utils/use-current-wallet'
import Image from 'next/image'
import { PudgyOnboardingButton } from './pudgy-onboarding-button'

export function PudgyBanner() {
  const { mainProfile, loading } = useCurrentWallet()

  if (loading) {
    return <Skeleton className="w-full aspect-[594/130] rounded-lg" />
  }

  if (!mainProfile) {
    return null
  }

  return (
    <div className="bg-pudgy-background relative rounded-lg overflow-hidden flex items-center justify-center px-5 py-5">
      <Image
        src="/images/pudgy/mountains-banner.webp"
        alt="Pudgy Banner"
        width={642}
        height={137}
        className="w-full absolute bottom-0 left-0"
      />
      <div className="rounded-lg border-2 border-pudgy-border bg-pudgy-background/30 relative backdrop-blur-sm py-4 px-5 w-full flex items-center justify-between">
        <div>
          <h2 className="font-pudgy-heading text-xl uppercase drop-shadow-md">
            The pudgy x sse collab is here!
          </h2>
          <p className="font-pudgy-body text-sm uppercase drop-shadow-md font-bold">
            level up to a Pudgy profile — exclusively on sse
          </p>
        </div>
        <div className="mr-9">
          <PudgyOnboardingButton mainProfile={mainProfile} />
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
  )
}
