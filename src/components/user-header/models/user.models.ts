export interface IUser {
  username: string
  walletAddress: string
  namespace?: string
  userProfileURL?: string
  avatarUrl: string | null
  bio: string
  isLoading?: boolean
  createdAt?: string
  socialCounts?: {
    followers: number
    following: number
  }
}
