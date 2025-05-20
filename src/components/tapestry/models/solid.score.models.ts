export interface SolidScoreResponse {
  walletAddress: string
  score: number
  badges: string[]
  position: number
  percentile: number
}

export interface SolidScoreLeaderboardResponse {
  id: string
  username: string
  position: number
  walletAddress: string
  score: number
  percentile: number
}
