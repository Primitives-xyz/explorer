import { IPaginatedResponse } from './common.models'

export interface ILeaderboardResponse extends IPaginatedResponse {
  entries: {
    position: number
    profile: {
      username: string
      image?: string
      bio?: string
      wallet?: {
        id: string
        blockchain: string
      }
    }
    score: number
  }[]
}
