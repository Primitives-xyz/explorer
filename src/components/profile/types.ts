export interface Wallet {
  id: string
  blockchain: string
}

export interface Profile {
  id: string
  created_at: number
  namespace: string
  username: string
  bio: string | null
  image: string | null
  wallet: Wallet | null
}

export interface GetFollowingResponse {
  profiles: Profile[]
  page: number
  pageSize: number
}
