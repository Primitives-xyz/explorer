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

export interface SuggestedProfile {
  profile?: {
    username?: string
    namespace?: string
    image?: string | null
    bio?: string
    hasSeenProfileSetupModal?: boolean
  }
  namespace?: {
    name: string
    readableName: string
    faviconURL?: string | null
  }
}

export interface SuggestedUsername {
  username: string
  namespace: string
  readableName: string
  faviconURL?: string | null
  image?: string | null
}
export enum BLOCKCHAIN {
  SOLANA = 'SOLANA',
  ETHEREUM = 'ETHEREUM',
}

export interface IPaginatedResponse {
  page: number
  pageSize: number
}
