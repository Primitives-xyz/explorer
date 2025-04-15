import { IPaginatedResponse, ISocialCounts } from './common.models'
import { IProfile } from './profiles.models'

export interface IContent {
  namespace: string
  created_at: number
  id: string
}

export interface IRequestingProfileSocialInfo {
  hasLiked: boolean
}

// POST /contents/findOrCreate

export interface IFindOrCreateContentInput {
  id: string
  profileId: string
  properties: {
    key: string
    value: string
  }[]
}

// GET /contents

export interface IGetContentsResponse<T = IContent> extends IPaginatedResponse {
  contents: {
    authorProfile: IProfile
    content: T
    socialCounts: ISocialCounts
    requestingProfileSocialInfo: IRequestingProfileSocialInfo
  }[]
}

// GET /contents/[id]

export interface IGetContentResponse<T = IContent> {
  content: T
  authorProfile: IProfile
  socialCounts: ISocialCounts
  requestingProfileSocialInfo: IRequestingProfileSocialInfo
}

// PUT /contents/[id]

export interface IUpdateContentInput {
  properties?: {
    key: string
    value: string | number | boolean
  }[]
}
