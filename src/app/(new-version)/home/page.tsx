import { MainContentWrapper } from '@/components-new-version/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components-new-version/common/right-sidebar-wrapper'
import { HomeContent } from '@/components-new-version/home/home-content/home-content'
import { RightSideHome } from '@/components-new-version/home/right-side-home/right-side-home'

export default function Home() {
  return (
    <>
      <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto flex justify-center">
        <HomeContent />
      </MainContentWrapper>
      <RightSidebarWrapper className="pt-[50px]">
        <RightSideHome />
      </RightSidebarWrapper>
    </>
  )
}
