'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RevealScoreAnimation } from '@/components/solid-score/animation/reveal-score-animation'
import { StakeContent } from '@/components/stake/stake-content'

export default function Stake() {
  return (
    <MainContentWrapper>
      <RevealScoreAnimation />
      <StakeContent />
    </MainContentWrapper>
  )
}
