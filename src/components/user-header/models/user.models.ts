export interface IUser {
  username: string
  walletAddress: string
  namespace?: string
  userProfileURL?: string
  avatarUrl: string | null
  bio: string
  socialCounts?: {
    followers: number
    following: number
  }
  isLoading?: boolean
  createdAt?: string
}
