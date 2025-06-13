'use client'

import { useCurrentWallet } from '@/utils/use-current-wallet'
import { SolidScoreSmartCta } from './solid-score-smart-cta'
import { SolidScoreCard } from './solid-score-card'

interface Props {
  simpleRevealButton?: boolean
}

export function SolidScoreSmartCtaWrapper({
  simpleRevealButton = false,
}: Props) {
  const { mainProfile, isLoggedIn, setShowAuthFlow, sdkHasLoaded } = useCurrentWallet()

  // Don't render anything while SDK is loading
  if (!sdkHasLoaded) {
    return null
  }

  // For logged-in users with a profile, show the existing smart CTA
  if (isLoggedIn && mainProfile?.username) {
    return (
      <SolidScoreSmartCta
        simpleRevealButton={simpleRevealButton}
        mainProfile={mainProfile}
      />
    )
  }

  // For logged-out users, show a CTA to connect wallet
  if (!isLoggedIn) {
    return (
      <SolidScoreCard
        title="Discover Your Solid Score"
        description="Connect your wallet to reveal your unique solid score and unlock exclusive features"
        buttonText="Connect Wallet"
        buttonAction={() => setShowAuthFlow(true)}
        loading={false}
        isOnProfilePage={false}
      />
    )
  }

  // For logged-in users without a profile (edge case), don't show anything
  return null
}
