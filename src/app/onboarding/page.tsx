'use client'

import { Onboarding } from '@/components/onboarding/components/page/onboarding'
import { useCurrentWallet } from '@/utils/use-current-wallet'

export default function OnboardingPage() {
  const { mainProfile } = useCurrentWallet()
  return <>{!!mainProfile?.id && <Onboarding profileId={mainProfile.id} />}</>
}