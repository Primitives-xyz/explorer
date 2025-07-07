import { MainContentWrapper } from '@/components/common/main-content-wrapper'
import { LeaderboardContent } from '@/components/solid-score/components/leaderboard/leaderboard-content'
import { StatusBar } from '@/components/status-bar/status-bar'

export default function LeaderboardPage() {
  return (
    <MainContentWrapper>
      <StatusBar condensed={false} />
      <LeaderboardContent />
    </MainContentWrapper>
  )
}
