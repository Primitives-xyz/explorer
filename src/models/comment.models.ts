export interface IComment {
  namespace: string
  created_at: string
  id: string
  text: string
}

export interface ICreateCommentInput {
  profileId: string
  contentId: string
  text: string
  commentId?: string
}

export interface ICreateCommentResponse {
  id: string
  text: string
  profileId: string
  contentId: string
  commentId?: string
  createdAt: string
  updatedAt: string
}
