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
