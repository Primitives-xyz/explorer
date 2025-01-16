export interface ProfileSearchResult {
  profile: {
    id: string
    username: string
  }
  namespace: {
    name: string
    readableName: string
  }
  socialCounts: {
    followers: number
    following: number
  }
  userProfileURL?: string
} 