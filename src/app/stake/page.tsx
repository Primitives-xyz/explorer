'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StakeContent } from '@/components/stake/stake-content'
import { FullPageSpinner } from '@/components/ui'
import { useIsMobile } from '@/utils/use-is-mobile'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Stake() {
  const { isMobile } = useIsMobile()
  const { push } = useRouter()

  useEffect(() => {
    if (isMobile) {
      push('/trade')
    }
  }, [isMobile, push])

  if (isMobile) {
    return <FullPageSpinner />
  }

  return (
    <MainContentWrapper>
      <StakeContent />
    </MainContentWrapper>
  )
}
