import { BLOCKCHAIN, IPaginatedResponse } from '@/models/common.models'

export interface ISocialCounts {
  followers: number
  following: number
}

export interface IProfileResponse {
  [x: string]: any
  walletAddress?: string | undefined
  socialCounts: ISocialCounts
}

export interface IProfile {
  id: string
  created_at: number
  username: string
  bio: string
  image: string
  namespace: string
  blockchain: BLOCKCHAIN
  isWaitListed?: boolean
}
export interface IGetSocialResponse extends IPaginatedResponse {
  profiles: IProfile[]
}

export interface ISuggestedProfile {
  namespaces: {
    name: string
    readableName: string
    faviconURL: string
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
  [key: string]: ISuggestedProfile
}
