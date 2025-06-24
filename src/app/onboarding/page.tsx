'use client'

import { Onboarding } from '@/components/onboarding/components/page/onboarding'
import { useCurrentWallet } from '@/utils/use-current-wallet'

export default function OnboardingPage() {
  const { mainProfile } = useCurrentWallet()
  return (
    <>
      {!mainProfile?.hasSeenProfileSetupModal && !!mainProfile?.id ? (
        <Onboarding profileId={mainProfile.id} />
      ) : (
        <div className="w-full h-full flex justify-center items-center">
          <span>You've already seen the onboarding</span>
        </div>
      )}
    </>
  )
}
