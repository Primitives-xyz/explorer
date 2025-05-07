export interface ITwitterFeed {
  handle: string
  tweets: {
    id: string
    text: string
    createdAt: string
    likes: number
    retweets: number
    url: string
  }[]
}
