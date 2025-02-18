import { BLOCKCHAIN } from '@/models/common.models'

export interface ISocialCounts {
  followers: number
  following: number
}

export interface IProfileResponse {
  walletAddress: string
  socialCounts: {
    followers: number
    following: number
  }
  isFollowing: boolean
}

export interface IProfile {
  id: string
  created_at: number
  username: string
  bio: string | null
  image: string | null
  namespace: string
  blockchain: BLOCKCHAIN
  isWaitListed?: boolean
}

export interface IGetSocialResponse {
  profiles: IProfile[]
  page: number
  pageSize: number
}

export interface IGetProfilesResponse {
  namespace: {
    name: string
    readableName: string
    faviconURL?: string | null
  }
  profile: {
    blockchain: string
    namespace: string
    id: string
    username: string
    image: string
    hasSeenProfileSetupModal?: boolean
  }
  wallet: { address: string }
}

export interface ISuggestedProfile {
  namespaces: {
    name: string
    readableName: string
    faviconURL?: string | null
  }[]
  profile: {
    blockchain: string
    namespace: string
    id: string
    username: string
    image: string
  }
  wallet: { address: string }
}

export interface ISuggestedProfiles {
  id: string
  username: string
  walletAddress: string
  bio?: string
  avatar?: string
}
