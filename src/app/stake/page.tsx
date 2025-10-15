import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { StakeContent } from '@/components/stake/stake-content'
import { StatusBar } from '@/components/status-bar/status-bar'
import { ENABLE_STAKING } from '@/utils/constants'

export default function Stake() {
  return (
    <MainContentWrapper>
      <StatusBar condensed={false} />
      <StakeContent isStakingEnabled={ENABLE_STAKING} />
    </MainContentWrapper>
  )
}
