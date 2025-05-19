export interface SolidScoreResponse {
  walletAddress: string
  score: number
  badges: string[]
}

export interface SolidScoreLeaderboardResponse {
  id: string
  username: string
  position: number
  walletAddress: string
  score: number
}
