import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StakeContent } from '@/components/stake/stake-content'
import { StatusBar } from '@/components/status-bar/status-bar'

export default function Stake() {
  return (
    <MainContentWrapper>
      <StatusBar condensed={false} />
      <StakeContent />
    </MainContentWrapper>
  )
}
