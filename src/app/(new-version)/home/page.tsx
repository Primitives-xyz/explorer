import { OverflowContentWrapper } from '@/components-new-version/common/overflow-content-wrapper'
import { RightSideLayout } from '@/components-new-version/common/right-side-layout'
import { HomeContent } from '@/components-new-version/home/home-content/home-content'
import { RightSideHome } from '@/components-new-version/home/right-side-home/right-side-home'

export default function Home() {
  return (
    <>
      <OverflowContentWrapper className="max-w-main-content mx-auto items-center justify-center">
        <HomeContent />
      </OverflowContentWrapper>
      <RightSideLayout>
        <RightSideHome />
      </RightSideLayout>
    </>
  )
}
