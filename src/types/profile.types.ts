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

export interface IGetSocialResponse extends IPaginatedResponse {
  profiles: IProfile[]
}

export interface IWallet {
  id: string
  created_at: number
  blockchain: string
  wallet_type: string
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
  hasSeenProfileSetupModal?: boolean
  wallet: IWallet
}

export interface INameSpace {
  id: number
  name: string
  readableName: string
  faviconURL?: string | null
  createdAt: string
  updatedAt: string
  isDefault: boolean
  team_id: number
  userProfileURL: string
}

export interface IProfilesListResponse extends IPaginatedResponse {
  profiles: IGetProfileResponse[]
}

export interface IGetProfileResponse {
  namespace: INameSpace
  profile: IProfile
  wallet: { address: string }
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
  page?: number
  pageSize?: number
  totalCount?: number
}
