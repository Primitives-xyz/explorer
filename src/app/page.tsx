import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { HomeContent } from '@/components/home/home-content/home-content'

export default function Home() {
  return (
    <>
      <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto flex justify-center">
        <HomeContent />
      </MainContentWrapper>
      {/* <RightSidebarWrapper>
        <SwapTray isAlwaysOpen />
      </RightSidebarWrapper> */}
    </>
  )
}
