export interface Profile {
  id: string
  username: string
  image: string | null | undefined
  bio: string | null | undefined
  namespace: string
  blockchain: string
  created_at: number
}

export interface Wallet {
  address: string
}

export interface FollowStats {
  followers: number
  following: number
}

export interface FungibleToken {
  id: string
  symbol: string
  balance: number
  price?: number
  imageUrl?: string
}

export interface ProfileSearchResult {
  profile: {
    id: string
    username: string
    image?: string
  }
  namespace: {
    name: string
    readableName: string
    userProfileURL: string
    faviconURL?: string | null
  }
  socialCounts: {
    followers: number
    following: number
  }
  walletAddress?: string
}
