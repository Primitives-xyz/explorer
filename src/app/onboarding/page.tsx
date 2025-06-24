'use client'

import { Onboarding } from '@/components/onboarding/components/page/onboarding'
import { useCurrentWallet } from '@/utils/use-current-wallet'

export default function OnboardingPage() {
  const { mainProfile } = useCurrentWallet()
  console.log(mainProfile)
  return (
    <>
      {!mainProfile?.hasSeenProfileSetupModal && !!mainProfile?.id && (
        <Onboarding profileId={mainProfile.id} />
      )}
    </>
  )
}
