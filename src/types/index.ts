import { Profile as ApiProfile } from '@/utils/api'

export interface Profile {
  id: string
  username: string
  image: string | null | undefined
  bio: string | null | undefined
  namespace: string
  blockchain: string
  created_at: number
}

export interface ProfileWithStats extends Omit<ApiProfile, 'profile'> {
  followStats?: {
    followers: number
    following: number
  }
  profile: Profile
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
  }
  namespace: {
    name: string
    readableName: string
    userProfileURL: string
    faviconURL: string
  }
  socialCounts: {
    followers: number
    following: number
  }
}

export interface Comment {
  id: string
  content: string
  authorId: string
  authorUsername?: string
  createdAt: string
  updatedAt: string
}
