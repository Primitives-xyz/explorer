export interface INamespaceDetails {
  id: number
  name: string
  readableName: string
  faviconURL: string | null
  userProfileURL: string
}

export interface INamespaceProfile {
  profile: {
    id: string
    username: string
    bio: string
    image: string
  }
  wallet: {
    address: string
  }
  namespace: {
    id: number
    name: string
    userProfileURL: string
  }
  socialCounts?: {
    followers: number
    following: number
  }
}

export interface INamespaceProfileInfos {
  socialCounts?: {
    followers: number
    following: number
  }
  profile: {
    created_at: string
    image: string | null
    bio?: string
  }
  namespace?: {
    name?: string
    userProfileURL?: string
    readableName?: string
    faviconURL?: string
    externalProfileURLKey?: string
  }
  walletAddress: string
}
