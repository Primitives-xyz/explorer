import { IPaginatedResponse } from '@/components/tapestry/models/common.models'

export interface IActivityTapeEntry {
  type: string
  text: string
  action: string
  wallet: string
  timestamp: number
  highlight: string
  amount?: string
  amountSuffix?: string
  isSSEBuy?: boolean
  signature?: string
}

export interface IActivityGlobalResponse extends IPaginatedResponse {
  activities: IActivityGlobal[]
}

export interface IActivityGlobal {
  type: string
  actor_id: string
  actor_username: string
  target_id: string
  target_username?: string
  comment_id?: string
  content_type?: string
  timestamp: number
  activity: string
}
