'use client'

import { useCurrentWallet } from '@/utils/use-current-wallet'
import { SolidScoreSmartCta } from './solid-score-smart-cta'

interface Props {
  simpleRevealButton?: boolean
}

export function SolidScoreSmartCtaWrapper({
  simpleRevealButton = false,
}: Props) {
  const { mainProfile, isAdmin } = useCurrentWallet()

  if (!mainProfile?.username || !isAdmin) {
    return null
  }

  return (
    <SolidScoreSmartCta
      simpleRevealButton={simpleRevealButton}
      mainProfile={mainProfile}
    />
  )
}
