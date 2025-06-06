export interface ISolidScoreResponse {
  walletAddress: string
  score: number
  badges: string[]
  position: number
  percentile: number
  image?: string
}

export interface ISolidScoreLeaderboardResponse {
  id: string
  username: string
  image?: string
  position: number
  walletAddress: string
  score: number
  percentile: number
}
