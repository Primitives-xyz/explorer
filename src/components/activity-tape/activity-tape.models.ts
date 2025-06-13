import { IPaginatedResponse } from '@/components/tapestry/models/common.models'

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
  timestamp: number
  activity: string
  content_type?: string
  text?: string
  action?: string
}
