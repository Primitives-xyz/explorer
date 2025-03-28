import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'
import { HomeContent } from '@/components-new-version/home/home-content/home-content'
import { RightSideHome } from '@/components-new-version/home/right-side-home/right-side-home'

export default function Home() {
  return (
    <>
      <OverflowContentWrapper>
        <HomeContent />
      </OverflowContentWrapper>
      <RightSideLayout>
        <RightSideHome />
      </RightSideLayout>
    </>
  )
}
