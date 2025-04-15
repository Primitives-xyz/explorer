import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { RightSidebarWrapper } from '@/components/common/right-sidebar-wrapper'
import { LaunchPad } from '@/components/LaunchPad'

export default function StakePage() {
  return (
    <>
      <MainContentWrapper className="min-w-main-content max-w-main-content mx-auto pb-12">
        <LaunchPad />
      </MainContentWrapper>
      <RightSidebarWrapper>
        <div className="p-4">
          <h3 className="text-lg font-medium mb-2">About Token Launching</h3>
          <p className="text-sm text-muted-foreground mb-4">
            This launchpad uses Vertigo AMM to create and trade tokens on Solana.
            You can launch new tokens, buy or sell existing ones, and claim royalties.
          </p>
          <h4 className="text-md font-medium mb-1">Royalty Information</h4>
          <p className="text-sm text-muted-foreground">
            Token creators earn royalties from trading activity. The default 
            fee is 1% (100 basis points), with half going to the pool owner.
          </p>
        </div>
      </RightSidebarWrapper>
    </>
  )
}
