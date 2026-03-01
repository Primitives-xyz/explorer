'use client'

import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { HomeContent } from '@/components/home/home-content/home-content'

export default function Home() {
  return (
    <MainContentWrapper className="pb-20">
      <HomeContent />
    </MainContentWrapper>
  )
}
