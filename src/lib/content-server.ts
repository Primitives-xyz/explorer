import { FetchMethod } from '@/utils/api'
import { fetchTapestryServer } from './tapestry-server'

export interface ContentProperties {
  key: string
  value: string
}

export interface Content {
  id: string
  created_at: number
}

export interface ContentResponse {
  content: Content
  socialCounts: {
    likeCount: number
    commentCount: number
  }
  authorProfile: {
    id: string
    namespace: string
    created_at: number
    username: string
    bio: string
    image: string
  }
  requestingProfileSocialInfo: {
    hasLiked: boolean
  }
}

export interface ContentListResponse {
  contents: ContentResponse[]
  page: number
  pageSize: number
}

export const contentServer = {
  async getContents({
    orderByField,
    orderByDirection,
    page,
    pageSize,
    profileId,
    requestingProfileId,
    namespace = 'primitives',
  }: {
    orderByField?: string
    orderByDirection?: 'ASC' | 'DESC'
    page?: number
    pageSize?: number
    profileId?: string
    requestingProfileId?: string
    namespace?: string
  } = {}): Promise<ContentListResponse> {
    const params = new URLSearchParams()
    if (orderByField) params.append('orderByField', orderByField)
    if (orderByDirection) params.append('orderByDirection', orderByDirection)
    if (page) params.append('page', page.toString())
    if (pageSize) params.append('pageSize', pageSize.toString())
    if (profileId) params.append('profileId', profileId)
    if (requestingProfileId)
      params.append('requestingProfileId', requestingProfileId)
    if (namespace) params.append('namespace', namespace)

    return fetchTapestryServer({
      endpoint: `contents?${params.toString()}`,
      method: FetchMethod.GET,
    })
  },

  async getContentById(
    id: string,
    requestingProfileId?: string,
  ): Promise<ContentResponse> {
    const params = new URLSearchParams()
    if (requestingProfileId)
      params.append('requestingProfileId', requestingProfileId)

    return fetchTapestryServer({
      endpoint: `contents/${id}${
        params.toString() ? `?${params.toString()}` : ''
      }`,
      method: FetchMethod.GET,
    })
  },

  async findOrCreateContent({
    id,
    profileId,
    relatedContentId,
    properties,
  }: {
    id: string
    profileId: string
    relatedContentId?: string
    properties?: ContentProperties[]
  }): Promise<Content> {
    return fetchTapestryServer({
      endpoint: 'contents/findOrCreate',
      method: FetchMethod.POST,
      data: {
        id,
        profileId,
        ...(relatedContentId && { relatedContentId }),
        ...(properties && { properties }),
      },
    })
  },

  async updateContent(
    id: string,
    properties: ContentProperties[],
  ): Promise<Content> {
    return fetchTapestryServer({
      endpoint: `contents/${id}`,
      method: FetchMethod.PUT,
      data: { properties },
    })
  },

  async deleteContent(id: string): Promise<void> {
    return fetchTapestryServer({
      endpoint: `contents/${id}`,
      method: FetchMethod.DELETE,
    })
  },

  async getBatchContents(ids: string[]): Promise<{
    successful: ContentResponse[]
  }> {
    return fetchTapestryServer({
      endpoint: 'contents/batch/read',
      method: FetchMethod.POST,
      data: ids,
    })
  },
}
